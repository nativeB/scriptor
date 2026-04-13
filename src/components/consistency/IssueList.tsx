'use client'

import { motion } from 'framer-motion'
import { useRouter, useParams } from 'next/navigation'
import type { ConsistencyIssue } from '@/types'

interface Props {
  issues: ConsistencyIssue[]
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
}

export default function IssueList({ issues }: Props) {
  const router = useRouter()
  const params = useParams()
  const novelId = params.novelId as string

  if (issues.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-2 py-12 text-zinc-500"
      >
        <span className="text-3xl">✓</span>
        <p className="text-sm">No consistency issues found.</p>
      </motion.div>
    )
  }

  function goToIssue(issue: ConsistencyIssue) {
    router.push(`/novel/${novelId}/chapter/${issue.chapterId}?highlightLine=${issue.line}`)
  }

  return (
    <motion.ul
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-2"
    >
      {issues.map((issue, i) => (
        <motion.li key={i} variants={itemVariants}>
          <button
            onClick={() => goToIssue(issue)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-left transition-colors hover:border-amber-500/30 hover:bg-zinc-800"
          >
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded-full bg-red-950/60 px-2 py-0.5 text-xs font-medium text-red-400">
                premature mention
              </span>
              <span className="text-sm font-semibold text-amber-400">"{issue.term}"</span>
            </div>
            <p className="text-xs text-zinc-500">
              {issue.chapterTitle} · line {issue.line}
            </p>
            <p className="mt-1.5 truncate text-xs text-zinc-400 italic">"{issue.context}"</p>
          </button>
        </motion.li>
      ))}
    </motion.ul>
  )
}
