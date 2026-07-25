const NAV_ITEMS = [
  { label: 'Home', href: '#home', active: true },
  { label: 'Studio', href: '#studio', active: false },
  { label: 'About', href: '#about', active: false },
  { label: 'Journal', href: '#journal', active: false },
  { label: 'Reach Us', href: '#reach-us', active: false },
]

export default function Navbar() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 bg-black/40 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-6">
        <a href="#home" className="flex flex-col leading-none">
          <span
            className="font-display text-4xl tracking-tight"
            style={{ color: '#F2F4F7' }}
          >
            BABLY
          </span>
          <span
            className="mt-0.5 text-[10px] uppercase tracking-[0.25em]"
            style={{ color: '#9AA0AA' }}
          >
            the dream studio
          </span>
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className="text-sm transition-colors hover:opacity-80"
                style={{ color: item.active ? '#F2F4F7' : '#9AA0AA' }}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="rounded-full px-6 py-2.5 text-sm transition-transform duration-300 hover:scale-[1.03]"
          style={{ backgroundColor: '#E8EAED', color: '#0A0A0B' }}
        >
          Begin Journey
        </button>
      </div>
    </nav>
  )
}
