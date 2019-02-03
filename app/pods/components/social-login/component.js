import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { getOwner } from '@ember/application';

export default Component.extend({
  localClassNames: 'social-login',

  router: service(),

  redirect(location) {
    const currentRouteName = this.get('router.currentRouteName');
    const params = getOwner(this).lookup('route:application').paramsFor(currentRouteName);
    const queryParams = params.redirect ? `?redirect=${encodeURIComponent(params.redirect)}` : '';
    window.location = `${location}${queryParams}`;
  },
});
