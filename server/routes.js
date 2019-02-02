/* eslint-env node */
// TODO setup eslint so this is not needed
const express = require('express');
const bodyParser = require('body-parser');

// Setup root path
require('app-module-path').addPath(`${__dirname}`);
// database & models
require('db/models/user');

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

module.exports = function(app) {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  require('routes/redirect-middleware')(app);

  // Static files should come before session/auth
  app.use(express.static('dist'));
  app.use(express.static('public'));

  require('routes/auth')(app);
  require('routes/users-api')(app);
  require('routes/posts-api')(app);
  require('routes/communications-api')(app);
  require('routes/location-api')(app);
  require('routes/upload-api')(app);

  if (process.env.EMBER_ENV !== 'development') {
    // This messes with livereload - TODO find another way to do this
    app.get('*', function(req, res) {
      res.redirect('/');
    });
  }
};
