import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | reunion-registration/main', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const route = this.owner.lookup('route:reunion-registration/main');
    assert.ok(route);
  });
});
