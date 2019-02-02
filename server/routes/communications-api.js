/* eslint-env node */
const routeUtils = require('routes/utils');
const { isLoggedIn } = routeUtils;
const airtableUtils = require('airtable/utils');
const {
  createAirtableRecord,
  tables: {
    COMMUNICATION_TABLE,
  },
} = airtableUtils;

module.exports = function(app) {
  app.post('/api/communications', isLoggedIn, async function(req, res) {
    const attrs = req.body;

    try {
      const airtableCommunication = await createAirtableRecord(COMMUNICATION_TABLE, attrs);
      res.status(200).json(airtableCommunication.serialize());
    } catch (error) {
      res.status(error.statusCode).json(error);
    }
  });
};
