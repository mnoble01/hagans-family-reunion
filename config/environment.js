'use strict';

module.exports = function(environment) {
  const ENV = {
    modulePrefix: 'hagans-family',
    podModulePrefix: 'hagans-family/pods',
    environment,
    rootURL: '/',
    // locationType: 'auto',
    locationType: 'hash',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false,
      },
    },
    // moment
    moment: {
      // outputFormat: 'MMMM Do YYYY',
      outputFormat: 'LL',
    },

    flashMessageDefaults: {
      sticky: true,
      allowClose: true,
      destroyOnClick: false,
    },

    googleFonts: [
      'Lato',
      'Noto+Serif:400,700',
    ],

    bugsnag: {
      apiKey: process.env.BUGSNAG_API_KEY,
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
  }

  if (environment === 'production') {
    // here you can enable a production-specific feature
  }

  return ENV;
};
