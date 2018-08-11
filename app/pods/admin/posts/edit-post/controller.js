import Controller from '@ember/controller';
import { alias, equal, readOnly } from '@ember/object/computed';
import { task, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { camelize } from '@ember/string';
import moment from 'moment';
import PostModel from 'hagans-family/pods/airtable/post-model';

export default Controller.extend({
  ajax: service(),
  flashMessages: service(),

  post: alias('model.post'),
  isDraft: equal('post.status', 'Draft'),
  isPublished: equal('post.status', 'Publish'),

  canEdit: readOnly('isDraft'),

  // Maybe use airtable form for attachments?

  // TODO add fields:
  // Featured image (upload)
  // Show featured image (checkbox)
  // Categories

  // 'Add attachment'

  setup() {
    if (this.canEdit) {
      for (const field of this.post.editableFields) {
        const camelizedField = camelize(field);
        this.addObserver(`post.${camelizedField}`, () => {
          this.get('_debouncedSave').perform();
        });
      }
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

  removeAttachment: task(function*(id) {
    const attachments = [...this.post.attachments];
    this.post.set('attachments', attachments.reject(a => a.id === id));
  }),

  addAttachment: task(function*() {
    this.set('showAddAttachmentModal', true);
    this.set('uploadAttachmentCallback', (url) => {
      const attachments = [...this.post.attachments];
      attachments.push({ url });
      this.post.set('attachments', attachments);
      this.set('showAddAttachmentModal', false);
      this._pollAttachmentChanges.perform();
    });
  }),

  upload: task(function*(file) {
    const url = '/api/upload';

    try {
      yield file.readAsDataURL();
      const response = yield file.upload(url);
      this.get('uploadAttachmentCallback')(response.body.url);
    } catch (e) {
      this.flashMessages.danger(e, { scope: 'add-attachment-modal' });
    }
  }),

  _pollAttachmentChanges: task(function*() {
    // TODO add model names to Airtable model &
    // methods for reloading and editing
    yield timeout(1000);
    const response = yield this.ajax.request(`/api/posts/${this.post.id}`);
    const post = new PostModel(response);
    const attachments = post.attachments || [];
    if (attachments.find(a => !a.thumbnails)) {
      this._pollAttachmentChanges.perform();
    } else {
      this.set('post', post);
    }
  }),
});
