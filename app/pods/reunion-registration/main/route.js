import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import ReunionRegistrationModel from 'hagans-family/pods/airtable/reunion-registration-model';
import UserModel from 'hagans-family/pods/airtable/user-model';
import TshirtOrderModel from 'hagans-family/pods/airtable/tshirt-order-model';

export default Route.extend({
  ajax: service(),
  session: service(),

  queryParams: {
    step: {
      refreshModel: true,
    },
    reunionRegistrationId: {
      refreshModel: true,
      as: 'reg_id',
    },
  },

  async model(params) {
    const reunionRegistrationId = params.reunionRegistrationId || this.get('session.user.reunionRegistrationId.0');

    if (reunionRegistrationId) {
      const reunionRegistration = new ReunionRegistrationModel(
        await this.ajax.request(`/api/reunion_registrations/${reunionRegistrationId}`)
      );
      const registeredByUser = new UserModel(
        await this.ajax.request(`/api/users/${reunionRegistration.registeredById.firstObject}`)
      );
      const dependentRegistrations = (
        await this.ajax.request(`/api/users/${reunionRegistration.userId.firstObject}/reunion_registrations`)
      ).map(response => new ReunionRegistrationModel(response));

      const tshirtOrderIds = reunionRegistration.additionalTShirtOrders || [];
      const tshirtOrderResponses = await Promise.all(tshirtOrderIds.map((orderId) => {
        return this.ajax.request(`/api/tshirt_orders/${orderId}`);
      }));
      const tshirtOrders = tshirtOrderResponses.map(response => new TshirtOrderModel(response));

      return {
        reunionRegistration,
        registeredByUser,
        tshirtOrders,
        // Remove duplicate toplevel registration
        dependentRegistrations: dependentRegistrations.reject(reg => reg.id === reunionRegistration.id),
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
