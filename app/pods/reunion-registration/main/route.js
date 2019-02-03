import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import ReunionRegistrationModel from 'hagans-family/pods/airtable/reunion-registration-model';
import UserModel from 'hagans-family/pods/airtable/user-model';

export default Route.extend({
  ajax: service(),
  session: service(),

  async model() {
    const reunionRegistrationId = this.get('session.user.reunionRegistrationId.0');
    const tshirtSizes = (await this.ajax.request('/api/tshirt_sizes')).mapBy('Name');

    if (reunionRegistrationId) {
      const reunionRegistration = await this.ajax.request(`/api/reunion_registrations/${reunionRegistrationId}`);
      const registeredByUser = await this.ajax.request(`/api/users/${reunionRegistration.registered_by_id[0]}`);
      return {
        reunionRegistration: new ReunionRegistrationModel(reunionRegistration),
        registeredByUser: new UserModel(registeredByUser),
        tshirtSizes,
      };
    } else {
      return {
        tshirtSizes,
      };
    }
  },

  actions: {
    refreshModel() {
      this.refresh();
    },
  },
});
