/* eslint-env node */
const mongoose = require('mongoose');
const Users = mongoose.model('Users');
const airtableUtils = require('airtable/utils');
const {
  findAirtableUserByEmail,
  createAirtableRecord,
  updateAirtableRecord,
  tables: {
    USER_TABLE,
  },
} = airtableUtils;

// TODO make this work with facebook
module.exports = function({ done, email, password, airtableAttrs, registrationSource }) {
  findAirtableUserByEmail({
    email,
    onSuccess: (airtableUser) => {
      const updatedRegSource = (airtableUser.registrationSource || []).concat(registrationSource || []);

      // find or create db user
      Users.findOne({ email }, (dbError, dbUser) => {
        if (dbError) {
          // error accessing database
          return done(dbError);
        } else if (dbUser) {
          // database user found
          updateAirtableRecord(USER_TABLE, {
            id: airtableUser.id,
            attrs: {
              ['In Database']: true,
              ['Registration Source']: updatedRegSource,
              ...airtableAttrs,
            },
            onSuccess: (airtableUser) => {
              done(null, airtableUser.serialize());
            },
            onError: (error) => {
              done(error);
            },
          });
        } else {
          const newDbUser = new Users({
            email,
            airtableId: airtableUser.id,
          });
          if (password) {
            newDbUser.setPassword(password);
          }
          newDbUser.save(function(err) {
            if (err) {
              return done(err);
            }
            updateAirtableRecord(USER_TABLE, {
              id: airtableUser.id,
              attrs: {
                ['In Database']: true,
                ['Status']: 'Member',
                ['Registration Source']: updatedRegSource,
                ...airtableAttrs,
              },
              onSuccess: (airtableUser) => {
                done(null, airtableUser.serialize());
              },
              onError: (error) => {
                done(err);
              },
            });
          });
        }
      });
    },
    onError: (airtableError) => {
      // create airtable user
      createAirtableRecord(USER_TABLE, {
        attrs: {
          Status: 'Pending Review',
          Email: email,
          ['In Database']: true,
          ['Registration Source']: [registrationSource],
          ...airtableAttrs,
        },
        onSuccess(airtableUser) {
          // Create db user
          const newDbUser = new Users({
            email,
            airtableId: airtableUser.id,
          });
          newDbUser.setPassword(password);
          newDbUser.save(function(err) {
            if (err) {
              return done(err);
            } else {
              return done(null, airtableUser.serialize());
            }
          });
        },
        onError(err) {
          return done(err);
        },
      });
    },
  });
};
