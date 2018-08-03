import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({
  session: service(),

  login() {
    console.log('login');
    // const { login, password } = this.getProperties('login', 'password');
    // this.get('session').authenticate('authenticator:oauth2', login, password).then(() => {
    //   console.info('Success authenticaing!');
    // }, (err) => {
    //   console.error('Error obtaining token: ' + err.responseText);
    // });
  },

  register() {
    console.log('register');
  },
});
