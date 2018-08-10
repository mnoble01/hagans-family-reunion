import { helper } from '@ember/component/helper';
import { dasherize } from '@ember/string';

export function safe(params) {
  return dasherize(params.join(''));
}

export default helper(safe);
