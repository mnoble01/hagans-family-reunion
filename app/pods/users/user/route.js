import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import AirtableModel from 'hagans-family/pods/airtable/model';

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
    const user = await this.get('ajax').request(`/api/users/${params.user_id}`);
    return { user: new AirtableModel(user) };
  },

  afterModel(model) {
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
