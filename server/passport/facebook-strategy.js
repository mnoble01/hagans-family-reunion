/* eslint-env node */
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
// const registerOrLogin = require('passport/register-or-login');

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: 'https://hagans.family/auth/facebook/callback',
    profileFields: ['id', 'email', 'link', 'name'],
  },
  function(accessToken, refreshToken, profile, done) {
    console.log('FACEBOOK PROFILE', profile);
    console.log(Object.keys(profile));
    // TODO should work for both registration and login
    // registerOrLogin({
    //   done,
    //   email,
    //   password,
    //   registrationSource: 'Facebook',
    //   airtableAttrs: {
    //     ['First Name']: req.body.firstName,
    //     ['Last Name']: req.body.lastName,
    //   },
    // });
  }
));

module.exports = function(app) {
  // Facebook login
  // Redirect the user to Facebook for authentication.  When complete,
  // Facebook will redirect the user back to the application at
  //     /auth/facebook/callback
  app.get('/auth/facebook', passport.authenticate('facebook'));

  // Facebook will redirect the user to this URL after approval.  Finish the
  // authentication process by attempting to obtain an access token.  If
  // access was granted, the user will be logged in.  Otherwise,
  // authentication has failed.
  app.get('/auth/facebook/callback', passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/#/login' }));
};
