// import DS from 'ember-data';
// import ESASession from 'ember-simple-auth/services/session';
// import { computed } from '@ember/object';
import Service, { inject as service } from '@ember/service';
import AirtableModel from 'hagans-family/pods/airtable/model';
console.log(AirtableModel);

// export default ESASession.extend({
//   ajax: service(),
//
//   user: computed('isAuthenticated', function() {
//     console.log('isAuthenticated', this.get('isAuthenticated'));
//     if (this.get('isAuthenticated')) {
//       console.log('get user');
//       // return this.get('store').queryRecord('user')
//       // const promise = this.get('store').queryRecord('user', {});
//       // return DS.PromiseObject.create({ promise: promise });
//       return this.get('ajax').request('user');
//     }
//   }),
//
//   // Does ember-simple-autho already have this??
//   // authorize() {
//   //
//   // },
// });
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
      this.set('user', user);
      this.set('isAuthenticated', true);
    } catch (e) {
      this.set('isAuthenticated', false);
      throw e;
    }
  },
});
