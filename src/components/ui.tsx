import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { getBlock } from '../data/blocks'
import { hoursLabel } from '../lib/format'

// Kleine, wiederverwendbare Bausteine – bewusst schlicht gehalten.

export function Card({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-2xl bg-paper border border-line shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${className}`}
    >
      {children}
    </div>
  )
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
      {children}
    </p>
  )
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost'
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const base =
    'w-full rounded-xl px-4 py-3.5 text-base font-semibold transition active:scale-[0.99] disabled:opacity-40 disabled:active:scale-100'
  const styles =
    variant === 'primary'
      ? 'bg-brand text-brand-ink shadow-sm hover:brightness-110'
      : 'bg-paper text-ink border border-line hover:bg-canvas'
  return (
    <button className={`${base} ${styles} ${className}`} {...rest}>
      {children}
    </button>
  )
}

/** Fortschrittsbalken fürs Wochenziel. */
export function Bar({
  value,
  goal,
  color,
}: {
  value: number
  goal: number
  color: string
}) {
  const pct = Math.min(100, goal > 0 ? (value / goal) * 100 : 0)
  return (
    <div className="h-2.5 w-full rounded-full bg-line overflow-hidden">
      <div
        className="h-full rounded-full transition-[width] duration-500"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  )
}

/** Farbiger Punkt + Kürzel eines Blocks. */
export function BlockDot({ blockId }: { blockId: string | null | undefined }) {
  const block = getBlock(blockId)
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
        style={{ background: block?.color ?? '#cbd5e1' }}
      />
      <span className="text-sm font-medium text-ink-soft">
        {block ? block.id : '–'}
      </span>
    </span>
  )
}

/** Auswählbares Hut-Kärtchen (für Fragekarten & Tageseingabe). */
export function BlockOption({
  blockId,
  selected,
  onClick,
  sub,
}: {
  blockId: string
  selected?: boolean
  onClick?: () => void
  sub?: string
}) {
  const block = getBlock(blockId)
  if (!block) return null
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition ${
        selected
          ? 'border-transparent ring-2 ring-offset-1'
          : 'border-line bg-paper hover:bg-canvas'
      }`}
      style={selected ? { background: `${block.color}14`, boxShadow: `inset 0 0 0 2px ${block.color}` } : undefined}
    >
      <span
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
        style={{ background: block.color }}
      >
        {block.id}
      </span>
      <span className="min-w-0">
        <span className="block font-semibold leading-tight">{block.name}</span>
        <span className="block truncate text-sm text-ink-soft">
          {sub ?? block.hint}
        </span>
      </span>
    </button>
  )
}

export function HoursPill({ hours, bioZ }: { hours: number; bioZ?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-lg px-2 py-0.5 text-sm font-semibold tabular-nums ${
        bioZ ? 'text-bioz' : 'text-ink-soft'
      }`}
    >
      {hoursLabel(hours)}
    </span>
  )
}
