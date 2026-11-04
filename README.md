# NeuroSegment AI

Prompt-guided brain MRI segmentation for the **Meta Global AI Hackathon 2026**.

NeuroSegment AI is a research prototype that connects a React annotation workspace to Meta
SAM 3.1 through a FastAPI backend proxy. Researchers can upload a single MRI slice, describe a
region with text, positive/negative points, or a bounding box, and inspect the returned mask.

> **Research use only.** This project is not a medical device and has not been clinically
> validated. AI-generated annotations must be reviewed by a qualified clinician.

## Status

- The frontend, backend, API contract, mask post-processing, and automated tests are in place.
- A controlled live request to Meta SAM 3.1 was accepted by the API, but the last run returned an
  **empty mask** for the tested image and `brain lesion` prompt. A successful real-model mask has
  not yet been demonstrated in this repository. Empty responses are shown as errors; no demo or
  fabricated mask is substituted.
- The current workflow supports a **single PNG/JPEG slice**. DICOM, TIFF, multi-slice volumes,
  and clinical deployment are not implemented.
- Research metrics shown on the Evaluation page are clearly marked demo placeholders.

## Features

- Upload and inspect a single PNG/JPEG MRI slice.
- Text prompts plus positive-point, negative-point, and bounding-box prompts.
- Server-side Meta SAM 3.1 request with the official `meta-sam-parser` response decoder.
- Nearest-neighbour mask resizing to the original image dimensions, with multiple mask records
  merged into one overlay.
- Interactive mask visibility and opacity controls.
- Mask preview, PNG export, undo/redo history, and clear prompt/API errors.
- Upload size/pixel limits, request timeout, server-side API key handling, and configurable CORS.

## Architecture

```
React + TypeScript (Vite)
        |
        |  POST /api/segment  (JSON, raw base64 image)
        v
FastAPI backend proxy
  - validates image, prompt, and limits
  - converts normalized prompts to SAM pixel prompts
  - calls Meta SAM 3.1 with the server-side API key
  - decodes/merges masks and resizes them to the source image
        |
        v
Meta SAM 3.1 hosted API
```

The API key never reaches the browser. The frontend only knows the backend URL.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite 8 |
| Styling | Tailwind CSS v4, custom CSS variables |
| Icons/charts | Lucide React, Recharts |
| Backend | FastAPI, Pydantic, Uvicorn |
| Model client | OpenAI Python SDK pointed at the Meta API base URL |
| Response parsing | `meta-sam-parser==0.1.0` |
| Images | Pillow, NumPy |
| Tests | Pytest, FastAPI TestClient |
| Lint/build | Oxlint, TypeScript project build, Vite |

## Repository Layout

```
.
├── backend/
│   ├── app/
│   │   ├── config.py              # environment settings
│   │   ├── main.py                # FastAPI app, CORS, validation handler
│   │   ├── routes/                # health + segmentation endpoints
│   │   ├── schemas/               # request/response models and image validation
│   │   ├── services/              # SAM, image, and mask services
│   │   └── utils/                 # base64/image helpers
│   ├── tests/                     # API and parser/prompt tests
│   ├── test_single_sam_slice.py   # one controlled live SAM request
│   ├── .env.example
│   └── requirements.txt
├── src/
│   ├── components/workspace/      # viewer, prompts, overlay, results
│   ├── hooks/useAnnotation.ts     # annotation state
│   ├── pages/                     # Overview, Workspace, Methodology, Evaluation, About
│   ├── services/samApi.ts         # frontend API client
│   └── types/
├── public/
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 20+ and npm
- Python 3.13 (tested with the Anaconda `base` environment)
- A Meta API key with access to SAM 3.1

### 1. Backend

From the repository root:

```powershell
cd backend
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `backend/.env` and set your key:

```dotenv
MODEL_API_KEY=your_meta_api_key_here
```

Then start the API:

```powershell
python -m uvicorn app.main:app --reload --port 8000
```

Health check: `http://localhost:8000/health`

Interactive docs: `http://localhost:8000/docs`

### 2. Frontend

From the repository root:

```powershell
npm.cmd install
npm.cmd run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`. To point the frontend at a
different backend, create a `.env.local` file:

```dotenv
VITE_BACKEND_URL=http://localhost:8000
```

## Environment Variables

