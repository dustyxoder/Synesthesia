"""Pydantic schemas used across the API."""
from __future__ import annotations

from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


# ---------------------------------------------------------------------------
# Audio Metadata
# ---------------------------------------------------------------------------
class AudioMetadata(BaseModel):
    filename: str
    duration_seconds: float
    sample_rate: int
    channels: int
    file_size_bytes: int
    format: str
    bitrate_kbps: Optional[float] = None


# ---------------------------------------------------------------------------
# Feature Extraction
# ---------------------------------------------------------------------------
class ExtractedFeatures(BaseModel):
    tempo: float = Field(..., description="Estimated BPM")
    zero_crossing_rate_mean: float
    zero_crossing_rate_std: float
    rms_energy_mean: float
    rms_energy_std: float
    spectral_centroid_mean: float
    spectral_centroid_std: float
    spectral_rolloff_mean: float
    spectral_rolloff_std: float
    spectral_bandwidth_mean: float
    spectral_bandwidth_std: float
    mfcc_means: list[float] = Field(..., description="20 MFCC means")
    mfcc_stds: list[float] = Field(..., description="20 MFCC stds")
    chroma_means: list[float] = Field(..., description="12 chroma means")
    chroma_stds: list[float] = Field(..., description="12 chroma stds")
    spectral_contrast_means: list[float]
    spectral_contrast_stds: list[float]
    tonnetz_means: list[float]
    tonnetz_stds: list[float]
    harmonic_mean: float
    percussive_mean: float


# ---------------------------------------------------------------------------
# Prediction
# ---------------------------------------------------------------------------
class GenreProbability(BaseModel):
    genre: str
    probability: float


class PredictionResult(BaseModel):
    predicted_genre: str
    confidence: float
    top5: list[GenreProbability]
    all_probabilities: list[GenreProbability]
    inference_time_ms: float
    model_type: str


# ---------------------------------------------------------------------------
# AI Insights
# ---------------------------------------------------------------------------
class AIInsights(BaseModel):
    explanation: str
    characteristics: list[str]
    instruments: list[str]
    rhythm_patterns: str
    mood: str
    listening_recommendations: list[str]
    compliment: str
    similar_artists: list[str]


# ---------------------------------------------------------------------------
# Full Analysis Response
# ---------------------------------------------------------------------------
class AnalysisResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    audio_metadata: AudioMetadata
    features: ExtractedFeatures
    prediction: PredictionResult
    ai_insights: AIInsights
    waveform_data: list[float] = Field(default_factory=list, description="Down-sampled waveform for UI")
    spectrogram_b64: Optional[str] = Field(None, description="Base64-encoded mel spectrogram PNG")
    mfcc_b64: Optional[str] = Field(None, description="Base64-encoded MFCC heatmap PNG")
    chroma_b64: Optional[str] = Field(None, description="Base64-encoded chroma feature PNG")


# ---------------------------------------------------------------------------
# Model Info
# ---------------------------------------------------------------------------
class ModelMetrics(BaseModel):
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    confusion_matrix: list[list[int]]
    class_labels: list[str]
    training_samples: int
    validation_samples: int
    epochs_trained: Optional[int] = None


class ModelInfoResponse(BaseModel):
    model_type: str
    architecture: str
    dataset: str
    genres: list[str]
    feature_count: int
    metrics: Optional[ModelMetrics] = None
    training_notes: str
    inference_pipeline: list[str]
