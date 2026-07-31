"""Health check endpoints."""
from fastapi import APIRouter, Request
import psutil

router = APIRouter()


@router.get("/health", summary="Health check")
async def health(request: Request):
    predictor = getattr(request.app.state, "predictor", None)
    model_loaded = predictor is not None and predictor._loaded
    return {
        "status": "ok",
        "model_loaded": model_loaded,
        "model_type": predictor._model_type if predictor else "unknown",
        "cpu_percent": psutil.cpu_percent(),
        "memory_percent": psutil.virtual_memory().percent,
    }
