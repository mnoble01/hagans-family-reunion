import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { computed } from '@ember/object';

export default Controller.extend({
  session: service(),

  redirectHere: computed(function() {
    return window.location.toString();
  }),

  // What happens if users with accounts try to register
  // BUT they are not signed in????
  createUser: task(function*() {
    this.clearFlashMessages();
    try {
      yield this.session.register({
        email: this.email,
        password: this.password,
        firstName: this.firstName,
        lastName: this.lastName,
      });
      const user = this.session.user;
      // if (user.status === 'Pending Review') {
      //   this.transitionToRoute('account');
      // } else if (user.status === 'Rejected') {
      //   this.flashMessages.info('Your registration request has been rejected.', {
      //     scope: 'form',
      //   });
      // } else if (user.status === 'Inactive') {
      //   this.flashMessages.info('Your account is inactive.', { scope: 'form' });
      // } else {
      //   this.transitionToRoute('account');
      // }
    } catch (e) {
      this.handleError(e);
    }
  }),

  // TODO might want to split up into separate routes....
  createReunionRegistration: task(function*() {
    this.clearFlashMessages();
    try {
      console.log('create reunion registration');
    } catch (e) {
      this.handleError(e);
    }
  }),

  createTshirtOrder: task(function*() {
    this.clearFlashMessages();
    try {
      console.log('create t-shirt order');
    } catch (e) {
      this.handleError(e);
    }
  }),

  handleError(e) {
    this.flashMessages.danger(e, { scope: 'form' });
  },

  clearFlashMessages() {
    this.flashMessages.clearMessages();
  },
});
