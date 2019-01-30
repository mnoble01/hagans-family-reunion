import Controller from '@ember/controller';
import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default Controller.extend({
  session: service(),

  post: alias('model.post'),
  author: alias('model.author'),

  featuredImageUrl: computed('post.featuredImage.firstObject.url', function() {
    return this.get('post.featuredImage.firstObject.url') || '/images/watercolor.jpg';
  }),

  categoriesForDisplay: computed('post.categories', 'model.categories', function() {
    const allCategories = this.model.categories;
    const postCategoryIds = this.post.categories;
    return allCategories.filter(cat => postCategoryIds.includes(cat.id)).mapBy('name').join(', ');
  }),

  canEdit: computed('session.{user.id,session.userPermissions}', 'author', 'post.status', function() {
    const permissions = this.session.userPermissions;
    const isAdmin = permissions.includes('is_admin');
    const canPost = permissions.includes('can_post');
    const author = this.author;
    const correctStatus = ['Draft', 'Published'].includes(this.post.status);
    const correctPermissions = this.session.user.id === author.id && canPost || isAdmin;
    return correctPermissions && correctStatus;
  }),
});
