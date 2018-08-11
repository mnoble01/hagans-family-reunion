/* global Quill */
import Component from '@ember/component';
import { computed } from '@ember/object';
import 'quill-image-resize-module';
import { ImageDrop } from 'quill-image-drop-module';

Quill.register('modules/imageDrop', ImageDrop);

// TODO upload images - https://github.com/quilljs/quill/issues/1089#issuecomment-362845501
// TODO check that image alignment is maintained
export default Component.extend({
  options: computed(function() {
    return {
      theme: 'snow',
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          ['blockquote', { align: [] }],
          // { indent: '-1' }, { indent: '+1' }, 'align'], // TODO fixme
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link', 'image', 'video'],
        ],
        imageDrop: true,
        imageResize: {
          modules: [ 'Resize', 'DisplaySize', 'Toolbar' ],
        },
      },
    };
  }),

  onChange() {},

  updateText(editor) {
    this.onChange(editor.root.innerHTML);
  },
});
