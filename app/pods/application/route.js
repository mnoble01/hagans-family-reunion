import Route from '@ember/routing/route';
// import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';
import { inject as service } from '@ember/service';

// export default Route.extend(ApplicationRouteMixin, {
export default Route.extend({
  airtable: service(),
  session: service(),
  // TODO support deep linking

  async model() {
    await this.get('session').authorize();
  },

  // afterModel({ model }, transition) {
  //   // The session endpoint will always return a minimal payload (e.g. CSRF info)
  //   // even if the user isn't actually signed in, so we need to force a logout
  //   // if there's no actual active user.
  //   if (!(model.user.id && model.organization.id)) {
  //     window.location = SIGN_OUT_URL;
  //     transition.abort();
  //   }
  // },
});
