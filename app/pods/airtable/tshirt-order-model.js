import { computed } from '@ember/object';
import AirtableModel from './model';

export const TSHIRT_PRICE = 20;

export default AirtableModel.extend({
  editableFields: computed(function() {
    return [
      'user_id',
      'T-Shirt Size',
      'Quantity',
      'registrations',
      'Price',
    ];
  }).readOnly(),
});
