/* eslint-env node */
const routeUtils = require('routes/utils');
const { isLoggedIn } = routeUtils;
const request = require('request');
const fs = require('fs');
const schedule = require('node-schedule');
const moment = require('moment');

// upload utilities
const multer = require('multer');
const upload = multer({
  dest: '/tmp',
});

module.exports = function(app) {
  app.post('/api/upload', isLoggedIn, upload.single('file'), function(req, res) {
    const file = req.file;
    const filePath = file.path;
    const BASE_IMGR_URL = 'https://api.imgur.com/3/image';

    // if (file.mimetype.startsWith('image')) {
    // TODO try uploading PDF and DOCX
    const imgurAuthHeader = {
      Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`,
    };

    const imgurUploadOptions = {
      url: BASE_IMGR_URL,
      method: 'POST',
      headers: {
        'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW',
        ...imgurAuthHeader,
      },
      formData: {
        image: fs.createReadStream(filePath),
      },
    };

    request(imgurUploadOptions, (error, response) => {
      if (error) {
        return res.status(error.statusCode).json(error);
      }

      const responseJson = JSON.parse(response.body);
      const imageLink = responseJson.data.link;
      const deleteHash = responseJson.data.deletehash;
      const deleteRequestOptions = {
        url: `${BASE_IMGR_URL}/${deleteHash}`,
        method: 'DELETE',
        headers: {
          ...imgurAuthHeader,
        },
      };

      // delete imgur file (schedule so airtable has time to fetch)
      schedule.scheduleJob(moment(Date.now()).add(5, 'm').toDate(), () => {
        request(deleteRequestOptions);
      });

      // delete local file
      fs.unlink(filePath, () => {});

      res.status(200).json({
        message: 'Successfully uploaded',
        url: imageLink,
      });
    });
    // } else {
    //   // delete local file
    //   fs.unlink(filePath, () => {});
    //
    //   res.status(403).json({ error: 'Only image files are allowed!' });
    // }
  });
};
