import memoize from 'lru-memoize';
import {createValidator, required} from 'utils/validation';

const clusterValidation = createValidator({
  name: [required]
});
export default memoize(10)(clusterValidation);
