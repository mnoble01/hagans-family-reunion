import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import PostModel from 'hagans-family/pods/airtable/post-model';
import UserModel from 'hagans-family/pods/airtable/user-model';
import AirtableModel from 'hagans-family/pods/airtable/model';

export default Route.extend({
  ajax: service(),
  session: service(),

  titleToken({ post }) {
    return post.title;
  },

  async model(params) {
    const [postResponse, categories] = await Promise.all([
      this.get('ajax').request(`/api/posts/${params.post_id}`),
      this.get('ajax').request('/api/post_categories'),
    ]);
    const post = new PostModel(postResponse);
    const authorId = post.author && post.author[0];

    let author;
    if (this.session.isAuthenticated && authorId) {
      author = await this.get('ajax').request(`/api/users/${authorId}`);
    } else {
      // We can now fetch posts by id when not authenticated, but we cannot fetch users
      author = { ['First Name']: 'A User' };
    }

    return {
      post,
      author: new UserModel(author),
      categories: categories.map(cat => new AirtableModel(cat)),
    };
  },
});
