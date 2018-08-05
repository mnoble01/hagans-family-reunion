import Controller from '@ember/controller';
import { alias } from '@ember/object/computed';
import { computed, observer } from '@ember/object';
import { readOnly } from '@ember/object/computed';
import moment from 'moment';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';

export default Controller.extend({
  ajax: service(),
  queryParams: ['edit'],
  edit: false,

  user: alias('model.user'),

  _loadAddress: observer('user.address', function() {
    this.loadAddressCoordinates.perform();
  }),

  birthDate: computed('user.birthDate', function() {
    return moment(this.user.birthDate);
  }),

  contactMethods: computed('user.contactMethods', function() {
    return this.user.contactMethods.join(', ');
  }),

  loadAddressCoordinates: task(function*() {
    if (this.user.address) {
      const address = this.user.address;
      const response = yield this.ajax.request(`/api/location/${encodeURIComponent(address)}`);
      this.set('addressLocation', response.geometry.location);
      this.set('formattedAddress', response['formatted_address']);
    }
  }),

  addressLat: readOnly('addressLocation.lat'),
  addressLong: readOnly('addressLocation.long'),

  // TODO edit mode
});
