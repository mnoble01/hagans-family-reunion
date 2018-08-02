import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  session: service(),

  actions: {
    authenticate() {
      const { login, password } = this.getProperties('login', 'password');
      this.get('session').authenticate('authenticator:oauth2', login, password).then(() => {
        console.info('Success authenticaing!');
      }, (err) => {
        console.error('Error obtaining token: ' + err.responseText);
      });
    },
  },
});
