import type { AnnotationState, Point, BoundingBox } from '../types';

export const BASE_URL = (import.meta.env.VITE_BACKEND_URL as string | undefined) ?? 'http://localhost:8000';

export interface SAMSegmentRequest {
  imageBase64: string;
  textPrompt?: string;
  positivePoints?: Point[];
  negativePoints?: Point[];
  boundingBox?: BoundingBox;
}

export interface SAMSegmentResponse {
  maskDataUrl: string | null;
  confidence: number | null;
  pixelArea: number | null;
  processingTimeMs: number | null;
  regionLabel: string | null;
  status?: string;
  message?: string;
}

export async function runSegmentation(request: SAMSegmentRequest): Promise<SAMSegmentResponse> {
  const response = await fetch(`${BASE_URL}/api/segment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image_base64: request.imageBase64,
      text_prompt: request.textPrompt ?? null,
      positive_points: request.positivePoints ?? [],
      negative_points: request.negativePoints ?? [],
      bounding_box: request.boundingBox ?? null,
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;

  if (!response.ok) {
    const detail = payload.detail;
    if (typeof detail === 'string') {
      throw new Error(detail);
    }
    if (Array.isArray(detail)) {
      const messages = detail
        .map((item) => {
          if (item && typeof item === 'object' && 'msg' in item && typeof item.msg === 'string') {
            return item.msg;
          }
          return null;
        })
        .filter((message): message is string => message !== null);
      if (messages.length > 0) {
        throw new Error(messages.join('; '));
      }
    }
    throw new Error('Segmentation request failed.');
  }

  return {
    maskDataUrl: (payload.mask_data_url as string | null) ?? null,
    confidence: typeof payload.confidence === 'number' ? payload.confidence : null,
    pixelArea: typeof payload.pixel_area === 'number' ? payload.pixel_area : null,
    processingTimeMs: typeof payload.processing_time_ms === 'number' ? payload.processing_time_ms : null,
    regionLabel: typeof payload.region_label === 'string' ? payload.region_label : null,
    status: typeof payload.status === 'string' ? payload.status : 'success',
    message: typeof payload.message === 'string' ? payload.message : undefined,
  };
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/health`, { method: 'GET' });
    return response.ok;
  } catch {
    return false;
  }
}

export function buildRequest(state: AnnotationState): SAMSegmentRequest | null {
  if (!state.imageDataUrl) return null;

  const base64 = state.imageDataUrl.split(',')[1] ?? '';
  const req: SAMSegmentRequest = { imageBase64: base64 };
  const { prompt } = state;

  if (prompt.textPrompt.trim()) {
    req.textPrompt = prompt.textPrompt.trim();
  }
  if (prompt.positivePoints.length > 0) {
    req.positivePoints = prompt.positivePoints;
  }
  if (prompt.negativePoints.length > 0) {
    req.negativePoints = prompt.negativePoints;
  }
  if (prompt.boundingBox) {
    req.boundingBox = prompt.boundingBox;
  }

  return req;
}
