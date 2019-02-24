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
    const component = this;
    return {
      theme: 'snow',
      modules: {
        toolbar: {
          container: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', { align: [] }],
            // { indent: '-1' }, { indent: '+1' }, 'align'], // TODO fixme
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link', 'image', 'video'],
          ],
          handlers: {
            // image: this._uploadImage.bind(this),
            image() {
              // console.log('this.quill', this.quill);
              component.set('quill', this.quill);
              component._uploadImage();
            },
          },
        },
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

  _uploadImage() {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.click();

    // Listen upload local image and save to server
    input.onchange = () => {
      const file = input.files[0];

      // file type is only image.
      if (/^image\//.test(file.type)) {
        this._sendToServer(file);
      } else {
        // TODO replace with a modal dialog
        alert('You can only upload images');
      }
    };
  },

  _sendToServer(fileBlob) {
    const url = '/api/upload';
    const method = 'POST';
    const formData = new FormData();
    formData.append('Content-Type', fileBlob.type);
    formData.append('file', fileBlob);

    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);

    // listen callback
    xhr.onload = () => {
      if (xhr.status === 200) {
        this._insertImage(JSON.parse(xhr.responseText).url);
      } else {
        // TODO handle error as above
        // eslint-disable-next-line no-console
        console.error('ERROR', xhr);
        alert('Image upload error');
      }
    };

    xhr.send(formData);
  },

  _insertImage(url) {
    const selection = this.quill.getSelection();
          const index = selection ? selection.index : this.quill.getLength();
      this.quill.insertEmbed(index, 'image', url, 'user');
  },
});
