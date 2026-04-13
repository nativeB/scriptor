'use client'

import { useRouter, useParams } from 'next/navigation'
import type { SearchResult } from '@/lib/search/fullTextSearch'

interface Props {
  result: SearchResult
  query: string
}

export default function SearchResultItem({ result, query }: Props) {
  const router = useRouter()
  const params = useParams()
  const novelId = params.novelId as string

  function handleClick() {
    router.push(`/novel/${novelId}/chapter/${result.chapterId}?highlightLine=${result.line}`)
  }

  // Highlight the matched query in context
  const lowerContext = result.context.toLowerCase()
  const matchIdx = lowerContext.indexOf(query.toLowerCase())

  let contextNode: React.ReactNode = result.context
  if (matchIdx >= 0) {
    contextNode = (
      <>
        {result.context.slice(0, matchIdx)}
        <mark className="bg-amber-500/30 text-amber-300 rounded-sm px-0.5">
          {result.context.slice(matchIdx, matchIdx + query.length)}
        </mark>
        {result.context.slice(matchIdx + query.length)}
      </>
    )
  }

  return (
    <button
      onClick={handleClick}
      className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-left transition-colors hover:border-zinc-700 hover:bg-zinc-800"
    >
      <div className="mb-1 flex items-center gap-2">
        <span className="text-sm font-medium text-zinc-300">{result.chapterTitle}</span>
        <span className="text-xs text-zinc-600">line {result.line}</span>
      </div>
      <p className="text-xs text-zinc-500 font-mono">{contextNode}</p>
    </button>
  )
}
