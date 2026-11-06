import { useEffect, useState } from 'react'

// Kleines Gimmick: ein Herz-Button in der Kopfzeile öffnet jederzeit
// „unseren Magic Moment" – ein Bild als Erinnerung.
export function MagicMoment() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Magic Moment"
        title="Magic Moment ✨"
        className="shrink-0 rounded-lg p-1.5 text-white/80 transition hover:bg-white/10 hover:text-white"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 21s-6.7-4.35-9.33-8.07C.9 10.27 1.6 6.9 4.2 5.7c1.9-.88 4.02-.2 5.2 1.36L12 10l2.6-2.94c1.18-1.56 3.3-2.24 5.2-1.36 2.6 1.2 3.3 4.57 1.53 7.23C18.7 16.65 12 21 12 21z" />
        </svg>
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          style={{ animation: 'mm-fade 0.2s ease-out' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-paper shadow-2xl"
            style={{ animation: 'mm-pop 0.25s cubic-bezier(0.2,0.9,0.3,1.3)' }}
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Schließen"
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/35 text-lg text-white backdrop-blur hover:bg-black/55"
            >
              ×
            </button>
            <img
              src={`${import.meta.env.BASE_URL}magic-moment.webp`}
              alt="Unser Magic Moment"
              className="block max-h-[75vh] w-full object-cover"
            />
            <div className="px-5 py-4 text-center">
              <p className="text-sm font-semibold tracking-wide text-brand">
                ✨ UNSER MAGIC MOMENT ✨
              </p>
              <p className="mt-0.5 text-sm text-ink-soft">
                Einfach, weil's schön war. 💛
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes mm-fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes mm-pop { from { opacity: 0; transform: scale(0.9) } to { opacity: 1; transform: scale(1) } }
      `}</style>
    </>
  )
}
