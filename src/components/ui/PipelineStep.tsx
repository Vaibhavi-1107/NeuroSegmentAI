import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';

interface PipelineStepProps {
  step: number;
  title: string;
  description: string;
  icon: ReactNode;
  isLast?: boolean;
  highlight?: boolean;
  badge?: string;
}

export function PipelineStep({
  step,
  title,
  description,
  icon,
  isLast,
  highlight,
  badge,
}: PipelineStepProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
      {/* Step card */}
      <div
        className="flex-shrink-0 w-full md:w-auto"
        style={{ minWidth: '160px', maxWidth: '200px' }}
      >
        <div
          className="p-4 rounded-xl transition-all duration-150"
          style={{
            background: highlight
              ? 'rgba(56,189,248,0.1)'
              : 'var(--color-surface)',
            border: highlight
              ? '1px solid rgba(56,189,248,0.35)'
              : '1px solid var(--color-border)',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
              style={{
                background: highlight ? 'var(--color-accent-dim)' : 'var(--color-surface-high)',
                color: highlight ? 'var(--color-accent)' : 'var(--color-text-muted)',
              }}
            >
              {icon}
            </div>
            <span
              className="font-mono text-xs"
              style={{ color: 'var(--color-text-dim)' }}
            >
              {String(step).padStart(2, '0')}
            </span>
          </div>
          <div
            className="text-sm font-semibold mb-0.5"
            style={{ color: highlight ? 'var(--color-accent)' : 'var(--color-text)' }}
          >
            {title}
          </div>
          <div className="text-xs" style={{ color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
            {description}
          </div>
          {badge && (
            <div
              className="mt-2 inline-block px-2 py-0.5 rounded text-xs font-mono font-semibold"
              style={{
                background: 'rgba(167,139,250,0.12)',
                color: 'var(--color-pending)',
                border: '1px solid rgba(167,139,250,0.3)',
              }}
            >
              {badge}
            </div>
          )}
        </div>
      </div>

      {/* Arrow connector */}
      {!isLast && (
        <div
          className="hidden md:flex flex-shrink-0"
          style={{ color: 'var(--color-text-dim)' }}
        >
          <ArrowRight size={16} />
        </div>
      )}
    </div>
  );
}
