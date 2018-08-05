import Service, { inject as service } from '@ember/service';
import AirtableModel from 'hagans-family/pods/airtable/model';
import { bool } from '@ember/object/computed';

export default Service.extend({
  ajax: service(),

  isAuthenticated: bool('user.id'),
  user: null,

  async authorize() {
    const response = await this.get('ajax').request('/api/user');
    const user = new AirtableModel(response);
    this.set('user', user);
  },

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
    } catch (e) {
      throw e;
    }
  },

  async register({ email, password, firstName, lastName }) {
    const response = await this.get('ajax').post('/api/register', {
      data: {
        email,
        password,
        firstName,
        lastName,
      },
    });
    const user = new AirtableModel(response);
    this.set('user', user);
  },

  async logout() {
    await this.get('ajax').post('/api/logout');
    this.set('user');
  },
});
