import Route from '@ember/routing/route';
// import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';
import { inject as service } from '@ember/service';

// export default Route.extend(ApplicationRouteMixin, {
export default Route.extend({
  airtable: service(),

  async model() {
    console.log('application model hook');
    const users = await this.get('airtable').fetch('users');
    console.log('users', users);
  },
});