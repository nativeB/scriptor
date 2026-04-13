'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChapterStore } from '@/store/useChapterStore'
import { useBibleStore } from '@/store/useBibleStore'
import { useConsistencyStore } from '@/store/useConsistencyStore'
import { putConsistencyReport } from '@/lib/db/consistency'
import { runConsistencyCheck } from '@/lib/consistency/checker'
import { Button } from '@/components/ui/button'
import ScanAnimation from './ScanAnimation'
import IssueList from './IssueList'

interface Props {
  novelId: string
}

type Phase = 'idle' | 'scanning' | 'done'

export default function ConsistencyChecker({ novelId }: Props) {
  const { chapters } = useChapterStore()
  const { entries } = useBibleStore()
  const { reports, setReport } = useConsistencyStore()
  const [phase, setPhase] = useState<Phase>('idle')

  const report = reports[novelId]

  // Aggregate lines from all chapters for the scan animation preview
  const allLines = chapters.flatMap((ch) => ch.content.split('\n')).slice(0, 40)

  function handleScanComplete() {
    const result = runConsistencyCheck(chapters, entries)
    setReport(novelId, result)
    putConsistencyReport(result)
    setPhase('done')
  }

  function handleCheck() {
    setPhase('scanning')
  }

  function handleRecheck() {
    setPhase('scanning')
  }

  return (
    <div className="flex h-full flex-col overflow-hidden p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Consistency Check</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Scans for terms appearing before they're introduced in the world bible.
          </p>
        </div>
        <div className="flex gap-2">
          {phase === 'done' && (
            <Button
              variant="outline"
              onClick={handleRecheck}
              className="border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
            >
              Re-check
            </Button>
          )}
          {phase === 'idle' && (
            <Button onClick={handleCheck} className="bg-amber-500 text-zinc-950 hover:bg-amber-400">
              Check consistency
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {phase === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-48 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-800 text-zinc-600"
            >
              <span>
                Will scan {chapters.length} chapter{chapters.length !== 1 ? 's' : ''} against {entries.filter(e => e.firstIntroducedChapterId).length} tracked bible entries.
              </span>
              {entries.filter(e => e.firstIntroducedChapterId).length === 0 && (
                <span className="text-xs text-zinc-700">
                  Add entries to your world bible with "First introduced in" set to enable checking.
                </span>
              )}
            </motion.div>
          )}

          {phase === 'scanning' && (
            <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ScanAnimation lines={allLines} onComplete={handleScanComplete} />
            </motion.div>
          )}

          {phase === 'done' && report && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="text-sm text-zinc-500">
                  {report.issues.length === 0
                    ? 'No issues found'
                    : `${report.issues.length} issue${report.issues.length !== 1 ? 's' : ''} found`}
                </span>
                <span className="text-xs text-zinc-700">
                  · {chapters.length} chapter{chapters.length !== 1 ? 's' : ''} scanned · {new Date(report.generatedAt).toLocaleTimeString()}
                </span>
              </div>
              <IssueList issues={report.issues} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
