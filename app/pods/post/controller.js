import Controller from '@ember/controller';
import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';

export default Controller.extend({
  post: alias('model.post'),
  author: alias('model.author'),

  featuredImageUrl: computed('post.featuredImage.firstObject.url', function() {
    return this.get('post.featuredImage.firstObject.url') || '/images/watercolor.jpg';
  }),

  categoriesForDisplay: computed('post.categories', function() {
    return (this.post.categories || []).join(', ');
  }),
});
