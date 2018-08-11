import Component from '@ember/component';
import { computed } from '@ember/object';
import 'quill-image-resize-module';

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
        imageResize: {
          modules: [ 'Resize', 'DisplaySize', 'Toolbar' ],
          // handleStyles: {
          //   backgroundColor: 'black',
          //   border: 'none',
          //   color: white
          //   // other camelCase styles for size display
          // }
          // displayStyles: {
          //   backgroundColor: 'black',
          //   border: 'none',
          //   color: white
          //   // other camelCase styles for size display
          // }
          // toolbarStyles: {
          //   backgroundColor: 'black',
          //   border: 'none',
          //   color: white
          //   // other camelCase styles for size display
          // },
          // toolbarButtonStyles: {
          //   // ...
          // },
          // toolbarButtonSvgStyles: {
          //   // ...
          // },
        },
      },
    };
  }),

  onChange() {},

  updateText(editor) {
    this.onChange(editor.root.innerHTML);
  },
});
