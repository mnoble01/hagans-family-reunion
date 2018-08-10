import Controller from '@ember/controller';
import { alias } from '@ember/object/computed';
import { task, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { camelize } from '@ember/string';

export default Controller.extend({
  ajax: service(),
  flashMessages: service(),

  post: alias('model.post'),
  // Auto save
  // Maybe use airtable form for attachments?


  // TODO get post content auto saving w/ save indicator

  // TODO add fields:
  // Featured image (upload)
  // Show featured image (checkbox)
  // Categories

  // On initial save:
  // Set 'author'

  // On debounced save:
  // Or debounce save each field separately??
  // Set 'title'
  // Set 'content'
  // Set 'featuredImage'
  // Set 'showFeaturedImage'
  // Set 'categories'

  // On publish:
  // Set 'status' to 'Published'
  // Set 'publishedOn'
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
});
