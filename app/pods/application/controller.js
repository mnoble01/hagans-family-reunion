import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import fadeTransition from 'ember-animated/transitions/fade';
import { computed } from '@ember/object';

export default Controller.extend({
  flashMessages: service(),
  router: service(),

  fadeTransition,

  transitionTo() {
    this.transitionToRoute(...arguments);
  },

  onIndexPage: computed('router.currentRouteName', function() {
    return this.router.currentRouteName === 'index';
  }),

  onPostPage: computed('router.currentRouteName', function() {
    return this.router.currentRouteName === 'post';
  }),
});
