import Service, { inject as service } from '@ember/service';
import AirtableModel from 'hagans-family/pods/airtable/model';

export default Service.extend({
  ajax: service(),

  isAuthenticated: false,
  user: null,

  async authenticate({ email, password }) {
    try {
      const response = await this.get('ajax').post('/api/login', {
        data: {
          email,
          password,
        },
      });
      const user = new AirtableModel(response);
      this.set('user', user);
      this.set('isAuthenticated', true);
    } catch (e) {
      this.set('isAuthenticated', false);
      throw e;
    }
  },
});
