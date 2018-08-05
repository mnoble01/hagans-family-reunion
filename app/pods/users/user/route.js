import Route from '@ember/routing/route';

export default Route.extend({
  // titleToken({ model }) {
    // return model.firstName; // TODO make sure this works
  titleToken() {
    return 'User';
  },

  model() {
    console.log('GET USER');
  },
});
