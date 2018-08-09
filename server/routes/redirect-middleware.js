/* eslint-env node */

// function requireHttps(req, res, next) {
//   if (!req.secure && req.get('x-forwarded-proto') !== 'https' && process.env.NODE_ENV !== 'development' && !req.url.startsWith('/api')) {
//     return res.redirect('https://' + req.host + req.url);
//   } else {
//     return next();
//   }
// }

// redirect www to non-www
// function wwwRedirect(req, res, next) {
//   if (req.headers.host.slice(0, 4) === 'www.' && !req.url.startsWith('/api')) {
//     const newHost = req.headers.host.slice(4);
//     return res.redirect(301, req.protocol + '://' + newHost + req.originalUrl);
//   } else {
//     return next();
//   }
// }

module.exports = function(app) {
  // Enable reverse proxy support in Express. This causes the
  // the "X-Forwarded-Proto" header field to be trusted so its
  // value can be used to determine the protocol. See
  // http://expressjs.com/api#app-settings for more details.
  // app.enable('trust proxy');

  // app.use(wwwRedirect);
  // app.use(requireHttps);

  // :( couldn't get this all to work
};
