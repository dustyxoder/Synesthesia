import type { Metadata } from 'next'
import AnalyzePage from './AnalyzeClient'

export const metadata: Metadata = {
  title: 'Analyze Music – Synesthesia',
  description: 'Upload your audio file and get instant AI-powered genre classification.',
}

export default function Page() {
  return <AnalyzePage />
}
