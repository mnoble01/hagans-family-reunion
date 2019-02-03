/* eslint-env node */
const passport = require('passport');
const registerOrLogin = require('passport/register-or-login');
const TwitterStrategy = require('passport-twitter').Strategy;
const routeUtils = require('routes/utils');
const { LOGIN_SUCCESS_REDIRECT, LOGIN_FAILURE_REDIRECT } = routeUtils;
const logger = require('utils/logger');

function imageUrl(url) {
  if (!url) return;
  return url.replace('_normal', '') ;
}

passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: 'https://hagans.family/auth/twitter/callback',
    includeEmail: true,
    includeStatus: false,
    includeEntities: false,
  },
  function(token, tokenSecret, profile, done) {
    logger.log('info', 'TWITTER PROFILE', profile);
    const name = profile.displayName.split(' ');
    const firstName = name[0];
    const lastName = name[1];
    const email = profile.emails[0].value;
    const profileImageUrl = imageUrl(profile.photos && profile.photos[0] && profile.photos[0].value);
    registerOrLogin({
      done,
      email,
      firstName,
      lastName,
      profileImageUrl,
      registrationSource: 'Twitter',
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
