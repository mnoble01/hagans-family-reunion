import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

export default Controller.extend({
  session: service(),

  canPost: computed(function() {
    return this.session.userPermissions.includes('can_post');
  }),
});
