import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({
  localClassNames: 'app-header',
  session: service(),

  menuItems: computed(function() {
    return [{
      route: '2019-reunion',
      name: '2019 Reunion',
      children: [{
        route: '2019-reunion.announcements',
        name: 'Announcements',
      }, {
        route: '2019-reunion.dates',
        name: 'Dates & Itinerary',
      }, {
        route: '2019-reunion.accommodations',
        name: 'Travel & Accommodations',
      }, {
        route: '2019-reunion.fees',
        name: 'Fees',
      }, {
        route: '2019-reunion.t-shirts',
        name: 'T-Shirts',
      }, {
        route: '2019-reunion.committee',
        name: 'Planning Committee',
      }, {
        route: '2019-reunion.suggestions',
        name: 'Suggestions',
      }],
    }, {
      route: 'users',
      name: 'People',
    }, {
      route: 'past-years',
      name: 'Past Years',
      children: [], // TODO generate
    }, {
      route: 'account',
      name: 'Account',
      children: [{
        action: this.logout,
        name: 'Logout',
      }],
    }];
  }),

  logout() {
    this.transitionTo('login', { queryParams: { logout: true } });
  },
});
