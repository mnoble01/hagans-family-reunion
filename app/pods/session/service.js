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
  },

  _initBugsnag() {
    const bugsnagClient = this.bugsnagClient;
    Ember.onerror = function(error) {
      bugsnagClient.notify(error);
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

  async authorize() {
    const response = await this.get('ajax').request('/api/user');
    const user = new UserModel(response);
    this.set('user', user);
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
      throw e;
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
