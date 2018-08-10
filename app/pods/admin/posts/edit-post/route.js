import Route from '@ember/routing/route';
import PostModel from 'hagans-family/pods/airtable/post-model';
import { inject as service } from '@ember/service';

export default Route.extend({
  ajax: service(),

  titleToken({ post }) {
    return post.title ? `Edit Post - ${post.title}` : 'Edit Post';
  },

  async model(params) {
    const post = await this.get('ajax').request(`/api/posts/${params.post_id}`);
    return { post: new PostModel(post) };
  },

  setupController() {
    this._super(...arguments);
    const controller = this.controllerFor(this.routeName);
    controller.setup();
  },
});
