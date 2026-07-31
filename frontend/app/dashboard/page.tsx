'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, CartesianGrid, Legend,
} from 'recharts'
import { BarChart3, Brain, Database, GitBranch, Target, Zap, CheckCircle2, Loader2 } from 'lucide-react'
import axios from 'axios'
import type { ModelInfoResponse } from '@/types/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const GENRE_COLORS = [
  '#3b82f6','#8b5cf6','#f59e0b','#ec4899','#f97316',
  '#6366f1','#ef4444','#10b981','#84cc16','#f43f5e',
]

// Mock training history for visualisation
const mockHistory = Array.from({ length: 50 }, (_, i) => ({
  epoch: i + 1,
  train_loss: parseFloat((1.8 * Math.exp(-i * 0.06) + 0.1 + Math.random() * 0.05).toFixed(3)),
  val_loss: parseFloat((2.0 * Math.exp(-i * 0.055) + 0.15 + Math.random() * 0.08).toFixed(3)),
  val_acc: parseFloat((Math.min(0.92, 0.3 + i * 0.013 + Math.random() * 0.02)).toFixed(3)),
}))

export default function DashboardPage() {
  const [info, setInfo] = useState<ModelInfoResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    axios.get<ModelInfoResponse>(`${API_URL}/api/v1/model/info`)
      .then(r => setInfo(r.data))
      .catch(() => setError('Could not load model info. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-syn-accent animate-spin" />
    </div>
  )

  if (error) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="glass rounded-2xl p-8 text-center max-w-md">
        <p className="text-red-400 mb-2">{error}</p>
        <p className="text-syn-muted text-sm">Start the backend with <code className="text-syn-accent">uvicorn backend.main:app --reload</code></p>
      </div>
    </div>
  )

  const m = info?.metrics
  const barData = info?.genres.map((g, i) => ({
    genre: g,
    accuracy: m ? parseFloat((m.confusion_matrix[i][i] / m.confusion_matrix[i].reduce((a, b) => a + b, 0) * 100).toFixed(1)) : 0,
    fill: GENRE_COLORS[i],
  })) || []

  return (
    <div className="min-h-screen pt-20 px-4 pb-20">
      <div className="max-w-6xl mx-auto">
        <motion.div className="mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-black mb-3">
            <span className="gradient-text">Model Dashboard</span>
          </h1>
          <p className="text-syn-muted">Performance metrics, evaluation results, and model information.</p>
        </motion.div>

        {/* Metric cards */}
        {m && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Accuracy', value: `${(m.accuracy * 100).toFixed(1)}%`, icon: Target, color: '#10b981' },
              { label: 'Precision', value: `${(m.precision * 100).toFixed(1)}%`, icon: CheckCircle2, color: '#6c63ff' },
              { label: 'Recall', value: `${(m.recall * 100).toFixed(1)}%`, icon: Brain, color: '#a855f7' },
              { label: 'F1 Score', value: `${(m.f1_score * 100).toFixed(1)}%`, icon: Zap, color: '#06b6d4' },
            ].map(({ label, value, icon: Icon, color }, i) => (
              <motion.div
                key={label}
                className="glass rounded-2xl p-5 card-hover"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-syn-muted uppercase tracking-widest">{label}</p>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <p className="text-3xl font-black" style={{ color }}>{value}</p>
              </motion.div>
            ))}
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-6 mb-8">
          {/* Per-genre accuracy */}
          <motion.div className="glass rounded-2xl p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-syn-accent" /> Per-Genre Accuracy
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData}>
                <XAxis dataKey="genre" tick={{ fill: '#8892a4', fontSize: 11 }} angle={-30} textAnchor="end" height={50} />
                <YAxis domain={[0, 100]} tick={{ fill: '#8892a4', fontSize: 11 }} unit="%" />
                <Tooltip
                  contentStyle={{ background: '#1a1a2e', border: '1px solid #2a2a3e', borderRadius: 8 }}
                  formatter={(v: number) => [`${v}%`, 'Accuracy']}
                />
                <Bar dataKey="accuracy" radius={[4, 4, 0, 0]}>
                  {barData.map(entry => <Cell key={entry.genre} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Training history */}
          <motion.div className="glass rounded-2xl p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-syn-accent" /> Training History
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={mockHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                <XAxis dataKey="epoch" tick={{ fill: '#8892a4', fontSize: 10 }} label={{ value: 'Epoch', position: 'insideBottom', offset: -2, fill: '#8892a4', fontSize: 11 }} />
                <YAxis tick={{ fill: '#8892a4', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #2a2a3e', borderRadius: 8 }} />
                <Legend wrapperStyle={{ color: '#8892a4', fontSize: 11 }} />
                <Line type="monotone" dataKey="train_loss" stroke="#6c63ff" strokeWidth={2} dot={false} name="Train Loss" />
                <Line type="monotone" dataKey="val_loss" stroke="#a855f7" strokeWidth={2} dot={false} name="Val Loss" />
                <Line type="monotone" dataKey="val_acc" stroke="#10b981" strokeWidth={2} dot={false} name="Val Accuracy" />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Confusion Matrix */}
        {m && (
          <motion.div className="glass rounded-2xl p-6 mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-syn-accent" /> Confusion Matrix
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="p-2 text-syn-muted text-left">Pred →</th>
                    {m.class_labels.map(l => <th key={l} className="p-2 text-syn-muted text-center">{l.slice(0,4)}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {m.confusion_matrix.map((row, ri) => (
                    <tr key={ri}>
                      <td className="p-2 text-syn-muted font-medium">{m.class_labels[ri].slice(0,4)}</td>
                      {row.map((val, ci) => (
                        <td key={ci} className="p-2 text-center font-mono text-sm rounded"
                          style={{
                            background: ri === ci ? `rgba(16,185,129,${Math.min(0.7, val / 100)})` : `rgba(239,68,68,${Math.min(0.5, val / 50)})`,
                            color: val > 0 ? '#e2e8f0' : '#57606a',
                          }}
                        >
                          {val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Model info */}
        {info && (
          <motion.div className="glass rounded-2xl p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Database className="w-4 h-4 text-syn-accent" /> Model Details
            </h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                {[
                  ['Architecture', info.architecture],
                  ['Dataset', info.dataset],
                  ['Feature Count', info.feature_count.toString()],
                  ['Training Samples', m?.training_samples.toString() || '–'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2 border-b border-syn-border/50">
                    <span className="text-syn-muted text-sm">{k}</span>
                    <span className="text-syn-text text-sm font-medium">{v}</span>
                  </div>
                ))}
                <p className="text-xs text-syn-muted pt-2 leading-relaxed">{info.training_notes}</p>
              </div>
              <div>
                <p className="text-sm text-syn-muted mb-3">Inference Pipeline</p>
                <ol className="space-y-2">
                  {info.inference_pipeline.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="w-5 h-5 rounded-full bg-syn-accent/20 text-syn-accent text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                      <span className="text-syn-text">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
