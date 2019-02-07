import { computed } from '@ember/object';
import AirtableModel from './model';
import moment from 'moment';

export default AirtableModel.extend({
  editableFields: computed(function() {
    return [
      'user_id',
      'registered_by_id',
      'First Name',
      'Last Name',
      'Email',
      'Birth Date',
      'Phone',
      'Address',
      'Relationship',
      'T-Shirt Size',
      'Year',
    ];
  }).readOnly(),

  init() {
    this._super(...arguments);
    // Set to current year
    this.set('year', moment().year());
  },
});
