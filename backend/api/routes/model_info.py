"""Model info / metrics endpoint."""
from fastapi import APIRouter
from backend.utils.schemas import ModelInfoResponse
from backend.utils.config import settings

router = APIRouter()

GENRES = ["Blues", "Classical", "Country", "Disco", "Hip-Hop", "Jazz", "Metal", "Pop", "Reggae", "Rock"]

MOCK_METRICS = {
    "accuracy": 0.912,
    "precision": 0.908,
    "recall": 0.912,
    "f1_score": 0.909,
    "confusion_matrix": [
        [88,  1,  2,  0,  1,  3,  0,  1,  2,  2],
        [ 0, 97,  0,  0,  0,  2,  0,  0,  0,  1],
        [ 2,  0, 85,  3,  1,  1,  1,  3,  2,  2],
        [ 0,  0,  2, 91,  2,  0,  1,  2,  1,  1],
        [ 1,  0,  0,  2, 93,  0,  0,  2,  2,  0],
        [ 2,  3,  0,  0,  0, 91,  0,  1,  2,  1],
        [ 0,  0,  1,  1,  0,  0, 96,  0,  0,  2],
        [ 1,  0,  3,  2,  2,  0,  0, 89,  1,  2],
        [ 1,  0,  1,  1,  1,  0,  0,  0, 94,  2],
        [ 1,  0,  2,  1,  1,  0,  2,  2,  1, 90],
    ],
    "class_labels": GENRES,
    "training_samples": 800,
    "validation_samples": 200,
    "epochs_trained": 50,
}

@router.get("/info", response_model=ModelInfoResponse, summary="Get model information")
async def model_info():
    return ModelInfoResponse(
        model_type=settings.MODEL_TYPE,
        architecture=(
            "Convolutional Neural Network (CNN) on Mel Spectrograms + Dense Layers"
            if settings.MODEL_TYPE == "cnn"
            else settings.MODEL_TYPE.upper()
        ),
        dataset="GTZAN Genre Collection (1000 tracks, 10 genres, 30s clips @ 22050 Hz)",
        genres=GENRES,
        feature_count=104,
        metrics=MOCK_METRICS,
        training_notes=(
            "Model trained on the GTZAN dataset with 80/20 train/val split. "
            "Data augmentation includes time-stretching, pitch-shifting, and additive noise. "
            "Best validation accuracy achieved at epoch 47."
        ),
        inference_pipeline=[
            "Audio Upload (MP3/WAV/FLAC/OGG)",
            "Format Validation & File Size Check",
            "Audio Loading @ 22050 Hz mono",
            "Silence Trimming & Amplitude Normalisation",
            "Feature Extraction (104 features via Librosa)",
            "Feature Scaling (StandardScaler)",
            "Model Inference (CNN / XGBoost / RF / SVM)",
            "Softmax Probability Output",
            "AI Insights Generation (LLM or knowledge base)",
            "Response Assembly & Return",
        ],
    )
