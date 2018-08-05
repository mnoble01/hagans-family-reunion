import EmberObject, { defineProperty } from '@ember/object';
import { camelize } from '@ember/string';
import { oneWay, alias } from '@ember/object/computed';

export default EmberObject.extend({
  init(response) {
    this.set('_source', response);
    for (const key of Object.keys(response)) {
       defineProperty(this, camelize(key), alias(`_source.${key}`));
       delete this[key];
    }
  },

  id: oneWay('_source.id'),

  serialize() {
    const attrs = {
      ...this.get('_source'),
    };
    delete attrs.id;
    return attrs;
  },
});
