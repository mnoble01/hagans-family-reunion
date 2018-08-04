/* eslint-env node */
const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

// airtable
const Airtable = require('airtable');
const AirtableModel = require('./airtable-model');

// database
const mongoose = require('mongoose');
require('./db/models/user');
const Users = mongoose.model('Users');

const airtableBase = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY,
  endpointUrl: 'https://api.airtable.com', // TODO use an env variable
}).base('appTLUN9CFH4IhugP');

const USER_TABLE = 'users';

function findAirtableUserByEmail({ email, onSuccess, onError }) {
  airtableBase(USER_TABLE).select({
      pageSize: 100,
      view: 'Grid view',
  }).eachPage((records, fetchNextPage) => {
    for (const record of records) {
      const airtableModel = new AirtableModel(record);
      if (airtableModel.email === email) {
        onSuccess(airtableModel);
      }
    }
    fetchNextPage();
  }, (error) => {
    if (error) {
      onError(error);
    }
  });
}

function findAirtableUserById({ id, onSuccess, onError }) {
  airtableBase(USER_TABLE).find(id, (err, record) => {
    if (err) {
      return onError(err);
    }
    onSuccess(new AirtableModel(record));
});
}

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
      // FIXME this should only happen on register
      // findAirtableUserByEmail({
      //   email,
      //   onSuccess: (airtableUser) => {
      //     // create user
      //     console.log('Creating user', airtableUser);
      //     const newDbUser = new Users({
      //       email,
      //       airtableId: airtableUser.id,
      //     });
      //     // newDbUser.email = email ;
      //     // newDbUser.airtableId = airtableUser.id;
      //
      //     newDbUser.setPassword(password);
      //     newDbUser.save(function(err) {
      //       if (err) {
      //         return done(err);
      //       }
      //       return done(null, airtableUser.serialize());
      //     });
      //   },
      //   onError: () => {
      //     return done(null, false, {
      //       message: 'User not found',
      //     });
      //   },
      // });
    } else if (!dbUser.validPassword(password)) {
      return done(null, false, {
        message: 'Invalid password',
      });
    } else {
      findAirtableUserById({
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
    // User.findOne({ email: username }, function (err, user) {
    //     if (err) { return done(err); }
    //     // Return if user not found in database
    //     if (!user) {
    //       return done(null, false, {
    //         message: 'User not found'
    //       });
    //     }
    //     // Return if password is wrong
    //     if (!user.validPassword(password)) {
    //       return done(null, false, {
    //         message: 'Password is wrong'
    //       });
    //     }
    //     // If credentials are correct, return the user object
    //     return done(null, user);
    //   });

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
  // user was successfully authenticated
  // so return the user id storage in the session
  // console.log('serializeUser', user);
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  // called on all requests to confirm session status
  // The id comes from same storage as serializeUser

  // TODO get user by id
  const user = { id: 'user-id', email: 'user-email' };
  // if (error) {
  //   done(err);
  // } else {
  done(null, user);
});

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  // or res.redirect('/login');
  // or res.redirect('/access-denied');
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

  //   router.post('/register', passport.authenticate('local-register', {
  //     successRedirect : '/profile',
  //     failureRedirect : '/signup'
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
