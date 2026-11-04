from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from app.schemas.segmentation import SegmentationError, SegmentationRequest, SegmentationResult
from app.services.image_service import validate_image
from app.services.sam_service import SAMServiceError, generate_mask

router = APIRouter()


@router.post('/segment', response_model=SegmentationResult)
async def segment(request: SegmentationRequest) -> SegmentationResult:
    try:
        validate_image(request.image_base64)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover - defensive guard
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f'Invalid image payload: {exc}') from exc

    try:
        result = generate_mask(
            request.image_base64,
            text_prompt=request.text_prompt,
            positive_points=[point.model_dump() for point in request.positive_points],
            negative_points=[point.model_dump() for point in request.negative_points],
            bounding_box=request.bounding_box.model_dump() if request.bounding_box else None,
        )
    except SAMServiceError as exc:
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc

    return SegmentationResult(**result)
