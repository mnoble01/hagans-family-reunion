import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import fadeTransition from 'ember-animated/transitions/fade';

export default Controller.extend({
  flashMessages: service(),
  router: service(),

  fadeTransition,
});
