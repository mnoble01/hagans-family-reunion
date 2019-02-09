import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import keycode from 'keycode';

export default Controller.extend({
  flashMessages: service(),
  session: service(),

  queryParams: ['redirect', 'handhold'],
  handhold: true,

  register: task(function*() {
    this.flashMessages.clearMessages();

    if (this.password !== this.passwordConfirm) {
      this.flashMessages.danger('Password does not match password confirmation', {
        scope: 'form',
      });
      return;
    }

    try {
      yield this.session.register({
        email: this.email,
        password: this.password,
        firstName: this.firstName,
        lastName: this.lastName,
      });
      const user = this.session.user;
      if (user.status === 'Rejected') {
        this.flashMessages.info('Your registration request has been rejected.', {
          scope: 'form',
        });
      } else if (user.status === 'Inactive') {
        this.flashMessages.info('Your account is inactive.', { scope: 'form' });
      } else {
        const redirect = this.redirect;
        const userIsPending = user.status === 'Pending Review';
        const reunionRegistration = redirect && redirect.includes('reunion-registration');
        const doRedirect = (userIsPending && reunionRegistration) || (!userIsPending && redirect);
        if (doRedirect) {
          window.location = this.redirect;
        } else {
          this.transitionToRoute('account');
        }
      }
    } catch (e) {
      this.flashMessages.danger(e, { scope: 'form' });
    }
  }),

  onEnter(event) {
    if (keycode.isEventKey(event, 'enter')) {
      this.register.perform();
    }
  },
});
