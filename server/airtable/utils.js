/* eslint-env node */
const Airtable = require('airtable');
const AirtableModel = require('airtable/model');

const USER_TABLE = 'users';
const POST_TABLE = 'posts';
const POST_CATEGORY_TABLE = 'post_categories';

const airtableBase = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY,
  endpointUrl: 'https://api.airtable.com',
}).base(process.env.AIRTABLE_BASE);

function fetchAirtableRecords(tableName, { onSuccess, onError }) {
  const airtableRecords = [];
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
     onError(error);
    } else {
      onSuccess(airtableRecords);
    }
  });
}

function findAirtableRecordById(tableName, { id, onSuccess, onError }) {
  airtableBase(tableName).find(id, (err, record) => {
    if (err) {
      return onError(err);
    } else {
      return onSuccess(new AirtableModel(record));
    }
  });
}

function createAirtableRecord(tableName, { attrs, onSuccess, onError }) {
  airtableBase(tableName).create(attrs, (err, record) => {
    if (err) {
      return onError(err);
    } else {
      return onSuccess(new AirtableModel(record));
    }
  });
}

function updateAirtableRecord(tableName, { id, attrs, onSuccess, onError }) {
  airtableBase(tableName).update(id, attrs, (err, record) => {
    if (err) {
      return onError(err);
    } else {
      return onSuccess(new AirtableModel(record));
    }
  });
}

function fetchAirtableUsers({ onSuccess, onError }) {
  // TODO use generic functions w/ custom filter callbacks
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
  let foundModel;
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
      onSuccess(foundModel);
    } else {
     onError(error || 'Not found');
    }
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
  },
};
