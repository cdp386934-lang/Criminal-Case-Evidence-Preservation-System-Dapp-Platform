import { forwardRef } from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

/**
 * 司法系统风格表单输入组件
 */
const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-neutral-900">
            {label}
            {props.required && <span className="text-error ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full h-10 px-3 py-2 border rounded bg-white text-sm text-neutral-900 transition-colors focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-700 focus:ring-offset-0 ${
            error ? 'border-error' : 'border-gray-300'
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="text-sm text-error mt-0.5">
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

export default FormInput;

