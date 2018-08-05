import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  session: service(),

  titleToken: 'Register',

  beforeModel() {
    if (this.session.isAuthenticated) {
      this.transitionTo('profile');
    }
  },
});
