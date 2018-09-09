/* eslint-env node */
const Airtable = require('airtable');
const AirtableModel = require('airtable/model');

const USER_TABLE = 'users';
const POST_TABLE = 'posts';
const POST_CATEGORY_TABLE = 'post_categories';
const UPLOAD_TABLE = 'uploads';

const airtableBase = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY,
  endpointUrl: 'https://api.airtable.com',
}).base(process.env.AIRTABLE_BASE);

// TODO rewrite these to use promises!!!
// TODO remove ALL CALLBACKS when all uses are converted to async/await
function fetchAirtableRecords(tableName, { onSuccess, onError }) {
  const airtableRecords = [];
  return new Promise((resolve, reject) => {
    airtableBase(tableName).select({
        pageSize: 100,
        view: 'Grid view',
    }).eachPage((records, fetchNextPage) => {
      for (const record of records) {
        airtableRecords.push(new AirtableModel(record));
      }
      fetchNextPage();
    }, (error) => {
      if (error) {
       if (onError) onError(error);
       reject(error);
      } else {
        if (onSuccess) onSuccess(airtableRecords);
        resolve(airtableRecords);
      }
    });
  });
}

function findAirtableRecordById(tableName, { id, onSuccess, onError }) {
  return new Promise((resolve, reject) => {
    airtableBase(tableName).find(id, (err, record) => {
      if (err) {
        if (onError) onError(err);
        return reject(err);
      } else {
        if (onSuccess) onSuccess(new AirtableModel(record));
        return resolve(new AirtableModel(record));
      }
    });
  });
}

function createAirtableRecord(tableName, { attrs, onSuccess, onError }) {
  return new Promise((resolve, reject) => {
    airtableBase(tableName).create(attrs, (err, record) => {
      if (err) {
        if (onError) onError(err);
        return reject(err);
      } else {
        if (onSuccess) onSuccess(new AirtableModel(record));
        return resolve(new AirtableModel(record));
      }
    });
  }) ;
}

function updateAirtableRecord(tableName, { id, attrs, onSuccess, onError }) {
  return new Promise((resolve, reject) => {
    airtableBase(tableName).update(id, attrs, (err, record) => {
      if (err) {
        if (onError) onError(err);
        return reject(err);
      } else {
        if (onSuccess) onSuccess(new AirtableModel(record));
        return resolve(new AirtableModel(record));
      }
    });
  });
}

function fetchAirtableUsers({ onSuccess, onError }) {
  // TODO use generic function w/ custom filter callbacks
  const airtableRecords = [];
  airtableBase(USER_TABLE).select({
      pageSize: 100,
      view: 'Grid view',
  }).eachPage((records, fetchNextPage) => {
    for (const record of records) {
      const airtableModel = new AirtableModel(record);
      if (airtableModel.status === 'Member' || airtableModel.status === 'Inactive') {
        airtableRecords.push(airtableModel);
      }
    }
    fetchNextPage();
  }, (error) => {
    if (error) {
     onError(error);
    } else {
      onSuccess(airtableRecords);
    }
  });
}

function fetchAirtablePosts({ status, onSuccess, onError }) {
  // TODO use generic function w/ custom filter callbacks
  const airtableRecords = [];
  airtableBase(POST_TABLE).select({
      pageSize: 100,
      view: 'Grid view',
  }).eachPage((records, fetchNextPage) => {
    for (const record of records) {
      const airtableModel = new AirtableModel(record);
      if (status) {
        if (airtableModel.status === status) {
          airtableRecords.push(airtableModel);
        }
      } else {
        airtableRecords.push(airtableModel);
      }
    }
    fetchNextPage();
  }, (error) => {
    if (error) {
     onError(error);
    } else {
      onSuccess(airtableRecords);
    }
  });
}

function findAirtableUserByEmail({ email, onSuccess, onError }) {
  // TODO use generic function w/ custom filter callbacks
  let foundModel;
  return new Promise((resolve, reject) => {
    airtableBase(USER_TABLE).select({
        pageSize: 100,
        view: 'Grid view',
    }).eachPage((records, fetchNextPage) => {
      for (const record of records) {
        const airtableModel = new AirtableModel(record);
        if (airtableModel.email === email) {
          foundModel = airtableModel;
        }
      }
      fetchNextPage();
    }, (error) => {
      if (foundModel) {
        if (onSuccess) onSuccess(foundModel);
        resolve(foundModel);
      } else {
       if (onError) onError(error || 'Not found');
       reject(error || new Error('Not found'));
      }
    });
  });
}

module.exports = {
  airtableBase,

  fetchAirtableRecords,
  fetchAirtableUsers,
  fetchAirtablePosts,

  findAirtableRecordById,
  findAirtableUserByEmail,

  createAirtableRecord,
  updateAirtableRecord,

  tables: {
    USER_TABLE,
    POST_TABLE,
    POST_CATEGORY_TABLE,
    UPLOAD_TABLE,
  },
};
