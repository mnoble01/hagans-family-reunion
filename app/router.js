import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL,
});

Router.map(function() {
  this.route('login');
  this.route('register');
  this.route('account');
  this.route('users', function() {
    this.route('user', { path: ':user_id' });
  });
  this.route('password-reset');
  this.route('contact');

  this.route('not-found', { path: '/*path' });
  this.route('past-years', function() {
    this.route('2017-reunion');
    this.route('2015-reunion');
    this.route('2013-reunion');
    this.route('2011-reunion');
    this.route('2009-reunion');
  });
  this.route('2019-reunion', function() {
    this.route('announcements');
    this.route('dates');
    this.route('accommodations');
    this.route('fees');
    this.route('t-shirts');
    this.route('committee');
    this.route('suggestions');
  });
  this.route('logout');
  this.route('post', { path: '/posts/:post_id' });
  this.route('privacy');
  this.route('admin', function() {
    this.route('posts', function() {
      this.route('new');
      this.route('edit-post', { path: ':post_id/edit' });
    });
  });
});

export default Router;
