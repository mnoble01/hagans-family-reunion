import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  airtable: service(),

  async model() {
    console.log('hi')
    console.log(this.get('airtable').users());
  },
});
