import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import PostModel from 'hagans-family/pods/airtable/post-model';
import UserModel from 'hagans-family/pods/airtable/user-model';

export default Route.extend({
  ajax: service(),

  async model(params) {
    const postResponse = await this.get('ajax').request(`/api/posts/${params.post_id}`);
    const post = new PostModel(postResponse);
    const authorId = post.author[0];
    const author = await this.get('ajax').request(`/api/users/${authorId}`);
    return { post, author: new UserModel(author) };
  },
});