| Variable | Where | Default | Purpose |
| --- | --- | --- | --- |
| `MODEL_API_KEY` | backend only | none | Meta API key. Required for live inference. |
| `API_BASE_URL` | backend | `https://api.meta.ai/v1` | Meta API base URL. |
| `CORS_ORIGINS` | backend | `http://localhost:5173,http://127.0.0.1:5173` | Comma-separated allowed frontend origins. |
| `REQUEST_TIMEOUT_SECONDS` | backend | `60` | Timeout for one SAM request. |
| `MAX_UPLOAD_BYTES` | backend | `10485760` (10 MiB) | Maximum decoded image size. |
| `MAX_IMAGE_PIXELS` | backend | `16000000` | Maximum image width × height. |
| `VITE_BACKEND_URL` | frontend | `http://localhost:8000` | Backend base URL. |

Use `backend/.env.example` as the template. Never commit `backend/.env`.

## API Contract

### `POST /api/segment`

Request body:

```json
{
  "image_base64": "<raw base64 or data URL>",
  "text_prompt": "brain tumor",
  "positive_points": [{ "x": 0.48, "y": 0.52 }],
  "negative_points": [{ "x": 0.2, "y": 0.2 }],
  "bounding_box": { "x": 0.25, "y": 0.25, "width": 0.4, "height": 0.4 }
}
```

Prompt coordinates are normalized to `0..1` and converted to pixel coordinates on the
**backend** using the image dimensions. All prompt fields are optional, but at least one text or
object prompt is required. If an object prompt is present, it takes precedence and the text prompt
is ignored, matching the SAM guidance not to combine text and object prompts.

Success response:

```json
{
  "mask_data_url": "data:image/png;base64,...",
  "pixel_area": 1423,
  "processing_time_ms": 1840,
  "confidence": 0.93,
  "region_label": "0",
  "status": "success",
  "message": "Segmentation generated successfully."
}
```

Empty-model response (`HTTP 200` with no mask):

```json
{
  "mask_data_url": null,
  "pixel_area": 0,
  "processing_time_ms": 1200,
  "confidence": null,
  "region_label": null,
  "status": "empty-mask",
  "message": "Meta SAM returned no mask for this prompt."
}
```

Errors return a JSON `detail` string with an appropriate status code. Invalid images and prompts
return `400`; upstream credential/rate-limit/service failures are mapped to safe messages without
exposing the API key.

### `GET /health`

```json
{ "status": "ok" }
```

## Verification

Run these from the repository root:

```powershell
cd backend
python -m pytest -q
cd ..
npm.cmd run build
npm.cmd run lint
```

On Windows PowerShell, use `npm.cmd` if script execution is disabled for `npm.ps1`.

The test suite covers API validation, prompt construction, the official parser mask path, mask
resizing, and mask payload generation. It does **not** make paid model calls.

### Controlled live SAM check

This makes a real, potentially billable API call and requires a configured key:

```powershell
cd backend
python test_single_sam_slice.py ..\path\to\deidentified-slice.png --prompt "brain lesion"
```

The script prints status, pixel area, confidence, timing, and whether a mask was returned. Do not
run it repeatedly without a reason.

## Security and Privacy

- Keep `MODEL_API_KEY` in `backend/.env` only; it is ignored by Git.
- If a key is ever exposed in logs, screenshots, editor history, or a commit, rotate it immediately.
- Use only de-identified research images. Do not upload identifiable patient data.
- CORS is restricted by `CORS_ORIGINS`; set it to your deployed frontend origin in production.
- Upload size and pixel limits are enforced before inference.

## Limitations and Next Steps

- Confirm a successful real SAM mask on a suitable de-identified MRI slice and prompt.
- Evaluate segmentation quality against a labelled dataset; do not infer clinical performance from
  the current prototype.
- Add DICOM/TIFF parsing and multi-slice volume navigation.
- Replace demo research metrics with measured results and document failure modes.
- Add authentication, rate limiting, audit logging, and deployment hardening before any shared use.

## Assets and Attribution

- Meta SAM 3.1 is provided by Meta. This project uses the `meta-sam-parser` Python package for
  response decoding. Follow Meta's API terms and model-use policies.
- No licensed MRI dataset is bundled with this repository. The local `BrainMRI-*.png` files are
  development inputs and are intentionally not part of the documented dataset; confirm their
  provenance and rights before committing or redistributing them.
- UI artwork in `src/assets/` is project-local; confirm rights before public distribution.
- Add a project license before publishing. No license file is currently included.
