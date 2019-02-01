import Component from '@ember/component';
import { computed } from '@ember/object';
import { v4 as uuid } from 'ember-uuid';
import { htmlSafe } from '@ember/string';

export default Component.extend({
  localClassNames: 'family-tree-icon',

  animate: false,

  attributeBindings: ['style'],

  style: computed('height', function() {
    return htmlSafe(`height: ${this.height}px`);
  }),

  height: 170,

  clipPathId: computed(function() {
    return `${uuid()}-clip-path`;
  }),
});
