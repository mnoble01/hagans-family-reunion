/* eslint-env node */
const routeUtils = require('routes/utils');
const { isLoggedIn } = routeUtils;
const request = require('request');
const fs = require('fs');
const schedule = require('node-schedule');
const moment = require('moment');

// airtable utilities
const airtableUtils = require('airtable/utils');
const {
  fetchAirtableUsers,
  findAirtableRecordById,
  updateAirtableRecord,
  tables: {
    USER_TABLE,
  },
} = airtableUtils;

// file upload utilities
const multer = require('multer');
const upload = multer({
  dest: '/tmp',
});

module.exports = function(app) {
  app.get('/api/user', isLoggedIn, function(req, res) {
    return res.status(200).json({ ...req.user });
  });

  app.get('/api/users', isLoggedIn, function(req, res) {
    fetchAirtableUsers({
      onSuccess: (airtableUsers) => {
        res.status(200).json(airtableUsers.map(user => user.serialize()));
      },
      onError:(error) => {
        res.status(error.statusCode).json(error);
      },
    });
  });

  app.get('/api/users/:id', isLoggedIn, function(req, res) {
    findAirtableRecordById(USER_TABLE, {
      id: req.params.id,
      onSuccess: (airtableUser) => {
        res.status(200).json(airtableUser.serialize());
      },
      onError: (error) => {
        res.status(error.statusCode).json(error);
      },
    });
  });

  app.put('/api/users/:id', isLoggedIn, function(req, res) {
    const attrs = req.body;

    updateAirtableRecord(USER_TABLE, {
      id: req.params.id,
      attrs,
      onSuccess: (airtableUser) => {
        res.status(200).json(airtableUser.serialize());
      },
      onError: (error) => {
        res.status(error.statusCode).json(error);
      },
    });
  });

  // TODO maybe create an object for managing uploads
  // TODO remove this endpoint maybe?
  app.post('/api/users/:id/profile_image', isLoggedIn, upload.single('file'), function(req, res) {
    const file = req.file;
    const filePath = file.path;
    const BASE_IMGR_URL = 'https://api.imgur.com/3/image';

    if (file.mimetype.startsWith('image')) {
      // TODO use same code as /api/upload
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

        updateAirtableRecord(USER_TABLE, {
          id: req.params.id,
          attrs: {
            ['Profile Image']: [{ url: imageLink }],
          },
          onSuccess: (airtableUser) => {
            res.status(200).json({ message: 'Successfully uploaded' });
          },
          onError: (error) => {
            res.status(error.statusCode).json(error);
          },
        });
      });
    } else {
      // delete local file
      fs.unlink(filePath, (err) => {
        if (err) {
          return res.status(err.statusCode).json(err);
        }

        res.status(403).json({ error: 'Only image files are allowed!' });
      });
    }
  });
};
