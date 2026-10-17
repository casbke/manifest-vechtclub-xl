import { useState } from 'react'

/** Single-series vertical bars, drawn to scale with a hover tooltip. */
export function Bars({ data, height = 160, color = 'var(--chart-1)', format = (v: number) => String(v), label }: { data: { label: string; value: number }[]; height?: number; color?: string; format?: (v: number) => string; label: string }) {
  const [hover, setHover] = useState<number | null>(null)
  const max = Math.max(1, ...data.map(d => d.value))
  const w = 100 / Math.max(1, data.length)
  const ticks = niceTicks(max)
  return (
    <figure className="m-0 flex flex-col gap-1" aria-label={label}>
      <div className="relative" style={{ height }}>
        <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="absolute inset-0 w-full h-full" aria-hidden>
          {ticks.map(t => <line key={t} x1="0" x2="100" y1={height - (t / max) * (height - 8)} y2={height - (t / max) * (height - 8)} stroke="var(--chart-grid)" strokeWidth="1" vectorEffect="non-scaling-stroke" />)}
          {data.map((d, i) => {
            const h = (d.value / max) * (height - 8)
            return <rect key={d.label} x={i * w + w * 0.2} y={height - h} width={w * 0.6} height={h} fill={color} opacity={hover === null || hover === i ? 1 : 0.45} rx="0" />
          })}
        </svg>
        <div className="absolute inset-0 flex">
          {data.map((d, i) => <div key={d.label} className="flex-1" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} tabIndex={0} aria-label={`${d.label}: ${format(d.value)}`} />)}
        </div>
        {hover !== null && (
          <div className="absolute card px-2 py-1 text-xs pointer-events-none" style={{ left: `${Math.min(80, hover * w + w / 2)}%`, top: 0, transform: 'translateX(-50%)' }}>
            <span className="text-muted">{data[hover].label}</span> <strong className="tnum">{format(data[hover].value)}</strong>
          </div>
        )}
      </div>
      <div className="flex text-xs text-muted tnum">
        {data.map(d => <div key={d.label} className="flex-1 text-center truncate">{d.label}</div>)}
      </div>
    </figure>
  )
}

/** Horizontal bars with direct labels, for ranked lists. */
export function HBars({ data, color = 'var(--chart-1)', format = (v: number) => String(v), label }: { data: { label: string; value: number; sub?: string }[]; color?: string; format?: (v: number) => string; label: string }) {
  const max = Math.max(1, ...data.map(d => d.value))
  return (
    <div className="flex flex-col gap-2" role="list" aria-label={label}>
      {data.map(d => (
        <div key={d.label} className="grid items-center gap-2" style={{ gridTemplateColumns: 'minmax(0, 11rem) 1fr auto' }} role="listitem">
          <div className="truncate text-sm">{d.label}{d.sub && <span className="text-muted text-xs"> · {d.sub}</span>}</div>
          <div className="h-3 rounded-sm" style={{ background: 'var(--surface-2)' }}>
            <div className="h-3 rounded-sm" style={{ width: `${(d.value / max) * 100}%`, background: color }} />
          </div>
          <div className="text-sm tnum w-10 text-right">{format(d.value)}</div>
        </div>
      ))}
    </div>
  )
}

/** Twelve-month heat strip for one year. */
export function MonthHeat({ values, year }: { values: number[]; year: number }) {
  const max = Math.max(1, ...values)
  const steps = ['#cde2fb', '#9ec5f4', '#6da7ec', '#3987e5', '#1c5cab']
  const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']
  return (
    <div className="flex gap-1" role="img" aria-label={`Books finished per month in ${year}`}>
      {values.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1" title={`${months[i]} ${year}: ${v} finished`}>
          <div className="w-full rounded-sm" style={{ height: 28, background: v === 0 ? 'var(--surface-2)' : steps[Math.min(4, Math.ceil((v / max) * 5) - 1)] }} />
          <span className="text-xs text-muted">{months[i]}</span>
        </div>
      ))}
    </div>
  )
}

function niceTicks(max: number) {
  const step = max <= 5 ? 1 : max <= 10 ? 2 : max <= 20 ? 5 : Math.pow(10, Math.floor(Math.log10(max)))
  const out: number[] = []
  for (let t = step; t <= max; t += step) out.push(t)
  return out
}
