import React from 'react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value'> {
  value?: unknown;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, value, ...props }, ref) => {
    const stringValue =
      value === null || value === undefined ? '' :
      typeof value === 'string' ? value :
      typeof value === 'number' ? value.toString() :
      Array.isArray(value) ? value.join(', ') :
      typeof value === 'object' && 'name' in value ? String(value.name) :
      '';

    return (
      <input
        className={`w-full border rounded p-2 ${className}`}
        ref={ref}
        value={stringValue}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };