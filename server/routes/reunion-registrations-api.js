/* eslint-env node */
const routeUtils = require('routes/utils');
const { isLoggedIn } = routeUtils;
const airtableUtils = require('airtable/utils');
const {
  creationCallback,
  findCallback,
  fetchCallback,
  tables: {
    REGISTRATION_TABLE,
    TSHIRT_ORDER_TABLE,
    TSHIRT_SIZE_TABLE,
  },
} = airtableUtils;

module.exports = function(app) {
  app.post('/api/reunion_registrations', isLoggedIn, creationCallback(REGISTRATION_TABLE));

  app.get('/api/reunion_registrations/:id', isLoggedIn, findCallback(REGISTRATION_TABLE));

  app.post('/api/tshirt_orders', isLoggedIn, creationCallback(TSHIRT_ORDER_TABLE));

  app.get('/api/tshirt_sizes', isLoggedIn, fetchCallback(TSHIRT_SIZE_TABLE));
};
