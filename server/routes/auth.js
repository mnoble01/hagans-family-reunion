/* eslint-env node */
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');

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

  // Facebook login
  // Redirect the user to Facebook for authentication.  When complete,
  // Facebook will redirect the user back to the application at
  //     /auth/facebook/callback
  app.get('/auth/facebook', passport.authenticate('facebook'));
  // Facebook will redirect the user to this URL after approval.  Finish the
  // authentication process by attempting to obtain an access token.  If
  // access was granted, the user will be logged in.  Otherwise,
  // authentication has failed.
  app.get('/auth/facebook/callback', passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/login' }));


  // API
  app.post('/api/login', passport.authenticate('local-login'), function(req, res) {
    return res.json({ ...req.user });
  });

  app.post('/api/register', passport.authenticate('local-register'), function(req, res) {
    return res.json({ ...req.user });
  });

  app.post('/api/logout', function(req, res) {
    req.logout();
    return res.status(200).json({
        message: 'successfully logout',
    });
  });
};
