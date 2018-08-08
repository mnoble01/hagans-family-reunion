import Service from '@ember/service';
import $ from 'jquery';
import { defer } from 'rsvp';

export default Service.extend({
  init() {
    this._super(...arguments);
    const $form = $(`<input type="file" name="file">`);
    $form.fileupload({
      maxChunkSize: 30 * 1000000, // arbitrary, but chosen for UI feedback pace
      multipart: true,
      singleFileUploads: true,
      sequentialUploads: true,

      dropZone: null,
      pasteZone: null,
      // progressall: bind(this, '_progressAll'),
      // done: bind(this, '_done'),
      // always: bind(this, '_always'),
      // fail: bind(this, '_fail'),
      // chunksend: bind(this, '_chunkSend'),
    });
    this.setProperties({
      $form,
      dfd: defer(),
    });
  },

  then() {
    // TODO resove this below functions
    return this.get('dfd').promise.then(...arguments);
  },

  // inProgress: computed(function() {
  // })

  async start() {
    // Upload by file(s)
    // if (this.get('allFiles')) {
    //   try {
    //     await this._uploadAllFiles();
    //   } catch (e) {
    //     this.get('dfd').reject(e);
    //   }
    //   return this;
    // // Upload by url
    // } else {
    //   this.debug('uploading by url');
    //   try {
    //     await this._uploadAllUrls();
    //   } catch (e) {
    //     this.get('dfd').reject(e);
    //   }
    //   return this;
    // }
  },

  // async _uploadAllFiles() {
  //   const { url, formData } = await this._requestMountPoint();
  //   const { allFiles, $form } = this.getProperties('allFiles', '$form');
  //   if (!this.session.featureFlags.duplicateAssetUploadsEnabled) {
  //     await this._detectDuplicates();
  //   }
  //   const uploadFiles = this._filterFiles(allFiles);
  //
  //   this.setProperties({ uploadFiles });
  //
  //   if (uploadFiles.length) {
  //     $form.fileupload('add', {
  //       url,
  //       formData,
  //       files: uploadFiles,
  //     });
  //   } else {
  //     await this._uploadByFileComplete(0, 0, this.get('allFilesCount'));
  //   }
  // },

  // async _uploadAllUrls() {
  //   const { url, formData } = await this._requestMountPoint();
  //
  //   const assetUrls = this.get('allUrls');
  //
  //   const links = await this._checkForVideoUrls(assetUrls);
  //   for (const link of links.video) {
  //     this._uploadVideoUrl(url, link, formData);
  //   }
  //
  //   for (const link of links.other) {
  //     this._uploadUrl(url, link, formData);
  //   }
  // },

  // async _uploadUrl(mountUrl, assetUrl, formData) {
  //   try {
  //     const response = await request({
  //       url: mountUrl,
  //       type: 'POST',
  //       dataType: 'json',
  //       data: _.map(_.extend({}, { file: assetUrl }, formData), function(value, key) {
  //         return { name: key, value: value };
  //       }),
  //     });
  //
  //     // image size according to cloudinary
  //     const { bytes } = response;
  //     if (!this._violatesAssetSizeLimit(assetUrl, bytes)) {
  //
  //       if (!this.get('useWebhooks')) {
  //         await this._createAsset(assetUrl, {
  //           sourceUrl: assetUrl,
  //           uploadResponseAttributes: response,
  //         });
  //       }
  //       this.incrementProperty('urlsUploadedCount');
  //     }
  //   } catch (e) {
  //     const errorMessage = `${e.errorThrown}: ${assetUrl}`;
  //     this.get('failures').push(errorMessage);
  //   }
  //
  //   this._progressUrl();
  //
  //   if (this.get('urlsProcessedCount') === this.get('allUrlsCount')) {
  //     try {
  //       await this._uploadByUrlComplete();
  //     } catch (e) {
  //       this.get('dfd').reject(e);
  //     }
  //   }
  // },

  // TODO add upload by url
});
