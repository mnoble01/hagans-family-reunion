/* eslint-env node */
const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback : true,
}, function(req, email, password, done) {
    // https://medium.com/@bmshamsnahid/node-js-authentication-using-passport-js-78386be1f518
    // error
    // return done(error)

    // if (!user)
    // return done(null, false, { message: 'Incorrect usrname.'})

    // if (!user.validPassword(password))
    // return done(null, false, {message: 'Incorrect password.'})

    // success
    console.log(email, password);
    const user = { id: 'user-id', email: 'user-email' };
    return done(null, user);
  },
));
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  const user = { id: 'user-id', email: 'user-email' };
  // error
  // done(err);
  done(null, user);
});

module.exports = function(app) {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(session({ secret: 'cats' })); // TODO
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.static('dist'));

  app.post('/api/login', passport.authenticate('local'), function(req, res) {
    console.log('respond json', req.user);
    res.json({ ...req.user });
  });
    // successRedirect: '/',
    // failureRedirect: '/login',
  // }));

  app.get('user', function(req, res) {
    console.log('GET USER');
    return res.status(200).send({ user: { id: 1, email: 'vladimir@kremlin.ru' } });
  });

  // static files
  // app.get('*', function(req, res) {
  //   app.use(express.static('dist'));
  // });
};
