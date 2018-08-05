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
      children: [],
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
