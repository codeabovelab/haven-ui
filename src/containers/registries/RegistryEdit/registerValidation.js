import memoize from 'lru-memoize';
import {createValidator, required} from 'utils/validation';

const registerValidation = createValidator({
  name: [required],
  host: [required],
  port: [required],
  username: [required],
  password: [required]
});
export default memoize(10)(registerValidation);
