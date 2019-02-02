import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  session: service(),
  // TODO try to load all reunion registrations for user
  // And show something else if they exist

  afterModel(model, transition) {
    this._super(...arguments);

    // If is authenticated, move to first step
  },
});
