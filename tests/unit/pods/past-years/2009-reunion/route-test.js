import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | past-years/2009-reunion', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:past-years/2009-reunion');
    assert.ok(route);
  });
});
