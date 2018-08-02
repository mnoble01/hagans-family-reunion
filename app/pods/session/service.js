// import DS from 'ember-data';
import ESASession from 'ember-simple-auth/services/session';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

export default ESASession.extend({
  ajax: service(),

  user: computed('isAuthenticated', function() {
    console.log('isAuthenticated', this.get('isAuthenticated'));
    if (this.get('isAuthenticated')) {
      console.log('get user');
      // return this.get('store').queryRecord('user')
      // const promise = this.get('store').queryRecord('user', {});
      // return DS.PromiseObject.create({ promise: promise });
      return this.get('ajax').request('user');
    }
  }),

  // Does ember-simple-autho already have this??
  // authorize() {
  //
  // },
});
