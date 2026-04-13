'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEditorStore } from '@/store/useEditorStore'
import { useChapterStore } from '@/store/useChapterStore'

interface Props {
  novelId: string
  onApply: (text: string) => void
}

type Action = 'tighten' | 'pacing' | 'sound_like_chapter'

const actions: { id: Action; label: string; description: string }[] = [
  { id: 'tighten', label: 'Tighten this', description: 'Remove wordiness, preserve voice' },
  { id: 'pacing', label: 'Check pacing', description: 'Analyze rhythm and flow' },
  { id: 'sound_like_chapter', label: 'Match voice to…', description: 'Sound more like another chapter' },
]

export default function AiRevisionPanel({ novelId, onApply }: Props) {
  const { aiPanelOpen, selectedText, closeAiPanel } = useEditorStore()
  const { chapters } = useChapterStore()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [refChapterId, setRefChapterId] = useState<string>('')

  async function runAction(action: Action) {
    if (!selectedText) return
    setLoading(true)
    setResult(null)
    setError(null)

    const refChapter = chapters.find((ch) => ch.id === refChapterId)

    try {
      const res = await fetch('/api/ai/revise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          selectedText,
          referenceChapterContent: refChapter?.content,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data.result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  function handleApply() {
    if (result) {
      onApply(result)
      setResult(null)
      closeAiPanel()
    }
  }

  return (
    <AnimatePresence>
      {aiPanelOpen && (
        <motion.aside
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="absolute right-0 top-0 z-50 flex h-full w-96 flex-col border-l border-zinc-800 bg-zinc-950 shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
            <span className="text-sm font-semibold text-amber-400">✦ AI Revision</span>
            <button onClick={closeAiPanel} className="text-zinc-500 hover:text-zinc-300">✕</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {selectedText ? (
              <div className="mb-4 rounded-md border border-zinc-800 bg-zinc-900 p-3">
                <p className="mb-1 text-xs text-zinc-500">Selected text</p>
                <p className="line-clamp-4 text-xs text-zinc-300">{selectedText}</p>
              </div>
            ) : (
              <p className="mb-4 text-sm text-zinc-500">Highlight text in the editor, then choose an action.</p>
            )}

            <div className="flex flex-col gap-2">
              {actions.map((action) => (
                <div key={action.id}>
                  {action.id === 'sound_like_chapter' && (
                    <select
                      value={refChapterId}
                      onChange={(e) => setRefChapterId(e.target.value)}
                      className="mb-2 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300"
                    >
                      <option value="">Pick a reference chapter…</option>
                      {chapters.map((ch) => (
                        <option key={ch.id} value={ch.id}>{ch.title}</option>
                      ))}
                    </select>
                  )}
                  <button
                    onClick={() => runAction(action.id)}
                    disabled={loading || !selectedText || (action.id === 'sound_like_chapter' && !refChapterId)}
                    className="w-full rounded-md border border-zinc-700 px-3 py-2.5 text-left transition-colors hover:border-amber-500/50 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <p className="text-sm font-medium text-zinc-200">{action.label}</p>
                    <p className="text-xs text-zinc-500">{action.description}</p>
                  </button>
                </div>
              ))}
            </div>

            {loading && (
              <div className="mt-6 flex justify-center">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-600 border-t-amber-400" />
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-md border border-red-900/50 bg-red-950/30 p-3">
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            {result && (
              <div className="mt-4 flex flex-col gap-2">
                <div className="rounded-md border border-zinc-700 bg-zinc-900 p-3">
                  <p className="mb-1 text-xs text-zinc-500">Result</p>
                  <p className="text-sm text-zinc-200 whitespace-pre-wrap">{result}</p>
                </div>
                <button
                  onClick={handleApply}
                  className="rounded-md bg-amber-500 px-3 py-2 text-sm font-medium text-zinc-950 hover:bg-amber-400"
                >
                  Apply to selection
                </button>
                <button
                  onClick={() => setResult(null)}
                  className="text-xs text-zinc-500 hover:text-zinc-300"
                >
                  Discard
                </button>
              </div>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
