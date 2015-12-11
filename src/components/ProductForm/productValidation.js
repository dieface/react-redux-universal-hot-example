import { createValidator, required, maxLength } from 'utils/validation';

const productValidation = createValidator({
  name: [required, maxLength(30)]
});
export default productValidation;
