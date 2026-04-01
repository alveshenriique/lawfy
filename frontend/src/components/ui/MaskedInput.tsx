import { forwardRef } from 'react';
import { IMaskInput } from 'react-imask';

interface MaskedInputProps {
  label: string;
  mask: string | { mask: string }[];
  value?: string;
  onAccept?: (value: string) => void;
  error?: string;
  placeholder?: string;
  name?: string;
}

export const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ label, mask, value, onAccept, error, placeholder, name }, ref) => {
    return (
      <div className="flex flex-col gap-2 w-full text-left">
        <label className="input-label" htmlFor={name}>
          {label}
        </label>

        <IMaskInput
          id={name}
          mask={mask as string}
          value={value}
          onAccept={onAccept}
          placeholder={placeholder}
          className={`input-base ${error ? 'input-error' : ''}`}
          inputRef={ref}
        />

        {error && (
          <span className="input-error-msg">{error}</span>
        )}
      </div>
    );
  }
);

MaskedInput.displayName = 'MaskedInput';