"""Feature extraction unit tests."""
import numpy as np
import pytest
from backend.feature_extraction.extractor import build_feature_vector, extract_features
from backend.audio_processing.preprocessor import preprocess_audio


def make_sine(freq: float = 440, sr: int = 22050, duration: float = 3.0) -> np.ndarray:
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    return 0.5 * np.sin(2 * np.pi * freq * t).astype(np.float32)


def test_extract_features_shape():
    y = make_sine()
    sr = 22050
    feats = extract_features(y, sr)
    assert "tempo" in feats
    assert len(feats["mfcc_means"]) == 20
    assert len(feats["chroma_means"]) == 12


def test_feature_vector_length():
    y = make_sine()
    sr = 22050
    feats = extract_features(y, sr)
    fv = build_feature_vector(feats)
    # 13 scalars + 20+20+12+12+7+7+6+6 = 103 — verify non-empty
    assert fv.ndim == 1
    assert len(fv) > 100


def test_preprocess_normalises():
    y = make_sine() * 3.0  # over-amplitude
    y_proc = preprocess_audio(y, 22050)
    assert np.max(np.abs(y_proc)) <= 1.01  # small epsilon allowed
