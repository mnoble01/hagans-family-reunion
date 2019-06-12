import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import UserModel from 'hagans-family/pods/airtable/user-model';

export default Route.extend({
  ajax: service(),
  session: service(),

  queryParams: {
    tab: {
      refreshModel: false,
    },
  },

  titleToken({ user }) {
    return `${user.firstName} ${user.lastName}`;
  },

  async model(params) {
    // eslint-disable-next-line
    console.log('PARAMS', params);;
    // eslint-disable-next-line
    console.log('ajax', this.ajax);
    // eslint-disable-next-line
    console.log('UserModel', UserModel);
    const user = await this.get('ajax').request(`/api/users/${params.user_id}`);
    return { user: new UserModel(user) };
  },

  afterModel(model) {
    this._super(...arguments);
    if (this.session.userIsPending && model.user.id !== this.session.user.id) {
      this.transitionTo('account');
    }
  },


  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('tab');
    }
  },

  actions: {
    refreshModel() {
      this.refresh();
    },
  },
});
