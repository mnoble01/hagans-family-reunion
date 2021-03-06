/* eslint-env node */
const routeUtils = require('routes/utils');
const { isLoggedIn } = routeUtils;
const fs = require('fs');
const { Storage } = require('@google-cloud/storage');
const airtableUtils = require('airtable/utils');
const logger = require('utils/logger');
const {
  createAirtableRecord,
  tables: {
    UPLOAD_TABLE,
  },
} = airtableUtils;
const googleCloudStorage = new Storage({
  credentials: {
    ['client_email']: process.env.GOOGLE_CLOUD_CLIENT_ID,
    ['private_key']: process.env.GOOGLE_CLOUD_PRIVATE_KEY,
  },
});


// upload utilities
const multer = require('multer');
const upload = multer({
  dest: '/tmp',
});

function sleep(millis) {
  return new Promise(resolve => setTimeout(resolve, millis));
}

async function waitUntilUploaded(airtableUploadModel) {
  await airtableUploadModel.reload();
  const url = airtableUploadModel.file[0].url;
  if (/airtable/.test(url)) return;
  await sleep(200);
  return waitUntilUploaded(airtableUploadModel);
}

module.exports = function(app) {
  app.post('/api/upload', isLoggedIn, upload.single('file'), async function(req, res) {
    // TODO add query param for whether the upload should be temporary or not
    const file = req.file;
    const filePath = file.path;
    const bucketName = 'hagans-family-uploads';

    let googleCloudStorageLink;
    try {
      const response = await googleCloudStorage.bucket(bucketName).upload(filePath);
      googleCloudStorageLink = response[0].metadata.mediaLink;
      logger.log('info', `Successful upload - Google Cloud Storage - ${googleCloudStorageLink}`);

      // delete local file
      fs.unlink(filePath, () => {});
    } catch (error) {
      // delete local file
      fs.unlink(filePath, () => {});

      logger.log('info', `Failed upload - Google Cloud Storage - ${error}`);
      return res.status(500).json(error);
    }

    // TODO schedule google cloud deletion after 3 months or something???

    // I tried just using the google cloud storage link, but it didn't work
    // return res.status(200).json({
    //   url: googleCloudStorageLink,
    //   message: 'Successfully uploaded',
    // });
    try {
      const airtableUpload = await createAirtableRecord(UPLOAD_TABLE, {
        attrs: {
          ['File']: [{ url: googleCloudStorageLink }],
          ['Created By']: [req.user.id],
          ['Name']: file.originalname,
        },
      });
      await waitUntilUploaded(airtableUpload);
      return res.status(200).json({
        url: airtableUpload.file[0].url,
        message: 'Successfully uploaded',
      });
    } catch (error) {
      logger.log('info', `Failed upload - Airtable - ${error}`);
      return res.status(error.statusCode).json(error);
    }
  });
};
