export type Novel = {
  id: string
  title: string
  createdAt: number
  updatedAt: number
}

export type Chapter = {
  id: string
  novelId: string
  order: number
  title: string
  content: string
  wordCount: number
  updatedAt: number
}

export type BibleEntry = {
  id: string
  novelId: string
  type: 'character' | 'location' | 'term' | 'faction'
  name: string
  aliases: string[]
  description: string
  firstIntroducedChapterId: string | null
}

export type ConsistencyIssue = {
  type: 'premature_mention' | 'unknown_term'
  term: string
  chapterId: string
  chapterTitle: string
  line: number
  context: string
  bibleEntryId: string | null
}

export type ConsistencyReport = {
  novelId: string
  generatedAt: number
  issues: ConsistencyIssue[]
}

export type BackupFile = {
  version: 1
  exportedAt: number
  novel: Novel
  chapters: Chapter[]
  bibleEntries: BibleEntry[]
}

export type SaveStatus = 'saved' | 'saving' | 'unsaved'

export type ExtractedEntry = {
  type: BibleEntry['type']
  name: string
  aliases: string[]
  description: string
}

export type CandidateEntry = ExtractedEntry & {
  _key: string
  accepted: boolean
  isDuplicate: boolean
}
