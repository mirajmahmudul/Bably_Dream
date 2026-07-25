import { useEffect, useRef, useState } from 'react'

interface VideoSectionProps {
  id: string
  videoSrc: string
  fallbackGradient?: string // tailwind gradient classes used if video fails/missing
  isActive: boolean // only the on-screen section should decode/play its video
  children?: React.ReactNode
}

export default function VideoSection({
  id,
  videoSrc,
  fallbackGradient = 'from-slate-950 via-slate-900 to-black',
  isActive,
  children,
}: VideoSectionProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const glitchTimeoutRef = useRef<number | null>(null)
  const [videoFailed, setVideoFailed] = useState(false)
  const [glitching, setGlitching] = useState(false)
  // increments every time this section becomes active, used to force the
  // content block to remount and replay its entrance animation on every
  // scroll-in, not just the very first page load
  const [activationCount, setActivationCount] = useState(0)

  const triggerGlitch = () => {
    setGlitching(true)
    if (glitchTimeoutRef.current) window.clearTimeout(glitchTimeoutRef.current)
    glitchTimeoutRef.current = window.setTimeout(() => setGlitching(false), 500)
  }

  // Play/pause based on visibility. This is the single biggest lever for
  // performance: five 1080p videos all decoding simultaneously (even
  // fully off-screen) is what causes page-wide jank. Only the active
  // section's video should ever actually be playing. The video itself
  // loops natively (no manual fade/restart) so playback is continuous.
  useEffect(() => {
    const video = videoRef.current
    if (!video || videoFailed) return

    if (isActive) {
      video.muted = true // belt-and-suspenders: guarantees autoplay isn't blocked
      video.play().catch(() => {
        /* autoplay may be blocked until user interaction; ignore */
      })
      setActivationCount((c) => c + 1)
      triggerGlitch() // glitch flash doubles as the scroll-in transition
    } else {
      video.pause()
    }
  }, [isActive, videoFailed])

  // Glitch flash right as the video loops, to mask the loop seam instead
  // of letting it show as a visible cut/restart.
  useEffect(() => {
    const video = videoRef.current
    if (!video || videoFailed || !isActive) return

    const GLITCH_WINDOW = 0.25 // seconds before the end to start glitching

    const handleTimeUpdate = () => {
      if (video.duration && !Number.isNaN(video.duration)) {
        if (video.currentTime > video.duration - GLITCH_WINDOW) {
          triggerGlitch()
        }
      }
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    return () => video.removeEventListener('timeupdate', handleTimeUpdate)
  }, [videoFailed, isActive])

  useEffect(() => {
    return () => {
      if (glitchTimeoutRef.current) window.clearTimeout(glitchTimeoutRef.current)
    }
  }, [])

  return (
    <section
      id={id}
      data-lenis-section
      className="sticky top-0 h-screen w-full overflow-hidden bg-black"
    >
      {/* video layer */}
      <div className="absolute inset-0 z-0">
        {!videoFailed && (
          <video
            ref={videoRef}
            className={`h-full w-full object-cover ${glitching ? 'glitch-active' : ''}`}
            src={videoSrc}
            muted
            loop
            playsInline
            preload={isActive ? 'auto' : 'metadata'}
            onError={() => setVideoFailed(true)}
          />
        )}
        {/* fallback shown behind video always, and alone if video fails to load */}
        <div
          className={`absolute inset-0 bg-gradient-to-b ${fallbackGradient} ${
            videoFailed ? '' : '-z-10'
          }`}
        />
        {/* TV-screen overlays: brief static flicker + a single sweeping roll-bar */}
        <div
          className={`tv-static pointer-events-none absolute inset-0 ${
            glitching ? 'glitch-active' : ''
          }`}
        />
        <div
          className={`tv-roll-bar pointer-events-none ${
            glitching ? 'glitch-active' : ''
          }`}
        />
      </div>

      {/* night-mode grounding: gentle dark vignette top+bottom, video stays bright center */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/50 via-black/10 to-black/60" />

      {/* content layer */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <div key={activationCount}>{children}</div>
      </div>
    </section>
  )
}
