import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Synesthesia – Intelligent Music Genre Classification',
  description: 'AI-powered music analysis platform. Upload any audio file and discover its genre with deep learning.',
  keywords: 'music genre classification, AI music analysis, audio deep learning, music prediction',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-syn-bg text-syn-text antialiased min-h-screen`}>
        {/* Animated background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-syn-accent opacity-10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute top-1/2 -right-40 w-80 h-80 bg-syn-accent2 opacity-8 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
          <div className="absolute -bottom-40 left-1/3 w-72 h-72 bg-syn-accent3 opacity-6 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '3s' }} />
        </div>

        <div className="relative z-10">
          <Navbar />
          <main>{children}</main>
        </div>

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a2e',
              color: '#e2e8f0',
              border: '1px solid #2a2a3e',
              borderRadius: '12px',
            },
          }}
        />
      </body>
    </html>
  )
}
