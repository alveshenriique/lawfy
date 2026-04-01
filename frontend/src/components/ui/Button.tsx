import { type ButtonHTMLAttributes, type ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  fullWidth?: boolean;
}

export function Button({ children, loading, variant = 'primary', fullWidth = true, ...rest }: ButtonProps) {
  const variantClass = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
  }[variant];

  return (
    <button
      className={`btn-base ${variantClass} ${fullWidth ? 'w-full' : 'w-auto px-6'}`}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading ? (
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      ) : (
        children
      )}
    </button>
  );
}