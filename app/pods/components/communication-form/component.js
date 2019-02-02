import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { notEmpty } from '@ember/object/computed';
import { run } from '@ember/runloop';
import { task } from 'ember-concurrency';
import CommunicationModel from 'hagans-family/pods/airtable/communication-model';

const EDITABLE_FIELDS = (new CommunicationModel).clientEditableFields;

export default Component.extend({
  localClassNames: 'communication-form',

  flashMessages: service(),
  ajax: service(),

  init() {
    this._super(...arguments);
    this.communicationModel = new CommunicationModel;
  },

  didInsertElement() {
    this._super(...arguments);
    run(() => document.querySelector('input').focus());
  },

  hasFromUser: notEmpty('editedFields.fromUser'),

  editedFields: computed(...EDITABLE_FIELDS, function() {
    return EDITABLE_FIELDS.reduce((memo, field) => {
      memo[field] = this[field];
      return memo;
    }, {});
  }),

  submit: task(function*() {
    this.flashMessages.clearMessages();
    try {
      const communicationModel = new CommunicationModel;
      for (const key of Object.keys(this.editedFields)) {
        communicationModel.set(key, this.editedFields[key]);
      }

      yield this.get('ajax').post('/api/communications', {
        data: communicationModel.serialize(),
      });

      this.flashMessages.info('Successfully sent!', {
        scope: 'communication-form',
      });
      this.set('success', true);
    } catch (e) {
      this.flashMessages.danger(e, { scope: 'communication-form' });
    }
  }),
});
