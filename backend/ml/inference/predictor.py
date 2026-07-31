"""
ML Inference – loads the saved model and runs prediction.
Supports CNN (PyTorch), XGBoost, RandomForest, and SVM.
Falls back to a mock predictor when no model file is found.
"""
from __future__ import annotations

import logging
import time
from pathlib import Path
from typing import Optional

import joblib
import numpy as np

from backend.utils.config import settings

logger = logging.getLogger(__name__)

GENRES = [
    "blues", "classical", "country", "disco",
    "hiphop", "jazz", "metal", "pop", "reggae", "rock",
]

GENRE_DISPLAY = {
    "blues": "Blues", "classical": "Classical", "country": "Country",
    "disco": "Disco", "hiphop": "Hip-Hop", "jazz": "Jazz",
    "metal": "Metal", "pop": "Pop", "reggae": "Reggae", "rock": "Rock",
}


class ModelPredictor:
    def __init__(self):
        self._model = None
        self._scaler = None
        self._label_encoder = None
        self._model_type: str = settings.MODEL_TYPE
        self._loaded: bool = False

    def load(self) -> None:
        """Load model artefacts from disk. Falls back to mock mode if files missing."""
        model_path = settings.MODEL_PATH
        scaler_path = settings.SCALER_PATH
        label_encoder_path = settings.LABEL_ENCODER_PATH

        if not model_path.exists():
            logger.warning(
                "Model file not found at %s – using MOCK predictor. "
                "Run ml/scripts/train.py to train a model.",
                model_path,
            )
            self._loaded = False
            return

        try:
            if self._model_type == "cnn":
                self._load_cnn(model_path)
            else:
                self._model = joblib.load(model_path)

            if scaler_path.exists():
                self._scaler = joblib.load(scaler_path)
            if label_encoder_path.exists():
                self._label_encoder = joblib.load(label_encoder_path)

            self._loaded = True
            logger.info("Model loaded: type=%s path=%s", self._model_type, model_path)
        except Exception as exc:  # noqa: BLE001
            logger.error("Failed to load model: %s – falling back to mock.", exc)
            self._loaded = False

    def _load_cnn(self, path: Path) -> None:
        """Load a TorchScript or state-dict CNN."""
        import torch
        try:
            self._model = torch.jit.load(str(path), map_location="cpu")
            self._model.eval()
        except Exception:
            # Try loading as a plain state-dict is handled at training time
            raise

    def predict(self, feature_vector: np.ndarray) -> dict:
        """
        Run inference and return a dict compatible with PredictionResult schema.
        feature_vector: 1-D numpy array of shape (104,)
        """
        t0 = time.perf_counter()

        if not self._loaded:
            return self._mock_predict()

        if self._scaler is not None:
            fv = self._scaler.transform(feature_vector.reshape(1, -1))
        else:
            fv = feature_vector.reshape(1, -1)

        if self._model_type == "cnn":
            probs = self._cnn_proba(fv)
        else:
            probs = self._sklearn_proba(fv)

        elapsed_ms = (time.perf_counter() - t0) * 1000

        labels = (
            list(self._label_encoder.classes_)
            if self._label_encoder is not None
            else GENRES
        )

        genre_probs = [
            {"genre": GENRE_DISPLAY.get(g, g), "probability": round(float(p), 4)}
            for g, p in zip(labels, probs)
        ]
        genre_probs.sort(key=lambda x: x["probability"], reverse=True)
        top = genre_probs[0]

        return {
            "predicted_genre": top["genre"],
            "confidence": top["probability"],
            "top5": genre_probs[:5],
            "all_probabilities": genre_probs,
            "inference_time_ms": round(elapsed_ms, 2),
            "model_type": self._model_type,
        }

    def _cnn_proba(self, fv: np.ndarray) -> np.ndarray:
        import torch
        with torch.no_grad():
            x = torch.tensor(fv, dtype=torch.float32)
            logits = self._model(x)
            probs = torch.softmax(logits, dim=-1).numpy().flatten()
        return probs

    def _sklearn_proba(self, fv: np.ndarray) -> np.ndarray:
        return self._model.predict_proba(fv).flatten()

    @staticmethod
    def _mock_predict() -> dict:
        """Return plausible mock probabilities for demo/dev without a model."""
        rng = np.random.default_rng()
        raw = rng.dirichlet(np.ones(10) * 0.5)
        raw[rng.integers(0, 10)] += 0.3
        raw /= raw.sum()
        genre_probs = [
            {"genre": GENRE_DISPLAY[g], "probability": round(float(p), 4)}
            for g, p in zip(GENRES, raw)
        ]
        genre_probs.sort(key=lambda x: x["probability"], reverse=True)
        top = genre_probs[0]
        return {
            "predicted_genre": top["genre"],
            "confidence": top["probability"],
            "top5": genre_probs[:5],
            "all_probabilities": genre_probs,
            "inference_time_ms": round(rng.uniform(5, 40), 2),
            "model_type": "mock",
        }
