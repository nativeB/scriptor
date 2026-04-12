'use client'

import { useMemo } from 'react'
import { useBibleStore } from '@/store/useBibleStore'
import { escapeRegex } from '@/lib/utils'

export type TermMatch = {
  start: number
  end: number
  term: string
  description: string
}

export function useBibleTermHighlight(content: string): TermMatch[] {
  const { entries } = useBibleStore()

  return useMemo(() => {
    if (!content || entries.length === 0) return []

    const matches: TermMatch[] = []
    const seen = new Set<string>() // dedupe overlapping ranges

    for (const entry of entries) {
      const terms = [entry.name, ...entry.aliases].filter(Boolean)
      for (const term of terms) {
        if (!term) continue
        const regex = new RegExp(`\\b${escapeRegex(term)}\\b`, 'gi')
        let m: RegExpExecArray | null
        while ((m = regex.exec(content)) !== null) {
          const key = `${m.index}-${m.index + m[0].length}`
          if (!seen.has(key)) {
            seen.add(key)
            matches.push({
              start: m.index,
              end: m.index + m[0].length,
              term: m[0],
              description: entry.description,
            })
          }
        }
      }
    }

    return matches.sort((a, b) => a.start - b.start)
  }, [content, entries])
}
