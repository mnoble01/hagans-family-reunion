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
  endpointUrl: 'https://api.airtable.com',
}).base('appTLUN9CFH4IhugP');

const USER_TABLE = 'users';

function findAirtableUserByEmail({ email, onSuccess, onError }) {
  let foundModel;
  airtableBase(USER_TABLE).select({
      pageSize: 100,
      view: 'Grid view',
  }).eachPage((records, fetchNextPage) => {
    for (const record of records) {
      const airtableModel = new AirtableModel(record);
      if (airtableModel.email === email) {
        foundModel = airtableModel;
      }
    }
    fetchNextPage();
  }, (error) => {
    if (foundModel) {
      onSuccess(foundModel);
    } else {
     onError(error || 'Not found');
    }
  });
}

function findAirtableUserById({ id, onSuccess, onError }) {
  airtableBase(USER_TABLE).find(id, (err, record) => {
    if (err) {
      return onError(err);
    } else {
      return onSuccess(new AirtableModel(record));
    }
  });
}

function createAirtableUser({ attrs, onSuccess, onError }) {
  airtableBase(USER_TABLE).create(attrs, (err, record) => {
    if (err) {
      return onError(err);
    } else {
      return onSuccess(new AirtableModel(record));
    }
  });
}

// function sendError(res, error) {
//   const output = {
//     error: {
//       name: error.name,
//       message: error.message,
//       text: error.toString(),
//     },
//   };
//   const statusCode = error.status || 500;
//   console.log('output', output);
//   return res.status(statusCode).json(output);
// }

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
}));
passport.use('local-register', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback : true,
}, function(req, email, password, done) {
  console.log('REGISTER');
  findAirtableUserByEmail({
    email,
    onSuccess: (airtableUser) => {
      console.log('FOUND AIRTABLE USER');
      // create db user
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
            return done(null, airtableUser.serialize());
          });
        }
      });
    },
    onError: (airtableError) => {
      console.log('ON findbyemail ERROR', airtableError);
      // create airtable user
      createAirtableUser({
        attrs: {
          Status: 'Pending Review',
          Email: email,
          ['First Name']: req.body.firstName,
          ['Last Name']: req.body.lastName,
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

passport.serializeUser(function(user, done) {
  // user was successfully authenticated
  // so return the user id storage in the session
  console.log('serializeUser', user);
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
  app.use(session({ secret: 'woohoo-hagans' })); // TODO
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.static('dist'));

  app.post('/api/login', passport.authenticate('local-login'), function(req, res) {
    return res.json({ ...req.user });
  });

  app.post('/api/register', passport.authenticate('local-register'), function(req, res) {
    return res.json({ ...req.user });
  });

  app.get('/api/user', isLoggedIn, function(req, res) {
    return res.status(200).send({ user: { id: 1, email: 'vladimir@kremlin.ru' } });
  });

  app.get('/api/logout', isLoggedIn, function(req, res) {
    req.logout();
    return res.status(200).json({
        message: 'successfully logout',
    });
  });
};
