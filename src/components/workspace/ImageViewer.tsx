import { useRef, useCallback, useState } from 'react';
import {
  Upload, ZoomIn, ZoomOut, Maximize2, Sun, Contrast,
  ChevronLeft, ChevronRight, X, AlertCircle
} from 'lucide-react';
import type { BoundingBox, Point, PromptMode } from '../../types';
import { Button } from '../ui/Button';

interface ImageViewerProps {
  imageDataUrl: string | null;
  maskDataUrl: string | null;
  maskVisible: boolean;
  maskOpacity: number;
  zoom: number;
  brightness: number;
  contrast: number;
  currentSlice: number;
  totalSlices: number;
  promptMode: PromptMode;
  positivePoints: Point[];
  negativePoints: Point[];
  boundingBox: BoundingBox | null;
  onImageLoad: (dataUrl: string, width: number, height: number) => void;
  onClear: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitScreen: () => void;
  onBrightnessChange: (v: number) => void;
  onContrastChange: (v: number) => void;
  onSliceChange: (n: number) => void;
  onAddPoint: (point: Point, kind: 'positive' | 'negative') => void;
  onSetBBox: (bbox: BoundingBox) => void;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function ImageViewer({
  imageDataUrl,
  maskDataUrl,
  maskVisible,
  maskOpacity,
  zoom,
  brightness,
  contrast,
  currentSlice,
  totalSlices,
  promptMode,
  positivePoints,
  negativePoints,
  boundingBox,
  onImageLoad,
  onClear,
  onZoomIn,
  onZoomOut,
  onFitScreen,
  onBrightnessChange,
  onContrastChange,
  onSliceChange,
  onAddPoint,
  onSetBBox,
}: ImageViewerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [dragPreview, setDragPreview] = useState<BoundingBox | null>(null);

  const getRelativePoint = useCallback((event: React.PointerEvent<HTMLDivElement>): Point => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    const y = clamp((event.clientY - rect.top) / rect.height, 0, 1);
    return { x, y };
  }, []);

