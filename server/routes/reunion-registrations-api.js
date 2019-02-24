/* eslint-env node */
const routeUtils = require('routes/utils');
const { isLoggedIn, isCurrentUser } = routeUtils;
const airtableUtils = require('airtable/utils');
const {
  creationCallback,
  findCallback,
  fetchCallback,
  fetchAirtableRecords,
  tables: {
    REGISTRATION_TABLE,
    TSHIRT_ORDER_TABLE,
    TSHIRT_SIZE_TABLE,
  },
} = airtableUtils;

module.exports = function(app) {
  app.post('/api/reunion_registrations', isLoggedIn, creationCallback(REGISTRATION_TABLE));

  app.get('/api/reunion_registrations/:id', isLoggedIn, findCallback(REGISTRATION_TABLE));

  app.get('/api/users/:id/reunion_registrations', isLoggedIn, isCurrentUser, async function(req, res) {
    const id = req.params.id; // Allow fetching by many ids
    try {
      const records = await fetchAirtableRecords(REGISTRATION_TABLE, {
        filterCallback(airtableRegModel) {
          return airtableRegModel.userId[0] === id
              || airtableRegModel.registeredById[0] === id;
        },
      });
      res.status(200).json(records.map(record => record.serialize()));
    } catch (error) {
      res.status(error.statusCode || 500).json(error);
    }
  });

  app.post('/api/tshirt_orders', isLoggedIn, creationCallback(TSHIRT_ORDER_TABLE));

  app.get('/api/tshirt_orders/:id', isLoggedIn, findCallback(TSHIRT_ORDER_TABLE));

  app.get('/api/tshirt_sizes', isLoggedIn, fetchCallback(TSHIRT_SIZE_TABLE));
};
