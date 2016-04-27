import memoize from 'lru-memoize';
import {createValidator, required} from 'utils/validation';

const nodeValidation = createValidator({
  name: [required],
  cluster: [required]
});
export default memoize(10)(nodeValidation);