  const finalizeBoxSelection = useCallback(() => {
    if (!dragStart || !dragPreview) return;
    const bbox: BoundingBox = {
      x: clamp(Math.min(dragStart.x, dragPreview.x), 0, 1),
      y: clamp(Math.min(dragStart.y, dragPreview.y), 0, 1),
      width: clamp(Math.abs(dragPreview.x - dragStart.x), 0.01, 1),
      height: clamp(Math.abs(dragPreview.y - dragStart.y), 0.01, 1),
    };
    const safeBox: BoundingBox = {
      x: clamp(bbox.x, 0, 1 - bbox.width),
      y: clamp(bbox.y, 0, 1 - bbox.height),
      width: clamp(bbox.width, 0.01, 1),
      height: clamp(bbox.height, 0.01, 1),
    };
    onSetBBox(safeBox);
    setDragStart(null);
    setDragPreview(null);
  }, [dragPreview, dragStart, onSetBBox]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const isAllowed =
        file.type === 'image/png' ||
        file.type === 'image/jpeg' ||
        /\.(png|jpe?g)$/i.test(file.name);

      if (!isAllowed) {
        setFileError('Only PNG and JPEG images are supported.');
        e.target.value = '';
        return;
      }

      setFileError(null);
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        const img = new Image();
        img.onload = () => onImageLoad(dataUrl, img.naturalWidth, img.naturalHeight);
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    },
    [onImageLoad]
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!imageDataUrl) return;
      const point = getRelativePoint(event);

      if (promptMode === 'positive-point') {
        onAddPoint(point, 'positive');
        return;
      }

      if (promptMode === 'negative-point') {
        onAddPoint(point, 'negative');
        return;
      }

      if (promptMode === 'bbox') {
        const nextBox: BoundingBox = { x: point.x, y: point.y, width: 0.01, height: 0.01 };
        setDragStart(point);
        setDragPreview(nextBox);
      }
    },
    [getRelativePoint, imageDataUrl, onAddPoint, promptMode]
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!dragStart || promptMode !== 'bbox') return;
      const currentPoint = getRelativePoint(event);
      const nextBox: BoundingBox = {
        x: Math.min(dragStart.x, currentPoint.x),
        y: Math.min(dragStart.y, currentPoint.y),
        width: Math.abs(currentPoint.x - dragStart.x),
        height: Math.abs(currentPoint.y - dragStart.y),
      };
      setDragPreview(nextBox);
    },
    [dragStart, getRelativePoint, promptMode]
  );

  const displayBBox = dragPreview ?? boundingBox;

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Controls bar */}
      <div
        className="flex items-center justify-between gap-2 flex-wrap rounded-lg px-3 py-2"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onZoomOut}
            title="Zoom Out"
            aria-label="Zoom out"
          >
            <ZoomOut size={14} />
          </Button>
          <span
            className="font-mono text-xs px-2"
            style={{ color: 'var(--color-text-muted)', minWidth: '42px', textAlign: 'center' }}
          >
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onZoomIn}
            title="Zoom In"
            aria-label="Zoom in"
          >
            <ZoomIn size={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onFitScreen}
            title="Fit to Screen"
            aria-label="Fit to screen"
          >
            <Maximize2 size={14} />
          </Button>
        </div>

        {/* Brightness */}
        <div className="flex items-center gap-2">
          <Sun size={12} style={{ color: 'var(--color-text-muted)' }} />
          <input
            id="brightness-slider"
            type="range"
            min={20}
            max={200}
            value={brightness}
            onChange={(e) => onBrightnessChange(Number(e.target.value))}
            className="w-20"
            title={`Brightness: ${brightness}%`}
          />
          <Contrast size={12} style={{ color: 'var(--color-text-muted)' }} />
          <input
            id="contrast-slider"
            type="range"
            min={20}
            max={300}
            value={contrast}
            onChange={(e) => onContrastChange(Number(e.target.value))}
            className="w-20"
            title={`Contrast: ${contrast}%`}
          />
        </div>

        {/* Upload / Clear */}
        <div className="flex items-center gap-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Upload image"
          >
            <Upload size={13} />
            Upload MRI
          </Button>
          {imageDataUrl && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              aria-label="Clear image"
              title="Clear image"
            >
              <X size={14} />
            </Button>
          )}
          <input
            id="mri-file-input"
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,.png,.jpg,.jpeg"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* Main viewer */}
      <div
        className="relative flex-1 rounded-xl overflow-hidden flex items-center justify-center"
        style={{
          background: '#080a0d',
          border: '1px solid var(--color-border)',
          minHeight: '360px',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finalizeBoxSelection}
        onPointerLeave={finalizeBoxSelection}
      >
        {imageDataUrl ? (
          <div
            className="relative"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              lineHeight: 0,
              transform: `scale(${zoom})`,
              transformOrigin: 'center',
              transition: 'transform 0.15s ease',
            }}
          >
            <img
              src={imageDataUrl}
              alt="MRI scan"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                transition: 'filter 0.1s ease',
                display: 'block',
                pointerEvents: 'none',
              }}
            />

            <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
              {maskDataUrl && maskVisible && (
                <img
                  src={maskDataUrl}
                  alt=""
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'fill',
                    opacity: maskOpacity,
                    pointerEvents: 'none',
                  }}
                />
              )}

              {promptMode === 'positive-point' &&
                positivePoints.map((point, index) => (
                  <span
                    key={`positive-${index}`}
                    className="absolute rounded-full"
                    style={{
                      left: `${point.x * 100}%`,
                      top: `${point.y * 100}%`,
                      width: '10px',
                      height: '10px',
                      transform: 'translate(-50%, -50%)',
                      background: 'rgba(52,211,153,0.9)',
                      border: '1px solid rgba(255,255,255,0.8)',
                      boxShadow: '0 0 0 3px rgba(52,211,153,0.18)',
                    }}
                  />
                ))}

              {promptMode === 'negative-point' &&
                negativePoints.map((point, index) => (
                  <span
                    key={`negative-${index}`}
                    className="absolute rounded-full"
                    style={{
                      left: `${point.x * 100}%`,
                      top: `${point.y * 100}%`,
                      width: '10px',
                      height: '10px',
                      transform: 'translate(-50%, -50%)',
                      background: 'rgba(248,113,113,0.9)',
                      border: '1px solid rgba(255,255,255,0.8)',
                      boxShadow: '0 0 0 3px rgba(248,113,113,0.18)',
                    }}
                  />
                ))}

              {promptMode === 'bbox' && displayBBox && (
                <div
                  className="absolute"
                  style={{
                    left: `${displayBBox.x * 100}%`,
                    top: `${displayBBox.y * 100}%`,
                    width: `${displayBBox.width * 100}%`,
                    height: `${displayBBox.height * 100}%`,
                    border: '1px solid rgba(56,189,248,0.95)',
                    background: 'rgba(56,189,248,0.12)',
                    boxShadow: 'inset 0 0 0 1px rgba(56,189,248,0.2)',
                  }}
                />
              )}
            </div>
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center gap-4 text-center px-6 animate-fade-in">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: 'var(--color-surface)',
                border: '1px dashed var(--color-border)',
              }}
            >
              <Upload size={24} style={{ color: 'var(--color-text-dim)' }} />
            </div>
            <div>
              <p
                className="text-sm font-medium mb-1"
                style={{ color: 'var(--color-text-muted)' }}
              >
                No image loaded
              </p>
              <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
                Click <strong>Upload MRI</strong> to load a brain scan
                <br />
                Supported: PNG, JPG
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150"
              style={{
                background: 'var(--color-surface-high)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
                cursor: 'pointer',
              }}
            >
              <Upload size={14} className="inline mr-2" />
              Upload MRI Image
            </button>
          </div>
        )}

        {fileError && (
          <div
            className="absolute bottom-3 left-3 right-3 flex items-start gap-2 rounded-lg px-3 py-2 text-xs"
            style={{
              background: 'rgba(248,113,113,0.08)',
              border: '1px solid rgba(248,113,113,0.25)',
              color: 'var(--color-text-muted)',
            }}
          >
            <AlertCircle size={14} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
            <span>{fileError}</span>
          </div>
        )}

        {/* Zoom badge overlay */}
        {imageDataUrl && zoom !== 1 && (
          <div
            className="absolute top-3 right-3 font-mono text-xs px-2 py-1 rounded"
            style={{
              background: 'rgba(13,15,20,0.75)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-muted)',
            }}
          >
            {Math.round(zoom * 100)}%
          </div>
        )}
      </div>

      {/* Slice navigator */}
      {imageDataUrl && (
        <div
          className="flex items-center gap-3 px-3 py-2 rounded-lg"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <span className="label-caps">Slice</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSliceChange(Math.max(1, currentSlice - 1))}
            disabled={currentSlice <= 1}
            aria-label="Previous slice"
          >
            <ChevronLeft size={14} />
          </Button>
          <input
            id="slice-slider"
            type="range"
            min={1}
            max={totalSlices}
            value={currentSlice}
            onChange={(e) => onSliceChange(Number(e.target.value))}
            className="flex-1"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSliceChange(Math.min(totalSlices, currentSlice + 1))}
            disabled={currentSlice >= totalSlices}
            aria-label="Next slice"
          >
            <ChevronRight size={14} />
          </Button>
          <span
            className="font-mono text-xs"
            style={{ color: 'var(--color-text-muted)', minWidth: '48px', textAlign: 'right' }}
          >
            {currentSlice} / {totalSlices}
          </span>
        </div>
      )}
    </div>
  );
}
