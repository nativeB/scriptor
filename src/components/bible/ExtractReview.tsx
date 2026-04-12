'use client'

import type { CandidateEntry } from '@/types'
import { Button } from '@/components/ui/button'
import { ENTRY_TYPE_ORDER, ENTRY_TYPE_COLORS } from '@/lib/bible-constants'

interface Props {
  candidates: CandidateEntry[]
  onChange: (key: string, patch: Partial<CandidateEntry>) => void
  onAccept: () => void
  onBack: () => void
}

export default function ExtractReview({ candidates, onChange, onAccept, onBack }: Props) {
  const acceptedCount = candidates.filter((c) => c.accepted).length

  return (
    <div className="flex flex-col gap-6">
      {ENTRY_TYPE_ORDER.map((type) => {
        const group = candidates.filter((c) => c.type === type)
        if (group.length === 0) return null

        return (
          <div key={type}>
            <h3 className={`mb-3 text-xs font-semibold uppercase tracking-widest ${ENTRY_TYPE_COLORS[type]}`}>
              {type}s ({group.length})
            </h3>
            <div className="flex flex-col gap-2">
              {group.map((candidate) => (
                <div
                  key={candidate._key}
                  className={`flex gap-3 rounded-lg border p-3 transition-colors ${
                    candidate.accepted
                      ? 'border-zinc-700 bg-zinc-900'
                      : 'border-zinc-800/50 bg-zinc-950 opacity-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={candidate.accepted}
                    onChange={(e) => onChange(candidate._key, { accepted: e.target.checked })}
                    className="mt-1 h-4 w-4 shrink-0 accent-amber-500"
                  />
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <input
                        value={candidate.name}
                        onChange={(e) => onChange(candidate._key, { name: e.target.value })}
                        className="flex-1 bg-transparent text-sm font-semibold text-zinc-100 outline-none focus:underline focus:decoration-amber-500/50"
                      />
                      {candidate.isDuplicate && (
                        <span className="shrink-0 rounded-full border border-yellow-700 px-2 py-0.5 text-xs text-yellow-400">
                          Already in bible
                        </span>
                      )}
                    </div>
                    {candidate.aliases.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {candidate.aliases.map((a, i) => (
                          <span key={i} className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                            {a}
                          </span>
                        ))}
                      </div>
                    )}
                    <textarea
                      value={candidate.description}
                      onChange={(e) => onChange(candidate._key, { description: e.target.value })}
                      rows={2}
                      className="resize-none bg-transparent text-xs text-zinc-400 outline-none focus:text-zinc-300"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
        <Button variant="ghost" onClick={onBack} className="text-zinc-500 hover:text-zinc-300">
          ← Back
        </Button>
        <span className="text-sm text-zinc-500">
          {acceptedCount} of {candidates.length} selected
        </span>
        <Button
          onClick={onAccept}
          disabled={acceptedCount === 0}
          className="bg-amber-500 text-zinc-950 hover:bg-amber-400 disabled:opacity-40"
        >
          Accept {acceptedCount > 0 ? `${acceptedCount} ` : ''}selected
        </Button>
      </div>
    </div>
  )
}
