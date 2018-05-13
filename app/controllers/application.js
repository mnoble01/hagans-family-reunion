import Controller from '@ember/controller';
import { computed } from '@ember/object';

export default Controller.extend({
  menuItems: computed(function() {
    return [{
      label: '2019 Reunion',
      destination: '2019-reunion',
      children: [{
        label: 'Announcements',
        destination: 'announcements',
      }, {
        label: 'Dates & Itinerary',
        destination: 'dates',
      }, {
        label: 'Travel & Accomodations',
        destination: 'accommodations',
      }, {
        label: 'Fees',
        destination: 'fees',
      }, {
        label: 'T-Shirts',
        destination: 't-shirts',
      }, {
        label: 'Planning Committee',
        destination: 'committee',
      }, {
        label: 'Suggestions',
        destination: 'suggestions',
      }]
    }, {
      label: 'People',
      destination: 'members',
    }, {
      label: 'Past Years',
      destination: 'past-years',
      children: [{
        label: '2017',
        destination: '2017',
      }, {
        label: '2015',
        destination: '2015',
      }, {
        label: '2013',
        destination: '2013',
      }, {
        label: '2011',
        destination: '2011',
      }, {
        label: '2009',
        destination: '2009',
      }]
    }, {
      label: 'Account',
      destination: 'account',
      children: [{
        label: 'Profile',
        destination: 'profile',
      }, {
        label: 'Edit Profile',
        destination: 'edit-profile',
      }, {
        label: 'Logout',
        destination: 'logout',
      }]
    }];
  }),

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
