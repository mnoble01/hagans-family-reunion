import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  airtable: service(),
  session: service(),
  router: service(),

  init() {
    this._super(...arguments);
    // Hack to work around ember-cli-document-title's use of the private `router`
    this.router.setTitle = (...params) => this._router.setTitle(...params);
  },

  async model() {
    try {
      await this.get('session').authorize();
    } catch (e) {
      // do nothing,
      // swallow model hook to error
    }
  },

  afterModel() {
    // if not authenticated, transition to login with 'redirect' parameter
    const onLoginPage = window.location.hash === '#/login';
    const hasRedirectParam = window.location.hash.indexOf('redirect') > -1;
    if (!this.session.isAuthenticated && !onLoginPage && !hasRedirectParam) {
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

    // error(err, transition) {
    //   const handler = this.get('errorHandler');
    //
    //   if (err && err.status === NOT_FOUND) {
    //     transition.send('notFound', transition);
    //   } else if (err && err.status === FORBIDDEN) {
    //     this.transitionTo('forbidden');
    //   } else {
    //     next(handler, handler.handleServerError, err);
    //   }
    // },

    didTransition() {
      this.flashMessages.clearMessages();
    },
  },
});
