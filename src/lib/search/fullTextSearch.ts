import type { Chapter } from '@/types'

export type SearchResult = {
  chapterId: string
  chapterTitle: string
  chapterOrder: number
  line: number
  context: string
}

export function fullTextSearch(query: string, chapters: Chapter[]): SearchResult[] {
  if (!query.trim()) return []

  const results: SearchResult[] = []
  const lowerQuery = query.toLowerCase()

  for (const chapter of chapters) {
    const lines = chapter.content.split('\n')
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(lowerQuery)) {
        const matchIndex = lines[i].toLowerCase().indexOf(lowerQuery)
        const start = Math.max(0, matchIndex - 30)
        const end = Math.min(lines[i].length, matchIndex + query.length + 50)
        const context = (start > 0 ? '…' : '') + lines[i].slice(start, end) + (end < lines[i].length ? '…' : '')

        results.push({
          chapterId: chapter.id,
          chapterTitle: chapter.title,
          chapterOrder: chapter.order,
          line: i + 1,
          context,
        })
      }
    }
  }

  return results
}
