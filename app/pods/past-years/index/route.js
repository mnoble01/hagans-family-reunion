import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { computed, get } from '@ember/object';
import { getOwner } from '@ember/application';

export default Route.extend({
  session: service(),

  beforeModel() {
    if (this.session.userIsPending) {
      this.transitionTo('account');
    }
  },

  model() {
    return { pastYearRoutes: this.pastYearRoutes };
  },

  pastYearRoutes: computed(function() {
    const router = getOwner(this).lookup('router:main');
    const routes = get(router, '_routerMicrolib.recognizer.names');
    const pastYearRoutes = Object.keys(routes).reduce((memo, route) => {
      if (/^past-years.\d{4}-reunion$/.test(route)) {
        memo.push({
          route,
          name: route.match(/\d{4}/)[0],
        });
      }
      return memo;
    }, []);
    return pastYearRoutes.sortBy('name').reverse();
  }),
});
