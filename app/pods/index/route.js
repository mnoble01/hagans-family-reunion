import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import AirtableModel from 'hagans-family/pods/airtable/model';

export default Route.extend({
  session: service(),
  ajax: service(),

  async model() {
    const response = await this.get('ajax').request('/api/posts', {
      data: {
        status: 'Published',
      },
    });
    const posts = response.slice(0, 12).map(post => new AirtableModel(post));
    const authorIds = posts.map(post => post.author).uniq();
    const authorsResponses = await Promise.all(authorIds.map((authorId) => {
      return this.get('ajax').request(`/api/users/${authorId}`);
    }));
    const authors = authorsResponses.map(author => new AirtableModel(author));
    return { posts, authors };
  },
});
