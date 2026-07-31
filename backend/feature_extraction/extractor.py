"""Extract audio features using Librosa."""
from __future__ import annotations

import logging
from typing import Any

import librosa
import numpy as np

logger = logging.getLogger(__name__)

N_MFCC = 20
N_CHROMA = 12
N_FFT = 2048
HOP_LENGTH = 512


def extract_features(y: np.ndarray, sr: int) -> dict[str, Any]:
    """
    Extract all audio features from a pre-processed audio array.
    Returns a flat dict that matches the ExtractedFeatures schema.
    """
    logger.debug("Extracting features …")

    # ---- Time-domain ---------------------------------------------------
    zcr = librosa.feature.zero_crossing_rate(y, hop_length=HOP_LENGTH)
    rms = librosa.feature.rms(y=y, hop_length=HOP_LENGTH)

    # ---- Frequency-domain ----------------------------------------------
    stft = np.abs(librosa.stft(y, n_fft=N_FFT, hop_length=HOP_LENGTH))
    centroid = librosa.feature.spectral_centroid(S=stft, sr=sr)
    rolloff = librosa.feature.spectral_rolloff(S=stft, sr=sr)
    bandwidth = librosa.feature.spectral_bandwidth(S=stft, sr=sr)
    contrast = librosa.feature.spectral_contrast(S=stft, sr=sr)

    # ---- MFCCs ---------------------------------------------------------
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=N_MFCC, n_fft=N_FFT, hop_length=HOP_LENGTH)

    # ---- Chroma --------------------------------------------------------
    chroma = librosa.feature.chroma_stft(S=stft, sr=sr, n_chroma=N_CHROMA)

    # ---- Tonnetz -------------------------------------------------------
    y_harmonic = librosa.effects.harmonic(y)
    tonnetz = librosa.feature.tonnetz(y=y_harmonic, sr=sr)

    # ---- Rhythm --------------------------------------------------------
    tempo, _ = librosa.beat.beat_track(y=y, sr=sr, hop_length=HOP_LENGTH)

    # ---- Harmonic / Percussive -----------------------------------------
    y_harm, y_perc = librosa.effects.hpss(y)

    return {
        "tempo": float(tempo),
        "zero_crossing_rate_mean": float(np.mean(zcr)),
        "zero_crossing_rate_std": float(np.std(zcr)),
        "rms_energy_mean": float(np.mean(rms)),
        "rms_energy_std": float(np.std(rms)),
        "spectral_centroid_mean": float(np.mean(centroid)),
        "spectral_centroid_std": float(np.std(centroid)),
        "spectral_rolloff_mean": float(np.mean(rolloff)),
        "spectral_rolloff_std": float(np.std(rolloff)),
        "spectral_bandwidth_mean": float(np.mean(bandwidth)),
        "spectral_bandwidth_std": float(np.std(bandwidth)),
        "mfcc_means": [round(float(v), 6) for v in np.mean(mfccs, axis=1)],
        "mfcc_stds": [round(float(v), 6) for v in np.std(mfccs, axis=1)],
        "chroma_means": [round(float(v), 6) for v in np.mean(chroma, axis=1)],
        "chroma_stds": [round(float(v), 6) for v in np.std(chroma, axis=1)],
        "spectral_contrast_means": [round(float(v), 6) for v in np.mean(contrast, axis=1)],
        "spectral_contrast_stds": [round(float(v), 6) for v in np.std(contrast, axis=1)],
        "tonnetz_means": [round(float(v), 6) for v in np.mean(tonnetz, axis=1)],
        "tonnetz_stds": [round(float(v), 6) for v in np.std(tonnetz, axis=1)],
        "harmonic_mean": float(np.mean(np.abs(y_harm))),
        "percussive_mean": float(np.mean(np.abs(y_perc))),
    }


def build_feature_vector(features: dict[str, Any]) -> np.ndarray:
    """
    Flatten the feature dict into a 1-D numpy array for scikit-learn / xgboost models.
    Total: 2+2+2+2+2+2 + 20+20+12+12+7+7+6+6 = 104 features
    """
    scalars = [
        features["tempo"],
        features["zero_crossing_rate_mean"],
        features["zero_crossing_rate_std"],
        features["rms_energy_mean"],
        features["rms_energy_std"],
        features["spectral_centroid_mean"],
        features["spectral_centroid_std"],
        features["spectral_rolloff_mean"],
        features["spectral_rolloff_std"],
        features["spectral_bandwidth_mean"],
        features["spectral_bandwidth_std"],
        features["harmonic_mean"],
        features["percussive_mean"],
    ]
    vectors = (
        features["mfcc_means"]
        + features["mfcc_stds"]
        + features["chroma_means"]
        + features["chroma_stds"]
        + features["spectral_contrast_means"]
        + features["spectral_contrast_stds"]
        + features["tonnetz_means"]
        + features["tonnetz_stds"]
    )
    return np.array(scalars + vectors, dtype=np.float32)
