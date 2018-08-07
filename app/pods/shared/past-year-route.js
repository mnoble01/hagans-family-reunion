import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import PostModel from 'hagans-family/pods/airtable/post-model';
import UserModel from 'hagans-family/pods/airtable/user-model';
import { assert } from '@ember/debug';

export default Route.extend({
  ajax: service(),

  init() {
    this._super(...arguments);
    assert('Must provide a reunion year', typeof this.reunionYear === 'string' && /\d{4}/.test(this.reunionYear));
  },

  titleToken() {
    return this.reunionYear;
  },

  async model() {
    const year = this.reunionYear;
    const response = await this.get('ajax').request('/api/posts', {
      data: {
        status: 'Published',
      },
    });
    const posts = response.map(post => new PostModel(post)).filter((post) => {
      return (post.categories || []).includes(`${year} Reunion`);
    });
    const authorIds = posts.map(post => post.author).uniq();
    const authorsResponses = await Promise.all(authorIds.map((authorId) => {
      return this.get('ajax').request(`/api/users/${authorId}`);
    }));
    const authors = authorsResponses.map(author => new UserModel(author));
    return { posts, authors };
  },

  setupController() {
    this._super(...arguments);
    const controller = this.controllerFor(this.routeName);
    controller.set('reunionYear', this.reunionYear);
  },
});
