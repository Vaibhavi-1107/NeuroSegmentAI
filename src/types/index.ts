// ─── Core Domain Types ──────────────────────────────────────────────────────

export type PromptMode = 'text' | 'positive-point' | 'negative-point' | 'bbox';

export interface Point {
  /** Coordinates are normalized to the image dimensions (0–1). */
  x: number;
  y: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AnnotationPrompt {
  mode: PromptMode;
  textPrompt: string;
  positivePoints: Point[];
  negativePoints: Point[];
  boundingBox: BoundingBox | null;
}

export interface SegmentationResult {
  maskDataUrl: string | null;
  pixelArea: number | null;
  processingTimeMs: number | null;
  confidence: number | null;
  regionLabel: string | null;
}

export type ApiStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AnnotationState {
  imageDataUrl: string | null;
  imageWidth: number;
  imageHeight: number;
  currentSlice: number;
  totalSlices: number;
  zoom: number;
  brightness: number;
  contrast: number;
  prompt: AnnotationPrompt;
  segmentation: SegmentationResult;
  apiStatus: ApiStatus;
  lastError: string | null;
  maskVisible: boolean;
  maskOpacity: number;
  history: SegmentationResult[];
  historyIndex: number;
}

// ─── Navigation ─────────────────────────────────────────────────────────────

export interface NavItem {
  label: string;
  path: string;
  icon?: string;
}

// ─── Research Metrics (demo placeholders) ───────────────────────────────────

export interface MetricCard {
  label: string;
  value: string;
  unit?: string;
  isPlaceholder: boolean;
  description: string;
}

export interface AnnotationTimeDataPoint {
  method: string;
  minutes: number;
  isEstimate: boolean;
}
