import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  session: service(),

  titleToken: '2019',

  beforeModel() {
    if (this.session.userIsPending) {
      this.transitionTo('account');
    }
  },
});
