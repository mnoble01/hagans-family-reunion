import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | 2019-reunion/accommodations', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const route = this.owner.lookup('route:2019-reunion/accommodations');
    assert.ok(route);
  });
});
