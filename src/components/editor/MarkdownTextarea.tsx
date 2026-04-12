'use client'

import { useRef, useCallback } from 'react'
import { useBibleTermHighlight } from '@/hooks/useBibleTermHighlight'
import BibleTermHighlighter from './BibleTermHighlighter'

interface Props {
  content: string
  onChange: (value: string) => void
  onSelectionChange: (text: string, start: number, end: number) => void
  highlightLine?: number
}

export default function MarkdownTextarea({ content, onChange, onSelectionChange, highlightLine }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const matches = useBibleTermHighlight(content)

  const handleSelect = useCallback(() => {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    if (start !== end) {
      onSelectionChange(ta.value.slice(start, end), start, end)
    }
  }, [onSelectionChange])

  return (
    <div className="relative flex-1 overflow-hidden">
      <BibleTermHighlighter
        content={content}
        matches={matches}
        textareaRef={textareaRef}
      />
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => onChange(e.target.value)}
        onSelect={handleSelect}
        onMouseUp={handleSelect}
        onKeyUp={handleSelect}
        spellCheck
        className="absolute inset-0 h-full w-full resize-none bg-transparent px-6 py-4 font-[var(--font-geist-mono)] text-sm leading-7 text-zinc-200 outline-none placeholder:text-zinc-700 [caret-color:theme(colors.amber.400)]"
        placeholder="Begin writing…"
      />
    </div>
  )
}
