import Route from '@ember/routing/route';
// import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';
import { inject as service } from '@ember/service';

// export default Route.extend(ApplicationRouteMixin, {
export default Route.extend({
  session: service(),
  ajax: service(),

  async model() {
    // TODO this should actually be authorizing
    // console.log('application/index model hook');
    // // this.get('session').authenticate('authenticator:oauth2', login, password).then(() => {
    // await this.get('session').authenticate('authenticator:oauth2', 'EMAIL', 'PASS').then(() => {
    //   console.info('Success authenticaing!');
    // }, (err) => {
    //   console.log(err);
    //   console.error('Error obtaining token: ' + err.responseText);
    // });

    // TODO handle errors (with flash messages)
    await this.get('session').authenticate();
  },
});
