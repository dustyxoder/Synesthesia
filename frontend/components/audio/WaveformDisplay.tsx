'use client'
import { useEffect, useRef } from 'react'

interface Props {
  waveformData: number[]
  color?: string
}

export default function WaveformDisplay({ waveformData, color = '#6c63ff' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !waveformData.length) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height
    ctx.clearRect(0, 0, W, H)

    const mid = H / 2
    const step = W / waveformData.length

    const gradient = ctx.createLinearGradient(0, 0, W, 0)
    gradient.addColorStop(0, '#6c63ff')
    gradient.addColorStop(0.5, color)
    gradient.addColorStop(1, '#06b6d4')

    ctx.strokeStyle = gradient
    ctx.lineWidth = 1.5
    ctx.shadowBlur = 4
    ctx.shadowColor = color

    ctx.beginPath()
    waveformData.forEach((v, i) => {
      const x = i * step
      const y = mid + v * mid * 0.9
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    })
    ctx.stroke()
  }, [waveformData, color])

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="font-semibold mb-4 text-syn-text">Waveform</h3>
      <canvas
        ref={canvasRef}
        width={800}
        height={80}
        className="w-full rounded-xl"
        style={{ background: 'rgba(10,10,15,0.5)' }}
      />
    </div>
  )
}
