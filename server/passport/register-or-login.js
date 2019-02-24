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
const logger = require('utils/logger');

module.exports = async function({ done, email, password, firstName, lastName, profileImageUrl, registrationSource }) {
  try {
    const airtableUser = await findAirtableUserByEmail({ email });
    const updatedRegSource = (airtableUser.registrationSource || []).concat(registrationSource || []);
    const updatedImageUrl = airtableUser.profileImage && airtableUser.profileImage[0] && airtableUser.profileImage[0].url || profileImageUrl;

    if (!email) {
      logger.log('info', 'registerOrLogin: No email provided', ...arguments);
      // http://www.passportjs.org/docs/configure/#verify-callback
      return done(null, false, { message: `No email provided by ${registrationSource}` });
    }

    // TODO Use async/await with mongoose
    // https://codeburst.io/using-mongoose-validation-with-async-await-c3a9255459e1

    // find or create db user
    Users.findOne({ email }, (dbError, dbUser) => {
      if (dbError) {
        // error accessing database
        logger.log('info', 'Error finding database user', dbError);
        return done(dbError);
      } else if (dbUser) {
        // database user found
        updateAirtableRecord(USER_TABLE, {
          id: airtableUser.id,
          attrs: {
            ['In Database']: true,
            ['Registration Source']: updatedRegSource,
            ['First Name']: airtableUser.firstName || firstName,
            ['Last Name']: airtableUser.lastName || lastName,
            ['Profile Image']: updatedImageUrl ? [{ url: updatedImageUrl }] : null,
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
              ['Status']: airtableUser.status || 'Member',
              ['Registration Source']: updatedRegSource,
              ['First Name']: firstName,
              ['Last Name']: lastName,
              ['Profile Image']: updatedImageUrl ? [{ url: updatedImageUrl }] : null,
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
  } catch (e) {
    logger.log('info', 'registerOrLogin: Could not find airtable user, creating', e);
    // no airtable user found, so create one
    createAirtableRecord(USER_TABLE, {
      attrs: {
        Status: 'Pending Review',
        Email: email,
        ['In Database']: true,
        ['Registration Source']: [registrationSource],
        ['First Name']: firstName,
        ['Last Name']: lastName,
        ['Profile Image']: profileImageUrl ? [{ url: profileImageUrl }] : null,
      },
      onSuccess(airtableUser) {
        // Create db user
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
          } else {
            return done(null, airtableUser.serialize());
          }
        });
      },
      onError(err) {
        return done(err);
      },
    });
  }
};
