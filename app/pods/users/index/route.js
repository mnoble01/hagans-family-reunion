import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import AirtableModel from 'hagans-family/pods/airtable/model';

export default Route.extend({
  titleToken: 'People',

  ajax: service(),
  session: service(),

  beforeModel() {
    if (this.session.userIsPending) {
      this.transitionTo('account');
    }
  },

  async model() {
    const users = await this.get('ajax').request('/api/users');
    return { users: users.map(u => new AirtableModel(u)) };
  },
});
