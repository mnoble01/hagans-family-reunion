import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { computed, set } from '@ember/object';
import { readOnly } from '@ember/object/computed';
import AirtableModel from 'hagans-family/pods/airtable/model';
import TshirtOrderModel from 'hagans-family/pods/airtable/tshirt-order-model';

const EDITABLE_FIELDS = Object.freeze([
  'tShirtSize',
  'quantity',
]);

export default Component.extend({
  localClassNames: 'tshirt-order-form',
  session: service(),
  flashMessages: service(),
  ajax: service(),

  onSuccess() {},

  init() {
    this._super(...arguments);
    this.loadTshirtSizes.perform();
  },

  loadTshirtSizes: task(function*() {
    try {
      const response = yield this.ajax.request('/api/tshirt_sizes');
      return response.map(size => new AirtableModel(size));
    } catch (e) {
      this.handleError(e);
    }
  }),

  tshirtSizes: readOnly('loadTshirtSizes.lastSuccessful.value'),

  editedOrders: computed(() => ([{}])),

  addOrder() {
    this.editedOrders.pushObject({});
  },

  removeOrder(order) {
    this.editedOrders.removeObject(order);
  },

  setTshirtSize(order, { id }) {
    set(order, 'tShirtSize', [id]);
    set(order, 'selectedTshirtSize', this.tshirtSizes.findBy('id', id));
    this.notifyPropertyChange('canSubmit');
  },

  setQuantity(order, { target: { value: quantity } }) {
    set(order, 'quantity', parseInt(quantity, 10));
    this.notifyPropertyChange('canSubmit');
  },

  canSubmit: computed(`editedOrders.@each.${EDITABLE_FIELDS}`, function() {
    return this.editedOrders.every((order) => {
      return EDITABLE_FIELDS.every(field => order[field]);
    });
  }),

  submit: task(function*() {
    this.flashMessages.clearMessages();
    try {
      const tshirtOrders = yield Promise.all(this.editedOrders.map((orderFields) => {
        return this.createOrder.perform(orderFields);
      }));
      this.onSuccess(tshirtOrders);
    } catch (e) {
      this.handleError(e);
    }
  }),

  referenceRegistrationId: readOnly('session.user.reunionRegistrationId.0'),

  createOrder: task(function*(orderFields) {
    const tshirtOrderModel = new TshirtOrderModel;
    tshirtOrderModel.set('userId', [this.session.user.id]);
    tshirtOrderModel.set('registrations', [this.referenceRegistrationId]);

    for (const key of EDITABLE_FIELDS) {
      tshirtOrderModel.set(key, orderFields[key]);
    }

    const response = yield this.ajax.post('/api/tshirt_orders', {
      data: tshirtOrderModel.serialize(),
    });

    return new TshirtOrderModel(response);
  }),

  handleError(error) {
    this.flashMessages.danger(error, { scope: 'form' });
  },
});
