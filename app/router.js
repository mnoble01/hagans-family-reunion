import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL,
});

Router.map(function() {
  this.route('login');
  this.route('register');
  this.route('profile');
  this.route('users', function() {
    this.route('user', { path: ':user_id' });
  });
  this.route('password-reset');
  this.route('contact');

  this.route('not-found', { path: '/*path' });
});

export default Router;
