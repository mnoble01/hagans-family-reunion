import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  session: service(),

  beforeModel() {
    this.transitionTo('users.user', this.get('session.user.id'));
  },
});
