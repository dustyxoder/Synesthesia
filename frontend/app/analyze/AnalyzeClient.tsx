'use client'
import { useState, useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { Upload, Music2, FileAudio, X, Loader2, Sparkles } from 'lucide-react'
import axios from 'axios'
import ResultsDashboard from '@/components/audio/ResultsDashboard'
import type { AnalysisResponse } from '@/types/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const MAX_SIZE_MB = 50

export default function AnalyzePage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<AnalysisResponse | null>(null)
  const [stage, setStage] = useState('')
  const abortRef = useRef<AbortController | null>(null)

  const onDrop = useCallback((accepted: File[], rejected: File[]) => {
    if (rejected.length) {
      toast.error('Unsupported file. Please upload MP3, WAV, FLAC, or OGG.')
      return
    }
    const f = accepted[0]
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`File too large. Max ${MAX_SIZE_MB} MB.`)
      return
    }
    setFile(f)
    setResult(null)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/mpeg': ['.mp3'],
      'audio/wav': ['.wav'],
      'audio/flac': ['.flac'],
      'audio/ogg': ['.ogg'],
      'audio/x-wav': ['.wav'],
    },
    multiple: false,
    maxSize: MAX_SIZE_MB * 1024 * 1024,
  })

  const analyze = async () => {
    if (!file) return
    setLoading(true)
    setProgress(0)
    abortRef.current = new AbortController()

    const stages = [
      'Preprocessing audio…',
      'Extracting features…',
      'Running ML inference…',
      'Generating AI insights…',
    ]

    const stageInterval = setInterval(() => {
      setProgress(prev => {
        const next = prev + Math.random() * 15
        return Math.min(next, 90)
      })
    }, 400)

    let stageIdx = 0
    setStage(stages[stageIdx])
    const stageTimer = setInterval(() => {
      stageIdx = Math.min(stageIdx + 1, stages.length - 1)
      setStage(stages[stageIdx])
    }, 2000)

    try {
      const fd = new FormData()
      fd.append('file', file)

      const { data } = await axios.post<AnalysisResponse>(
        `${API_URL}/api/v1/audio/analyze`,
        fd,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          signal: abortRef.current.signal,
        }
      )
      setProgress(100)
      setResult(data)
      toast.success(`Genre detected: ${data.prediction.predicted_genre}!`)
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.code === 'ERR_CANCELED') return
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.detail || err.message
        : 'Analysis failed. Is the backend running?'
      toast.error(msg)
    } finally {
      clearInterval(stageInterval)
      clearInterval(stageTimer)
      setLoading(false)
    }
  }

  const reset = () => {
    abortRef.current?.abort()
    setFile(null)
    setResult(null)
    setLoading(false)
    setProgress(0)
  }

  return (
    <div className="min-h-screen pt-20 px-4 pb-20">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-black mb-3">
            <span className="gradient-text">Analyze Your Music</span>
          </h1>
          <p className="text-syn-muted text-lg">
            Upload an audio file — our AI will classify the genre and explain why.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Drop Zone */}
              <div
                {...getRootProps()}
                className={`upload-zone glass rounded-3xl p-16 text-center cursor-pointer transition-all ${isDragActive ? 'active' : ''}`}
              >
                <input {...getInputProps()} />
                <motion.div animate={{ scale: isDragActive ? 1.05 : 1 }} transition={{ type: 'spring', stiffness: 300 }}>
                  <div className="relative inline-block mb-6">
                    <div className="w-20 h-20 rounded-full bg-syn-accent/15 flex items-center justify-center mx-auto">
                      {isDragActive ? (
                        <Music2 className="w-10 h-10 text-syn-accent animate-bounce" />
                      ) : (
                        <Upload className="w-10 h-10 text-syn-accent" />
                      )}
                    </div>
                  </div>
                  <p className="text-xl font-semibold text-syn-text mb-2">
                    {isDragActive ? 'Drop it here!' : 'Drop your audio file here'}
                  </p>
                  <p className="text-syn-muted mb-4">or click to browse files</p>
                  <p className="text-xs text-syn-muted">MP3 · WAV · FLAC · OGG · Max {MAX_SIZE_MB}MB</p>
                </motion.div>
              </div>

              {/* File Preview */}
              <AnimatePresence>
                {file && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="glass rounded-2xl p-5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-syn-accent/15 flex items-center justify-center">
                        <FileAudio className="w-5 h-5 text-syn-accent" />
                      </div>
                      <div>
                        <p className="font-medium text-syn-text truncate max-w-xs">{file.name}</p>
                        <p className="text-xs text-syn-muted">{(file.size / 1024 / 1024).toFixed(2)} MB · {file.type}</p>
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); reset() }} className="p-2 rounded-full hover:bg-syn-surface transition-colors">
                      <X className="w-4 h-4 text-syn-muted" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Analyze Button */}
              <AnimatePresence>
                {file && !loading && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    onClick={analyze}
                    className="w-full py-4 rounded-2xl bg-gradient-syn text-white font-semibold text-lg hover:opacity-90 transition-opacity shadow-xl shadow-syn-accent/25 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    Analyze Genre
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Loading */}
              <AnimatePresence>
                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="glass rounded-2xl p-8 text-center"
                  >
                    <Loader2 className="w-10 h-10 text-syn-accent animate-spin mx-auto mb-4" />
                    <p className="text-syn-text font-medium mb-2">{stage}</p>
                    <div className="w-full bg-syn-border rounded-full h-2 overflow-hidden mt-4">
                      <motion.div
                        className="h-full progress-gradient rounded-full"
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                    <p className="text-xs text-syn-muted mt-2">{Math.round(progress)}%</p>
                    <button
                      onClick={() => abortRef.current?.abort()}
                      className="mt-4 text-xs text-syn-muted hover:text-syn-text underline"
                    >
                      Cancel
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <ResultsDashboard result={result} onReset={reset} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
