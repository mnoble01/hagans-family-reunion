import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | past-years/2017-reunion', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const route = this.owner.lookup('route:past-years/2017-reunion');
    assert.ok(route);
  });
});
