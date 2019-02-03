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

function setCustomDirect(req, res, next()) {
  logger.log('info', 'SET CUSTOM REDIRECT', req.query);
  req.session.redirect = req.query.redirect || null;
  next();
}

function loginSuccessRedirect(req, res) {
  const defaultRedirect = `${req.hostname}${LOGIN_SUCCESS_REDIRECT}`;
  if (req.session.redirect) {
    logger.log('info', 'CUSTOM REDIRECT', req.session.redirect);
  } else {
    logger.log('info', 'DEFAULT REDIRECT', defaultRedirect);
  }
  res.redirect(req.session.redirect || defaultRedirect);
  req.session.redirect = null;
}

module.exports = {
  isLoggedIn,
  loginSuccessRedirect,
  setCustomDirect,
  LOGIN_SUCCESS_REDIRECT,
  LOGIN_FAILURE_REDIRECT,
};
