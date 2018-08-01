import Route from '@ember/routing/route';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';
import { inject as service } from '@ember/service';

export default Route.extend(ApplicationRouteMixin, {
  airtable: service(),

  async model() {
    const users = await this.get('airtable').fetch('users');
    console.log('users', users);
  },
});
