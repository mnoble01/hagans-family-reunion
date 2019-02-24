import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { readOnly } from '@ember/object/computed';

export default Controller.extend({
  session: service(),
  embedUrl: readOnly('session.secrets.AIRTABLE_USER_DB_EMBED_URL'),
});
