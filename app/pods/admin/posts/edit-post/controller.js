import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { alias, equal, readOnly } from '@ember/object/computed';
import { task, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { camelize } from '@ember/string';
import moment from 'moment';

export default Controller.extend({
  ajax: service(),
  flashMessages: service(),

  post: alias('model.post'),
  isDraft: equal('post.status', 'Draft'),
  isPublished: equal('post.status', 'Publish'),

  // Maybe use airtable form for attachments?

  // TODO add fields:
  // Featured image (upload)
  // Show featured image (checkbox)
  // Categories

  setup() {
    for (const field of this.post.editableFields) {
      const camelizedField = camelize(field);
      this.addObserver(`post.${camelizedField}`, () => {
        this.get('_debouncedSave').perform();
      });
    }
  },

  _debouncedSave: task(function*() {
    yield timeout(750);
    // unlinked so it doesn't cancel when this task restarts
    yield this.get('savePost').unlinked().perform();
  }).restartable(),

  savePost: task(function*() {
    try {
      yield this.ajax.put(`/api/posts/${this.post.id}`, {
        data: JSON.stringify(this.post.serialize()),
      });
    } catch (e) {
      this.flashMessages.danger(e);
    }
  }).keepLatest(),

  showPublish: readOnly('isDraft'),

  publish: task(function*() {
    // TODO choose whether or not to notify
    this.post.set('status', 'Published');
    this.post.set('publishedOn', moment().format('YYYY-MM-DD'));
  }),

  canEditAttachments: readOnly('isDraft'),
});
