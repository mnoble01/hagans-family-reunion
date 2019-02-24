import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  session: service(),

  afterModel(model, transition) {
    this._super(...arguments);

    // If is authenticated & has already registered, move to the main registration page
    const hasRegistration = this.get('session.user.reunionRegistrationId.0');
    if (this.session.isAuthenticated && hasRegistration) {
      this.replaceWith('reunion-registration.main');
    }
  },
});
