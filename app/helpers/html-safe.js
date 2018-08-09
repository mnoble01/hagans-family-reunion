import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/string';

export function safe(params) {
  return htmlSafe(params.join(''));
}

export default helper(safe);
