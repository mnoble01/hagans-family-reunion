import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import AirtableModel from 'hagans-family/pods/airtable/model';

export default Route.extend({
  ajax: service(),

  titleToken: 'Announcements',

  async model() {
    const response = await this.get('ajax').request('/api/posts', {
      data: {
        status: 'Published',
      },
    });
    const posts = response.map(post => new AirtableModel(post)).filter((post) => {
      return (post.categories || []).includes('2019 Reunion');
    });
    const authorIds = posts.map(post => post.author).uniq();
    const authorsResponses = await Promise.all(authorIds.map((authorId) => {
      return this.get('ajax').request(`/api/users/${authorId}`);
    }));
    const authors = authorsResponses.map(author => new AirtableModel(author));
    return { posts, authors };
  },
});
