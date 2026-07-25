import Navbar from './components/Navbar'
import VideoSection from './components/VideoSection'
import SectionContent from './components/SectionContent'
import FireflyCursor from './components/FireflyCursor'
import { useLenisScroll } from './hooks/useLenisScroll'

const SECTIONS = [
  {
    id: 'home',
    videoSrc: import.meta.env.BASE_URL + 'videos/home.mp4',
    fallbackGradient: 'from-slate-950 via-slate-900 to-black',
    eyebrow: 'BABLY',
    headline: 'Beyond silence, we build the eternal.',
    description:
      'Building platforms for brilliant minds, fearless makers, and thoughtful souls. Through the noise, we craft digital havens for deep work and pure flows.',
    ctaLabel: 'Begin Journey',
  },
  {
    id: 'studio',
    videoSrc: import.meta.env.BASE_URL + 'videos/studio.mp4',
    fallbackGradient: 'from-slate-950 via-slate-900 to-black',
    eyebrow: 'Studio',
    headline: 'Where craft meets restraint.',
    description:
      'Every frame here runs the same fade-in, fade-out loop as the hero — one continuous rhythm across the page.',
  },
  {
    id: 'about',
    videoSrc: import.meta.env.BASE_URL + 'videos/about.mp4',
    fallbackGradient: 'from-slate-950 via-slate-900 to-black',
    eyebrow: 'About',
    headline: 'A quiet obsession with detail.',
    description:
      'We build slowly, on purpose — for people who notice the difference.',
  },
  {
    id: 'journal',
    videoSrc: import.meta.env.BASE_URL + 'videos/journal.mp4',
    fallbackGradient: 'from-slate-950 via-slate-900 to-black',
    eyebrow: 'Journal',
    headline: 'Notes from the process.',
    description:
      'Field notes, process sketches, and the occasional detour worth writing down.',
  },
  {
    id: 'reach-us',
    videoSrc: import.meta.env.BASE_URL + 'videos/reach-us.mp4',
    fallbackGradient: 'from-slate-950 via-slate-900 to-black',
    eyebrow: 'Reach Us',
    headline: "Let's build something eternal.",
    description: "Tell us what you're building — we read every message.",
    ctaLabel: 'Get in Touch',
  },
]

export default function App() {
  const { activeIndex } = useLenisScroll(SECTIONS.length)

  return (
    <div className="relative w-full bg-background">
      <FireflyCursor />
      <Navbar />

      <main className="w-full">
        {SECTIONS.map((section, index) => (
          <VideoSection
            key={section.id}
            id={section.id}
            videoSrc={section.videoSrc}
            fallbackGradient={section.fallbackGradient}
            isActive={index === activeIndex}
          >
            <SectionContent
              eyebrow={section.eyebrow}
              headline={section.headline}
              description={section.description}
              ctaLabel={section.ctaLabel}
            />
          </VideoSection>
        ))}
      </main>
    </div>
  )
}
