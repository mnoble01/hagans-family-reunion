import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import moment from 'moment';

const STEPS = Object.freeze({
  ADDITIONAL_REGISTRATION: 'additional_registration',
  SUCCESSFUL_REGISTRATION: 'success',

  TSHIRT_ORDER_DECISION: 'tshirt_order?',
  ADDITIONAL_TSHIRT_ORDER: 'tshirt_order',

  PAYMENT: 'payment',
});

export default Controller.extend({
  session: service(),

  queryParams: ['step'],
  step: null,

  STEPS,

  // For ordering t-shirts:
  // referenceRegistrationId: readOnly('session.user.reunionRegistrationId.0'),

  reunionRegistration: alias('model.reunionRegistration'),
  registeredByUser: alias('model.registeredByUser'),

  formExpired: computed(function() {
    const deadline = moment('2019-07-12');
    const now = moment();
    return now.isAfter(deadline);
  }),

  currentYear: computed(function() {
    return moment().year();
  }),

  // onRegistrationSuccess() {
  //   this.set('successfullyRegistered', true);
  //   this.send('refreshModel');
  // },

  // registerAnother() {
  //   this.set('successfullyRegistered');
  // },
});
