import { useReducer, useCallback } from 'react';
import type {
  AnnotationState,
  AnnotationPrompt,
  Point,
  BoundingBox,
  PromptMode,
  SegmentationResult,
} from '../types';

// ─── Initial State ───────────────────────────────────────────────────────────

const defaultPrompt: AnnotationPrompt = {
  mode: 'text',
  textPrompt: '',
  positivePoints: [],
  negativePoints: [],
  boundingBox: null,
};

const defaultSegmentation: SegmentationResult = {
  maskDataUrl: null,
  pixelArea: null,
  processingTimeMs: null,
  confidence: null,
  regionLabel: null,
};

const initialState: AnnotationState = {
  imageDataUrl: null,
  imageWidth: 0,
  imageHeight: 0,
  currentSlice: 1,
  totalSlices: 1,
  zoom: 1,
  brightness: 100,
  contrast: 100,
  prompt: defaultPrompt,
  segmentation: defaultSegmentation,
  apiStatus: 'idle',
  lastError: null,
  maskVisible: true,
  maskOpacity: 0.5,
  history: [],
  historyIndex: -1,
};

// ─── Actions ─────────────────────────────────────────────────────────────────

type Action =
  | { type: 'SET_IMAGE'; payload: { dataUrl: string; width: number; height: number } }
  | { type: 'CLEAR_IMAGE' }
  | { type: 'SET_SLICE'; payload: number }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'SET_BRIGHTNESS'; payload: number }
  | { type: 'SET_CONTRAST'; payload: number }
  | { type: 'SET_PROMPT_MODE'; payload: PromptMode }
  | { type: 'SET_TEXT_PROMPT'; payload: string }
  | { type: 'ADD_POINT'; payload: { point: Point; kind: 'positive' | 'negative' } }
  | { type: 'SET_BBOX'; payload: BoundingBox }
  | { type: 'CLEAR_PROMPTS' }
  | { type: 'SET_API_STATUS'; payload: AnnotationState['apiStatus'] }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SEGMENTATION'; payload: SegmentationResult }
  | { type: 'CLEAR_MASK' }
  | { type: 'SET_MASK_VISIBLE'; payload: boolean }
  | { type: 'SET_MASK_OPACITY'; payload: number }
  | { type: 'UNDO' }
  | { type: 'REDO' };

// ─── Reducer ─────────────────────────────────────────────────────────────────

