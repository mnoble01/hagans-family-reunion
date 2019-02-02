import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  session: service(),
  queryParams: {
    redirect: {
      refreshModel: true,
    },
    handhold: { // Additional guidance
      refreshModel: false,
    },
  },

  titleToken: 'Register',

  beforeModel() {
    if (this.session.isAuthenticated) {
      if (this.redirect) {
        window.location = this.redirect;
      } else {
        this.transitionTo('profile');
      }
    }
  },
});
