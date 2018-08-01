import EmberObject, { defineProperty } from '@ember/object';
import { camelize } from '@ember/string';
import { oneWay, alias } from '@ember/object/computed';

export default EmberObject.extend({
  init(airtableRecord) {
    this.set('_airtableRecord', airtableRecord);
    for (const key of Object.keys(airtableRecord.fields)) {
       defineProperty(this, camelize(key), alias(`_airtableRecord.fields.${key}`));
    }
  },

  id: oneWay('_airtableRecord.id'),

  reload() {
    return this.get('_airtableRecord').fetch();
  },

  save() {
    return this.get('_airtableRecord').save();
  },

  destroy() {
    return this.get('_airtableRecord').destroy();
  },
});
