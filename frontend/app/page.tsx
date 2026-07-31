'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Music2, Zap, BarChart3, Sparkles, Brain } from 'lucide-react'

const features = [
  { icon: Zap, title: 'Instant Genre Detection', desc: 'Upload any audio file and get AI-powered genre classification in seconds with confidence scores.' },
  { icon: Brain, title: 'Deep Learning Model', desc: 'Trained on GTZAN dataset with CNN architecture achieving 91%+ accuracy across 10 genres.' },
  { icon: BarChart3, title: 'Rich Visualizations', desc: 'Mel spectrograms, MFCC heatmaps, chromagrams, waveforms — beautiful audio intelligence dashboards.' },
  { icon: Sparkles, title: 'AI Music Insights', desc: 'LLM-generated explanations, mood analysis, instrument identification, and a personalized compliment.' },
]

const genres = ['Blues', 'Classical', 'Country', 'Disco', 'Hip-Hop', 'Jazz', 'Metal', 'Pop', 'Reggae', 'Rock']

const stats = [
  { value: '91%+', label: 'Classification Accuracy' },
  { value: '10', label: 'Music Genres' },
  { value: '104', label: 'Audio Features' },
  { value: '<50ms', label: 'Inference Time' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen pt-16">
      {/* Hero */}
      <section className="relative px-4 pt-24 pb-32 text-center max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-syn-accent/30 text-syn-accent text-sm font-medium mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Music Analysis Platform
          </div>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-6 leading-tight">
            Hear the music.{' '}
            <span className="gradient-text">Understand the genre.</span>
          </h1>

          <p className="text-xl text-syn-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload any audio file and let our deep learning model identify its genre instantly.
            Get rich visualizations, AI insights, and a compliment tailored to your taste.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/analyze"
              className="group flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-syn text-white font-semibold text-lg hover:opacity-90 transition-all shadow-xl shadow-syn-accent/30"
            >
              Analyze Your Music
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/about"
              className="flex items-center gap-2 px-8 py-4 rounded-full glass border border-syn-border text-syn-text font-semibold text-lg hover:border-syn-accent/40 transition-all"
            >
              How It Works
            </Link>
          </div>
        </motion.div>

        {/* Floating music notes decoration */}
        <motion.div
          className="absolute top-32 left-10 text-4xl opacity-20"
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >♪</motion.div>
        <motion.div
          className="absolute top-48 right-16 text-3xl opacity-15"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        >♫</motion.div>
        <motion.div
          className="absolute bottom-24 left-1/4 text-2xl opacity-10"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 6, repeat: Infinity, delay: 2 }}
        >♩</motion.div>
      </section>

      {/* Stats */}
      <section className="px-4 py-12 border-y border-syn-border/50">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8">
          {stats.map(({ value, label }, i) => (
            <motion.div
              key={label}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl font-black gradient-text mb-1">{value}</div>
              <div className="text-sm text-syn-muted">{label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-24 max-w-6xl mx-auto">
        <motion.h2
          className="text-3xl font-bold text-center mb-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Everything you need to <span className="gradient-text">understand your music</span>
        </motion.h2>
        <p className="text-center text-syn-muted mb-16 max-w-xl mx-auto">
          Powered by deep learning and digital signal processing.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              className="glass rounded-2xl p-6 card-hover"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="w-12 h-12 rounded-xl bg-syn-accent/15 flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-syn-accent" />
              </div>
              <h3 className="font-semibold text-syn-text mb-2">{title}</h3>
              <p className="text-sm text-syn-muted leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Genres */}
      <section className="px-4 py-20 max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">
          10 <span className="gradient-text">Music Genres</span> Classified
        </h2>
        <p className="text-syn-muted mb-12">Trained on the GTZAN Genre Collection dataset.</p>
        <div className="flex flex-wrap justify-center gap-3">
          {genres.map((genre, i) => (
            <motion.span
              key={genre}
              className="genre-badge"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              viewport={{ once: true }}
            >
              {genre}
            </motion.span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-24 text-center">
        <motion.div
          className="max-w-2xl mx-auto glass rounded-3xl p-12 border border-syn-accent/20"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <Music2 className="w-12 h-12 text-syn-accent mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Ready to discover your genre?</h2>
          <p className="text-syn-muted mb-8">Upload a WAV, MP3, FLAC, or OGG file and get instant AI analysis.</p>
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-syn text-white font-semibold hover:opacity-90 transition-opacity shadow-xl shadow-syn-accent/30"
          >
            Start Analyzing <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-syn-border/50 py-8 text-center text-syn-muted text-sm">
        <p>Synesthesia © {new Date().getFullYear()} · Built with Next.js 15, FastAPI & PyTorch</p>
      </footer>
    </div>
  )
}
