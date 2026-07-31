'use client'
import { motion } from 'framer-motion'
import { Brain, Database, Code, Zap, GitBranch, Layers, Music2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const pipeline = [
  { step: '1', title: 'Audio Upload', desc: 'MP3, WAV, FLAC, or OGG — up to 50 MB. File size, format, and duration validated server-side.', icon: Music2 },
  { step: '2', title: 'Preprocessing', desc: 'Audio loaded at 22050 Hz mono, silence trimmed, amplitude normalised to ±1, padded/cropped to 30 seconds.', icon: Zap },
  { step: '3', title: 'Feature Extraction', desc: '104 features extracted: 20 MFCCs, 12 chroma, spectral centroid/bandwidth/rolloff, tempo, ZCR, RMS, tonnetz, and more.', icon: Layers },
  { step: '4', title: 'Scaling', desc: 'StandardScaler normalises the feature vector to zero mean and unit variance — critical for SVM and MLP convergence.', icon: Code },
  { step: '5', title: 'Model Inference', desc: 'Feature MLP (PyTorch TorchScript) produces softmax probabilities over 10 genre classes in <50ms.', icon: Brain },
  { step: '6', title: 'AI Insights', desc: 'OpenAI / Anthropic generates natural-language explanations, mood analysis, instrument lists, and a compliment.', icon: GitBranch },
]

const tech = [
  { category: 'Frontend', items: ['Next.js 15', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Recharts', 'React Dropzone'] },
  { category: 'Backend', items: ['FastAPI', 'Pydantic v2', 'Uvicorn', 'Python 3.11+', 'Async I/O'] },
  { category: 'ML/DSP', items: ['PyTorch', 'Librosa', 'Scikit-learn', 'XGBoost', 'SHAP', 'SoundFile'] },
  { category: 'DevOps', items: ['Docker', 'Docker Compose', 'GitHub Actions', 'Vercel', 'Railway'] },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-20 px-4 pb-20">
      <div className="max-w-5xl mx-auto">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-black mb-4">
            About <span className="gradient-text">Synesthesia</span>
          </h1>
          <p className="text-syn-muted text-lg max-w-2xl mx-auto">
            An end-to-end AI platform combining deep learning, digital signal processing, and large language models
            to classify music genres with rich, explainable insights.
          </p>
        </motion.div>

        {/* Dataset section */}
        <motion.div className="glass rounded-2xl p-8 mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-syn-accent/15 flex items-center justify-center flex-shrink-0">
              <Database className="w-6 h-6 text-syn-accent" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-3">Dataset – GTZAN Genre Collection</h2>
              <div className="grid sm:grid-cols-3 gap-6">
                <div>
                  <p className="text-3xl font-black gradient-text mb-1">1,000</p>
                  <p className="text-syn-muted text-sm">Audio tracks</p>
                </div>
                <div>
                  <p className="text-3xl font-black gradient-text mb-1">10</p>
                  <p className="text-syn-muted text-sm">Genre classes</p>
                </div>
                <div>
                  <p className="text-3xl font-black gradient-text mb-1">30s</p>
                  <p className="text-syn-muted text-sm">Clip duration</p>
                </div>
              </div>
              <p className="text-syn-muted text-sm mt-4 leading-relaxed">
                The GTZAN dataset is the most-used public dataset for evaluation in machine listening research for music genre recognition.
                Each genre contains 100 audio files at 22050 Hz mono 16-bit WAV format.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Pipeline */}
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          <h2 className="text-2xl font-bold mb-6">Inference Pipeline</h2>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-syn-accent to-syn-accent3 opacity-30" />
            <div className="space-y-4">
              {pipeline.map(({ step, title, desc, icon: Icon }, i) => (
                <motion.div
                  key={step}
                  className="glass rounded-2xl p-5 ml-14 relative"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.08 }}
                >
                  <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-syn-accent/20 border border-syn-accent/40 flex items-center justify-center text-syn-accent text-xs font-bold">
                    {step}
                  </div>
                  <div className="flex items-start gap-3">
                    <Icon className="w-5 h-5 text-syn-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-syn-text">{title}</p>
                      <p className="text-sm text-syn-muted mt-1 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Model Architecture */}
        <motion.div className="glass rounded-2xl p-8 mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-syn-accent2/15 flex items-center justify-center flex-shrink-0">
              <Brain className="w-6 h-6 text-syn-accent2" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-3">Model Architecture</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-semibold text-syn-accent mb-2">Primary: Feature MLP (PyTorch)</p>
                  <ul className="space-y-1 text-sm text-syn-muted">
                    <li>• Input: 104-dimensional feature vector</li>
                    <li>• Linear(104 → 256) + BatchNorm + ReLU + Dropout(0.4)</li>
                    <li>• Linear(256 → 128) + BatchNorm + ReLU + Dropout(0.4)</li>
                    <li>• Linear(128 → 64) + ReLU</li>
                    <li>• Linear(64 → 10) — softmax output</li>
                    <li>• Optimizer: AdamW + CosineAnnealingLR</li>
                    <li>• Exported: TorchScript for production</li>
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-semibold text-syn-accent mb-2">Baseline Models</p>
                  <ul className="space-y-1 text-sm text-syn-muted">
                    <li>• XGBoost: 500 trees, max depth 6, learning rate 0.05</li>
                    <li>• Random Forest: 500 trees, max depth 20</li>
                    <li>• SVM: RBF kernel, C=10</li>
                    <li className="mt-3 text-xs">Training: 80/20 stratified split, StandardScaler normalisation, AdamW + cosine schedule</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tech Stack */}
        <motion.div className="glass rounded-2xl p-8 mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Code className="w-5 h-5 text-syn-accent" /> Technology Stack
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tech.map(({ category, items }) => (
              <div key={category}>
                <p className="text-xs font-semibold text-syn-accent uppercase tracking-widest mb-3">{category}</p>
                <ul className="space-y-1.5">
                  {items.map(item => (
                    <li key={item} className="text-sm text-syn-text flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-syn-accent2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-syn text-white font-semibold hover:opacity-90 transition-opacity shadow-xl shadow-syn-accent/25"
          >
            Try the Analyzer <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
