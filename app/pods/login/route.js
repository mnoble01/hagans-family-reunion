import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  session: service(),
  queryParams: {
    logout: {
      refreshModel: true,
    },
  },

  titleToken: 'Login',

  async model() {
    const { logout } = this.paramsFor(this.routeName);
    if (this.session.isAuthenticated) {
      if (logout) {
        await this.session.logout();
      } else {
        this.transitionTo('account');
      }
    }
  },

  setupController() {
    this._super(...arguments);
    const controller = this.controllerFor(this.routeName);
    controller.setup();
  },

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('logout', false);
    }
  },
});
