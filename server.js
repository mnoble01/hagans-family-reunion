/* eslint-env node */
const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();

// configure mongodb database
const dbUri = process.env.MONGODB_URI || 'mongodb://localhost/hagans-family';
mongoose.Promise = global.Promise; // make mongoose use global promise
mongoose.promise = global.Promise; // make mongoose use global promise
mongoose.connect(dbUri);
mongoose.set('debug', process.env.environment === 'development');

// set the static files location
app.use(express.static(__dirname + '/dist'));

// configure our routes
require('./server/routes')(app);

// set our port & listen
const port = process.env.PORT || 3000;
app.listen(port);

// expose app
exports = module.exports = app;
