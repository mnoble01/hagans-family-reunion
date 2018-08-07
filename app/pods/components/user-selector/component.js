import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  options: computed('users', function() {
    return (this.users || []).sortBy('firstName');
  }),
});
