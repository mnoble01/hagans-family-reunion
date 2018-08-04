import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default Controller.extend({
  flashMessages: service(),

  register: task(function*() {
    console.log('register');
    // TODO check password === passwordConfirm
  }),
});
