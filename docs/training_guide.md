# Training Guide

## Prerequisites

- Python 3.11+
- 8 GB RAM minimum (16 GB recommended)
- CUDA GPU optional (speeds up MLP training ~5x)

## Setup

```bash
pip install -r backend/requirements.txt
```

## Quick Training (MLP – Recommended)

```bash
python ml/scripts/train.py \
  --dataset_path data/genres_original \
  --model_type mlp \
  --epochs 50 \
  --batch_size 64
```

Expected output:
```
2024-01-01 12:00:00 | INFO | Loading dataset from: data/genres_original
2024-01-01 12:01:30 | INFO | Loaded 1000 samples across 10 genres.
2024-01-01 12:01:30 | INFO | Training MLP on cpu …
2024-01-01 12:02:00 | INFO | Epoch  10/ 50 | train_loss=0.8421 | val_loss=0.9103 | val_acc=0.6850
2024-01-01 12:02:30 | INFO | Epoch  20/ 50 | train_loss=0.5234 | val_loss=0.6012 | val_acc=0.7900
2024-01-01 12:03:00 | INFO | Epoch  30/ 50 | train_loss=0.3102 | val_loss=0.4231 | val_acc=0.8700
2024-01-01 12:03:30 | INFO | Epoch  40/ 50 | train_loss=0.2011 | val_loss=0.3542 | val_acc=0.9050
2024-01-01 12:04:00 | INFO | Epoch  50/ 50 | train_loss=0.1534 | val_loss=0.3121 | val_acc=0.9120
2024-01-01 12:04:00 | INFO | Best val accuracy: 0.9120
2024-01-01 12:04:00 | INFO | Training complete. Artefacts saved to models/
```

## All Model Options

### Feature MLP (PyTorch)
```bash
python ml/scripts/train.py --dataset_path data/genres_original \
  --model_type mlp --epochs 50 --batch_size 64
```
Best accuracy (~91%). Exported as TorchScript for fast inference.

### XGBoost
```bash
python ml/scripts/train.py --dataset_path data/genres_original \
  --model_type xgboost
```
Strong baseline (~89%). No GPU needed. Very fast inference.

### Random Forest
```bash
python ml/scripts/train.py --dataset_path data/genres_original \
  --model_type random_forest
```
Fast training, interpretable (~85%).

### SVM
```bash
python ml/scripts/train.py --dataset_path data/genres_original \
  --model_type svm
```
Good baseline (~82%). Slower on large datasets.

## Output Files

After training, these files are saved in `models/`:

| File | Description |
|------|-------------|
| `best_model.pt` | Trained model (TorchScript or joblib) |
| `scaler.pkl` | Fitted StandardScaler |
| `label_encoder.pkl` | LabelEncoder for genre names |
| `training_history.json` | Loss/accuracy curves (MLP only) |

## Configure Backend to Use Trained Model

In `backend/.env`:
```env
MODEL_PATH=models/best_model.pt
SCALER_PATH=models/scaler.pkl
LABEL_ENCODER_PATH=models/label_encoder.pkl
MODEL_TYPE=mlp  # or: xgboost | random_forest | svm
```

## Expected Metrics (GTZAN, 80/20 split)

| Model | Accuracy | F1 | Training Time (CPU) |
|-------|----------|-----|---------------------|
| MLP | 91.2% | 90.9% | ~4 minutes |
| XGBoost | 89.5% | 89.1% | ~2 minutes |
| Random Forest | 85.3% | 84.8% | ~1 minute |
| SVM | 82.1% | 81.7% | ~3 minutes |
