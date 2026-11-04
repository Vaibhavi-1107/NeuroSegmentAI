import type { ReactNode } from 'react';

type BadgeVariant = 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'pending' | 'muted';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  className?: string;
}

const variantMap: Record<BadgeVariant, { bg: string; text: string; border: string; dot?: string }> = {
  default: {
    bg: 'rgba(37,40,54,1)',
    text: 'var(--color-text-muted)',
    border: 'var(--color-border)',
  },
  accent: {
    bg: 'rgba(56,189,248,0.12)',
    text: 'var(--color-accent)',
    border: 'rgba(56,189,248,0.3)',
    dot: 'var(--color-accent)',
  },
  success: {
    bg: 'rgba(52,211,153,0.1)',
    text: 'var(--color-success)',
    border: 'rgba(52,211,153,0.3)',
    dot: 'var(--color-success)',
  },
  warning: {
    bg: 'rgba(251,191,36,0.1)',
    text: 'var(--color-warning)',
    border: 'rgba(251,191,36,0.3)',
    dot: 'var(--color-warning)',
  },
  danger: {
    bg: 'rgba(248,113,113,0.1)',
    text: 'var(--color-danger)',
    border: 'rgba(248,113,113,0.3)',
    dot: 'var(--color-danger)',
  },
  pending: {
    bg: 'rgba(167,139,250,0.1)',
    text: 'var(--color-pending)',
    border: 'rgba(167,139,250,0.3)',
    dot: 'var(--color-pending)',
  },
  muted: {
    bg: 'transparent',
    text: 'var(--color-text-dim)',
    border: 'var(--color-border-subtle)',
  },
};

export function Badge({ children, variant = 'default', dot, className = '' }: BadgeProps) {
  const v = variantMap[variant];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-mono text-xs font-semibold ${className}`}
      style={{
        background: v.bg,
        color: v.text,
        border: `1px solid ${v.border}`,
      }}
    >
      {dot && v.dot && (
        <span
          className="w-1.5 h-1.5 rounded-full animate-pulse-soft flex-shrink-0"
          style={{ background: v.dot }}
        />
      )}
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: 'pending' | 'connected' | 'error' }) {
  const map = {
    pending: { label: 'SAM 3.1 — Backend Ready', variant: 'pending' as BadgeVariant },
    connected: { label: 'SAM 3.1 — Connected', variant: 'success' as BadgeVariant },
    error: { label: 'SAM 3.1 — Error', variant: 'danger' as BadgeVariant },
  };
  const { label, variant } = map[status];
  return (
    <Badge variant={variant} dot>
      {label}
    </Badge>
  );
}
