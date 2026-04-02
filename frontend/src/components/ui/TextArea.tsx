import { forwardRef, type TextareaHTMLAttributes, type KeyboardEvent } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, onKeyDown, ...rest }, ref) => {

    function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
      if (e.key === 'Enter') {
        e.stopPropagation();
      }
      onKeyDown?.(e);
    }

    return (
      <div className="flex flex-col gap-2 w-full text-left">
        <label className="input-label" htmlFor={rest.name}>
          {label}
        </label>

        <textarea
          ref={ref}
          id={rest.name}
          className={`input-base input-textarea ${error ? 'input-error' : ''}`}
          onKeyDown={handleKeyDown}
          {...rest}
        />

        {error && (
          <span className="input-error-msg">{error}</span>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';