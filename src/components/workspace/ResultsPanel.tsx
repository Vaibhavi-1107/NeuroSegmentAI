import { Download, Undo2, Redo2, Clock, Maximize, Tag } from 'lucide-react';
import { Button } from '../ui/Button';
import type { ApiStatus, SegmentationResult } from '../../types';

interface ResultsPanelProps {
  apiStatus: ApiStatus;
  segmentation: SegmentationResult;
  errorMessage?: string | null;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onExport: () => void;
}

export function ResultsPanel({
  apiStatus,
  segmentation,
  errorMessage,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onExport,
}: ResultsPanelProps) {
  const statusMap = {
    idle: { label: 'Ready', color: 'var(--color-text-muted)', dotColor: 'var(--color-text-dim)' },
    loading: { label: 'Processing…', color: 'var(--color-accent)', dotColor: 'var(--color-accent)' },
    success: { label: 'Segmented', color: 'var(--color-success)', dotColor: 'var(--color-success)' },
    error: { label: 'Error', color: 'var(--color-danger)', dotColor: 'var(--color-danger)' },
  };

  const currentStatus = statusMap[apiStatus];
  const hasMask = segmentation.maskDataUrl !== null;

  return (
    <div
      className="flex flex-col gap-4 p-4 rounded-xl"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <span className="label-caps">Results</span>

      {/* Status */}
      <div
        className="flex items-center gap-2 p-3 rounded-lg"
        style={{ background: 'var(--color-surface-high)', border: '1px solid var(--color-border)' }}
      >
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{
            background: currentStatus.dotColor,
            animation: apiStatus === 'loading' ? 'pulse-soft 1s infinite' : undefined,
          }}
        />
        <div>
          <p className="text-sm font-medium" style={{ color: currentStatus.color }}>
            {currentStatus.label}
          </p>
        </div>
      </div>

      {errorMessage && (
        <div
          className="p-2.5 rounded-lg text-xs"
          style={{
            background: 'rgba(248,113,113,0.08)',
            border: '1px solid rgba(248,113,113,0.25)',
            color: 'var(--color-text-muted)',
            lineHeight: 1.6,
          }}
        >
          {errorMessage}
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-2">
        {[
          {
            icon: Tag,
            label: 'Region Label',
            value: segmentation.regionLabel ?? '—',
          },
          {
            icon: Maximize,
            label: 'Pixel Area',
            value: segmentation.pixelArea ? `${segmentation.pixelArea.toLocaleString()} px²` : '—',
          },
          {
            icon: Clock,
            label: 'Processing Time',
            value: segmentation.processingTimeMs ? `${segmentation.processingTimeMs} ms` : '—',
          },
        ].map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="flex items-center gap-3 p-2.5 rounded-lg"
            style={{ background: 'var(--color-surface-high)', border: '1px solid var(--color-border)' }}
          >
            <Icon size={13} style={{ color: 'var(--color-text-dim)', flexShrink: 0 }} />
            <div className="flex-1 min-w-0">
              <p className="label-caps">{label}</p>
              <p
                className="text-sm font-mono font-medium mt-0.5 truncate"
                style={{ color: 'var(--color-text)' }}
              >
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Undo / Redo */}
      <div className="flex items-center gap-2">
        <Button
          id="undo-btn"
          variant="ghost"
          size="sm"
          disabled={!canUndo}
          onClick={onUndo}
          title="Undo"
        >
          <Undo2 size={13} />
          Undo
        </Button>
        <Button
          id="redo-btn"
          variant="ghost"
          size="sm"
          disabled={!canRedo}
          onClick={onRedo}
          title="Redo"
        >
          <Redo2 size={13} />
          Redo
        </Button>
      </div>

      {/* Export */}
      <Button
        id="export-mask-btn"
        variant="secondary"
        size="md"
        fullWidth
        disabled={!hasMask}
        onClick={onExport}
      >
        <Download size={14} />
        Export Mask
      </Button>

      {!hasMask && (
        <p className="text-xs text-center" style={{ color: 'var(--color-text-dim)' }}>
          Generate a segmentation first to export the mask.
        </p>
      )}
    </div>
  );
}
