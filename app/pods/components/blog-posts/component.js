import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  localClassNames: 'posts',

  // TODO do we actually need authors here?
  // I don't think so
  postsToRender: computed('posts', 'authors', function() {
    // const authors = this.authors || [];
    const posts = this.posts || [];

    return posts.map((post) => {
      let featuredImageUrl = '/images/watercolor.jpg';
      if (post.featuredImage && post.featuredImage[0]) {
        featuredImageUrl = post.featuredImage[0].url;
      }
      // const author = authors.findBy('id', post.author && post.author[0]);
      const summary = this._postSummary(post);
      return {
        id: post.id,
        title: post.title,
        summary,
        hasMoreContent: post.content.length > summary.length,
        featuredImageUrl,
      };
    });
  }),

  _postSummary(post) {
    const content = post.content.replace(/<{1}[^<>]{1,}>{1}/g, ' '); // remove html
    return content.substr(0, 500).split(' ').slice(0, 25).join(' ');
  },
});
