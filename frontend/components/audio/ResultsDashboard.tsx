'use client'
import { motion } from 'framer-motion'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from 'recharts'
import {
  Music2, BarChart3, Zap, Star, MessageSquareQuote,
  Users, RefreshCw, CheckCircle2, Activity,
} from 'lucide-react'
import type { AnalysisResponse } from '@/types/api'
import WaveformDisplay from './WaveformDisplay'

interface Props {
  result: AnalysisResponse
  onReset: () => void
}

const GENRE_COLORS: Record<string, string> = {
  Blues: '#3b82f6', Classical: '#8b5cf6', Country: '#f59e0b',
  Disco: '#ec4899', 'Hip-Hop': '#f97316', Jazz: '#6366f1',
  Metal: '#ef4444', Pop: '#10b981', Reggae: '#84cc16', Rock: '#f43f5e',
}

const fmt = (n: number, decimals = 2) => n.toFixed(decimals)
const pct = (n: number) => `${(n * 100).toFixed(1)}%`

export default function ResultsDashboard({ result, onReset }: Props) {
  const { prediction, ai_insights, features, audio_metadata, spectrogram_b64, mfcc_b64, chroma_b64, waveform_data } = result
  const genreColor = GENRE_COLORS[prediction.predicted_genre] || '#6c63ff'

  const radarData = [
    { subject: 'Energy', value: Math.min(features.rms_energy_mean * 1000, 100) },
    { subject: 'Tempo', value: Math.min((features.tempo / 200) * 100, 100) },
    { subject: 'Brightness', value: Math.min((features.spectral_centroid_mean / 8000) * 100, 100) },
    { subject: 'Complexity', value: Math.min(features.spectral_bandwidth_mean / 40, 100) },
    { subject: 'Percussive', value: Math.min(features.percussive_mean * 500, 100) },
    { subject: 'Harmonic', value: Math.min(features.harmonic_mean * 500, 100) },
  ]

  const probData = prediction.all_probabilities.map(p => ({
    genre: p.genre,
    probability: parseFloat((p.probability * 100).toFixed(1)),
    fill: GENRE_COLORS[p.genre] || '#6c63ff',
  })).sort((a, b) => b.probability - a.probability)

  return (
    <div className="space-y-6">
      {/* Top header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analysis Results</h2>
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 rounded-full glass border border-syn-border hover:border-syn-accent/40 text-sm text-syn-muted hover:text-syn-text transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Analyze Another
        </button>
      </div>

      {/* Genre Hero Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-3xl p-8 relative overflow-hidden"
        style={{ borderColor: `${genreColor}30` }}
      >
        <div className="absolute inset-0 opacity-5" style={{ background: `radial-gradient(circle at 80% 50%, ${genreColor}, transparent 60%)` }} />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center" style={{ background: `${genreColor}20`, border: `2px solid ${genreColor}40` }}>
              <Music2 className="w-12 h-12" style={{ color: genreColor }} />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-syn-muted text-sm font-medium uppercase tracking-widest mb-1">Detected Genre</p>
            <h2 className="text-5xl font-black mb-2" style={{ color: genreColor }}>
              {prediction.predicted_genre}
            </h2>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-syn-green" />
                <span className="text-syn-text font-semibold">{pct(prediction.confidence)} confidence</span>
              </div>
              <div className="flex items-center gap-1.5 text-syn-muted text-sm">
                <Zap className="w-3.5 h-3.5" />
                {prediction.inference_time_ms}ms · {prediction.model_type.toUpperCase()}
              </div>
            </div>
            {/* Confidence bar */}
            <div className="mt-3 w-full bg-syn-border rounded-full h-2 max-w-xs">
              <motion.div
                className="h-full rounded-full"
                style={{ background: genreColor }}
                initial={{ width: 0 }}
                animate={{ width: pct(prediction.confidence) }}
                transition={{ duration: 0.8, delay: 0.2 }}
              />
            </div>
          </div>
          {/* Audio info */}
          <div className="text-right hidden sm:block">
            <p className="text-xs text-syn-muted">{audio_metadata.filename}</p>
            <p className="text-syn-text font-medium">{fmt(audio_metadata.duration_seconds)}s</p>
            <p className="text-xs text-syn-muted">{audio_metadata.sample_rate} Hz · {(audio_metadata.file_size_bytes / 1024).toFixed(0)} KB</p>
          </div>
        </div>
      </motion.div>

      {/* Compliment Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-6 border border-syn-accent2/20"
      >
        <div className="flex gap-3">
          <MessageSquareQuote className="w-6 h-6 text-syn-accent2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-syn-accent2 font-semibold uppercase tracking-widest mb-2">Your Genre Compliment</p>
            <p className="text-lg text-syn-text font-medium italic">"{ai_insights.compliment}"</p>
          </div>
        </div>
      </motion.div>

      {/* 2-column grid */}
      <div className="grid sm:grid-cols-2 gap-6">
        {/* Top 5 Genres Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-syn-accent" /> Genre Probabilities
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={probData} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" domain={[0, 100]} tick={{ fill: '#8892a4', fontSize: 11 }} unit="%" />
              <YAxis type="category" dataKey="genre" tick={{ fill: '#e2e8f0', fontSize: 12 }} width={70} />
              <Tooltip
                cursor={{ fill: 'rgba(108,99,255,0.08)' }}
                contentStyle={{ background: '#1a1a2e', border: '1px solid #2a2a3e', borderRadius: 8 }}
                formatter={(v: number) => [`${v}%`, 'Probability']}
              />
              <Bar dataKey="probability" radius={[0, 4, 4, 0]}>
                {probData.map((entry) => <Cell key={entry.genre} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Audio Radar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-syn-accent" /> Audio Profile
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#2a2a3e" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#8892a4', fontSize: 11 }} />
              <Radar dataKey="value" stroke={genreColor} fill={genreColor} fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass rounded-2xl p-6"
      >
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Star className="w-4 h-4 text-syn-accent" /> AI Music Insights
        </h3>
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-syn-muted font-medium mb-2">Why this genre?</p>
            <p className="text-syn-text text-sm leading-relaxed">{ai_insights.explanation}</p>
            <p className="text-sm text-syn-muted font-medium mt-4 mb-2">Mood</p>
            <p className="text-syn-text text-sm">{ai_insights.mood}</p>
            <p className="text-sm text-syn-muted font-medium mt-4 mb-2">Rhythm Pattern</p>
            <p className="text-syn-text text-sm">{ai_insights.rhythm_patterns}</p>
          </div>
          <div>
            <p className="text-sm text-syn-muted font-medium mb-2">Key Characteristics</p>
            <ul className="space-y-1">
              {ai_insights.characteristics.map(c => (
                <li key={c} className="text-sm text-syn-text flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-syn-accent" />
                  {c}
                </li>
              ))}
            </ul>
            <p className="text-sm text-syn-muted font-medium mt-4 mb-2">Typical Instruments</p>
            <div className="flex flex-wrap gap-2">
              {ai_insights.instruments.map(inst => (
                <span key={inst} className="px-2 py-0.5 rounded-full text-xs glass border border-syn-border text-syn-text">{inst}</span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Similar Artists */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-2xl p-6"
      >
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-syn-accent" /> Similar Artists You Might Enjoy
        </h3>
        <div className="flex flex-wrap gap-3">
          {ai_insights.similar_artists.map((artist, i) => (
            <motion.div
              key={artist}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="px-4 py-2 rounded-full glass border border-syn-border text-sm text-syn-text hover:border-syn-accent/40 transition-colors"
            >
              {artist}
            </motion.div>
          ))}
        </div>
        <p className="text-xs text-syn-muted mt-3">Based on genre characteristics only — not exact song recognition.</p>
      </motion.div>

      {/* Waveform */}
      {waveform_data?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <WaveformDisplay waveformData={waveform_data} color={genreColor} />
        </motion.div>
      )}

      {/* Visualizations */}
      <div className="grid gap-6">
        {[
          { b64: spectrogram_b64, title: 'Mel Spectrogram' },
          { b64: mfcc_b64, title: 'MFCC Heatmap' },
          { b64: chroma_b64, title: 'Chromagram' },
        ].filter(v => v.b64).map(({ b64, title }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.05 }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="font-semibold mb-4">{title}</h3>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`data:image/png;base64,${b64}`}
              alt={title}
              className="w-full rounded-xl"
            />
          </motion.div>
        ))}
      </div>

      {/* Raw Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="glass rounded-2xl p-6"
      >
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-syn-accent" /> Extracted Audio Features
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Tempo (BPM)', value: fmt(features.tempo, 1) },
            { label: 'Spectral Centroid', value: `${fmt(features.spectral_centroid_mean, 0)} Hz` },
            { label: 'RMS Energy', value: fmt(features.rms_energy_mean, 4) },
            { label: 'ZCR Mean', value: fmt(features.zero_crossing_rate_mean, 4) },
            { label: 'Spectral Rolloff', value: `${fmt(features.spectral_rolloff_mean, 0)} Hz` },
            { label: 'Bandwidth', value: `${fmt(features.spectral_bandwidth_mean, 0)} Hz` },
            { label: 'Harmonic', value: fmt(features.harmonic_mean, 4) },
            { label: 'Percussive', value: fmt(features.percussive_mean, 4) },
          ].map(({ label, value }) => (
            <div key={label} className="bg-syn-surface rounded-xl p-4">
              <p className="text-xs text-syn-muted mb-1">{label}</p>
              <p className="text-syn-text font-mono font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
