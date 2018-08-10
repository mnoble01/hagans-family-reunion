import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  options: computed(function() {
    return {
      theme: 'snow',
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'strike'],
          ['blockquote', 'indent', 'align'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ indent: '-1' }, { indent: '+1' }],
          ['link', 'image', 'video'],
        ],
      },
    };
  }),

  onChange() {},

  updateText(editor) {
    this.onChange(editor.root.innerHTML);
  },
});
