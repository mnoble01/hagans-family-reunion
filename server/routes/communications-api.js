/* eslint-env node */
const routeUtils = require('routes/utils');
const { isLoggedIn } = routeUtils;
const airtableUtils = require('airtable/utils');
const {
  creationCallback,
  tables: {
    COMMUNICATION_TABLE,
  },
} = airtableUtils;

module.exports = function(app) {
  app.post('/api/communications', isLoggedIn, creationCallback(COMMUNICATION_TABLE));
};
