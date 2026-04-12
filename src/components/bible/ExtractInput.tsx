'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'

const MAX_CHARS = 20000
const WARN_CHARS = 18000

interface Props {
  onExtract: (text: string) => void
  loading: boolean
  error: string | null
}

export default function ExtractInput({ onExtract, loading, error }: Props) {
  const [text, setText] = useState('')
  const [truncated, setTruncated] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      if (result.length > MAX_CHARS) {
        setText(result.slice(0, MAX_CHARS))
        setTruncated(true)
      } else {
        setText(result)
        setTruncated(false)
      }
    }
    reader.readAsText(file)
    if (e.target) e.target.value = ''
  }

  function handleTextChange(val: string) {
    setText(val.slice(0, MAX_CHARS))
    setTruncated(val.length > MAX_CHARS)
  }

  const charCount = text.length
  const counterColor =
    charCount >= MAX_CHARS
      ? 'text-red-400'
      : charCount >= WARN_CHARS
      ? 'text-amber-400'
      : 'text-zinc-600'

  return (
    <div className="flex flex-col gap-4">
      <textarea
        value={text}
        onChange={(e) => handleTextChange(e.target.value)}
        rows={12}
        className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-200 outline-none transition-colors focus:border-amber-500/50 placeholder:text-zinc-600"
        placeholder="Paste your novel outline, master document, or notes here…"
      />

      <div className="flex items-center justify-between">
        <label className="cursor-pointer rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200">
          Upload .txt / .md
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.md"
            className="sr-only"
            onChange={handleFileChange}
          />
        </label>
        <span className={`text-xs tabular-nums ${counterColor}`}>
          {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
        </span>
      </div>

      {truncated && (
        <p className="text-xs text-amber-400">
          File was truncated to 20,000 characters.
        </p>
      )}

      {error && (
        <div className="rounded-md border border-red-900/50 bg-red-950/30 p-3">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      <Button
        onClick={() => onExtract(text)}
        disabled={loading || text.trim().length === 0}
        className="w-full bg-amber-500 text-zinc-950 hover:bg-amber-400 disabled:opacity-40"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-950" />
            Extracting…
          </span>
        ) : (
          'Extract entries'
        )}
      </Button>
    </div>
  )
}
