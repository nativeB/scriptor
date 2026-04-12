'use client'

import { useRef, useEffect } from 'react'
import type { TermMatch } from '@/hooks/useBibleTermHighlight'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface Props {
  content: string
  matches: TermMatch[]
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
}

export default function BibleTermHighlighter({ content, matches, textareaRef }: Props) {
  const mirrorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const textarea = textareaRef.current
    const mirror = mirrorRef.current
    if (!textarea || !mirror) return

    function syncScroll() {
      if (mirror) mirror.scrollTop = textarea!.scrollTop
    }

    textarea.addEventListener('scroll', syncScroll)
    return () => textarea.removeEventListener('scroll', syncScroll)
  }, [textareaRef])

  if (matches.length === 0) return null

  // Build segments of the content interleaved with highlighted spans
  const segments: React.ReactNode[] = []
  let cursor = 0

  for (const match of matches) {
    if (match.start > cursor) {
      segments.push(
        <span key={`text-${cursor}`} className="text-transparent">
          {content.slice(cursor, match.start)}
        </span>
      )
    }
    segments.push(
      <Tooltip key={`match-${match.start}`}>
        <TooltipTrigger>
          <span className="border-b border-amber-400/60 text-transparent">
            {content.slice(match.start, match.end)}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="font-semibold text-amber-400">{match.term}</p>
          <p className="mt-0.5 text-xs text-zinc-300">{match.description}</p>
        </TooltipContent>
      </Tooltip>
    )
    cursor = match.end
  }

  if (cursor < content.length) {
    segments.push(
      <span key={`text-end`} className="text-transparent">
        {content.slice(cursor)}
      </span>
    )
  }

  return (
    <div
      ref={mirrorRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap wrap-break-word px-6 py-4 font-(--font-geist-mono) text-sm leading-7 text-transparent"
      style={{ wordWrap: 'break-word' }}
    >
      {segments}
    </div>
  )
}
