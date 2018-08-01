import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  airtable: service(),

  async model() {
    const users = await this.get('airtable').fetch('users');
    console.log('users', users);
  },
});
