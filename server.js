/* eslint-env node */
const express = require('express');
const app = express();

// set our port
const port = process.env.PORT || 3000;

// set the static files location
app.use(express.static(__dirname + '/dist'));

// configure our routes
require('./routes')(app);

app.listen(port);

// expose app
exports = module.exports = app;
