import { forwardRef } from 'react';
import Input from './Input';

/**
 * Input especializado para texto general.
 */
const TextInput = forwardRef((props, ref) => {
  return <Input ref={ref} type="text" {...props} />;
});

TextInput.displayName = 'TextInput';

export default TextInput;
