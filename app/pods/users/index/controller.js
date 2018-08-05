import Controller from '@ember/controller';
import { computed } from '@ember/object';

export default Controller.extend({
  users: computed('model.users', function() {
    return this.model.users.sortBy('firstName');
  }),
});
