/* eslint-env node */

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

module.exports = {
  isLoggedIn,
  LOGIN_SUCCESS_REDIRECT,
  LOGIN_FAILURE_REDIRECT,
};
