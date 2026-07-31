// API response types matching backend Pydantic schemas

export interface AudioMetadata {
  filename: string
  duration_seconds: number
  sample_rate: number
  channels: number
  file_size_bytes: number
  format: string
  bitrate_kbps: number | null
}

export interface ExtractedFeatures {
  tempo: number
  zero_crossing_rate_mean: number
  zero_crossing_rate_std: number
  rms_energy_mean: number
  rms_energy_std: number
  spectral_centroid_mean: number
  spectral_centroid_std: number
  spectral_rolloff_mean: number
  spectral_rolloff_std: number
  spectral_bandwidth_mean: number
  spectral_bandwidth_std: number
  mfcc_means: number[]
  mfcc_stds: number[]
  chroma_means: number[]
  chroma_stds: number[]
  spectral_contrast_means: number[]
  spectral_contrast_stds: number[]
  tonnetz_means: number[]
  tonnetz_stds: number[]
  harmonic_mean: number
  percussive_mean: number
}

export interface GenreProbability {
  genre: string
  probability: number
}

export interface PredictionResult {
  predicted_genre: string
  confidence: number
  top5: GenreProbability[]
  all_probabilities: GenreProbability[]
  inference_time_ms: number
  model_type: string
}

export interface AIInsights {
  explanation: string
  characteristics: string[]
  instruments: string[]
  rhythm_patterns: string
  mood: string
  listening_recommendations: string[]
  compliment: string
  similar_artists: string[]
}

export interface AnalysisResponse {
  audio_metadata: AudioMetadata
  features: ExtractedFeatures
  prediction: PredictionResult
  ai_insights: AIInsights
  waveform_data: number[]
  spectrogram_b64: string | null
  mfcc_b64: string | null
  chroma_b64: string | null
}

export interface ModelMetrics {
  accuracy: number
  precision: number
  recall: number
  f1_score: number
  confusion_matrix: number[][]
  class_labels: string[]
  training_samples: number
  validation_samples: number
  epochs_trained: number | null
}

export interface ModelInfoResponse {
  model_type: string
  architecture: string
  dataset: string
  genres: string[]
  feature_count: number
  metrics: ModelMetrics | null
  training_notes: string
  inference_pipeline: string[]
}
