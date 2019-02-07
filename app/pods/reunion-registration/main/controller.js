import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import moment from 'moment';

export default Controller.extend({
  session: service(),

  // Might want to consolidate these into a single 'step' parameter
  queryParams: ['additionalRegistration', 'orderingTshirts'],
  additionalRegistration: false,
  orderingTshirts: false,

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

  onRegistrationSuccess() {
    this.set('successfullyRegistered', true);
    this.send('refreshModel');
  },

  // registerAnother() {
  //   this.set('successfullyRegistered');
  // },
});
