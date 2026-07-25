import { useEffect, useRef } from 'react'

/**
 * Firefly cursor trail.
 *
 * Same core idea as a classic sparkle-cursor: spawn small glowing
 * particles near the pointer and let them animate away on their own.
 * The difference is in the motion profile — instead of a quick radial
 * burst that shrinks to nothing, each particle:
 *   - drifts slowly with its own gentle random velocity (not straight
 *     outward from the cursor)
 *   - "breathes" — opacity oscillates like a real firefly blinking,
 *     rather than a single linear fade
 *
 * Performance note: canvas `shadowBlur` is recomputed by the browser on
 * every draw call and gets very expensive with dozens of particles per
 * frame. Instead we pre-render each color's glow once to an offscreen
 * canvas ("sprite") and just `drawImage` it per particle — much cheaper,
 * since it's a plain bitmap blit instead of a blur recalculation.
 */

interface Firefly {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  spriteIndex: number
  born: number
  lifespan: number
  blinkSpeed: number
  blinkOffset: number
}

const COLORS = [
  { hue: 52, sat: 100 }, // warm gold
  { hue: 46, sat: 90 }, // amber
  { hue: 70, sat: 80 }, // pale yellow-green
]

const MAX_FIREFLIES = 60
const SPRITE_SIZE = 64 // px, pre-rendered glow sprite dimensions

function makeGlowSprite(hue: number, sat: number): HTMLCanvasElement {
  const sprite = document.createElement('canvas')
  sprite.width = SPRITE_SIZE
  sprite.height = SPRITE_SIZE
  const ctx = sprite.getContext('2d')!
  const center = SPRITE_SIZE / 2
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, center)
  gradient.addColorStop(0, `hsla(${hue}, ${sat}%, 95%, 1)`)
  gradient.addColorStop(0.25, `hsla(${hue}, ${sat}%, 85%, 0.9)`)
  gradient.addColorStop(0.55, `hsla(${hue}, ${sat}%, 75%, 0.5)`)
  gradient.addColorStop(1, `hsla(${hue}, ${sat}%, 65%, 0)`)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE)
  return sprite
}

export default function FireflyCursor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const fliesRef = useRef<Firefly[]>([])
  const rafRef = useRef<number | null>(null)
  const lastSpawnRef = useRef(0)
  const spritesRef = useRef<HTMLCanvasElement[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    spritesRef.current = COLORS.map((c) => makeGlowSprite(c.hue, c.sat))

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const spawn = (x: number, y: number) => {
      const colorIndex = Math.floor(Math.random() * COLORS.length)
      const angle = Math.random() * Math.PI * 2
      const speed = 0.15 + Math.random() * 0.35 // slow drift, not a burst

      fliesRef.current.push({
        x: x + (Math.random() - 0.5) * 12,
        y: y + (Math.random() - 0.5) * 12,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.1, // slight upward bias, like real fireflies
        size: 4 + Math.random() * 6,
        spriteIndex: colorIndex,
        born: performance.now(),
        lifespan: 2200 + Math.random() * 1800,
        blinkSpeed: 1.2 + Math.random() * 1.8,
        blinkOffset: Math.random() * Math.PI * 2,
      })

      if (fliesRef.current.length > MAX_FIREFLIES) {
        fliesRef.current.splice(0, fliesRef.current.length - MAX_FIREFLIES)
      }
    }

    const handlePointerMove = (e: PointerEvent) => {
      const now = performance.now()
      if (now - lastSpawnRef.current > 55) {
        lastSpawnRef.current = now
        spawn(e.clientX, e.clientY)
      }
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })

    const render = () => {
      const now = performance.now()
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.globalCompositeOperation = 'lighter'

      fliesRef.current = fliesRef.current.filter((fly) => {
        const age = now - fly.born
        if (age > fly.lifespan) return false

        // gentle wandering drift, independent of the cursor
        fly.vx += (Math.random() - 0.5) * 0.02
        fly.vy += (Math.random() - 0.5) * 0.02
        fly.vx *= 0.99
        fly.vy *= 0.99
        fly.x += fly.vx
        fly.y += fly.vy

        const lifeRatio = age / fly.lifespan
        const envelope = Math.sin(lifeRatio * Math.PI) // fade in, fade out over lifespan
        const blink =
          0.6 + 0.4 * Math.abs(Math.sin(age / 300 / fly.blinkSpeed + fly.blinkOffset))
        const opacity = Math.min(1, envelope * blink * 1.3)

        const radius = fly.size * (1 + 0.5 * blink)
        const sprite = spritesRef.current[fly.spriteIndex]

        ctx.globalAlpha = opacity
        ctx.drawImage(sprite, fly.x - radius, fly.y - radius, radius * 2, radius * 2)

        return true
      })

      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'

      rafRef.current = requestAnimationFrame(render)
    }

    rafRef.current = requestAnimationFrame(render)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', handlePointerMove)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-40 h-screen w-screen"
      aria-hidden="true"
    />
  )
}
