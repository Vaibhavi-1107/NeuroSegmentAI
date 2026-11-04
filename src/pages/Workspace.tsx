import { useCallback } from 'react';
import { useAnnotation } from '../hooks/useAnnotation';
import { ImageViewer } from '../components/workspace/ImageViewer';
import { PromptPanel } from '../components/workspace/PromptPanel';
import { SegmentationOverlay } from '../components/workspace/SegmentationOverlay';
import { ResultsPanel } from '../components/workspace/ResultsPanel';
import { Badge } from '../components/ui/Badge';
import { buildRequest, runSegmentation } from '../services/samApi';

export function Workspace() {
  const {
    state,
    setImage,
    clearImage,
    setSlice,
    setZoom,
    setBrightness,
    setContrast,
    setPromptMode,
    setTextPrompt,
    addPoint,
    setBBox,
    clearPrompts,
    setApiStatus,
    setError,
    setSegmentation,
    clearMask,
    setMaskVisible,
    setMaskOpacity,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useAnnotation();

  const handleRunSegmentation = useCallback(async () => {
    if (!state.imageDataUrl) {
      setError('Upload a brain MRI before attempting segmentation.');
      return;
    }

    try {
      setApiStatus('loading');
      setError(null);
      const request = buildRequest(state);
      if (!request) {
        setError('No valid prompt or image is available for segmentation.');
        setApiStatus('error');
        return;
      }

      const result = await runSegmentation(request);
      setSegmentation({
        maskDataUrl: result.maskDataUrl ?? null,
        pixelArea: result.pixelArea ?? null,
        processingTimeMs: result.processingTimeMs ?? null,
        confidence: result.confidence ?? null,
        regionLabel: result.regionLabel ?? null,
      });
      setApiStatus(result.maskDataUrl ? 'success' : 'error');
      if (!result.maskDataUrl) {
        setError('Meta SAM returned an empty mask. No segmentation was produced for the current prompt.');
      }
    } catch (error) {
      setApiStatus('error');
      setError(error instanceof Error ? error.message : 'The segmentation request failed.');
    }
  }, [setApiStatus, setError, state, setSegmentation]);

  const handleExport = useCallback(() => {
    if (!state.segmentation.maskDataUrl) return;
    const a = document.createElement('a');
    a.href = state.segmentation.maskDataUrl;
    a.download = 'neurosegment_mask.png';
    a.click();
  }, [state.segmentation.maskDataUrl]);

  const handleZoomIn = useCallback(() => setZoom(state.zoom + 0.25), [state.zoom, setZoom]);
  const handleZoomOut = useCallback(() => setZoom(state.zoom - 0.25), [state.zoom, setZoom]);
  const handleFitScreen = useCallback(() => setZoom(1), [setZoom]);

  return (
    <div className="w-full max-w-screen-xl mx-auto px-4 md:px-6 py-6 flex flex-col gap-4">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
            Annotation Workspace
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            Upload a brain MRI and apply prompt-guided segmentation
          </p>
        </div>
        <Badge variant="accent" dot>Meta SAM 3.1 · API Backend</Badge>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 items-start">
        {/* Left: Image viewer */}
        <div className="flex flex-col gap-4">
          <ImageViewer
            imageDataUrl={state.imageDataUrl}
            maskDataUrl={state.segmentation.maskDataUrl}
            maskVisible={state.maskVisible}
            maskOpacity={state.maskOpacity}
            zoom={state.zoom}
            brightness={state.brightness}
            contrast={state.contrast}
            currentSlice={state.currentSlice}
            totalSlices={state.totalSlices}
            promptMode={state.prompt.mode}
            positivePoints={state.prompt.positivePoints}
            negativePoints={state.prompt.negativePoints}
            boundingBox={state.prompt.boundingBox}
            onImageLoad={setImage}
            onClear={clearImage}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onFitScreen={handleFitScreen}
            onBrightnessChange={setBrightness}
            onContrastChange={setContrast}
            onSliceChange={setSlice}
            onAddPoint={addPoint}
            onSetBBox={setBBox}
          />
        </div>

        {/* Right: Control panels */}
        <div className="flex flex-col gap-4">
          <PromptPanel
            mode={state.prompt.mode}
            textPrompt={state.prompt.textPrompt}
            positivePointsCount={state.prompt.positivePoints.length}
            negativePointsCount={state.prompt.negativePoints.length}
            hasBBox={state.prompt.boundingBox !== null}
            hasImage={state.imageDataUrl !== null}
            onModeChange={setPromptMode}
            onTextChange={setTextPrompt}
            onRunSegmentation={handleRunSegmentation}
            onClearPrompts={clearPrompts}
          />

          <SegmentationOverlay
            maskVisible={state.maskVisible}
            maskOpacity={state.maskOpacity}
            maskDataUrl={state.segmentation.maskDataUrl}
            hasMask={state.segmentation.maskDataUrl !== null}
            onToggleVisible={() => setMaskVisible(!state.maskVisible)}
            onOpacityChange={setMaskOpacity}
            onClearMask={clearMask}
          />

          <ResultsPanel
            apiStatus={state.apiStatus}
            segmentation={state.segmentation}
            errorMessage={state.lastError}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={undo}
            onRedo={redo}
            onExport={handleExport}
          />
        </div>
      </div>

      {/* Info footer */}
      <div
        className="p-3 rounded-lg flex items-start gap-2.5 text-xs"
        style={{
          background: 'rgba(167,139,250,0.07)',
          border: '1px solid rgba(167,139,250,0.2)',
          color: 'var(--color-text-muted)',
          lineHeight: 1.65,
        }}
      >
        <span style={{ color: 'var(--color-accent)', flexShrink: 0 }}>ℹ</span>
        <span>
          <strong style={{ color: 'var(--color-accent)' }}>Live API workflow —</strong>{' '}
          Segmentation requests are proxied to Meta SAM 3.1 by the FastAPI backend. A mask is
          displayed only when the API returns one; an empty response is surfaced as an error.
          Review all AI-generated annotations before research or clinical use.
        </span>
      </div>
    </div>
  );
}
