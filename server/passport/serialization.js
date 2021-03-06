/* eslint-env node */
const passport = require('passport');
const airtableUtils = require('airtable/utils');
const {
  findAirtableRecordById,
  tables: {
    USER_TABLE,
  },
} = airtableUtils;
const logger = require('utils/logger');

passport.serializeUser(function(user, done) {
  // user was successfully authenticated
  // so return the user id storage in the session
  logger.log('info', 'passport.serializeUser', user.id, user);
  done(null, user.id);
});

passport.deserializeUser(async function(id, done) {
  // called on all requests to confirm session status
  // The id comes from same storage as serializeUser
  try {
    const airtableUser = await findAirtableRecordById(USER_TABLE, { id });
    logger.log('info', 'passport.deserializeUser', id, airtableUser);
    return done(null, airtableUser);
  } catch (error) {
    return done(null, false, {
      message: 'User not found',
    });
  }
});
