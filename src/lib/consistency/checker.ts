import type { Chapter, BibleEntry, ConsistencyReport, ConsistencyIssue } from '@/types'
import { escapeRegex } from '@/lib/utils'

export function runConsistencyCheck(
  chapters: Chapter[],
  entries: BibleEntry[]
): ConsistencyReport {
  const novelId = chapters[0]?.novelId ?? ''

  // Build term → entry map (normalized lowercase)
  const termMap = new Map<string, BibleEntry>()
  for (const entry of entries) {
    const terms = [entry.name, ...entry.aliases].filter(Boolean)
    for (const t of terms) {
      termMap.set(t.toLowerCase(), entry)
    }
  }

  // Build chapterId → order map
  const orderMap = new Map<string, number>()
  for (const ch of chapters) {
    orderMap.set(ch.id, ch.order)
  }

  const issues: ConsistencyIssue[] = []
  const seen = new Set<string>() // dedupe by "chapterId:term:line"

  for (const chapter of chapters) {
    const lines = chapter.content.split('\n')

    for (const [term, entry] of termMap) {
      if (!entry.firstIntroducedChapterId) continue

      const introOrder = orderMap.get(entry.firstIntroducedChapterId)
      if (introOrder === undefined) continue

      // Only flag if this chapter comes BEFORE the intro chapter
      if (chapter.order >= introOrder) continue

      const regex = new RegExp(`\\b${escapeRegex(term)}\\b`, 'gi')

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        if (!regex.test(line)) continue
        regex.lastIndex = 0

        const key = `${chapter.id}:${term}:${i + 1}`
        if (seen.has(key)) continue
        seen.add(key)

        issues.push({
          type: 'premature_mention',
          term: entry.name, // canonical name
          chapterId: chapter.id,
          chapterTitle: chapter.title,
          line: i + 1,
          context: line.trim().slice(0, 120),
          bibleEntryId: entry.id,
        })
      }
    }
  }

  // Sort by chapter order, then line number
  issues.sort((a, b) => {
    const oa = orderMap.get(a.chapterId) ?? 0
    const ob = orderMap.get(b.chapterId) ?? 0
    return oa !== ob ? oa - ob : a.line - b.line
  })

  return { novelId, generatedAt: Date.now(), issues }
}
