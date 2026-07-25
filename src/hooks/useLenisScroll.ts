import { useEffect, useState } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

/**
 * Real momentum-based smooth scrolling, replacing the old hand-rolled
 * paged-scroll hook (wheel-delta accumulation + fixed-duration eased
 * scrollTop animation). That approach simulated momentum with a single
 * fixed animation regardless of how the user scrolled — Lenis instead
 * drives the browser's *actual* scroll position via continuous physics
 * (lerp), so the feel responds naturally to input instead of always
 * producing the identical transition.
 *
 * Lenis wraps native scroll rather than replacing it (unlike older
 * libraries such as Locomotive Scroll), so position: sticky and anchor
 * links keep working without change — which matters here since each
 * section is `sticky top-0`, stacking on top of one another as you
 * scroll (no snapping — continuous motion is the point of the effect).
 */
export function useLenisScroll(sectionCount: number) {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      anchors: true, // lets the navbar's <a href="#section-id"> links just work
      lerp: 0.1, // lower = smoother/slower catch-up to the target scroll
      wheelMultiplier: 1,
    })

    const sections = Array.from(
      document.querySelectorAll<HTMLElement>('[data-lenis-section]')
    )

    // With `sticky top-0` stacking, a pinned section still geometrically
    // overlaps the viewport even after a later section has scrolled on
    // top of it and covered it — so IntersectionObserver can't tell us
    // which one is actually on top. Instead: the active section is the
    // highest-index one that has started sticking (rect.top <= ~0).
    // Sections stack in order, so whichever has most recently reached
    // the top is the one currently visible above the rest.
    let ticking = false
    const computeActive = () => {
      ticking = false
      let current = 0
      for (let i = 0; i < sections.length; i++) {
        if (sections[i].getBoundingClientRect().top <= 1) {
          current = i
        }
      }
      setActiveIndex(current)
    }

    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(computeActive)
      }
    }

    computeActive()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      lenis.destroy()
    }
  }, [sectionCount])

  return { activeIndex }
}
