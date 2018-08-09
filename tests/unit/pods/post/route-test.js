import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | post', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const route = this.owner.lookup('route:post');
    assert.ok(route);
  });
});
