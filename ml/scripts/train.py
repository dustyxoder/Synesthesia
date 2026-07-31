"""
Training script for Synesthesia music genre classification models.

Usage:
    python ml/scripts/train.py --dataset_path data/genres_original \
        --model_type cnn --epochs 50 --batch_size 32

Dataset structure expected:
    data/genres_original/
        blues/      (*.wav)
        classical/  (*.wav)
        ...
"""
from __future__ import annotations

import argparse
import json
import logging
import os
import random
import sys
import warnings
from pathlib import Path

import joblib
import librosa
import numpy as np
import torch
import torch.nn as nn
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
)
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.svm import SVC
from torch.utils.data import DataLoader, Dataset
from xgboost import XGBClassifier

warnings.filterwarnings("ignore")
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from backend.feature_extraction.extractor import build_feature_vector, extract_features
from backend.audio_processing.preprocessor import load_audio, preprocess_audio
from backend.ml.models.cnn_model import FeatureMLP

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger(__name__)

GENRES = ["blues", "classical", "country", "disco", "hiphop", "jazz", "metal", "pop", "reggae", "rock"]
MODELS_DIR = Path("models")
MODELS_DIR.mkdir(exist_ok=True)


# ---------------------------------------------------------------------------
# Dataset
# ---------------------------------------------------------------------------
class AudioDataset(Dataset):
    def __init__(self, features: np.ndarray, labels: np.ndarray):
        self.X = torch.tensor(features, dtype=torch.float32)
        self.y = torch.tensor(labels, dtype=torch.long)

    def __len__(self):
        return len(self.y)

    def __getitem__(self, idx):
        return self.X[idx], self.y[idx]


# ---------------------------------------------------------------------------
# Feature extraction from directory
# ---------------------------------------------------------------------------
def load_dataset(dataset_path: Path) -> tuple[np.ndarray, np.ndarray, LabelEncoder]:
    logger.info("Loading dataset from: %s", dataset_path)
    X, y_raw = [], []
    for genre_dir in sorted(dataset_path.iterdir()):
        if not genre_dir.is_dir():
            continue
        genre = genre_dir.name.lower()
        if genre not in GENRES:
            continue
        for audio_file in genre_dir.glob("*.wav"):
            try:
                aud, sr = load_audio(audio_file)
                aud = preprocess_audio(aud, sr)
                feats = extract_features(aud, sr)
                fv = build_feature_vector(feats)
                X.append(fv)
                y_raw.append(genre)
            except Exception as e:
                logger.warning("Skipping %s: %s", audio_file.name, e)

    le = LabelEncoder()
    y = le.fit_transform(y_raw)
    logger.info("Loaded %d samples across %d genres.", len(X), len(le.classes_))
    return np.array(X, dtype=np.float32), np.array(y), le


# ---------------------------------------------------------------------------
# Sklearn baseline models
# ---------------------------------------------------------------------------
def train_sklearn(X_tr, X_val, y_tr, y_val, scaler, le, model_type: str):
    logger.info("Training %s …", model_type)
    if model_type == "xgboost":
        model = XGBClassifier(
            n_estimators=500, max_depth=6, learning_rate=0.05,
            subsample=0.8, colsample_bytree=0.8, n_jobs=-1,
            eval_metric="mlogloss", verbosity=0,
        )
    elif model_type == "random_forest":
        model = RandomForestClassifier(n_estimators=500, max_depth=20, n_jobs=-1, random_state=42)
    elif model_type == "svm":
        model = SVC(kernel="rbf", probability=True, C=10, gamma="scale")
    else:
        raise ValueError(f"Unknown model type: {model_type}")

    model.fit(X_tr, y_tr)
    preds = model.predict(X_val)
    acc = accuracy_score(y_val, preds)
    f1 = f1_score(y_val, preds, average="weighted")
    logger.info("Val Accuracy: %.4f  |  F1: %.4f", acc, f1)

    save_path = MODELS_DIR / "best_model.pt"
    joblib.dump(model, save_path)
    joblib.dump(scaler, MODELS_DIR / "scaler.pkl")
    joblib.dump(le, MODELS_DIR / "label_encoder.pkl")
    logger.info("Model saved to %s", save_path)

    return acc, confusion_matrix(y_val, preds).tolist()


