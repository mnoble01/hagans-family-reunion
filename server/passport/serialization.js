/* eslint-env node */
const passport = require('passport');
const airtableUtils = require('airtable/utils');
const {
  findAirtableRecordById,
  tables: {
    USER_TABLE,
  },
} = airtableUtils;

passport.serializeUser(function(user, done) {
  // user was successfully authenticated
  // so return the user id storage in the session
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  // called on all requests to confirm session status
  // The id comes from same storage as serializeUser
  findAirtableRecordById(USER_TABLE, {
    id,
    onSuccess(airtableUser) {
      done(null, airtableUser.serialize());
    },
    onError(error) {
      return done(null, false, {
        message: 'User not found',
      });
    },
  });
});
