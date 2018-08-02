import EmberObject, { defineProperty } from '@ember/object';
import { camelize } from '@ember/string';
import { oneWay, alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default EmberObject.extend({
  ajax: service(),

  // init(airtableRecord) {
  //   this.set('_airtableRecord', airtableRecord);
  //   for (const key of Object.keys(airtableRecord.fields)) {
  //      defineProperty(this, camelize(key), alias(`_airtableRecord.fields.${key}`));
  //   }
  // },

  init(response) {
    this.set('_source', response);
    for (const key of Object.keys(response)) {
       defineProperty(this, camelize(key), alias(`_source.${key}`));
       delete this[key]; // not sure why I need this
    }
  },

  id: oneWay('_source.id'),

  reload() {
    return this.get('ajax').get(`users/${this.id}`);
  },

  save() {
    // TODO send _source values only
    return this.get('ajax').put(`users/${this.id}`);
  },

  destroy() {
    return this.get('ajax').delete(`users/${this.id}`);
  },
});
