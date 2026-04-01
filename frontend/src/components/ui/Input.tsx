import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, ...rest }, ref) => {
    return (
      <div className="flex flex-col gap-2 w-full text-left">
        <label className="input-label" htmlFor={rest.name}>
          {label}
        </label>
        
        <input 
          ref={ref}
          id={rest.name}
          className={`input-base ${error ? 'input-error' : ''}`}
          {...rest}
        />

        {error && (
          <span className="input-error-msg">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';