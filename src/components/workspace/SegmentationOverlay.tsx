import { Eye, EyeOff, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface SegmentationOverlayProps {
  maskVisible: boolean;
  maskOpacity: number;
  maskDataUrl: string | null;
  hasMask: boolean;
  onToggleVisible: () => void;
  onOpacityChange: (v: number) => void;
  onClearMask: () => void;
}

export function SegmentationOverlay({
  maskVisible,
  maskOpacity,
  maskDataUrl,
  hasMask,
  onToggleVisible,
  onOpacityChange,
  onClearMask,
}: SegmentationOverlayProps) {
  return (
    <div
      className="flex flex-col gap-3 p-4 rounded-xl"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <span className="label-caps">Segmentation Overlay</span>

      {/* Mask visibility */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Mask Visibility
        </span>
        <Button
          id="toggle-mask-btn"
          variant="ghost"
          size="sm"
          disabled={!hasMask}
          onClick={onToggleVisible}
          title={maskVisible ? 'Hide mask' : 'Show mask'}
        >
          {maskVisible ? <Eye size={13} /> : <EyeOff size={13} />}
          {maskVisible ? 'Visible' : 'Hidden'}
        </Button>
      </div>

      {/* Opacity slider */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Opacity
          </span>
          <span
            className="font-mono text-xs"
            style={{ color: 'var(--color-text-dim)' }}
          >
            {Math.round(maskOpacity * 100)}%
          </span>
        </div>
        <input
          id="mask-opacity-slider"
          type="range"
          min={0}
          max={100}
          value={Math.round(maskOpacity * 100)}
          onChange={(e) => onOpacityChange(Number(e.target.value) / 100)}
          className="w-full"
          disabled={!hasMask}
        />
      </div>

      {/* Mask preview */}
      <div
        className="rounded-lg overflow-hidden flex items-center justify-center"
        style={{
          background: '#080a0d',
          border: '1px solid var(--color-border)',
          height: '80px',
        }}
      >
        {hasMask && maskDataUrl ? (
          <img
            src={maskDataUrl}
            alt="Mask preview"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              opacity: maskVisible ? maskOpacity : 0.35,
            }}
          />
        ) : (
          <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
            No mask generated
          </p>
        )}
      </div>

      {/* Clear mask */}
      <Button
        id="clear-mask-btn"
        variant="danger"
        size="sm"
        fullWidth
        disabled={!hasMask}
        onClick={onClearMask}
      >
        <Trash2 size={13} />
        Clear Mask
      </Button>
    </div>
  );
}
