import Component from '@ember/component';

export default Component.extend({
  localClassNames: 'social-login',

  redirect(location) {
    window.location = location;
  },
});
