import { useEffect, type ReactNode } from 'react'
import type { Book } from '../types'
import { coverColors } from '../lib/util'

export function Stars({ value, onChange, size = 16 }: { value?: number; onChange?: (v: number) => void; size?: number }) {
  const v = value ?? 0
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={v ? `${v} out of 5 stars` : 'Not rated'} role={onChange ? 'radiogroup' : undefined}>
      {[1, 2, 3, 4, 5].map(i => (
        <button key={i} type="button" disabled={!onChange} onClick={() => onChange?.(i === v ? 0 : i)}
          className={onChange ? 'cursor-pointer' : 'cursor-default'} style={{ fontSize: size, lineHeight: 1, color: i <= v ? 'var(--brass)' : 'var(--line)', background: 'none', border: 0, padding: 0 }}
          aria-label={`${i} star${i > 1 ? 's' : ''}`}>★</button>
      ))}
    </span>
  )
}

/** A book cover: the real image when one is set and loads; otherwise a generated cloth binding. */
export function Cover({ book, width = 96, className = '', onClick }: { book: Book; width?: number; className?: string; onClick?: () => void }) {
  const height = Math.round(width * 1.5)
  const c = coverColors(book)
  const titleSize = Math.max(9, Math.min(16, width / 7))
  const content = (
    <div className={'relative overflow-hidden shrink-0 ' + className} style={{ width, height, background: c.bg, color: c.ink, borderRadius: Math.max(2, width / 32), boxShadow: 'inset 4px 0 6px -4px rgba(0,0,0,0.6), 0 2px 6px rgba(0,0,0,0.25)' }}>
      {book.coverUrl && <img src={book.coverUrl} alt="" className="absolute inset-0 w-full h-full object-cover" onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />}
      <div className="absolute inset-0 flex flex-col justify-between" style={{ padding: width / 10 }}>
        <div style={{ fontSize: Math.max(7, width / 11), letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.85, lineHeight: 1.2 }}>{book.authors[0] ?? ''}</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: titleSize, lineHeight: 1.1, fontWeight: 600, textWrap: 'balance' as any }}>{book.title}</div>
        <div style={{ height: 1, background: c.ink, opacity: 0.4 }} />
      </div>
    </div>
  )
  return onClick ? <button type="button" onClick={onClick} className="block shrink-0 text-left" aria-label={book.title} style={{ padding: 0, border: 0, background: 'none' }}>{content}</button> : content
}

export function Ring({ value, max, size = 96, stroke = 10, children }: { value: number; max: number; size?: number; stroke?: number; children?: ReactNode }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const p = max > 0 ? Math.min(1, value / max) : 0
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg className="ring" width={size} height={size} role="img" aria-label={`${value} of ${max}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--accent)" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${c * p} ${c}`} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  )
}

export function Modal({ onClose, children, label }: { onClose: () => void; children: ReactNode; label: string }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [onClose])
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={label} onClick={e => e.stopPropagation()}>{children}</div>
    </div>
  )
}

export function Empty({ title, hint, children }: { title: string; hint?: string; children?: ReactNode }) {
  return (
    <div className="card p-8 text-center flex flex-col items-center gap-2">
      <h3 className="text-xl">{title}</h3>
      {hint && <p className="text-muted max-w-md">{hint}</p>}
      {children}
    </div>
  )
}

export function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-lg">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

export function Stat({ label, value, sub }: { label: string; value: ReactNode; sub?: string }) {
  return (
    <div className="card p-4 flex flex-col gap-1 min-w-0">
      <div className="eyebrow">{label}</div>
      <div className="text-2xl font-display tnum">{value}</div>
      {sub && <div className="text-xs text-muted truncate">{sub}</div>}
    </div>
  )
}
