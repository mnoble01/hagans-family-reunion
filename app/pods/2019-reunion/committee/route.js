import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import AirtableModel from 'hagans-family/pods/airtable/model';

export default Route.extend({
  titleToken: 'People',

  ajax: service(),

  async model() {
    const response = await this.get('ajax').request('/api/users');
    const airtableUsers = response.map(u => new AirtableModel(u));
    const users = airtableUsers.filter((user) => {
      const groups = user.userGroups || [];
      return groups.includes('2019 planning committee');
    });
    return { users };
  },
});
