import { computed } from '@ember/object';
import AirtableModel from './model';

export default AirtableModel.extend({
  editableFields: computed(function() {
    return [
      // basic info
      'First Name',
      'Last Name',
      'Birth Date',
      'Profile Image',
      'Phone',
      'Address',
      'Contact Methods',
      'Email',
      // relationships
      'Mother',
      'Father',
      'Siblings',
      'Spouse',
      'Children',
    ];
  }).readOnly(),
});
