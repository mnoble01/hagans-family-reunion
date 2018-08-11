import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import PostModel from 'hagans-family/pods/airtable/post-model';

export default Route.extend({
  session: service(),
  ajax: service(),

  async model() {
    const userId = this.session.user.id;
    const postModel = new PostModel();
    postModel.setProperties({
      author: [userId],
      status: 'Draft',
    });
    const response = await this.get('ajax').post('/api/posts', {
      data: postModel.serialize(),
    });
    this.transitionTo('admin.posts.edit-post', response.id);
  },
});
