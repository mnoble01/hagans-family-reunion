import EmberObject, { defineProperty } from '@ember/object';
import { camelize } from '@ember/string';
import { computed } from '@ember/object';
import { oneWay, alias, readOnly, map } from '@ember/object/computed';

export default EmberObject.extend({
  editableFields: computed(function() {
    return [];
  }).readOnly(),

  clientEditableFields: map('editableFields', function(field) {
    return this._airtableToClientKey(field);
  }).readOnly(),

  _airtableToClientKey(fieldKey) {
    return camelize(fieldKey);
  },

  init(response = {}) {
    this.set('_source', response);
    for (const key of this.editableFields) {
       defineProperty(this, this._airtableToClientKey(key), alias(`_source.${key}`));
       delete this[key];
    }
    for (const key of Object.keys(response)) {
      if (!this.editableFields.includes(key)) {
        defineProperty(this, this._airtableToClientKey(key), readOnly(`_source.${key}`));
      }
      delete this[key];
    }
  },

  id: oneWay('_source.id'),

  serialize() {
    return this.editableFields.reduce((attrs, key) => {
      attrs[key] = this.get(`_source.${key}`);
      return attrs;
    }, {});
  },
});
