# Dataset Preparation Guide

## GTZAN Genre Collection (Primary Dataset)

### Overview

| Property | Value |
|----------|-------|
| Genres | 10 (blues, classical, country, disco, hiphop, jazz, metal, pop, reggae, rock) |
| Tracks per genre | 100 |
| Total tracks | 1,000 |
| Duration | 30 seconds each |
| Sample rate | 22050 Hz |
| Format | WAV (mono, 16-bit) |

### Download Options

#### Option A: Kaggle (Recommended)

```bash
# Requires Kaggle CLI: pip install kaggle
# Add your kaggle.json API token to ~/.kaggle/kaggle.json
kaggle datasets download -d andradaolteanu/gtzan-dataset-music-genre-classification
unzip gtzan-dataset*.zip -d data/
```

#### Option B: Direct Download

Download from the official Marsyas project:
http://marsyas.info/downloads/data_sets.html

```bash
wget http://opihi.cs.uvic.ca/sound/genres.tar.gz
tar -xzf genres.tar.gz -C data/
mv data/genres data/genres_original
```

### Expected Directory Structure

```
data/
└── genres_original/
    ├── blues/
    │   ├── blues.00000.wav
    │   ├── blues.00001.wav
    │   └── ... (100 files)
    ├── classical/
    ├── country/
    ├── disco/
    ├── hiphop/
    ├── jazz/
    ├── metal/
    ├── pop/
    ├── reggae/
    └── rock/
```

### Preprocessing Notes

The training script handles all preprocessing automatically:
1. Audio loaded at 22050 Hz mono
2. Silence trimmed from start/end (top_db=20)
3. Normalised to [-1, 1]
4. Padded/cropped to exactly 30 seconds
5. 104 features extracted per track

### Optional Datasets for Extended Training

| Dataset | Size | Genres | Notes |
|---------|------|--------|-------|
| FMA Small | 7.2 GB | 8 | Free Music Archive |
| FMA Medium | 22 GB | 16 | More variety |
| MagnaTagATune | 470 MB | Multi-label | Tag-based labels |
| OpenMIC | 6 GB | 20 | Instrument tags |

> **Note:** These datasets require custom label mapping to align with GTZAN's 10 genres.

### Data Augmentation

The training script supports these augmentations (applied during feature extraction):
- Time-stretching: ±10% rate
- Pitch-shifting: ±2 semitones
- Additive white noise: SNR 20–40 dB
- Volume scaling: 0.8–1.2x

To enable: pass `--augment` flag to `ml/scripts/train.py`
