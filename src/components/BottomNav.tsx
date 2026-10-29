import type { ReactNode } from 'react'

export type Tab = 'heute' | 'woche' | 'fragen' | 'excel'

const ICONS: Record<Tab, ReactNode> = {
  heute: (
    <path d="M12 7v5l3 2M12 21a9 9 0 110-18 9 9 0 010 18z" />
  ),
  woche: (
    <path d="M4 5h16v16H4zM4 9h16M8 3v4M16 3v4M8 14h2M14 14h2" />
  ),
  fragen: (
    <path d="M9.1 9a3 3 0 115.8 1c0 2-3 2.5-3 4M12 17.5h.01M12 21a9 9 0 110-18 9 9 0 010 18z" />
  ),
  excel: (
    <path d="M4 3h10l6 6v12H4zM14 3v6h6M8 13l8 4m0-4l-8 4" />
  ),
}

const LABELS: Record<Tab, string> = {
  heute: 'Heute',
  woche: 'Woche',
  fragen: 'Fragen',
  excel: 'Excel',
}

export function BottomNav({
  active,
  onChange,
  badge,
}: {
  active: Tab
  onChange: (t: Tab) => void
  badge?: Partial<Record<Tab, number>>
}) {
  const tabs: Tab[] = ['heute', 'woche', 'fragen', 'excel']
  return (
    <nav className="sticky bottom-0 z-10 border-t border-line bg-paper/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-md">
        {tabs.map((t) => {
          const isActive = t === active
          const count = badge?.[t]
          return (
            <button
              key={t}
              onClick={() => onChange(t)}
              className={`relative flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition ${
                isActive ? 'text-brand' : 'text-ink-faint'
              }`}
            >
              <span className="relative">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {ICONS[t]}
                </svg>
                {count ? (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                    {count}
                  </span>
                ) : null}
              </span>
              {LABELS[t]}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
