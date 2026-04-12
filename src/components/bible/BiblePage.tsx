'use client'

import { useState } from 'react'
import { useBibleStore } from '@/store/useBibleStore'
import { putBibleEntry, deleteBibleEntry } from '@/lib/db/bible'
import { generateId } from '@/lib/utils'
import type { BibleEntry } from '@/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import BibleEntryCard from './BibleEntryCard'
import BibleEntryModal from './BibleEntryModal'
import ExtractModal from './ExtractModal'

interface Props {
  novelId: string
}

type EntryType = BibleEntry['type']
const TABS: { type: EntryType; label: string }[] = [
  { type: 'character', label: 'Characters' },
  { type: 'location', label: 'Locations' },
  { type: 'term', label: 'Terms' },
  { type: 'faction', label: 'Factions' },
]

export default function BiblePage({ novelId }: Props) {
  const { entries, addEntry, updateEntry, removeEntry } = useBibleStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [extractOpen, setExtractOpen] = useState(false)
  const [editing, setEditing] = useState<BibleEntry | undefined>()
  const [activeType, setActiveType] = useState<EntryType>('character')

  async function handleSave(data: Omit<BibleEntry, 'id' | 'novelId'>) {
    if (editing) {
      const updated: BibleEntry = { ...editing, ...data }
      await putBibleEntry(updated)
      updateEntry(editing.id, data)
    } else {
      const entry: BibleEntry = { id: generateId(), novelId, ...data }
      await putBibleEntry(entry)
      addEntry(entry)
    }
    setEditing(undefined)
  }

  async function handleDelete(entry: BibleEntry) {
    await deleteBibleEntry(entry.id)
    removeEntry(entry.id)
  }

  function openCreate(type: EntryType) {
    setEditing(undefined)
    setActiveType(type)
    setModalOpen(true)
  }

  function openEdit(entry: BibleEntry) {
    setEditing(entry)
    setActiveType(entry.type)
    setModalOpen(true)
  }

  return (
    <div className="flex h-full flex-col overflow-hidden p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">World Bible</h1>
          <p className="mt-1 text-sm text-zinc-500">The source of truth for your novel's canon.</p>
        </div>
        <button
          onClick={() => setExtractOpen(true)}
          className="shrink-0 rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:border-amber-500/50 hover:text-amber-400"
        >
          ✦ Extract from doc
        </button>
      </div>

      <Tabs defaultValue="character" className="flex flex-1 flex-col overflow-hidden">
        <TabsList className="mb-4 h-auto shrink-0 justify-start bg-zinc-900 p-1">
          {TABS.map(({ type, label }) => {
            const count = entries.filter((e) => e.type === type).length
            return (
              <TabsTrigger
                key={type}
                value={type}
                className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100"
              >
                {label}
                {count > 0 && (
                  <span className="ml-1.5 rounded-full bg-zinc-700 px-1.5 py-0.5 text-xs text-zinc-400">
                    {count}
                  </span>
                )}
              </TabsTrigger>
            )
          })}
        </TabsList>

        {TABS.map(({ type, label }) => {
          const filtered = entries.filter((e) => e.type === type)
          return (
            <TabsContent key={type} value={type} className="flex-1 overflow-y-auto">
              <div className="mb-4 flex justify-end">
                <button
                  onClick={() => openCreate(type)}
                  className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:border-amber-500/50 hover:text-amber-400"
                >
                  + Add {label.slice(0, -1)}
                </button>
              </div>

              {filtered.length === 0 ? (
                <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-zinc-800 text-zinc-600">
                  No {label.toLowerCase()} yet
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {filtered.map((entry) => (
                    <BibleEntryCard
                      key={entry.id}
                      entry={entry}
                      onEdit={() => openEdit(entry)}
                      onDelete={() => handleDelete(entry)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          )
        })}
      </Tabs>

      <BibleEntryModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(undefined) }}
        novelId={novelId}
        initial={editing}
        defaultType={activeType}
        onSave={handleSave}
      />

      <ExtractModal
        open={extractOpen}
        onClose={() => setExtractOpen(false)}
        novelId={novelId}
      />
    </div>
  )
}
