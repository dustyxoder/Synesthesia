"""Generate visualisation images (base64 PNG) for the frontend."""
from __future__ import annotations

import base64
import io
import logging

import librosa
import librosa.display
import matplotlib
import matplotlib.pyplot as plt
import numpy as np

matplotlib.use("Agg")  # non-interactive backend

logger = logging.getLogger(__name__)

_FIG_SIZE = (8, 3)
_DPI = 100


def _fig_to_b64(fig: plt.Figure) -> str:
    buf = io.BytesIO()
    fig.savefig(buf, format="png", bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close(fig)
    buf.seek(0)
    return base64.b64encode(buf.read()).decode("utf-8")


def mel_spectrogram_b64(y: np.ndarray, sr: int) -> str:
    S = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=128, fmax=8000)
    S_db = librosa.power_to_db(S, ref=np.max)

    fig, ax = plt.subplots(figsize=_FIG_SIZE, dpi=_DPI)
    fig.patch.set_facecolor("#1a1a2e")
    ax.set_facecolor("#1a1a2e")
    img = librosa.display.specshow(S_db, x_axis="time", y_axis="mel", sr=sr, fmax=8000, ax=ax, cmap="magma")
    ax.set_title("Mel Spectrogram", color="white", fontsize=10)
    ax.tick_params(colors="white")
    for spine in ax.spines.values():
        spine.set_edgecolor("#444")
    plt.colorbar(img, ax=ax, format="%+2.0f dB").ax.yaxis.set_tick_params(color="white", labelcolor="white")
    return _fig_to_b64(fig)


def mfcc_heatmap_b64(y: np.ndarray, sr: int) -> str:
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=20)

    fig, ax = plt.subplots(figsize=_FIG_SIZE, dpi=_DPI)
    fig.patch.set_facecolor("#1a1a2e")
    ax.set_facecolor("#1a1a2e")
    img = librosa.display.specshow(mfccs, x_axis="time", ax=ax, cmap="coolwarm")
    ax.set_title("MFCC Heatmap", color="white", fontsize=10)
    ax.set_ylabel("MFCC Coefficient", color="white")
    ax.tick_params(colors="white")
    for spine in ax.spines.values():
        spine.set_edgecolor("#444")
    plt.colorbar(img, ax=ax).ax.yaxis.set_tick_params(color="white", labelcolor="white")
    return _fig_to_b64(fig)


def chroma_feature_b64(y: np.ndarray, sr: int) -> str:
    chroma = librosa.feature.chroma_cqt(y=y, sr=sr)

    fig, ax = plt.subplots(figsize=_FIG_SIZE, dpi=_DPI)
    fig.patch.set_facecolor("#1a1a2e")
    ax.set_facecolor("#1a1a2e")
    img = librosa.display.specshow(chroma, y_axis="chroma", x_axis="time", ax=ax, cmap="viridis")
    ax.set_title("Chromagram", color="white", fontsize=10)
    ax.tick_params(colors="white")
    for spine in ax.spines.values():
        spine.set_edgecolor("#444")
    plt.colorbar(img, ax=ax).ax.yaxis.set_tick_params(color="white", labelcolor="white")
    return _fig_to_b64(fig)
