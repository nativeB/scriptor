'use client'

import { useState, useMemo } from 'react'
import { useChapterStore } from '@/store/useChapterStore'
import { fullTextSearch } from '@/lib/search/fullTextSearch'
import { debounce } from '@/lib/utils'
import SearchResultItem from './SearchResultItem'

export default function SearchPage() {
  const { chapters } = useChapterStore()
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  const debouncedSet = useMemo(() => debounce(setDebouncedQuery, 200), [])

  function handleChange(val: string) {
    setQuery(val)
    debouncedSet(val)
  }

  const results = useMemo(
    () => fullTextSearch(debouncedQuery, chapters),
    [debouncedQuery, chapters]
  )

  return (
    <div className="flex h-full flex-col overflow-hidden p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">Search</h1>
        <p className="mt-1 text-sm text-zinc-500">Full-text search across all chapters.</p>
      </div>

      <div className="mb-4">
        <input
          autoFocus
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Search chapters…"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none transition-colors focus:border-amber-500/50 placeholder:text-zinc-600"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {query && results.length === 0 && (
          <div className="flex h-32 items-center justify-center text-sm text-zinc-600">
            No results for "{query}"
          </div>
        )}

        {!query && (
          <div className="flex h-32 items-center justify-center text-sm text-zinc-700">
            Type to search
          </div>
        )}

        {results.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="mb-2 text-xs text-zinc-600">
              {results.length} result{results.length !== 1 ? 's' : ''}
            </p>
            {results.map((result, i) => (
              <SearchResultItem key={i} result={result} query={debouncedQuery} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
