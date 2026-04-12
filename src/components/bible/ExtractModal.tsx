'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useBibleStore } from '@/store/useBibleStore'
import { putBibleEntries } from '@/lib/db/bible'
import { generateId } from '@/lib/utils'
import type { CandidateEntry, BibleEntry, ExtractedEntry } from '@/types'
import ExtractInput from './ExtractInput'
import ExtractReview from './ExtractReview'

interface Props {
  open: boolean
  onClose: () => void
  novelId: string
}

type Phase = 'input' | 'loading' | 'review'

export default function ExtractModal({ open, onClose, novelId }: Props) {
  const { entries, addEntry } = useBibleStore()
  const [phase, setPhase] = useState<Phase>('input')
  const [candidates, setCandidates] = useState<CandidateEntry[]>([])
  const [error, setError] = useState<string | null>(null)

  function reset() {
    setPhase('input')
    setCandidates([])
    setError(null)
  }

  function handleClose() {
    reset()
    onClose()
  }

  async function handleExtract(text: string) {
    setPhase('loading')
    setError(null)
    try {
      const res = await fetch('/api/ai/extract-bible', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, novelId }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error ?? 'Request failed.')

      const existingNames = new Set(
        entries.map((e) => e.name.toLowerCase())
      )

      const mapped: CandidateEntry[] = (data.entries as ExtractedEntry[]).map((e) => ({
        ...e,
        _key: generateId(),
        accepted: true,
        isDuplicate: existingNames.has(e.name.toLowerCase()),
      }))

      setCandidates(mapped)
      setPhase('review')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setPhase('input')
    }
  }

  function handleCandidateChange(key: string, patch: Partial<CandidateEntry>) {
    setCandidates((prev) =>
      prev.map((c) => (c._key === key ? { ...c, ...patch } : c))
    )
  }

  async function handleAccept() {
    const accepted = candidates.filter((c) => c.accepted)
    const newEntries: BibleEntry[] = accepted.map((c) => ({
      id: generateId(),
      novelId,
      type: c.type,
      name: c.name.trim(),
      aliases: c.aliases,
      description: c.description.trim(),
      firstIntroducedChapterId: null,
    }))

    await putBibleEntries(newEntries)
    newEntries.forEach((e) => addEntry(e))
    handleClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="border-zinc-800 bg-zinc-950 text-zinc-100 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Extract from master doc</DialogTitle>
          <p className="text-sm text-zinc-500">
            Paste or upload your outline, notes, or manuscript. The AI will extract characters,
            locations, terms, and factions for you to review.
          </p>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto pr-1">
          {phase === 'review' ? (
            <ExtractReview
              candidates={candidates}
              onChange={handleCandidateChange}
              onAccept={handleAccept}
              onBack={reset}
            />
          ) : (
            <ExtractInput
              onExtract={handleExtract}
              loading={phase === 'loading'}
              error={error}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
