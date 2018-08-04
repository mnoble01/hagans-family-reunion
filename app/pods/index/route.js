import Route from '@ember/routing/route';
// import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';
import { inject as service } from '@ember/service';

// export default Route.extend(ApplicationRouteMixin, {
export default Route.extend({
  session: service(),
  ajax: service(),

  async model() {
    // TODO this should actually be authorizing (not authenticating) by getting the current user
    // TODO handle errors (with flash messages)
    await this.get('session').authenticate();
  },
});
