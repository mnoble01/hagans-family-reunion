/* eslint-env node */
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const Users = mongoose.model('Users');
const airtableUtils = require('airtable/utils');
const {
  findAirtableRecordById,
  tables: {
    USER_TABLE,
  },
} = airtableUtils;
const registerOrLogin = require('passport/register-or-login');

passport.use('local-login', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback : true,
}, function(req, email, password, done) {
  Users.findOne({ email }, (dbError, dbUser) => {
    if (dbError) {
      return done(dbError);
    } else if (!dbUser) {
      return done(null, false, {
        message: 'User not found',
      });
    } else if (!dbUser.validPassword(password)) {
      return done(null, false, {
        message: 'Incorrect password or no local login found',
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
  registerOrLogin({
    done,
    email,
    password,
    registrationSource: 'Password',
    firstName: req.body.firstName,
    lastName: req.body.lastName,
  });
}));

module.exports = function(app) {
  app.post('/api/login', passport.authenticate('local-login'), function(req, res) {
    return res.json({ ...req.user });
  });

  app.post('/api/register', passport.authenticate('local-register'), function(req, res) {
    return res.json({ ...req.user });
  });
};
