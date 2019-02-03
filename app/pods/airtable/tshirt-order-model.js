import { computed } from '@ember/object';
import AirtableModel from './model';

export default AirtableModel.extend({
  editableFields: computed(function() {
    return [
      'user_id',
      'T-Shirt Size',
      'Quantity',
      'registrations',
    ];
  }).readOnly(),
});
