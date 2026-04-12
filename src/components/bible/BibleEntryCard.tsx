'use client'

import { motion } from 'framer-motion'
import { useChapterStore } from '@/store/useChapterStore'
import type { BibleEntry } from '@/types'
import { ENTRY_CARD_COLORS } from '@/lib/bible-constants'

interface Props {
  entry: BibleEntry
  onEdit: () => void
  onDelete: () => void
}

export default function BibleEntryCard({ entry, onEdit, onDelete }: Props) {
  const { chapters } = useChapterStore()
  const introChapter = chapters.find((ch) => ch.id === entry.firstIntroducedChapterId)

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.1 }}
      className="group rounded-lg border border-zinc-800 bg-zinc-900 p-4"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-zinc-100">{entry.name}</h3>
            <span className={`rounded-full border px-2 py-0.5 text-xs ${ENTRY_CARD_COLORS[entry.type]}`}>
              {entry.type}
            </span>
          </div>
          {entry.aliases.length > 0 && (
            <p className="mt-0.5 text-xs text-zinc-500">aka {entry.aliases.join(', ')}</p>
          )}
        </div>
        <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={onEdit}
            className="rounded px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="rounded px-2 py-1 text-xs text-zinc-600 hover:bg-red-950/40 hover:text-red-400"
          >
            Del
          </button>
        </div>
      </div>

      {entry.description && (
        <p className="text-sm text-zinc-400">{entry.description}</p>
      )}

      <div className="mt-2 text-xs text-zinc-600">
        {introChapter ? `First in: ${introChapter.title}` : 'Not yet introduced'}
      </div>
    </motion.div>
  )
}
