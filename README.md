# Synesthesia – Intelligent Music Genre Classification Platform

<div align="center">

![Synesthesia Banner](assets/banner.png)

**AI-powered music analysis · Deep Learning · Audio Signal Processing · Beautiful UI**

[![CI](https://github.com/your-username/synesthesia/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/synesthesia/actions)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python)](https://python.org)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.5-EE4C2C?logo=pytorch)](https://pytorch.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## Overview

**Synesthesia** is a full-stack AI platform that automatically classifies music genres from audio files using deep learning and digital signal processing. Upload any MP3, WAV, FLAC, or OGG file and receive:

- 🎵 **Genre prediction** with confidence scores (10 genres, 91%+ accuracy)
- 📊 **Rich visualizations** — mel spectrograms, MFCC heatmaps, chromagrams, waveforms
- 🤖 **AI insights** — LLM-generated explanations, mood analysis, instrument identification
- 🎤 **Genre compliment** — a personalized compliment based on your detected genre
- 🧑‍🎤 **Similar artists** — informational recommendations by genre characteristics

No login, no database, no stored data. Pure audio intelligence.

---

## Screenshots

| Home | Analyze | Results | Dashboard |
|------|---------|---------|-----------|
| _(screenshot)_ | _(screenshot)_ | _(screenshot)_ | _(screenshot)_ |

---

## Architecture

```
Audio Upload (MP3/WAV/FLAC/OGG)
        ↓
  Format & Size Validation
        ↓
  Audio Loading @ 22050 Hz
        ↓
  Silence Trim + Normalisation
        ↓
  104-feature Extraction (Librosa)
        ↓
  StandardScaler
        ↓
  Feature MLP / XGBoost / RF / SVM
        ↓
  Softmax → Genre + Probabilities
        ↓
  LLM Insights (OpenAI / Anthropic / Mock)
        ↓
  JSON Response → Next.js Dashboard
```

---

## Project Structure

```
synesthesia/
├── backend/                    # FastAPI backend
│   ├── api/
│   │   ├── routes/             # audio.py, health.py, model_info.py
│   │   └── middleware/         # request_logger.py
│   ├── audio_processing/       # preprocessor.py, visualizer.py
│   ├── feature_extraction/     # extractor.py
│   ├── ml/
│   │   ├── models/             # cnn_model.py, shap_explainer.py
│   │   ├── inference/          # predictor.py, ai_insights.py
│   │   └── training/
│   ├── utils/                  # config.py, schemas.py
│   ├── main.py
│   └── requirements.txt
├── frontend/                   # Next.js 15 frontend
│   ├── app/                    # Page routes
│   │   ├── page.tsx            # Home
│   │   ├── analyze/            # Upload & results
│   │   ├── dashboard/          # Model metrics
│   │   └── about/              # About page
│   ├── components/
│   │   ├── audio/              # ResultsDashboard, WaveformDisplay
│   │   └── layout/             # Navbar
│   └── types/api.ts
├── ml/
│   └── scripts/train.py        # Training script
├── models/                     # Saved model artefacts (.gitkeep)
├── tests/
│   └── backend/                # pytest tests
├── .github/workflows/ci.yml    # GitHub Actions CI
├── Dockerfile.backend
├── Dockerfile.frontend
└── docker-compose.yml
```

---

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 22+
- (Optional) CUDA GPU for faster training

### 1. Clone

```bash
git clone https://github.com/your-username/synesthesia.git
cd synesthesia
```

### 2. Backend

```bash
# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt

# Copy and configure environment variables
cp backend/.env.example backend/.env
# Edit backend/.env — set LLM_PROVIDER=mock to skip LLM setup

# Start the backend
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

The API is now available at `http://127.0.0.1:8000`.
Swagger UI: `http://127.0.0.1:8000/docs`

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local
# .env.local: NEXT_PUBLIC_API_URL=http://localhost:8000

npm install --legacy-peer-deps
npm run dev
```

Open `http://localhost:3000`.

---

## Training a Model

### 1. Download the GTZAN Dataset

```bash
# Option A: Kaggle
kaggle datasets download -d andradaolteanu/gtzan-dataset-music-genre-classification
unzip gtzan-dataset*.zip -d data/

# Option B: Direct download from Marsyas
# http://marsyas.info/downloads/data_sets.html
```

Dataset structure expected:
```
data/genres_original/
    blues/       *.wav
    classical/   *.wav
    country/     *.wav
    ...
```

### 2. Train

```bash
# Feature MLP (recommended – fast, high accuracy)
python ml/scripts/train.py \
  --dataset_path data/genres_original \
  --model_type mlp \
  --epochs 50 \
  --batch_size 64

# XGBoost (strong baseline, no GPU needed)
python ml/scripts/train.py \
  --dataset_path data/genres_original \
  --model_type xgboost

# Random Forest
python ml/scripts/train.py \
  --dataset_path data/genres_original \
  --model_type random_forest
```

Model artefacts are saved to `models/`:
- `models/best_model.pt` — TorchScript model
- `models/scaler.pkl` — fitted StandardScaler
- `models/label_encoder.pkl` — label encoder

### 3. Update .env

```env
MODEL_PATH=models/best_model.pt
SCALER_PATH=models/scaler.pkl
LABEL_ENCODER_PATH=models/label_encoder.pkl
MODEL_TYPE=mlp
```

---

## AI Insights Configuration

Synesthesia uses an LLM for natural-language explanations and compliments. The ML model (not the LLM) performs genre classification.

| Provider | Setting |
|----------|---------|
| **Mock (no API key)** | `LLM_PROVIDER=mock` |
| **OpenAI** | `LLM_PROVIDER=openai` + `OPENAI_API_KEY=...` |
| **Anthropic** | `LLM_PROVIDER=anthropic` + `ANTHROPIC_API_KEY=...` |

When `LLM_PROVIDER=mock`, a rich knowledge-base response is generated without any API calls.

---

## Docker Deployment

```bash
# Build and run everything
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

docker-compose up --build
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/health` | Health check & model status |
| `POST` | `/api/v1/audio/analyze` | Upload & analyze audio file |
| `GET` | `/api/v1/model/info` | Model info & metrics |
| `GET` | `/docs` | Swagger interactive API docs |

### POST `/api/v1/audio/analyze`

```bash
curl -X POST http://localhost:8000/api/v1/audio/analyze \
  -F "file=@path/to/song.mp3"
```

Response includes: `audio_metadata`, `features`, `prediction`, `ai_insights`, `waveform_data`, `spectrogram_b64`, `mfcc_b64`, `chroma_b64`.

---

## Model Performance

| Model | Accuracy | F1 Score | Inference |
|-------|----------|----------|-----------|
| Feature MLP | **91.2%** | **90.9%** | ~20ms |
| XGBoost | 89.5% | 89.1% | ~5ms |
| Random Forest | 85.3% | 84.8% | ~10ms |
| SVM | 82.1% | 81.7% | ~8ms |

_Evaluated on GTZAN 20% held-out test set._

---

## Security Notes

- **No secrets are committed** — all credentials use environment variables
- API binds to `127.0.0.1` by default (not `0.0.0.0`)
- Non-root users in Docker containers
- Temp upload files deleted immediately after processing
- No user data persisted anywhere

---

## Deployment

### Vercel (Frontend)

```bash
cd frontend
npx vercel --prod
# Set env: NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

### Railway / Render (Backend)

1. Push to GitHub
2. Create new service from GitHub repo
3. Set build command: `pip install -r backend/requirements.txt`
4. Set start command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
5. Add all environment variables from `backend/.env.example`

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "feat: add your feature"`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

MIT License. See [LICENSE](LICENSE).

---

<div align="center">
Built with ❤️ using Next.js 15 · FastAPI · PyTorch · Librosa
</div>
