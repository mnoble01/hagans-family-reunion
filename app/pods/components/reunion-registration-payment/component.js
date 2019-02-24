import Component from '@ember/component';
import { computed } from '@ember/object';
import { TSHIRT_PRICE } from 'hagans-family/pods/airtable/tshirt-order-model';

export default Component.extend({
  localClassNames: 'reunion-registration-payment',

  reunionRegistration: null,
  registeredByUser: null,
  dependentRegistrations: null,

  remainingFeesDue: 0,
  totalFeesDue: 0,

  tshirtPrice: TSHIRT_PRICE,

  rows: computed('reunionRegistration', 'dependentRegistrations', function() {
    return [this.reunionRegistration, ...this.dependentRegistrations];
  }),
});
