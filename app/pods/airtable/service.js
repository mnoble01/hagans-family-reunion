import Service from '@ember/service';
import Airtable from 'airtable';
import { computed } from '@ember/object';

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

  users() {
    // TODO try async await
    this.get('_base')('Users').select({
        // Selecting the first 3 records in Grid view:
        maxRecords: 3,
        view: "Grid view"
    }).eachPage(function page(records, fetchNextPage) {
        // This function (`page`) will get called for each page of records.

        records.forEach(function(record) {
            console.log('Retrieved', record.get('Name'));
        });

        // To fetch the next page of records, call `fetchNextPage`.
        // If there are more records, `page` will get called again.
        // If there are no more records, `done` will get called.
        fetchNextPage();

    }, function done(err) {
        if (err) { console.error(err); return; }
    });
  },
});
