import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  activate() {
    if (this.get('_isRouteDestination')) {
      this.get('router').transitionTo(...this._getTransitionParams());
    }
  },

  _isUrlDestination: computed('destination', function() {
    const destination = this.get('destination');

    return typeof destination === 'string' && /[/:]/.test(destination);
  }),

  _isRouteDestination: computed('destination', function() {
    return this.get('destination') && !this.get('_isUrlDestination');
  }),
});
