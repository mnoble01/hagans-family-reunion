import Controller from '@ember/controller';
import { alias } from '@ember/object/computed';
import { computed, observer } from '@ember/object';
import { readOnly } from '@ember/object/computed';
import moment from 'moment';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import AirtableModel from 'hagans-family/pods/airtable/model';

export default Controller.extend({
  ajax: service(),
  queryParams: ['edit', 'tab'],
  edit: false,
  tab: 'info',

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

  _loadRelationships: observer('tab', 'user', function() {
    if (this.tab === 'relationships') {
      this.loadRelationships.perform();
    }
  }),

  loadRelationships: task(function*() {
    if (this.user) {
      const motherReqs = Promise.all((this.user.mother || []).map(id => this._fetchUser(id)));
      const fatherReq = Promise.all((this.user.father || []).map(id => this._fetchUser(id)));
      const siblingsReq = Promise.all((this.user.siblings || []).map(id => this._fetchUser(id)));
      const childrenReq = Promise.all((this.user.childrenReq || []).map(id => this._fetchUser(id)));
      const [mother, father, siblings, children] = yield Promise.all([motherReqs, fatherReq, siblingsReq, childrenReq]);
      this.set('relationships', {
        mother,
        father,
        siblings,
        children,
      });
    }
  }),

  async _fetchUser(id) {
    const user = await this.ajax.request(`/api/users/${id}`);
    return new AirtableModel(user);
  },

  // TODO edit mode
});
