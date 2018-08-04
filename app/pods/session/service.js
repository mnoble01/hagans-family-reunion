// import DS from 'ember-data';
// import ESASession from 'ember-simple-auth/services/session';
// import { computed } from '@ember/object';
import Service, { inject as service } from '@ember/service';
import AirtableModel from 'hagans-family/pods/airtable/model';

export default Service.extend({
  ajax: service(),

  isAuthenticated: false,
  user: null,

  async authenticate() {
    try {
      const response = await this.get('ajax').post('/api/login', {
        data: {
          email: 'makala.noble@gmail.com',
          password: 'password',
        },
      });
      const user = new AirtableModel(response);
      console.log('airtable user model', user);
      this.set('user', user);
      this.set('isAuthenticated', true);
    } catch (e) {
      this.set('isAuthenticated', false);
      throw e;
    }
  },
});
