/* eslint-env node */
const passport = require('passport');
const registerOrLogin = require('passport/register-or-login');
const TwitterStrategy = require('passport-twitter').Strategy;
const routeUtils = require('routes/utils');
const { LOGIN_SUCCESS_REDIRECT, LOGIN_FAILURE_REDIRECT } = routeUtils;

passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: 'https://hagans.family/auth/twitter/callback',
  },
  function(token, tokenSecret, profile, done) {
    console.log('TWITTER PROFILE', profile);
    const firstName = profile.name.givenName;
    const lastName = profile.name.familyName;
    const email = profile.emails[0].value;
    registerOrLogin({
      done,
      email,
      registrationSource: 'Google',
      airtableAttrs: {
        ['First Name']: firstName,
        ['Last Name']: lastName,
      },
    });
  }
));

module.exports = function(app) {
  // Redirect the user to Twitter for authentication.  When complete, Twitter
  // will redirect the user back to the application at
  //   /auth/twitter/callback
  app.get('/auth/twitter', passport.authenticate('twitter'));

  // Twitter will redirect the user to this URL after approval.  Finish the
  // authentication process by attempting to obtain an access token.  If
  // access was granted, the user will be logged in.  Otherwise,
  // authentication has failed.
  app.get('/auth/twitter/callback', passport.authenticate('twitter', {
    successRedirect: LOGIN_SUCCESS_REDIRECT,
    failureRedirect: LOGIN_FAILURE_REDIRECT,
  }));
};
