import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | 2019-reunion/committee', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:2019-reunion/committee');
    assert.ok(route);
  });
});
