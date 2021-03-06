import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import keycode from 'keycode';
import { scheduleOnce } from '@ember/runloop';

export default Controller.extend({
  session: service(),
  flashMessages: service(),

  queryParams: ['logout', 'redirect', 'handhold'],
  logout: false,
  handhold: true,

  setup() {
    this._super(...arguments);
    if (this.logout && !this.session.isAuthenticated) {
      scheduleOnce('afterRender', () => {
        this.flashMessages.success('Successfully logged out', { scope: 'login' });
      });
    } else if (this.redirect && !this.redirect.includes('reunion-registration') && !this.session.isAuthenticated) {
      scheduleOnce('afterRender', () => {
        this.flashMessages.info('Please sign in', { scope: 'login' });
      });
    }
    // This brings too much attention to the username / password
    // scheduleOnce('afterRender', () => {
    //   run(() => document.querySelector('input').focus());
    // });
  },

  login: task(function*() {
    this.flashMessages.clearMessages();
    try {
      yield this.session.authenticate({
        email: this.email,
        password: this.password,
      });

      if (this.session.user.status === 'Rejected') {
        this.flashMessages.danger('Your registration request has been rejected.', { scope: 'login' });
      } else if (this.session.user.status === 'Inactive') {
        this.flashMessages.danger('Your account is inactive.', { scope: 'login' });
      } else if (this.redirect) {
        window.location = this.redirect;
      } else {
        this.transitionToRoute('account');
      }
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
