import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import keycode from 'keycode';

export default Controller.extend({
  session: service(),
  flashMessages: service(),

  login: task(function*() {
    this.flashMessages.clearMessages();
    try {
      yield this.session.authenticate({
        email: this.email,
        password: this.password,
      });
      this.transitionToRoute('profile');
    } catch (e) {
      this.flashMessages.danger(e);
    }
  }),

  onEnter(event) {
    if (keycode.isEventKey(event, 'enter')) {
      this.login.perform();
    }
  },
});
