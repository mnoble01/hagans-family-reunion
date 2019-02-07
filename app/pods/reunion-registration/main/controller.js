import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import moment from 'moment';

export default Controller.extend({
  session: service(),

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

  onRegistrationSuccess() {
    this.set('successfullyRegistered', true);
  },

  // registerAnother() {
  //   this.set('successfullyRegistered');
  // },
});
