/* eslint-env node */
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const airtableUtils = require('airtable/utils');
const mongoose = require('mongoose');
const Users = mongoose.model('Users');
const {
  findAirtableRecordById,
  findAirtableUserByEmail,
  createAirtableRecord,
  updateAirtableRecord,
  tables: {
    USER_TABLE,
  },
} = airtableUtils;

passport.use('local-login', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback : true,
}, function(req, email, password, done) {
  Users.findOne({ email }, (dbError, dbUser) => {
    // TODO fix error responses to actually return json
    if (dbError) {
      return done(dbError);
    } else if (!dbUser) {
      return done(null, false, {
        message: 'User not found',
      });
    } else if (!dbUser.validPassword(password)) {
      return done(null, false, {
        message: 'Incorrect password',
      });
    } else {
      findAirtableRecordById(USER_TABLE, {
        id: dbUser.airtableId,
        onSuccess(airtableUser) {
          done(null, airtableUser.serialize());
        },
        onError(error) {
          return done(null, false, {
            message: 'User not found',
          });
        },
      });
    }
  });
}));

passport.use('local-register', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback : true,
}, function(req, email, password, done) {
  findAirtableUserByEmail({
    email,
    onSuccess: (airtableUser) => {
      // find or create db user
      Users.findOne({ email }, (dbError, dbUser) => {
        if (dbError) {
          return done(dbError);
        } else if (dbUser) {
          return done(null, airtableUser.serialize());
        } else {
          const newDbUser = new Users({
            email,
            airtableId: airtableUser.id,
          });
          newDbUser.setPassword(password);
          newDbUser.save(function(err) {
            if (err) {
              return done(err);
            }
            updateAirtableRecord(USER_TABLE, {
              id: airtableUser.id,
              attrs: {
                ['In Database']: true,
                ['Status']: 'Member',
                ['First Name']: req.body.firstName,
                ['Last Name']: req.body.lastName,
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
          ['First Name']: req.body.firstName,
          ['Last Name']: req.body.lastName,
          ['In Database']: true,
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
}));
