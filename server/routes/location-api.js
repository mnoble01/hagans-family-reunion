/* eslint-env node */
const routeUtils = require('routes/utils');
const { isLoggedIn } = routeUtils;
// google maps
const googleMapsClient = require('@google/maps').createClient({
  key: process.env.GOOGLE_MAPS_API_KEY,
});

module.exports = function(app) {
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
};
