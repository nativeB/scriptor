'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEditorStore } from '@/store/useEditorStore'
import type { SaveStatus } from '@/types'

interface Props {
  wordCount: number
  chapterTitle: string
  onTitleChange: (title: string) => void
  onAiOpen: () => void
  onScanOpen: () => void
}

function SaveIndicator({ status }: { status: SaveStatus }) {
  const label = status === 'saved' ? 'Saved' : status === 'saving' ? 'Saving…' : 'Unsaved'
  const color = status === 'saved' ? 'text-zinc-600' : status === 'saving' ? 'text-amber-500' : 'text-zinc-400'
  return <span className={`text-xs transition-colors ${color}`}>{label}</span>
}

export default function EditorToolbar({ wordCount, chapterTitle, onTitleChange, onAiOpen, onScanOpen }: Props) {
  const { saveStatus, isFullscreen, toggleFullscreen } = useEditorStore()

  return (
    <div className="flex items-center gap-3 border-b border-zinc-800 px-6 py-3">
      <input
        value={chapterTitle}
        onChange={(e) => onTitleChange(e.target.value)}
        className="flex-1 bg-transparent text-lg font-semibold text-zinc-100 outline-none placeholder:text-zinc-600"
        placeholder="Chapter title…"
      />
      <div className="flex items-center gap-3">
        <SaveIndicator status={saveStatus} />
        <motion.span
          key={wordCount}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
          className="text-xs text-zinc-600"
        >
          {wordCount.toLocaleString()} words
        </motion.span>
        <button
          onClick={onScanOpen}
          className="rounded-md border border-zinc-700 px-2.5 py-1 text-xs text-zinc-400 transition-colors hover:border-amber-500/50 hover:text-amber-400"
          title="Scan chapter for new bible entries"
        >
          ⟳ Scan
        </button>
        <button
          onClick={onAiOpen}
          className="rounded-md border border-zinc-700 px-2.5 py-1 text-xs text-zinc-400 transition-colors hover:border-amber-500/50 hover:text-amber-400"
        >
          ✦ AI
        </button>
        <button
          onClick={toggleFullscreen}
          className="rounded-md border border-zinc-700 px-2.5 py-1 text-xs text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200"
          title={isFullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen'}
        >
          {isFullscreen ? '⤡' : '⤢'}
        </button>
      </div>
    </div>
  )
}
