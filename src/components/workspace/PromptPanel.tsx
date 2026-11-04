import { MousePointer, MousePointerClick, Square, Type, X } from 'lucide-react';
import type { PromptMode } from '../../types';
import { Button } from '../ui/Button';

interface PromptPanelProps {
  mode: PromptMode;
  textPrompt: string;
  positivePointsCount: number;
  negativePointsCount: number;
  hasBBox: boolean;
  hasImage: boolean;
  onModeChange: (mode: PromptMode) => void;
  onTextChange: (text: string) => void;
  onRunSegmentation: () => void;
  onClearPrompts: () => void;
}

const modes: { key: PromptMode; label: string; icon: typeof MousePointer; description: string }[] = [
  { key: 'text', label: 'Text', icon: Type, description: 'Describe the region to segment' },
  { key: 'positive-point', label: '+Point', icon: MousePointerClick, description: 'Click to include regions' },
  { key: 'negative-point', label: '−Point', icon: MousePointerClick, description: 'Click to exclude regions' },
  { key: 'bbox', label: 'BBox', icon: Square, description: 'Draw a bounding box' },
];

export function PromptPanel({
  mode,
  textPrompt,
  positivePointsCount,
  negativePointsCount,
  hasBBox,
  hasImage,
  onModeChange,
  onTextChange,
  onRunSegmentation,
  onClearPrompts,
}: PromptPanelProps) {
  const hasAnyPrompt =
    textPrompt.trim().length > 0 ||
    positivePointsCount > 0 ||
    negativePointsCount > 0 ||
    hasBBox;

  return (
    <div
      className="flex flex-col gap-4 p-4 rounded-xl"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="label-caps">Prompt Controls</span>
        {hasAnyPrompt && (
          <button
            onClick={onClearPrompts}
            className="flex items-center gap-1 text-xs transition-colors"
            style={{ color: 'var(--color-text-dim)', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
          >
            <X size={11} />
            Clear all
          </button>
        )}
      </div>

      {/* Mode selector */}
      <div>
        <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>Prompt Mode</p>
        <div className="grid grid-cols-2 gap-1.5">
          {modes.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              id={`prompt-mode-${key}`}
              onClick={() => onModeChange(key)}
              disabled={!hasImage}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 text-left"
              style={{
                background:
                  mode === key
                    ? key === 'negative-point'
                      ? 'rgba(248,113,113,0.12)'
                      : 'var(--color-accent-dim)'
                    : 'var(--color-surface-high)',
                border:
                  mode === key
                    ? key === 'negative-point'
                      ? '1px solid rgba(248,113,113,0.3)'
                      : '1px solid var(--color-accent-border)'
                    : '1px solid var(--color-border)',
                color:
                  mode === key
                    ? key === 'negative-point'
                      ? 'var(--color-negative)'
                      : 'var(--color-accent)'
                    : 'var(--color-text-muted)',
                cursor: hasImage ? 'pointer' : 'not-allowed',
                opacity: hasImage ? 1 : 0.5,
              }}
            >
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-xs" style={{ color: 'var(--color-text-dim)' }}>
          {modes.find((m) => m.key === mode)?.description}
        </p>
      </div>

      {/* Text prompt */}
      <div>
        <label
          htmlFor="text-prompt-input"
          className="text-xs mb-1.5 block"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Text Prompt
        </label>
        <textarea
          id="text-prompt-input"
          value={textPrompt}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="e.g. brain tumor, glioblastoma, enhancing region..."
          disabled={!hasImage}
          rows={3}
          className="w-full rounded-lg px-3 py-2 text-sm resize-none transition-all duration-150"
          style={{
            background: 'var(--color-surface-high)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
            fontFamily: 'inherit',
            outline: 'none',
            opacity: hasImage ? 1 : 0.5,
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--color-accent-border)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--color-border)';
          }}
        />
      </div>

      {/* Point / BBox counters */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: '+Points', value: positivePointsCount, color: 'var(--color-positive)' },
          { label: '−Points', value: negativePointsCount, color: 'var(--color-negative)' },
          { label: 'BBox', value: hasBBox ? 1 : 0, color: 'var(--color-accent)' },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="flex flex-col items-center p-2 rounded-lg"
            style={{ background: 'var(--color-surface-high)', border: '1px solid var(--color-border)' }}
          >
            <span className="font-mono text-base font-bold" style={{ color }}>
              {value}
            </span>
            <span className="label-caps mt-0.5">{label}</span>
          </div>
        ))}
      </div>

      {/* Run segmentation */}
      <div className="flex flex-col gap-2">
        <Button
          id="run-segmentation-btn"
          variant="pending"
          size="md"
          fullWidth
          disabled={!hasImage || !hasAnyPrompt}
          onClick={onRunSegmentation}
        >
          Run Segmentation
        </Button>
        <p className="text-xs text-center" style={{ color: 'var(--color-text-dim)', lineHeight: 1.5 }}>
          Sends the image and prompt to the FastAPI backend, which calls Meta SAM 3.1.
          Empty masks are reported instead of being replaced with demo output.
        </p>
      </div>
    </div>
  );
}
