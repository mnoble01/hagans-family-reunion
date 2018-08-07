import Service, { inject as service } from '@ember/service';
import UserModel from 'hagans-family/pods/airtable/user-model';
import { bool, equal } from '@ember/object/computed';

export default Service.extend({
  ajax: service(),

  isAuthenticated: bool('user.id'),
  user: null,
  userIsPending: equal('user.status', 'Pending Review'),

  async authorize() {
    const response = await this.get('ajax').request('/api/user');
    const user = new UserModel(response);
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
      const user = new UserModel(response);
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
    const user = new UserModel(response);
    this.set('user', user);
  },

  async logout() {
    await this.get('ajax').post('/api/logout');
    this.set('user');
  },
});
