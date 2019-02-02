import { computed } from '@ember/object';
import AirtableModel from './model';

export default AirtableModel.extend({
  editableFields: computed(function() {
    return [
      'Delivery Method',
      'Subject',
      'Content',
      'Attachments',
      'Type',
      'Reply To',
      'From User',
      'To User',
    ];
  }).readOnly(),
});
