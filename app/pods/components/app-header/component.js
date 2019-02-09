import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed, get, observer } from '@ember/object';
import { getOwner } from '@ember/application';

export default Component.extend({
  localClassNames: 'app-header',
  session: service(),
  router: service(),

  showMenu: false,

  // When route changes, hide menu
  _hideMenu: observer('router.currentRouteName', function() {
    this.set('showMenu', false);
  }),

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

  menuItems: computed('pastYearRoutes', 'session.user', 'router.currentRouteName', function() {
    if (!this.session.isAuthenticated) return;

    if (this.get('session.user.status') === 'Pending Review') {
      return this.pendingReviewMenuItems;
    } else {
      return this.authenticatedMenuItems;
    }
  }),

  pendingReviewMenuItems: computed(function() {
    return [{
      route: 'account',
      name: 'Account',
      children: [{
        action: this.logout,
        name: 'Logout',
      }],
    }];
  }),

  authenticatedMenuItems: computed('this.session.currentURL', 'pastYearRoutes', 'adminMenuItems', function() {
    return [{
      route: '2019-reunion',
      name: '2019 Reunion',
      children: [{
      // Uncomment when going live
      //   route: 'reunion-registration',
      //   name: 'Registration',
      // }, {
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
      children: this.pastYearRoutes,
    },
    ...this.adminMenuItems,
    {
      route: 'account',
      name: 'Account',
      isActive: this.router.currentURL.endsWith(this.session.user.id),
      children: [{
        action: this.logout,
        name: 'Logout',
      }],
    }];
  }),

  adminMenuItems: computed('this.session.isAuthenticated', 'session.userPermissions', function() {
    const permissions = this.session.userPermissions;
    if (!permissions.includes('is_admin')) return [];

    const canPost = permissions.includes('can_post');
    // const canEmail = permissions.includes('can_email');

    const children = [{
      route: 'admin.posts',
      name: 'My Posts',
      visible: canPost,
    }];
    const visibleChildren = children.filter(child => child.visible);
    if (!visibleChildren.length) {
      return [];
    }

    return [{
      route: 'admin',
      name: 'Admin',
      children: visibleChildren,
    }];
  }),

  logout() {
    this.transitionTo('login', { queryParams: { logout: true } });
  },
});
