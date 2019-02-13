import Service, { inject as service } from '@ember/service';
import UserModel from 'hagans-family/pods/airtable/user-model';
import { computed, observer } from '@ember/object';
import { bool, equal } from '@ember/object/computed';
import ENV from 'hagans-family/config/environment';
import bugsnag from '@bugsnag/js';
import Ember from 'ember';

export default Service.extend({
  ajax: service(),

  isAuthenticated: bool('user.id'),
  user: null,
  userIsPending: equal('user.status', 'Pending Review'),
  userPermissions: computed('user.permissions', function() {
    return this.isAuthenticated && this.user.permissions || [];
  }),

  init() {
    this._super(...arguments);
    this._initBugsnag();
    this._initFullstory();
  },

  _initBugsnag() {
    const bugsnagClient = this.bugsnagClient;
    Ember.onerror = function(error) {
      bugsnagClient.notify(error);
      if (Ember.testing) {
        throw error;
      }
    };
  },

  bugsnagClient: computed(function() {
    const apiKey = ENV.bugsnag.apiKey;
    if (apiKey) {
      return bugsnag(apiKey);
    } else {
      return {
        notify: () => {},
      };
    }
  }),

  _setBugsnagClientUser: observer('user', function() {
    const user = this.user;
    this.bugsnagClient.user = user && user.serialize();
  }),

  _initFullstory() {
    if (this.user) {
      // eslint-disable-next-line no-undef
      FS.identify(this.user.id, {
        displayName: this.user.fullName,
        email: this.user.email,
        // Add your own custom user variables here, details at
        // http://help.fullstory.com/develop-js/setuservars
      });
    }
  },

  _initFullstoryOnUserChange: observer('user', function() {
    this._initFullstory();
  }),

  async authorize() {
    const response = await this.get('ajax').request('/api/user');
    const user = new UserModel(response);
    this.set('user', user);
  },

  reloadUser() {
    return this.authorize();
  },

  async authenticate({ email, password }) {
    try {
      const response = await this.get('ajax').post('/api/login', {
        data: {
          email,
          password,
        },
      });
      const user = new UserModel(response);
      this.set('user', user);
    } catch (e) {
      e.message = `Authentication failed: {e.message}`;
      this.bugsnagClient.notify(e);
    }
  },

  async register({ email, password, firstName, lastName }) {
    const response = await this.get('ajax').post('/api/register', {
      data: {
        email,
        password,
        firstName,
        lastName,
      },
    });
    const user = new UserModel(response);
    this.set('user', user);
  },

  async logout() {
    await this.get('ajax').post('/api/logout');
    this.set('user');
  },
});
