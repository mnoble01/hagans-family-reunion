/* eslint-env node */
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const registerOrLogin = require('passport/register-or-login');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://www.example.com/auth/google/callback',
  },
  function(accessToken, refreshToken, profile, done) {
    console.log('GOOGLE PROFILE', profile);
    // registerOrLogin({
    //   done,
    //   email,
    //   registrationSource: 'Facebook',
    //   airtableAttrs: {
    //     ['First Name']: firstName,
    //     ['Last Name']: lastName,
    //   },
    // });
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
  app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/#/login' }), function(req, res) {
    res.redirect('/#/account');
  });
};
