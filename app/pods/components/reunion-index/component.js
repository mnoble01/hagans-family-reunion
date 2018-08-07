import Component from '@ember/component';
import { assert } from '@ember/debug';

export default Component.extend({
  init() {
    this._super(...arguments);
    assert('Must provide a reunion year', typeof this.reunionYear === 'string' && /\d{4}/.test(this.reunionYear));
  },
});
