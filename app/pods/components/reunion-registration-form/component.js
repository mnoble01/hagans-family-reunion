import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { and, readOnly } from '@ember/object/computed';
import { task } from 'ember-concurrency';
import AirtableModel from 'hagans-family/pods/airtable/model';
import UserModel from 'hagans-family/pods/airtable/user-model';
import ReunionRegistrationModel from 'hagans-family/pods/airtable/reunion-registration-model';

const ALL_EDITABLE_USER_FIELDS = [
  'firstName',
  'lastName',
  'email',
  'birthDate',
  'phone',
  'address',
];
const ALL_EDITABLE_REGISTRATION_FIELDS = [
  'tShirtSize',
  'relationship',
];

export default Component.extend({
  localClassNames: 'reunion-registration-form',

  session: service(),
  ajax: service(),

  onSuccess() {},

  init() {
    this._super(...arguments);
    this.loadTshirtSizes.perform();
  },

  user: computed(function() {
    return new UserModel;
  }),

  loadTshirtSizes: task(function*() {
    try {
      const response = yield this.ajax.request('/api/tshirt_sizes');
      return response.map(size => new AirtableModel(size));
    } catch (e) {
      this.handleError(e);
    }
  }),

  tshirtSizes: readOnly('loadTshirtSizes.lastSuccessful.value'),

  setTshirtSize({ id }) {
    this.set('editedRegistrationFields.tShirtSize', [id]);
  },

  selectedTshirtSize: computed('editedRegistrationFields.tShirtSize.0', 'tshirtSizes', function() {
    const sizeId = this.get('editedRegistrationFields.tShirtSize.0');
    return this.tshirtSizes && this.tshirtSizes.findBy('id', sizeId);
  }),

  registeringSelf: computed('session.user.id', 'user.id', function() {
    return this.get('user.id') === this.get('session.user.id');
  }),

  editableUserFields: computed('registeringSelf', function() {
    if (this.registeringSelf) {
      return ALL_EDITABLE_USER_FIELDS;
    } else {
      const unnecessaryFields = ['phone', 'address'];
      return ALL_EDITABLE_USER_FIELDS.reject(field => unnecessaryFields.includes(field));
    }
  }),

  editedUserFields: computed('user', function() {
    const user = this.user;
    return this.editableUserFields.reduce((memo, fieldKey) => {
      memo[fieldKey] = user[fieldKey];
      return memo;
    }, {});
  }),

  editableRegistrationFields: computed('registeringSelf', function() {
    if (this.registeringSelf) {
      const unnecessaryFields = ['relationship'];
      return ALL_EDITABLE_REGISTRATION_FIELDS.reject(field => unnecessaryFields.includes(field));
    } else {
      return ALL_EDITABLE_REGISTRATION_FIELDS;
    }
  }),

  editedRegistrationFields: computed(function() {
    return {};
  }),

  validUserFields: computed('editableUserFields', `editedUserFields.{${ALL_EDITABLE_USER_FIELDS}}`, function() {
    const userFields = this.editedUserFields;
    const notRequired = this.registeringSelf ? [] : ['email'];
    const requiredUserFields = this.editableUserFields.reject(fieldKey => notRequired.includes(fieldKey));
    return requiredUserFields.every(fieldKey => userFields[fieldKey]);
  }),

  validRegistrationFields: computed('editableRegistrationFields', `editedRegistrationFields.{${ALL_EDITABLE_REGISTRATION_FIELDS}}`, function() {
    const regFields = this.editedRegistrationFields;
    return this.editableRegistrationFields.every(fieldKey => regFields[fieldKey]);
  }),

  canSubmit: and('validUserFields', 'validRegistrationFields'),

  submit: task(function*() {
    this.flashMessages.clearMessages();
    try {
      const user = yield this.createOrUpdateUser.perform();
      const reunionRegistration = yield this.createReunionRegistration.perform(user);

      this.get('onSuccess')(user, reunionRegistration);
    } catch (e) {
      this.flashMessages.danger(e, { scope: 'form' });
    }
  }),

  createOrUpdateUser: task(function*() {
    const user = this.user;
    const userFields = this.editedUserFields;
    for (const key of Object.keys(userFields)) {
      user.set(key, userFields[key]);
    }
    if (this.registeringSelf) {
      const response = yield this.ajax.put(`/api/users/${user.id}`, {
        data: JSON.stringify(user.serialize()),
      });
      return new UserModel(response);
    } else {
      const response = yield this.get('ajax').post('/api/users/register_other', {
        data: {
          email: userFields.email,
          attrs: user.serialize(),
        },
      });
      return new UserModel(response);
    }
  }),

  createReunionRegistration: task(function*(user) {
    const registration = new ReunionRegistrationModel;
    registration.set('userId', [user.id]);
    registration.set('registeredById', [this.session.user.id]);

    const regFields = this.editedRegistrationFields;
    for (const key of Object.keys(regFields)) {
      registration.set(key, regFields[key]);
    }

    const response = yield this.ajax.post('/api/reunion_registrations', {
      data: JSON.stringify(registration.serialize()),
    });

    return new ReunionRegistrationModel(response);
  }),

  // TODO this goes in its own route
  // app.post('/api/tshirt_orders', isLoggedIn, creationCallback(TSHIRT_ORDER_TABLE));
  createTshirtOrder: task(function*() {
    this.clearFlashMessages();
    try {
      // console.log('create t-shirt order');
    } catch (e) {
      this.handleError(e);
    }
  }),
});
