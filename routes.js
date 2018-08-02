/* eslint-env node */
const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const Airtable = require('airtable');
require('dotenv').config();

Airtable.configure({
  apiKey: process.env.AIRTABLE_API_KEY,
  endpointUrl: 'https://api.airtable.com', // TODO use an env variable
});
// var base = new Airtable({ apiKey: 'YOUR_API_KEY' }).base('app1mjrfgjv0RUiFT');
const airtableBase = Airtable.base('appTLUN9CFH4IhugP');
const USER_TABLE = 'users';

passport.use('local-login', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback : true,
}, function(req, email, password, done) {
    airtableBase(USER_TABLE).select({
        pageSize: 100,
        view: 'Grid view',
    }).eachPage((records, fetchNextPage) => {
      // TODO use airtable model here
      for (const record of records) {
        if (record.fields['Email'] === email) {
          const user = { id: record.id, ...record.fields };
          done(null, user);
        }
      }
      fetchNextPage();
    }, (error) => {
      if (error) {
        done(error);
      }
    });

    console.log('airtable key', process.env.AIRTABLE_API_KEY);
    // https://medium.com/@bmshamsnahid/node-js-authentication-using-passport-js-78386be1f518
    // error
    // return done(error)

    // if (!user)
    // return done(null, false, { message: 'Incorrect usrname.'})

    // if (!user.validPassword(password))
    // return done(null, false, {message: 'Incorrect password.'})

    // success
    // console.log(email, password);
    // const user = { id: 'user-id', email: 'user-email' };
    // return done(null, user);
  },
));
passport.serializeUser(function(user, done) {
  console.log('serializeUser', user);
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  const user = { id: 'user-id', email: 'user-email' };
  // error
  // done(err);
  done(null, user);
});

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(400).json({
      message: 'access denied',
  });
}

module.exports = function(app) {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(session({ secret: 'cats' })); // TODO
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.static('dist'));

  app.post('/api/login', passport.authenticate('local-login'), function(req, res) {
    console.log('respond json', req.user);
    res.json({ ...req.user });
  });

  //   router.post('/signup', passport.authenticate('local-signup', {
  //     successRedirect : '/auth/profile',
  //     failureRedirect : 'auth/signup'
  // }));

  app.get('/api/user', isLoggedIn, function(req, res) {
    return res.status(200).send({ user: { id: 1, email: 'vladimir@kremlin.ru' } });
  });

  app.get('/api/logout', isLoggedIn, function(req, res) {
      req.logout();
      res.status(200).json({
          message: 'successfully logout',
      });
  });
};
