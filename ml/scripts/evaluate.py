"""Model evaluation script – generate metrics on a held-out test set."""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import joblib
import numpy as np
from sklearn.metrics import (
    accuracy_score, classification_report,
    confusion_matrix, f1_score, precision_score, recall_score,
)

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from backend.feature_extraction.extractor import build_feature_vector, extract_features
from backend.audio_processing.preprocessor import load_audio, preprocess_audio

GENRES = ["blues", "classical", "country", "disco", "hiphop", "jazz", "metal", "pop", "reggae", "rock"]


def main():
    parser = argparse.ArgumentParser(description="Evaluate trained model on test data")
    parser.add_argument("--dataset_path", type=Path, required=True)
    parser.add_argument("--model_path", type=Path, default=Path("models/best_model.pt"))
    parser.add_argument("--scaler_path", type=Path, default=Path("models/scaler.pkl"))
    parser.add_argument("--output", type=Path, default=Path("models/eval_results.json"))
    args = parser.parse_args()

    print("Loading artefacts …")
    model = joblib.load(args.model_path)
    scaler = joblib.load(args.scaler_path)

    X, y_true = [], []
    for genre_dir in sorted(args.dataset_path.iterdir()):
        if not genre_dir.is_dir() or genre_dir.name.lower() not in GENRES:
            continue
        for audio_file in genre_dir.glob("*.wav"):
            try:
                aud, sr = load_audio(audio_file)
                aud = preprocess_audio(aud, sr)
                feats = extract_features(aud, sr)
                fv = build_feature_vector(feats)
                X.append(fv)
                y_true.append(genre_dir.name.lower())
            except Exception as e:
                print(f"  Skip {audio_file.name}: {e}")

    X_arr = scaler.transform(np.array(X, dtype=np.float32))
    y_pred = model.predict(X_arr)

    acc = accuracy_score(y_true, y_pred)
    prec = precision_score(y_true, y_pred, average="weighted")
    rec = recall_score(y_true, y_pred, average="weighted")
    f1 = f1_score(y_true, y_pred, average="weighted")
    cm = confusion_matrix(y_true, y_pred, labels=GENRES).tolist()

    results = {
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "confusion_matrix": cm,
        "class_labels": GENRES,
        "classification_report": classification_report(y_true, y_pred, target_names=GENRES),
    }

    args.output.parent.mkdir(exist_ok=True)
    with open(args.output, "w") as f:
        json.dump(results, f, indent=2)

    print(f"\nAccuracy : {acc:.4f}")
    print(f"Precision: {prec:.4f}")
    print(f"Recall   : {rec:.4f}")
    print(f"F1 Score : {f1:.4f}")
    print(f"\nSaved to: {args.output}")


if __name__ == "__main__":
    main()
