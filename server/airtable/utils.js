/* eslint-env node */
const Airtable = require('airtable');
const AirtableModel = require('airtable/model');

const TABLES = Object.freeze({
  USER_TABLE: 'users',
  POST_TABLE: 'posts',
  POST_CATEGORY_TABLE : 'post_categories',
  UPLOAD_TABLE : 'uploads',
  COMMUNICATION_TABLE : 'communications',
  REGISTRATION_TABLE : 'reunion_registrations',
  TSHIRT_ORDER_TABLE : 'tshirt_orders',
  TSHIRT_SIZE_TABLE : 'tshirt_sizes',
});

const airtableBase = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY,
  endpointUrl: 'https://api.airtable.com',
}).base(process.env.AIRTABLE_BASE);

// TODO remove ALL onSuccess/onError CALLBACKS when all uses are converted to async/await
function fetchAirtableRecords(tableName, { onSuccess, onError, filterCallback } = {}) {
  const airtableRecords = [];
  return new Promise((resolve, reject) => {
    airtableBase(tableName).select({
        pageSize: 100,
        view: 'Grid view',
    }).eachPage((records, fetchNextPage) => {
      for (const record of records) {
        const airtableModel = new AirtableModel(record);
        if (!filterCallback || filterCallback(airtableModel)) {
          // If no filterCallback exists,
          // Else if the filterCallback returns true,
          // Return record in results
          airtableRecords.push(airtableModel);
        }
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
  airtableBase(TABLES.USER_TABLE).select({
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
  airtableBase(TABLES.POST_TABLE).select({
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
    airtableBase(TABLES.USER_TABLE).select({
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

function creationCallback(tableName) {
  return async function(req, res) {
    const attrs = req.body;

    try {
      const record = await createAirtableRecord(tableName, { attrs });
      res.status(200).json(record.serialize());
    } catch (error) {
      res.status(error.statusCode || 500).json(error);
    }
  };
}

function updateCallback(tableName) {
  return async function(req, res) {
    const attrs = req.body;
    const id = req.params.id;

    try {
      const record = await updateAirtableRecord(tableName, { id, attrs });
      res.status(200).json(record.serialize());
    } catch (error) {
      res.status(error.statusCode || 500).json(error);
    }
  };
}

function findCallback(tableName) {
  return async function(req, res) {
    const id = req.params.id;

    try {
      const record = await findAirtableRecordById(tableName, { id });
      res.status(200).json(record.serialize());
    } catch (error) {
      res.status(error.statusCode || 500).json(error);
    }
  };
}

function fetchCallback(tableName) {
  return async function(req, res) {
    const ids = req.params.ids; // Allow fetching by many ids
    try {
      let records = await fetchAirtableRecords(tableName);
      if (ids) {
        records = records.filter(record => ids.includes(record.id));
      }
      res.status(200).json(records.map(record => record.serialize()));
    } catch (error) {
      res.status(error.statusCode || 500).json(error);
    }
  };
}

module.exports = {
  airtableBase,

  // Bespoke functions to maybe get rid of:
  findAirtableUserByEmail,
  fetchAirtableUsers,
  fetchAirtablePosts,

  fetchAirtableRecords,
  findAirtableRecordById,
  createAirtableRecord,
  updateAirtableRecord,

  creationCallback,
  updateCallback,
  findCallback,
  fetchCallback,

  tables: TABLES,
};
