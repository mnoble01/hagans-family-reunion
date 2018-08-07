import Controller from '@ember/controller';
import { alias } from '@ember/object/computed';
import { computed, observer, get } from '@ember/object';
import { readOnly } from '@ember/object/computed';
import moment from 'moment';
import { task, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import UserModel from 'hagans-family/pods/airtable/user-model';

export default Controller.extend({
  ajax: service(),
  session: service(),
  flashMessages: service(),

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
      this.set('addressLocation', get(response, 'geometry.location'));
      this.set('formattedAddress', get(response, 'formatted_address'));
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
      const spouseReq = Promise.all((this.user.spouse || []).map(id => this._fetchUser(id)));
      const childrenReq = Promise.all((this.user.children || []).map(id => this._fetchUser(id)));
      const [mother, father, siblings, spouse, children] = yield Promise.all([motherReqs, fatherReq, siblingsReq, spouseReq, childrenReq]);
      this.set('relationships', {
        mother,
        father,
        siblings,
        spouse,
        children,
      });
    }
  }),

  async _fetchUser(id) {
    const user = await this.ajax.request(`/api/users/${id}`);
    return new UserModel(user);
  },

  _loadEditSupport: observer('tab', function() {
    if (this.tab === 'edit') {
      this.loadUsers.perform();
    }
  }),

  loadUsers: task(function*() {
    const users = yield this.get('ajax').request('/api/users');
    this.set('allUsers', users.map(u => new UserModel(u)));
  }),

  editedFields: computed('user', 'formattedAddress', 'allUsers', function() {
    return {
      birthDate: this.user.birthDate,
      contactMethods: this.user.contactMethods,
      phone: this.user.phone,
      address: this.formattedAddress || this.user.address,
    };
  }),

  editedRelationships: computed('user', 'allUsers', function() {
    const allUsers = this.allUsers || [];
    return {
      mother: allUsers.filter(user => (this.user.mother || []).includes(user.id)),
      father: allUsers.filter(user => (this.user.father || []).includes(user.id)),
      siblings: allUsers.filter(user => (this.user.siblings || []).includes(user.id)),
      spouse: allUsers.filter(user => (this.user.spouse || []).includes(user.id)),
      children: allUsers.filter(user => (this.user.children || []).includes(user.id)),
    };
  }),

  updateUser: task(function*() {
    for (const key of Object.keys(this.editedFields)) {
      this.user.set(key, this.editedFields[key]);
    }
    for (const key of Object.keys(this.editedRelationships)) {
      const userIds = this.editedRelationships[key].mapBy('id');
      this.user.set(key, userIds);
    }

    try {
      yield this.ajax.put(`/api/users/${this.user.id}`, {
        data: JSON.stringify(this.user.serialize()),
      });
      this.flashMessages.success('Your information has been updated', { scope: 'update-user' });
      yield timeout(1500);
      this.send('refreshModel');
      this.transitionToRoute('users.user', this.user.id, { queryParams: { tab: 'info' } });
    } catch (e) {
      this.flashMessages.danger(e, { scope: 'update-user' });
    }
  }),
});
