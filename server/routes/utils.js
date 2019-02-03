/* eslint-env node */
const logger = require('utils/logger');
const LOGIN_SUCCESS_REDIRECT = '/#/account';
const LOGIN_FAILURE_REDIRECT = '/#/login';

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({
    message: 'access denied',
  });
}

function loginSuccessRedirect(req, res) {
  const defaultRedirect = `${req.host}${LOGIN_SUCCESS_REDIRECT}`;
  if (req.session.redirect) {
    logger.log('info', 'CUSTOM REDIRECT', req.session.redirect);
  } else {
    logger.log('info', 'DEFAULT REDIRECT', defaultRedirect);
  }
  res.redirect(req.session.redirect || defaultRedirect);
}

module.exports = {
  isLoggedIn,
  loginSuccessRedirect,
  LOGIN_SUCCESS_REDIRECT,
  LOGIN_FAILURE_REDIRECT,
};
