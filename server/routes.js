/* eslint-env node */
const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const redirectToHTTPS = require('express-http-to-https').redirectToHTTPS;


// google maps
const googleMapsClient = require('@google/maps').createClient({
  key: process.env.GOOGLE_MAPS_API_KEY,
});

// airtable
const Airtable = require('airtable');
const AirtableModel = require('./airtable-model');

// database
const mongoose = require('mongoose');
require('./db/models/user');
const Users = mongoose.model('Users');

// TODO move this stuff out of this file
const airtableBase = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY,
  endpointUrl: 'https://api.airtable.com',
}).base('appTLUN9CFH4IhugP');

const USER_TABLE = 'users';
const POST_TABLE = 'posts';

function fetchAirtableUsers({ onSuccess, onError }) {
  const airtableRecords = [];
  airtableBase(USER_TABLE).select({
      pageSize: 100,
      view: 'Grid view',
  }).eachPage((records, fetchNextPage) => {
    for (const record of records) {
      const airtableModel = new AirtableModel(record);
      if (airtableModel.status === 'Member' || airtableModel.status === 'Inactive') {
        airtableRecords.push(airtableModel);
      }
    }
    fetchNextPage();
  }, (error) => {
    if (error) {
     onError(error);
    } else {
      onSuccess(airtableRecords);
    }
  });
}

function fetchAirtablePosts({ status, onSuccess, onError }) {
  const airtableRecords = [];
  airtableBase(POST_TABLE).select({
      pageSize: 100,
      view: 'Grid view',
  }).eachPage((records, fetchNextPage) => {
    for (const record of records) {
      const airtableModel = new AirtableModel(record);
      if (status) {
        if (airtableModel.status === status) {
          airtableRecords.push(airtableModel);
        }
      } else {
        airtableRecords.push(airtableModel);
      }
    }
    fetchNextPage();
  }, (error) => {
    if (error) {
     onError(error);
    } else {
      onSuccess(airtableRecords);
    }
  });
}

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

function findAirtableRecordById(tableName, { id, onSuccess, onError }) {
  airtableBase(tableName).find(id, (err, record) => {
    if (err) {
      return onError(err);
    } else {
      return onSuccess(new AirtableModel(record));
    }
  });
}

function createAirtableRecord(tableName, { attrs, onSuccess, onError }) {
  airtableBase(tableName).create(attrs, (err, record) => {
    if (err) {
      return onError(err);
    } else {
      return onSuccess(new AirtableModel(record));
    }
  });
}

