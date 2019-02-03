import Controller from '@ember/controller';
import { task } from 'ember-concurrency';
import { computed } from '@ember/object';
import { alias, and, readOnly } from '@ember/object/computed';
import { inject as service } from '@ember/service';
// import ReunionRegistrationModel from 'hagans-family/pods/airtable/reunion-registration-model';

// const EDITABLE_FIELDS = (new ReunionRegistrationModel).clientEditableFields;

// TODO need reunion-registration-form
// TODO need tshirt-order-form
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
];

export default Controller.extend({
  session: service(),

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
    // const regFields = this.editedRegistrationFields;
    return true;
  }),

  canSubmit: and('validUserFields', 'validRegistrationFields'),

  submit: task(function*() {
    this.flashMessages.clearMessages();
    try {
      // Create or update user

      // const response = await this.get('ajax').post('/api/register', {
      //   data: {
      //     email,
      //     password,
      //     firstName,
      //     lastName,
      //   },
      // });
      // const user = new UserModel(response);

      // const communicationModel = new CommunicationModel;
      // for (const key of Object.keys(this.editedFields)) {
      //   communicationModel.set(key, this.editedFields[key]);
      // }
      //
      // yield this.get('ajax').post('/api/communications', {
      //   data: communicationModel.serialize(),
      // });
      //
      // this.flashMessages.info('Successfully sent!', {
      //   scope: 'communication-form',
      // });
      this.set('success', true);
    } catch (e) {
      this.flashMessages.danger(e, { scope: 'form' });
    }
  }),


  // app.get('/api/users/by_email/:email',
  // app.post('/api/reunion_registrations', isLoggedIn, creationCallback(REGISTRATION_TABLE));
  //
  // app.get('/api/reunion_registrations/:id', isLoggedIn, findCallback(REGISTRATION_TABLE));
  //
  // app.post('/api/tshirt_orders', isLoggedIn, creationCallback(TSHIRT_ORDER_TABLE));
  //
  // app.get('/api/tshirt_sizes', isLoggedIn, fetchCallback(TSHIRT_SIZE_TABLE));

  createReunionRegistration: task(function*() {
    // 'user_id',
    // 'registered_by_id',
    // 'First Name',
    // 'Last Name',
    // 'Email',
    // 'Birth Date',
    // 'Phone',
    // 'Address',
    // 'Relationship',
    // 'T-Shirt Size',
    this.clearFlashMessages();
    try {
      // console.log('create reunion registration');
    } catch (e) {
      this.handleError(e);
    }
  }),

  // TODO this goes in its own route
  createTshirtOrder: task(function*() {
    this.clearFlashMessages();
    try {
      // console.log('create t-shirt order');
    } catch (e) {
      this.handleError(e);
    }
  }),
});
