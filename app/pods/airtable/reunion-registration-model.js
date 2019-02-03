import { computed } from '@ember/object';
import AirtableModel from './model';

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
    ];
  }).readOnly(),
});
