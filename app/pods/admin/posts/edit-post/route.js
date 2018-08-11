import Route from '@ember/routing/route';
import PostModel from 'hagans-family/pods/airtable/post-model';
import AirtableModel from 'hagans-family/pods/airtable/model';
import { inject as service } from '@ember/service';

export default Route.extend({
  ajax: service(),

  titleToken({ post }) {
    return post.title ? `Edit Post - ${post.title}` : 'Edit Post';
  },

  async model(params) {
    const [post, categories] = await Promise.all([
      this.get('ajax').request(`/api/posts/${params.post_id}`),
      this.get('ajax').request(`/api/post_categories`),
    ]);
    return {
      post: new PostModel(post),
      categories: categories.map(cat => new AirtableModel(cat)),
    };
  },

  setupController() {
    this._super(...arguments);
    const controller = this.controllerFor(this.routeName);
    controller.setup();
  },
});
