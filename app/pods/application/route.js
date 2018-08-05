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
    const onLoginPage = window.location.pathname === '/login';
    const hasRedirectParam = window.location.search.indexOf('redirect') > -1;
    if (!this.session.isAuthenticated && !onLoginPage && !hasRedirectParam) {
      this.transitionTo('login', { queryParams: { redirect: window.location.href } });
    }
  },


  title(tokens = []) {
    return [...tokens.reverse(), 'Hagans Family'].join(' - ');
  },
});
