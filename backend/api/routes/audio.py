"""Audio upload and analysis endpoint."""
from __future__ import annotations

import logging
import tempfile
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, Request, UploadFile, status

from backend.audio_processing.preprocessor import (
    compute_waveform_data,
    get_audio_metadata,
    load_audio,
    preprocess_audio,
)
from backend.audio_processing.visualizer import (
    chroma_feature_b64,
    mel_spectrogram_b64,
    mfcc_heatmap_b64,
)
from backend.feature_extraction.extractor import build_feature_vector, extract_features
from backend.ml.inference.ai_insights import AIInsightsGenerator
from backend.utils.config import settings
from backend.utils.schemas import AnalysisResponse

logger = logging.getLogger(__name__)
router = APIRouter()

_insights_gen = AIInsightsGenerator()


@router.post("/analyze", response_model=AnalysisResponse, summary="Analyze an audio file")
async def analyze_audio(request: Request, file: UploadFile = File(...)):
    # ---- Validate ----------------------------------------------------------
    ext = Path(file.filename or "").suffix.lstrip(".").lower()
    if ext not in settings.allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported format '{ext}'. Allowed: {settings.allowed_extensions}",
        )

    # Read file bytes
    raw = await file.read()
    if len(raw) > settings.max_upload_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds {settings.MAX_UPLOAD_SIZE_MB} MB limit.",
        )

    # ---- Save to temp file -------------------------------------------------
    settings.TEMP_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(
        suffix=f".{ext}", dir=settings.TEMP_UPLOAD_DIR, delete=False
    ) as tmp:
        tmp.write(raw)
        tmp_path = Path(tmp.name)

    try:
        # ---- Metadata ------------------------------------------------------
        metadata = get_audio_metadata(tmp_path)

        # ---- Load & preprocess ---------------------------------------------
        y, sr = load_audio(tmp_path)
        y_proc = preprocess_audio(y, sr)

        # ---- Feature Extraction --------------------------------------------
        feats = extract_features(y_proc, sr)
        fv = build_feature_vector(feats)

        # ---- Waveform & Visualisations -------------------------------------
        waveform_data = compute_waveform_data(y_proc)
        try:
            spec_b64 = mel_spectrogram_b64(y_proc, sr)
            mfcc_b64 = mfcc_heatmap_b64(y_proc, sr)
            chroma_b64 = chroma_feature_b64(y_proc, sr)
        except Exception as viz_err:
            logger.warning("Visualisation generation failed: %s", viz_err)
            spec_b64 = mfcc_b64 = chroma_b64 = None

        # ---- Model Inference -----------------------------------------------
        predictor = request.app.state.predictor
        pred = predictor.predict(fv)

        # ---- AI Insights ---------------------------------------------------
        insights = await _insights_gen.generate(
            genre=pred["predicted_genre"],
            confidence=pred["confidence"],
            features=feats,
        )

        return AnalysisResponse(
            audio_metadata=metadata,
            features=feats,
            prediction=pred,
            ai_insights=insights,
            waveform_data=waveform_data,
            spectrogram_b64=spec_b64,
            mfcc_b64=mfcc_b64,
            chroma_b64=chroma_b64,
        )
    finally:
        # Always clean up temp file
        try:
            tmp_path.unlink(missing_ok=True)
        except Exception:
            pass
