import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  alpha: number
  dAlpha: number
  wobble: number
}

interface Props {
  count?: number
  color?: string
  enabled?: boolean
}

export default function ParticlesBackground({
  count = 30,
  color = '#c9a96e',
  enabled = true,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!enabled) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let rafId: number

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const particles: Particle[] = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.12,
      r: Math.random() * 1.2 + 0.3,
      alpha: Math.random() * 0.5 + 0.1,
      dAlpha: (Math.random() * 0.003 + 0.001) * (Math.random() > 0.5 ? 1 : -1),
      wobble: Math.random() * Math.PI * 2,
    }))

    const frame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const p of particles) {
        p.wobble += 0.006
        p.x += p.vx + Math.sin(p.wobble * 0.65) * 0.055
        p.y += p.vy + Math.cos(p.wobble) * 0.04

        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        p.alpha += p.dAlpha
        if (p.alpha <= 0.04 || p.alpha >= 0.72) p.dAlpha *= -1

        ctx.save()
        ctx.globalAlpha = p.alpha
        ctx.shadowBlur = 12
        ctx.shadowColor = color
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      rafId = requestAnimationFrame(frame)
    }

    frame()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(rafId)
    }
  }, [count, color, enabled])

  if (!enabled) return null

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}
