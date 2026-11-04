import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  hover?: boolean;
  accent?: boolean;
}

export function Card({ children, className = '', style, hover, accent }: CardProps) {
  return (
    <div
      className={`card transition-all duration-150 ${
        hover ? 'hover:border-[var(--color-accent)] hover:shadow-[0_0_20px_rgba(56,189,248,0.1)]' : ''
      } ${
        accent ? 'border-[var(--color-accent-border)] bg-[var(--color-accent-dim)]' : ''
      } ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

interface SectionLabelProps {
  children: ReactNode;
  className?: string;
}

export function SectionLabel({ children, className = '' }: SectionLabelProps) {
  return (
    <span className={`label-caps ${className}`}>{children}</span>
  );
}
