"""
SHAP-based feature importance explainer for the trained model.
"""
from __future__ import annotations

import logging
from pathlib import Path

import joblib
import numpy as np
import shap

logger = logging.getLogger(__name__)


class SHAPExplainer:
    def __init__(self):
        self._explainer = None
        self._feature_names: list[str] = self._build_feature_names()

    @staticmethod
    def _build_feature_names() -> list[str]:
        names = [
            "tempo", "zcr_mean", "zcr_std", "rms_mean", "rms_std",
            "centroid_mean", "centroid_std", "rolloff_mean", "rolloff_std",
            "bandwidth_mean", "bandwidth_std", "harmonic_mean", "percussive_mean",
        ]
        names += [f"mfcc_{i}_mean" for i in range(20)]
        names += [f"mfcc_{i}_std" for i in range(20)]
        names += [f"chroma_{i}_mean" for i in range(12)]
        names += [f"chroma_{i}_std" for i in range(12)]
        names += [f"contrast_{i}_mean" for i in range(7)]
        names += [f"contrast_{i}_std" for i in range(7)]
        names += [f"tonnetz_{i}_mean" for i in range(6)]
        names += [f"tonnetz_{i}_std" for i in range(6)]
        return names

    def load(self, model_path: Path, background_data: np.ndarray | None = None):
        model = joblib.load(model_path)
        if background_data is not None:
            self._explainer = shap.TreeExplainer(model) if hasattr(model, "predict_proba") else shap.KernelExplainer(model.predict_proba, background_data[:50])
        else:
            self._explainer = shap.TreeExplainer(model)

    def explain(self, feature_vector: np.ndarray) -> dict:
        """Return top-10 most influential features for the prediction."""
        if self._explainer is None:
            return {"features": [], "values": []}
        shap_vals = self._explainer.shap_values(feature_vector.reshape(1, -1))
        # For multi-class, sum absolute SHAP values across classes
        if isinstance(shap_vals, list):
            importance = np.sum(np.abs(np.array(shap_vals)), axis=0).flatten()
        else:
            importance = np.abs(shap_vals).flatten()
        top_idx = np.argsort(importance)[::-1][:10]
        return {
            "features": [self._feature_names[i] for i in top_idx],
            "values": [round(float(importance[i]), 4) for i in top_idx],
        }
