import Component from '@ember/component';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';

export default Component.extend({
  imageUrl: computed('user.profileImage.firstObject.url', function() {
    return this.get('user.profileImage.firstObject.url') || '/images/avatar.jpg';
  }),

  link: false,

  size: 150,
  sizeStyle: computed('size', function() {
    const size = this.size;
    return htmlSafe(`width: ${size}px; height: ${size}px;`);
  }),
});
