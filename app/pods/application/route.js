import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import ENV from 'hagans-family/config/environment';
import { get } from '@ember/object';

export default Route.extend({
  session: service(),
  router: service(),
  flashMessages: service(),

  init() {
    this._super(...arguments);
    // Hack to work around ember-cli-document-title's use of the private `router`
    this.router.setTitle = (...params) => this._router.setTitle(...params);
  },

  beforeModel() {
    if (ENV.environment === 'production') {
      let newLocation = window.location.href;
      if (window.location.protocol === 'http:') {
        newLocation = newLocation.replace('http', 'https');
      }
      if (window.location.host.startsWith('www.')) {
        newLocation = newLocation.replace('www.', '');
      }
      if (newLocation !== window.location.href) {
        window.location = newLocation;
      }
    }
  },

  async model() {
    try {
      await this.get('session').authorize();
    } catch (e) {
      // do nothing,
      // swallow model hook to error
    }
  },

  afterModel(model, transition) {
    // if not authenticated, transition to login with 'redirect' parameter
    const unauthRoutes = [
      'index',
      'login',
      'register',
      'contact',
      'post',
      'reunion-registration.index',
    ];
    const onWhitelistedPage = unauthRoutes.some(route => route === transition.targetName);
    const hasRedirectParam = window.location.hash.indexOf('redirect') > -1;

    if (!this.session.isAuthenticated && !hasRedirectParam && !onWhitelistedPage) {
      this.transitionTo('login', { queryParams: { redirect: window.location.href } });
    }
  },


  title(tokens = []) {
    return [...tokens.reverse(), 'Hagans Family'].join(' - ');
  },

  actions: {
    loading(transition, route) {
      // By default, mark the entire application controller as being in the loading state
      let controller = this.controller;

      // If we're transitioning within a single route, mark that controller as loading instead
      if (this.router.currentRouteName === route.fullRouteName) {
        controller = route.controller;
      }

      // If there is no active controller, just do nothing
      if (!controller) return true;

      controller.set('loading', true);
      transition.finally(() => controller.set('loading', false));

      return true;
    },

    error(error, transition) {
      const payloadMessage = error && get(error, 'payload.error') || error && get(error, 'payload.message');
      const errorMessage = error && get(error, 'message');
      const messages = ['Error', errorMessage, payloadMessage].compact();
      this.flashMessages.danger(messages);
      return true;
    },

    refreshModel() {
      this.refresh();
    },

    didTransition() {
      this.flashMessages.clearMessages();
    },
  },
});
