import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  authManager: service('session'),

  actions: {
    authenticate() {
      const { login, password } = this.getProperties('login', 'password');
      this.get('authManager').authenticate('authenticator:oauth2', login, password).then(() => {
        alert('Success authenticaing!');
      }, (err) => {
        alert('Error obtaining token: ' + err.responseText);
      });
    },
  },
});
