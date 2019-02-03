/* eslint-env node */
const routeUtils = require('routes/utils');
const { isLoggedIn } = routeUtils;
const airtableUtils = require('airtable/utils');
const {
  fetchAirtablePosts,
  creationCallback,
  updateCallback,
  findCallback,
  fetchCallback,
  tables: {
    POST_TABLE,
    POST_CATEGORY_TABLE,
  },
} = airtableUtils;

module.exports = function(app) {
  // Purposefully open to non logged-in users
  // TODO Might want to limit the fields that are returned to unauth users
  app.get('/api/posts', function(req, res) {
    fetchAirtablePosts({
      status: req.query.status,
      onSuccess: (airtablePosts) => {
        // Sort by publishedOn or createdAt, depending on which is defined
        // with most recent being first
        airtablePosts = airtablePosts.sort((a, b) => {
          const aDate = a.publishedOn || a.createdAt;
          const bDate = b.publishedOn || b.createdAt;
          return new Date(bDate) - new Date(aDate);
        });
        res.status(200).json(airtablePosts.map(post => post.serialize()));
      },
      onError:(error) => {
        res.status(error.statusCode).json(error);
      },
    });
  });

  // Purposefully open to non logged-in users
  // TODO Might want to limit the fields that are returned to unauth users
  app.get('/api/posts/:id', findCallback(POST_TABLE));

  // TODO check user permissions
  app.put('/api/posts/:id', isLoggedIn, updateCallback(POST_TABLE));

  // TODO check user permissions
  app.post('/api/posts', isLoggedIn, creationCallback(POST_TABLE));

  app.get('/api/post_categories', fetchCallback(POST_CATEGORY_TABLE));
};
