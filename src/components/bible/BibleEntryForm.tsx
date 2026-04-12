'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useChapterStore } from '@/store/useChapterStore'
import type { BibleEntry } from '@/types'

type EntryType = BibleEntry['type']

interface Props {
  novelId: string
  initial?: BibleEntry
  defaultType?: EntryType
  onSave: (data: Omit<BibleEntry, 'id' | 'novelId'>) => void
  onCancel: () => void
}

export default function BibleEntryForm({ novelId, initial, defaultType = 'character', onSave, onCancel }: Props) {
  const { chapters } = useChapterStore()
  const [type, setType] = useState<EntryType>(initial?.type ?? defaultType)
  const [name, setName] = useState(initial?.name ?? '')
  const [aliases, setAliases] = useState(initial?.aliases.join(', ') ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [firstChapterId, setFirstChapterId] = useState(initial?.firstIntroducedChapterId ?? '')

  const types: EntryType[] = ['character', 'location', 'term', 'faction']

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onSave({
      type,
      name: name.trim(),
      aliases: aliases.split(',').map((a) => a.trim()).filter(Boolean),
      description: description.trim(),
      firstIntroducedChapterId: firstChapterId || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex gap-2">
        {types.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
              type === t
                ? 'bg-amber-500 text-zinc-950'
                : 'border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-zinc-400">Name *</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-500/50"
          placeholder="e.g. Maren"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-zinc-400">Aliases (comma-separated)</label>
        <input
          value={aliases}
          onChange={(e) => setAliases(e.target.value)}
          className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-500/50"
          placeholder="e.g. the Hollow King, Pale Lord"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-zinc-400">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-500/50"
          placeholder="Who or what is this?"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-zinc-400">First introduced in chapter</label>
        <select
          value={firstChapterId}
          onChange={(e) => setFirstChapterId(e.target.value)}
          className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 outline-none focus:border-amber-500/50"
        >
          <option value="">Not yet introduced</option>
          {chapters.map((ch) => (
            <option key={ch.id} value={ch.id}>{ch.title}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="submit" className="flex-1 bg-amber-500 text-zinc-950 hover:bg-amber-400">
          Save
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="border-zinc-700 text-zinc-400">
          Cancel
        </Button>
      </div>
    </form>
  )
}
