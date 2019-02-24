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
  session: service(),

  init() {
    this._super(...arguments);
    this.communicationModel = new CommunicationModel;
  },

  didInsertElement() {
    this._super(...arguments);
    run(() => {
      const input = document.querySelector('input');
      if (input) input.focus();
    });
  },

  hasFromUser: notEmpty('editedFields.fromUser'),

  fromUser: computed('session.user.id', function() {
    const userId = this.get('session.user.id');
    if (userId) return [userId];
  }),

  isValid: computed('hasFromUser', 'editedFields.{content,replyTo}', function() {
    const content = this.editedFields.content;
    const replyTo = this.editedFields.replyTo;
    const hasContent = content && content.trim();
    const validFromUser = this.hasFromUser || replyTo && replyTo.trim();
    return hasContent && validFromUser;
  }),

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
