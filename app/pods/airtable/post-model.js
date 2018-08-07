import { computed } from '@ember/object';
import AirtableModel from './model';

export default AirtableModel.extend({
  editableFields: computed(function() {
    return [
      'title',
      'content',
    ];
  }).readOnly(),
});
