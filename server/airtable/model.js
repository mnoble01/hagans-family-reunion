/* eslint-env node */
const camelize = require('camelcase');

class AirtableModel {
  constructor(response) {
    return this._initialize(response);
  }

  _initialize(response) {
    this._airtableModel = response;
    const self = this;
    for (const key of Object.keys(response.fields)) {
      const camelizedKey = camelize(key);
      Object.defineProperty(self, camelizedKey, {
        configurable: true, // allow these fields to be redefined
        get() {
          return self._airtableModel.fields[key];
        },
        set(value) {
          self._airtableModel.fields[key] = value;
        },
      });
    }
    this.id = this._airtableModel.id;
    return this;
  }

  serialize() {
    return {
      id: this._airtableModel.id,
      ...this._airtableModel.fields,
    };
  }

  async reload() {
    const response = await this.callAirtable('fetch');
    return this._initialize(response);
  }

  // Or add nice-named functions
  callAirtable(functionName) {
    return this._airtableModel[functionName]();
  }
}

module.exports = AirtableModel;
