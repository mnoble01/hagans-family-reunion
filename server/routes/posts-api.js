/* eslint-env node */
const routeUtils = require('routes/utils');
const { isLoggedIn } = routeUtils;
const airtableUtils = require('airtable/utils');
const {
  fetchAirtablePosts,
  findAirtableRecordById,
  updateAirtableRecord,
  tables: {
    POST_TABLE,
  },
} = airtableUtils;

module.exports = function(app) {
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