function updateAirtableRecord(tableName, { id, attrs, onSuccess, onError }) {
  airtableBase(tableName).update(id, attrs, (err, record) => {
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

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({
    message: 'access denied',
  });
}

function requireHttps(req, res, next) {
//   console.log('secure?', req.secure, req.headers.host, req.protocol, req.headers.host.startsWith('localhost'));
//   console.log('url', req.url, req.url.startsWith('/api'));
//   if (req.secure || req.headers.host.startsWith('localhost') || req.url.startsWith('/api')) {
//     console.log('DO NOT redirect');
//     // request was via https, localhost, or api, so do no special handling
//     return next();
//   } else {
//     console.log('do redirect to https');
//     // request was via http, so redirect to https
//     return res.redirect('https://' + req.headers.host + req.url);
//   }

  // The 'x-forwarded-proto' check is for Heroku
  if (!req.secure && req.get('x-forwarded-proto') !== 'https' && process.env.NODE_ENV !== 'development') {
    return res.redirect('https://' + req.get('host') + req.url);
  }
  next();
}

// redirect www to non-www
function wwwRedirect(req, res, next) {
  if (req.headers.host.slice(0, 4) === 'www.' && !req.url.startsWith('/api')) {
    console.log('www', req.headers.host);
    const newHost = req.headers.host.slice(4);
    return res.redirect(301, req.protocol + '://' + newHost + req.originalUrl);
  } else {
    return next();
  }
}

module.exports = function(app) {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  // Enable reverse proxy support in Express. This causes the
  // the "X-Forwarded-Proto" header field to be trusted so its
  // value can be used to determine the protocol. See
  // http://expressjs.com/api#app-settings for more details.
  app.enable('trust proxy');
  app.use(wwwRedirect);
  app.use(requireHttps);
  // app.use(redirectToHTTPS([/localhost:(\d{4})/], [/\/api/], 301));


  // Static files should come before session
  app.use(express.static('dist'));

  // https://www.airpair.com/express/posts/expressjs-and-passportjs-sessions-deep-dive
  app.use(session({ secret: 'woohoo-hagans' })); // TODO move this to .env vars
  app.use(passport.initialize());
  app.use(passport.session());


  // API
  app.post('/api/login', passport.authenticate('local-login'), function(req, res) {
    return res.json({ ...req.user });
  });

  app.post('/api/register', passport.authenticate('local-register'), function(req, res) {
    return res.json({ ...req.user });
  });

  app.post('/api/logout', function(req, res) {
    req.logout();
    return res.status(200).json({
        message: 'successfully logout',
    });
  });

  app.get('/api/user', isLoggedIn, function(req, res) {
    return res.status(200).json({ ...req.user });
  });

  app.get('/api/users', isLoggedIn, function(req, res) {
    fetchAirtableUsers({
      onSuccess: (airtableUsers) => {
        res.status(200).json(airtableUsers.map(user => user.serialize()));
      },
      onError:(error) => {
        res.status(error.statusCode).json(error);
      },
    });
  });

  app.get('/api/users/:id', isLoggedIn, function(req, res) {
    findAirtableRecordById(USER_TABLE, {
      id: req.params.id,
      onSuccess: (airtableUser) => {
        res.status(200).json(airtableUser.serialize());
      },
      onError: (error) => {
        res.status(error.statusCode).json(error);
      },
    });
  });

  app.put('/api/users/:id', isLoggedIn, function(req, res) {
    const attrs = req.body;

    updateAirtableRecord(USER_TABLE, {
      id: req.params.id,
      attrs,
      onSuccess: (airtableUser) => {
        res.status(200).json(airtableUser.serialize());
      },
      onError: (error) => {
        res.status(error.statusCode).json(error);
      },
    });
  });

  app.get('/api/location/:address', isLoggedIn, function(req, res) {
    googleMapsClient.geocode({
      address: req.params.address,
    }, function(error, response) {
      if (error) {
        res.status(500).json(error);
      } else {
        res.json(response && response.json && response.json.results && response.json.results[0] || {});
      }
    });
  });

  // Purposefully open to non logged-in users
  app.get('/api/posts', function(req, res) {
    fetchAirtablePosts({
      status: req.query.status,
      onSuccess: (airtablePosts) => {
        res.status(200).json(airtablePosts.map(post => post.serialize()));
      },
      onError:(error) => {
        res.status(error.statusCode).json(error);
      },
    });
  });

  app.get('/api/posts/:id', isLoggedIn, function(req, res) {
    findAirtableRecordById(POST_TABLE, {
      id: req.params.id,
      onSuccess: (airtablePost) => {
        res.status(200).json(airtablePost.serialize());
      },
      onError: (error) => {
        res.status(error.statusCode).json(error);
      },
    });
  });

  app.put('/api/posts/:id', isLoggedIn, function(req, res) {
    const attrs = req.body;

    updateAirtableRecord(POST_TABLE, {
      id: req.params.id,
      attrs,
      onSuccess: (airtableUser) => {
        res.status(200).json(airtableUser.serialize());
      },
      onError: (error) => {
        res.status(error.statusCode).json(error);
      },
    });
  });

  app.post('/api/posts', isLoggedIn, function(req, res) {
    const attrs = req.body;

    updateAirtableRecord(POST_TABLE, {
      id: req.params.id,
      attrs,
      onSuccess: (airtableUser) => {
        res.status(200).json(airtableUser.serialize());
      },
      onError: (error) => {
        res.status(error.statusCode).json(error);
      },
    });
  });
};
