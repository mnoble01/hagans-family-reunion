import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  acceptedMimeTypes: computed(function() {
    return [
      'image/*',
      'application/pdf',
    ];
  }),
});
