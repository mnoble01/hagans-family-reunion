/* eslint-env node */
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const registerOrLogin = require('passport/register-or-login');
const routeUtils = require('routes/utils');
const { loginSuccessRedirect, setCustomDirect, LOGIN_FAILURE_REDIRECT } = routeUtils;
const logger = require('utils/logger');

function imageUrl(userId) {
  const size = 500;
  return `http://graph.facebook.com/${userId}/picture?height=${size}&width=${size}`;
}

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: 'https://hagans.family/auth/facebook/callback',
    profileFields: ['id', 'email', 'link', 'name', 'photos'],
  },
  function(accessToken, refreshToken, profile, done) {
    logger.log('info', 'FACEBOOK PROFILE', profile);
    const firstName = profile.name.givenName;
    const lastName = profile.name.familyName;
    const email = profile.emails && profile.emails[0] && profile.emails[0].value;
    const profileImageUrl = imageUrl(profile.id);
    registerOrLogin({
      done,
      email,
      firstName,
      lastName,
      profileImageUrl,
      registrationSource: 'Facebook',
    });
  }
));

module.exports = function(app) {
  // Facebook login
  // Redirect the user to Facebook for authentication.  When complete,
  // Facebook will redirect the user back to the application at
  //     /auth/facebook/callback
  app.get('/auth/facebook', setCustomDirect, passport.authenticate('facebook', {
    scope: ['email', 'public_profile'],
  }));

  // Facebook will redirect the user to this URL after approval.  Finish the
  // authentication process by attempting to obtain an access token.  If
  // access was granted, the user will be logged in.  Otherwise,
  // authentication has failed.
  app.get('/auth/facebook/callback', passport.authenticate('facebook', {
    failureRedirect: LOGIN_FAILURE_REDIRECT,
  }), loginSuccessRedirect);
};
