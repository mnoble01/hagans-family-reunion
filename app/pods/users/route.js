import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  titleToken: 'People',

  ajax: service(),
  session: service(),

  async model() {
    const users = await this.get('ajax').request('/api/users');
    console.log(users);
  },
});
