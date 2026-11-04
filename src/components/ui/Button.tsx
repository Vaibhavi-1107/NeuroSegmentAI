import type { ReactNode, ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'pending';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary: 'bg-[var(--color-accent)] text-[#0d0f14] hover:opacity-90',
  secondary: 'bg-[var(--color-surface-high)] text-[var(--color-text)] hover:bg-[var(--color-surface-raised)] border border-[var(--color-border)]',
  ghost: 'bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-high)]',
  danger: 'bg-[rgba(248,113,113,0.12)] text-[var(--color-danger)] hover:bg-[rgba(248,113,113,0.2)] border border-[rgba(248,113,113,0.25)]',
  pending: 'bg-[rgba(167,139,250,0.12)] text-[var(--color-pending)] hover:bg-[rgba(167,139,250,0.2)] border border-[rgba(167,139,250,0.3)]',
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-2.5 text-sm gap-2',
};

export function Button({
  variant = 'secondary',
  size = 'md',
  children,
  fullWidth,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center font-medium rounded-lg
        transition-all duration-150 cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed
        focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
