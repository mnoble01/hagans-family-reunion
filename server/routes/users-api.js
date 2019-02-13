/* eslint-env node */
const routeUtils = require('routes/utils');
const { isLoggedIn, isCurrentUser } = routeUtils;
const request = require('request');
const fs = require('fs');
const schedule = require('node-schedule');
const moment = require('moment');
const logger = require('utils/logger');

// airtable utilities
const airtableUtils = require('airtable/utils');
const {
  fetchAirtableUsers,
  updateAirtableRecord,
  findAirtableUserByEmail,
  createAirtableRecord,
  updateCallback,
  findCallback,
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
    logger.log('info', '/api/user user', req.user);
    const serialized = req.user.serialize ? req.user.serialize() : req.user;
    return res.status(200).json({ serialized });
  });

  app.get('/api/user/secrets', isLoggedIn, function(req, res) {
    const userIsMember = req.user.status === 'Member';
    const userIsAdmin = req.user.permissions && req.user.permissions.includes('is_admin');
    const adminSecrets = [
      'AIRTABLE_USER_DB_EMBED_URL',
    ];
    const secrets = [
      ...(userIsAdmin ? adminSecrets : []),
    ];
    try {
      if (userIsMember) {
        return res.status(200).json(secrets.reduce((memo, key) => {
          memo[key] = process.env[key];
          return memo;
        }, {}));
      } else {
        return res.status(401).json({ message: 'Unauthorized' });
      }
    } catch (error) {
      return res.status(error.statusCode).json(error);
    }
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

  // Endpoint for users to register other users
  app.post('/api/users/register_other', async function(req, res) {
      let airtableUser;
      const { email, attrs } = req.body;
      logger.log('debug', '/api/users/register_other', email, attrs);
      try {
        if (email) {
          logger.log('debug', 'finding user by email', email);
          airtableUser = await findAirtableUserByEmail({ email });
          // Update user attrs
          airtableUser = await updateAirtableRecord(USER_TABLE, {
            id: airtableUser.id,
            attrs,
          });
        }
      } catch (e) {
        // Swallow error
        logger.log('debug', 'user not found or error', e);
      }

      try {
        if (!airtableUser) { // Existing user not found
          logger.log('debug', 'no existing user found, so create new', attrs);
          airtableUser = await createAirtableRecord(USER_TABLE, {
            attrs: {
              ...attrs,
              Status: 'Pending Review',
              ['Registration Source']: ['Other User'],
              ['Invited By']: [req.user.id],
            },
          });
        }
        res.status(200).json(airtableUser.serialize());
      } catch (error) {
        logger.log('debug', '/api/users/register_other error', error);
        res.status(error.statusCode).json(error);
      }
  });

  app.get('/api/users/:id', isLoggedIn, findCallback(USER_TABLE));

  app.put('/api/users/:id', isLoggedIn, isCurrentUser, updateCallback(USER_TABLE));

  app.get('/api/users/by_email/:email', isLoggedIn, async function(req, res) {
    try {
      const airtableUser = await findAirtableUserByEmail({ email: req.params.email });
      res.status(200).json(airtableUser.serialize());
    } catch (error) {
      res.status(error.statusCode).json(error);
    }
  });

  // TODO create an object for managing uploads
  app.post('/api/users/:id/profile_image', isLoggedIn, upload.single('file'), function(req, res) {
    const file = req.file;
    const filePath = file.path;
    const BASE_IMGR_URL = 'https://api.imgur.com/3/image';

    if (file.mimetype.startsWith('image')) {
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
