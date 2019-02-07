import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import ReunionRegistrationModel from 'hagans-family/pods/airtable/reunion-registration-model';
import UserModel from 'hagans-family/pods/airtable/user-model';

export default Route.extend({
  ajax: service(),
  session: service(),

  queryParams: {
    step: {
      refreshModel: true,
    },
  },

  async model() {
    const reunionRegistrationId = this.get('session.user.reunionRegistrationId.0');

    // TODO add query param for 'registering other user' or 'additionalRegistration'
    if (reunionRegistrationId) {
      const reunionRegistration = await this.ajax.request(`/api/reunion_registrations/${reunionRegistrationId}`);
      const registeredByUser = await this.ajax.request(`/api/users/${reunionRegistration.registered_by_id[0]}`);
      return {
        reunionRegistration: new ReunionRegistrationModel(reunionRegistration),
        registeredByUser: new UserModel(registeredByUser),
      };
    }
  },

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('step', null);
    }
  },

  actions: {
    async refreshModel() {
      // manually set for reloading user
      this.controller.set('loading', true);
      await this.session.reloadUser();
      this.refresh();
    },
  },
});
