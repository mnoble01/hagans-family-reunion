import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import moment from 'moment';

const FEES_DUE_DATE = 'May 15th, 2019';

const STEPS = Object.freeze({
  ADDITIONAL_REGISTRATION: 'additional_registration',
  SUCCESSFUL_REGISTRATION: 'success',

  TSHIRT_ORDER_DECISION: 'tshirt_order?',
  ADDITIONAL_TSHIRT_ORDER: 'tshirt_order',

  PAYMENT: 'payment',
});

export default Controller.extend({
  session: service(),

  queryParams: ['step', 'reunionRegistrationId'],
  step: null,
  reunionRegistrationId: null,

  STEPS,

  reunionRegistration: alias('model.reunionRegistration'),
  registeredByUser: alias('model.registeredByUser'),
  dependentRegistrations: alias('model.dependentRegistrations'),
  tshirtOrders: alias('model.tshirtOrders'),

  allRegistrations: computed('reunionRegistration', 'dependentRegistrations', function() {
    return [this.reunionRegistration, ...this.dependentRegistrations];
  }),

  remainingFeesDue: computed('allRegistrations', 'tshirtOrders', function() {
    return sum(this.allRegistrations, 'remainingFeesDue');
  }),

  totalFeesDue: computed('allRegistrations', 'tshirtOrders', function() {
    return sum(this.allRegistrations, 'totalFeesDue');
  }),

  formExpired: computed(function() {
    const deadline = moment('2019-07-12');
    const now = moment();
    return now.isAfter(deadline);
  }),

  feesDueDate: FEES_DUE_DATE,

  currentYear: computed(function() {
    return moment().year();
  }),

  onRegistrationSuccess(user, reunionRegistration) {
    this.set('reunionRegistrationId', reunionRegistration.id);
    this.set('step', STEPS.SUCCESSFUL_REGISTRATION);
  },
});

function sum(array, objectKey) {
  return array.reduce((sum, object) => {
    return sum + object[objectKey];
  }, 0);
}
