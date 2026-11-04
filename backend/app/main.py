from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.routes.health import router as health_router
from app.routes.segmentation import router as segmentation_router

settings = get_settings()

app = FastAPI(
    title='NeuroSegment AI API',
    description='Backend service for prompt-guided MRI segmentation with Meta SAM 3.1.',
    version='0.1.0',
)


@app.exception_handler(RequestValidationError)
async def request_validation_exception_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    sanitized = []
    for error in exc.errors():
        cleaned = {key: value for key, value in error.items() if key != 'ctx'}
        if 'ctx' in error and isinstance(error['ctx'], dict):
            cleaned['ctx'] = {
                key: str(value) if not isinstance(value, (dict, list, str, int, float, bool)) else value
                for key, value in error['ctx'].items()
            }
        sanitized.append(cleaned)
    return JSONResponse(status_code=400, content={'detail': sanitized})


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(health_router, tags=['health'])
app.include_router(segmentation_router, prefix='/api', tags=['segmentation'])


@app.get('/')
async def root() -> dict[str, str]:
    return {'message': 'NeuroSegment API is running.'}
