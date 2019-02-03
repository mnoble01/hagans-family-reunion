import Controller from '@ember/controller';
import { task } from 'ember-concurrency';
import { computed } from '@ember/object';
import { alias, and, readOnly } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import moment from 'moment';
import UserModel from 'hagans-family/pods/airtable/user-model';
import ReunionRegistrationModel from 'hagans-family/pods/airtable/reunion-registration-model';

const EDITABLE_USER_FIELDS = [
  'firstName',
  'lastName',
  'email',
  'birthDate',
  'phone',
  'address',
];
const EDITABLE_REGISTRATION_FIELDS = [
  'tShirtSize',
  'relationship',
];

export default Controller.extend({
  session: service(),
  ajax: service(),

  formExpired: computed(function() {
    const deadline = moment('2019-07-12');
    const now = moment();
    return now.isAfter(deadline);
  }),

  editedUserFields: computed('session.user', function() {
    const user = this.session.user;
    return EDITABLE_USER_FIELDS.reduce((memo, fieldKey) => {
      memo[fieldKey] = user[fieldKey];
      return memo;
    }, {});
  }),

  editedRegistrationFields: computed(function() {
    return {};
  }),

  reunionRegistration: alias('model.reunionRegistration'),
  registeredByUser: alias('model.registeredByUser'),
  tshirtSizes: readOnly('model.tshirtSizes'),

  registeringSelf: true,

  validUserFields: computed(`editedUserFields.{${EDITABLE_USER_FIELDS}}`, function() {
    const userFields = this.editedUserFields;
    return EDITABLE_USER_FIELDS.every(fieldKey => userFields[fieldKey]);
  }),

  validRegistrationFields: computed(`editedRegistrationFields.{${EDITABLE_REGISTRATION_FIELDS}}`, function() {
    const regFields = this.editedRegistrationFields;
    return EDITABLE_REGISTRATION_FIELDS.every(fieldKey => regFields[fieldKey]);
  }),

  canSubmit: and('validUserFields', 'validRegistrationFields'),

  submit: task(function*() {
    this.flashMessages.clearMessages();
    try {
      let user = this.registeringSelf ? this.session.user : new UserModel;
      const userFields = this.editedUserFields;
      for (const key of Object.keys(userFields)) {
        user.set(key, userFields[key]);
      }

      if (this.registeringSelf) {
        yield this.ajax.put(`/api/users/${user.id}`, {
          data: JSON.stringify(user.serialize()),
        });
      } else {
        user = yield this.createOrUpdateUser.perform(user);
      }

      yield this.createReunionRegistration.perform(user);

      this.send('refreshModel');
    } catch (e) {
      this.flashMessages.danger(e, { scope: 'form' });
    }
  }),

  createOrUpdateUser: task(function*(user) {
    // Get user by email app.get('/api/users/by_email/:email')
    // IF USER EXISTS
    // update with attrs not filled in -- have to modify the UPDATE USER API for this
    // ELSE
    // Create new Pending user - can I use the register route??

    // const response = await this.get('ajax').post('/api/register', {
    //   data: {
    //     email,
    //     password,
    //     firstName,
    //     lastName,
    //   },
    // });
  }),

  createReunionRegistration: task(function*(user) {
    const registration = new ReunionRegistrationModel;
    registration.set('user_id', [user.id]);
    registration.set('registered_by_id', [this.session.user.id]);

    const regFields = this.editedRegistrationFields;
    for (const key of Object.keys(regFields)) {
      user.set(key, regFields[key]);
    }

    yield this.ajax.post('/api/reunion_registrations', {
      data: JSON.stringify(registration.serialize()),
    });
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
