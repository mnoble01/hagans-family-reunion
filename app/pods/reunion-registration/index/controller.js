import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

export default Controller.extend({
  session: service(),

  redirectHere: computed(function() {
    return window.location.toString();
  }),
});
