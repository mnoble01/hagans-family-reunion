import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import keycode from 'keycode';
import { scheduleOnce } from '@ember/runloop';

export default Controller.extend({
  session: service(),
  flashMessages: service(),

  queryParams: ['logout'],
  logout: false,

  setup() {
    this._super(...arguments);
    if (this.logout && !this.session.isAuthenticated) {
      scheduleOnce('afterRender', () => {
        this.flashMessages.success('Successfully logged out', { scope: 'login' });
      });
    }
  },

  login: task(function*() {
    this.flashMessages.clearMessages();
    try {
      yield this.session.authenticate({
        email: this.email,
        password: this.password,
      });
      this.transitionToRoute('account');
    } catch (e) {
      this.flashMessages.danger(e, { scope: 'login' });
    }
  }),

  onEnter(event) {
    if (keycode.isEventKey(event, 'enter')) {
      this.login.perform();
    }
  },
});