# ---------------------------------------------------------------------------
# MLP (PyTorch) trainer
# ---------------------------------------------------------------------------
def train_mlp(X_tr, X_val, y_tr, y_val, scaler, le, epochs: int, batch_size: int):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logger.info("Training MLP on %s …", device)

    model = FeatureMLP(input_dim=X_tr.shape[1], num_classes=len(le.classes_))
    model.to(device)

    tr_loader = DataLoader(AudioDataset(X_tr, y_tr), batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(AudioDataset(X_val, y_val), batch_size=batch_size)

    optimiser = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-4)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimiser, T_max=epochs)
    criterion = nn.CrossEntropyLoss()

    best_val_acc = 0.0
    history = {"train_loss": [], "val_loss": [], "val_acc": []}

    for epoch in range(1, epochs + 1):
        model.train()
        running_loss = 0.0
        for xb, yb in tr_loader:
            xb, yb = xb.to(device), yb.to(device)
            optimiser.zero_grad()
            loss = criterion(model(xb), yb)
            loss.backward()
            optimiser.step()
            running_loss += loss.item() * len(xb)
        scheduler.step()

        # Validation
        model.eval()
        val_loss, correct, total = 0.0, 0, 0
        with torch.no_grad():
            for xb, yb in val_loader:
                xb, yb = xb.to(device), yb.to(device)
                out = model(xb)
                val_loss += criterion(out, yb).item() * len(xb)
                correct += (out.argmax(1) == yb).sum().item()
                total += len(yb)

        train_loss = running_loss / len(tr_loader.dataset)
        val_loss /= total
        val_acc = correct / total
        history["train_loss"].append(round(train_loss, 4))
        history["val_loss"].append(round(val_loss, 4))
        history["val_acc"].append(round(val_acc, 4))

        if epoch % 10 == 0:
            logger.info("Epoch %3d/%d | train_loss=%.4f | val_loss=%.4f | val_acc=%.4f",
                        epoch, epochs, train_loss, val_loss, val_acc)

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            # Save as TorchScript for production inference
            scripted = torch.jit.script(model.cpu())
            scripted.save(str(MODELS_DIR / "best_model.pt"))
            model.to(device)

    joblib.dump(scaler, MODELS_DIR / "scaler.pkl")
    joblib.dump(le, MODELS_DIR / "label_encoder.pkl")

    # Save history
    with open(MODELS_DIR / "training_history.json", "w") as f:
        json.dump(history, f, indent=2)

    logger.info("Best val accuracy: %.4f", best_val_acc)
    return best_val_acc


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(description="Train Synesthesia genre classifier")
    parser.add_argument("--dataset_path", type=Path, required=True)
    parser.add_argument("--model_type", choices=["cnn", "xgboost", "random_forest", "svm", "mlp"],
                        default="mlp")
    parser.add_argument("--epochs", type=int, default=50)
    parser.add_argument("--batch_size", type=int, default=64)
    parser.add_argument("--test_size", type=float, default=0.2)
    parser.add_argument("--random_seed", type=int, default=42)
    args = parser.parse_args()

    random.seed(args.random_seed)
    np.random.seed(args.random_seed)
    torch.manual_seed(args.random_seed)

    X, y, le = load_dataset(args.dataset_path)
    X_tr, X_val, y_tr, y_val = train_test_split(
        X, y, test_size=args.test_size, stratify=y, random_state=args.random_seed
    )

    scaler = StandardScaler()
    X_tr = scaler.fit_transform(X_tr)
    X_val = scaler.transform(X_val)

    if args.model_type in ("xgboost", "random_forest", "svm"):
        train_sklearn(X_tr, X_val, y_tr, y_val, scaler, le, args.model_type)
    else:  # mlp or cnn (feature-based MLP)
        train_mlp(X_tr, X_val, y_tr, y_val, scaler, le, args.epochs, args.batch_size)

    logger.info("Training complete. Artefacts saved to models/")


if __name__ == "__main__":
    main()
