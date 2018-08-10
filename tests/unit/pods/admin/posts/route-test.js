import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | admin/posts', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const route = this.owner.lookup('route:admin/posts');
    assert.ok(route);
  });
});