import { computed } from '@ember/object';
import AirtableModel from './model';

export default AirtableModel.extend({
  editableFields: computed(function() {
    return [
      'Title',
      'Content',
      'Status',
      'Featured Image',
      'Show Featured Image',
      'Attachments',
      'Published On',
      'Author',
      'Categories',
    ];
  }).readOnly(),
});
