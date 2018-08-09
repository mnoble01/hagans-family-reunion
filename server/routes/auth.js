/* eslint-env node */
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');

require('passport/serialization');

module.exports = function(app) {
  // https://www.airpair.com/express/posts/expressjs-and-passportjs-sessions-deep-dive
  app.use(session({
    secret: 'woohoo-hagans', // TODO move this to .env vars
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  require('passport/local-strategy')(app);
  require('passport/facebook-strategy')(app);
  require('passport/google-strategy')(app);

  app.post('/api/logout', function(req, res) {
    req.logout();
    return res.status(200).json({
        message: 'successfully logout',
    });
  });
};
