'use client'

interface ScoreBadgeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
}

export default function ScoreBadge({ score, size = 'md' }: ScoreBadgeProps) {
  const tier =
    score >= 80
      ? { bg: 'bg-primary-container/15', text: 'text-primary-container', border: 'border-primary-container/35' }
      : score >= 50
        ? { bg: 'bg-tertiary-fixed-dim/15', text: 'text-tertiary-fixed-dim', border: 'border-tertiary-fixed-dim/35' }
        : { bg: 'bg-error/15', text: 'text-error', border: 'border-error/35' }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-lg border font-semibold ${tier.bg} ${tier.text} ${tier.border} ${sizeClasses[size]}`}
    >
      <span className="text-[10px] font-normal uppercase tracking-wide text-white/50">Alpha</span>
      <span className="tabular-nums">{score}</span>
    </div>
  )
}
