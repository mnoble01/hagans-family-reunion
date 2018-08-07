import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import PostModel from 'hagans-family/pods/airtable/post-model';

export default Route.extend({
  ajax: service(),

  async model(params) {
    const post = await this.get('ajax').request(`/api/posts/${params.post_id}`);
    return { post: new PostModel(post) };
  },
});