function reducer(state: AnnotationState, action: Action): AnnotationState {
  switch (action.type) {
    case 'SET_IMAGE':
      return {
        ...state,
        imageDataUrl: action.payload.dataUrl,
        imageWidth: action.payload.width,
        imageHeight: action.payload.height,
        zoom: 1,
        brightness: 100,
        contrast: 100,
        currentSlice: 1,
        segmentation: defaultSegmentation,
        prompt: defaultPrompt,
        apiStatus: 'idle',
        lastError: null,
        history: [],
        historyIndex: -1,
      };
    case 'CLEAR_IMAGE':
      return { ...initialState };
    case 'SET_SLICE':
      return { ...state, currentSlice: action.payload };
    case 'SET_ZOOM':
      return { ...state, zoom: Math.max(0.25, Math.min(4, action.payload)) };
    case 'SET_BRIGHTNESS':
      return { ...state, brightness: action.payload };
    case 'SET_CONTRAST':
      return { ...state, contrast: action.payload };
    case 'SET_PROMPT_MODE':
      return { ...state, prompt: { ...state.prompt, mode: action.payload } };
    case 'SET_TEXT_PROMPT':
      return { ...state, prompt: { ...state.prompt, textPrompt: action.payload } };
    case 'ADD_POINT': {
      const { point, kind } = action.payload;
      if (kind === 'positive') {
        return {
          ...state,
          prompt: {
            ...state.prompt,
            positivePoints: [...state.prompt.positivePoints, point],
          },
        };
      }
      return {
        ...state,
        prompt: {
          ...state.prompt,
          negativePoints: [...state.prompt.negativePoints, point],
        },
      };
    }
    case 'SET_BBOX':
      return { ...state, prompt: { ...state.prompt, boundingBox: action.payload } };
    case 'CLEAR_PROMPTS':
      return { ...state, prompt: defaultPrompt };
    case 'SET_API_STATUS':
      return { ...state, apiStatus: action.payload };
    case 'SET_ERROR':
      return { ...state, lastError: action.payload };
    case 'SET_SEGMENTATION': {
      const newHistory = [
        ...state.history.slice(0, state.historyIndex + 1),
        action.payload,
      ];
      return {
        ...state,
        segmentation: action.payload,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        apiStatus: 'success',
      };
    }
    case 'CLEAR_MASK':
      return { ...state, segmentation: defaultSegmentation, apiStatus: 'idle' };
    case 'SET_MASK_VISIBLE':
      return { ...state, maskVisible: action.payload };
    case 'SET_MASK_OPACITY':
      return { ...state, maskOpacity: action.payload };
    case 'UNDO': {
      if (state.historyIndex <= 0) return state;
      const newIndex = state.historyIndex - 1;
      return {
        ...state,
        historyIndex: newIndex,
        segmentation: state.history[newIndex] ?? defaultSegmentation,
      };
    }
    case 'REDO': {
      if (state.historyIndex >= state.history.length - 1) return state;
      const newIndex = state.historyIndex + 1;
      return {
        ...state,
        historyIndex: newIndex,
        segmentation: state.history[newIndex] ?? defaultSegmentation,
      };
    }
    default:
      return state;
  }
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAnnotation() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setImage = useCallback(
    (dataUrl: string, width: number, height: number) =>
      dispatch({ type: 'SET_IMAGE', payload: { dataUrl, width, height } }),
    []
  );

  const clearImage = useCallback(() => dispatch({ type: 'CLEAR_IMAGE' }), []);

  const setSlice = useCallback(
    (n: number) => dispatch({ type: 'SET_SLICE', payload: n }),
    []
  );

  const setZoom = useCallback(
    (z: number) => dispatch({ type: 'SET_ZOOM', payload: z }),
    []
  );

  const setBrightness = useCallback(
    (b: number) => dispatch({ type: 'SET_BRIGHTNESS', payload: b }),
    []
  );

  const setContrast = useCallback(
    (c: number) => dispatch({ type: 'SET_CONTRAST', payload: c }),
    []
  );

  const setPromptMode = useCallback(
    (mode: PromptMode) => dispatch({ type: 'SET_PROMPT_MODE', payload: mode }),
    []
  );

  const setTextPrompt = useCallback(
    (text: string) => dispatch({ type: 'SET_TEXT_PROMPT', payload: text }),
    []
  );

  const addPoint = useCallback(
    (point: Point, kind: 'positive' | 'negative') =>
      dispatch({ type: 'ADD_POINT', payload: { point, kind } }),
    []
  );

  const setBBox = useCallback(
    (bbox: BoundingBox) => dispatch({ type: 'SET_BBOX', payload: bbox }),
    []
  );

  const clearPrompts = useCallback(() => dispatch({ type: 'CLEAR_PROMPTS' }), []);

  const setApiStatus = useCallback(
    (status: AnnotationState['apiStatus']) => dispatch({ type: 'SET_API_STATUS', payload: status }),
    []
  );

  const setError = useCallback(
    (message: string | null) => dispatch({ type: 'SET_ERROR', payload: message }),
    []
  );

  const setSegmentation = useCallback(
    (payload: SegmentationResult) => dispatch({ type: 'SET_SEGMENTATION', payload }),
    []
  );

  const clearMask = useCallback(() => dispatch({ type: 'CLEAR_MASK' }), []);

  const setMaskVisible = useCallback(
    (v: boolean) => dispatch({ type: 'SET_MASK_VISIBLE', payload: v }),
    []
  );

  const setMaskOpacity = useCallback(
    (o: number) => dispatch({ type: 'SET_MASK_OPACITY', payload: o }),
    []
  );

  const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);
  const redo = useCallback(() => dispatch({ type: 'REDO' }), []);

  const canUndo = state.historyIndex > 0;
  const canRedo = state.historyIndex < state.history.length - 1;

  return {
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
  };
}
