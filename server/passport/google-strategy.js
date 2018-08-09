/* eslint-env node */
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const registerOrLogin = require('passport/register-or-login');
const routeUtils = require('routes/utils');
const { LOGIN_SUCCESS_REDIRECT, LOGIN_FAILURE_REDIRECT } = routeUtils;

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'https://hagans.family/auth/google/callback',
  },
  function(accessToken, refreshToken, profile, done) {
    const firstName = profile.name.givenName;
    const lastName = profile.name.familyName;
    const email = profile.emails[0].value;
    const profileImageUrl = profile.photos && profile.photos[0] && profile.photos[0].value;
    registerOrLogin({
      done,
      email,
      firstName,
      lastName,
      profileImageUrl,
      registrationSource: 'Google',
    });
  }
));

module.exports = function(app) {
  // GET /auth/google
  //   Use passport.authenticate() as route middleware to authenticate the
  //   request.  The first step in Google authentication will involve
  //   redirecting the user to google.com.  After authorization, Google
  //   will redirect the user back to this application at /auth/google/callback
  app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email', 'openid'] }));

  // GET /auth/google/callback
  //   Use passport.authenticate() as route middleware to authenticate the
  //   request.  If authentication fails, the user will be redirected back to the
  //   login page.  Otherwise, the primary route function function will be called,
  //   which, in this example, will redirect the user to the home page.
  app.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: LOGIN_FAILURE_REDIRECT,
  }), function(req, res) {
    res.redirect(LOGIN_SUCCESS_REDIRECT);
  });
};
