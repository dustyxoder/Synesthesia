# Deployment Guide

## Frontend – Vercel

1. Push your repository to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Set framework: **Next.js**
4. Set root directory: `frontend`
5. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   ```
6. Deploy

## Backend – Railway

1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select your repository
3. Configure:
   - **Build command**: `pip install -r backend/requirements.txt`
   - **Start command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
   - **Root directory**: `/` (keep default)
4. Add all environment variables from `backend/.env.example`
5. Upload model files via Railway volumes or use a model registry

> ⚠️ **Security Note**: On Railway production, set `HOST=0.0.0.0` since Railway handles the external binding securely through its own load balancer.

## Backend – Render

1. New Web Service → Connect GitHub repo
2. Build command: `pip install -r backend/requirements.txt`
3. Start command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables

## Docker Compose (Self-Hosted)

```bash
# Copy env files
cp backend/.env.example backend/.env
# Edit backend/.env with your values

docker-compose up --build -d
```

## Hugging Face Spaces (ML Demo)

Create a `Gradio` or `Streamlit` app in `huggingface_spaces/`:

```python
import gradio as gr
# ... wrap the inference pipeline
```

See the [Hugging Face Spaces documentation](https://huggingface.co/docs/hub/spaces).

## Model Files

Model files (`*.pt`, `*.pkl`) are excluded from git (see `.gitignore`).
For production deployment, use one of:
- **Railway/Render volumes** — mount a persistent disk
- **Hugging Face Hub** — store and load model files via `huggingface_hub`
- **Object storage** (S3, GCS, Azure Blob) — download on startup

Example for Hugging Face Hub:
```python
from huggingface_hub import hf_hub_download
model_path = hf_hub_download(repo_id="your-username/synesthesia", filename="best_model.pt")
```

## Environment Variables Reference

See `backend/.env.example` for the complete list.

| Variable | Required | Description |
|----------|----------|-------------|
| `MODEL_PATH` | Yes | Path to trained model file |
| `LLM_PROVIDER` | No | `mock`/`openai`/`anthropic` |
| `OPENAI_API_KEY` | If using OpenAI | Your OpenAI API key |
| `ANTHROPIC_API_KEY` | If using Anthropic | Your Anthropic API key |
| `FRONTEND_URL` | Yes | For CORS allowlist |
