import Service from '@ember/service';
import Airtable from 'airtable';
import AirtableModel from './model';
import { computed } from '@ember/object';
import { defer } from 'rsvp';

export default Service.extend({
  init() {
    this._super(...arguments);
    Airtable.configure({
        endpointUrl: 'https://api.airtable.com',
        apiKey: 'keywsbmp9UblODxTk',
    });
  },

  _base: computed(function() {
    return Airtable.base('appTLUN9CFH4IhugP');
  }),

  _deserializeRecord(record) {
    return new AirtableModel(record);
  },

  _serializeRecord(records) {

  },

  fetch(tableName, opts = {}) {
    const defaultOpts = {
      perPage: 12,
      page: 1,
      view: 'Grid view',
    };
    opts = Object.assign({}, defaultOpts, opts);

    const dfd = defer();
    // TODO try async await
    // TODO try pagination with fetchNextPage?
    this.get('_base')(tableName).select({
        pageSize: opts.perPage,
        view: opts.view,
    }).firstPage((error, records) => {
      if (error) {
        dfd.reject(error);
      } else {
        dfd.resolve(records.map(record => this._deserializeRecord(record)));
      }
    });

    return dfd.promise;
  },
});
