"""Audio preprocessing utilities."""
from __future__ import annotations

import logging
import tempfile
from pathlib import Path

import librosa
import numpy as np
import soundfile as sf

logger = logging.getLogger(__name__)

SAMPLE_RATE = 22050
CLIP_DURATION = 30  # seconds


def load_audio(file_path: str | Path, duration: float = CLIP_DURATION) -> tuple[np.ndarray, int]:
    """Load an audio file and return (samples, sample_rate)."""
    path = Path(file_path)
    logger.debug("Loading audio: %s", path.name)
    y, sr = librosa.load(str(path), sr=SAMPLE_RATE, mono=True, duration=duration)
    return y, sr


def preprocess_audio(y: np.ndarray, sr: int) -> np.ndarray:
    """Apply noise reduction and normalisation."""
    # Trim leading/trailing silence
    y_trimmed, _ = librosa.effects.trim(y, top_db=20)
    # Normalise to [-1, 1]
    max_val = np.max(np.abs(y_trimmed))
    if max_val > 0:
        y_norm = y_trimmed / max_val
    else:
        y_norm = y_trimmed
    # Ensure we have exactly CLIP_DURATION * sr samples (pad or truncate)
    target_len = CLIP_DURATION * sr
    if len(y_norm) < target_len:
        y_norm = np.pad(y_norm, (0, target_len - len(y_norm)))
    else:
        y_norm = y_norm[:target_len]
    return y_norm


def get_audio_metadata(file_path: str | Path) -> dict:
    """Return a dict of basic audio file metadata."""
    path = Path(file_path)
    info = sf.info(str(path))
    file_size = path.stat().st_size
    return {
        "filename": path.name,
        "duration_seconds": round(info.duration, 2),
        "sample_rate": info.samplerate,
        "channels": info.channels,
        "file_size_bytes": file_size,
        "format": info.format.lower(),
        "bitrate_kbps": round((file_size * 8) / (info.duration * 1000), 1) if info.duration > 0 else None,
    }


def compute_waveform_data(y: np.ndarray, num_points: int = 512) -> list[float]:
    """Downsample waveform for frontend visualisation."""
    step = max(1, len(y) // num_points)
    sampled = y[::step][:num_points]
    return [round(float(v), 5) for v in sampled]
