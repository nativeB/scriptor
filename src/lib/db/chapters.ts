import { getDB } from './client'
import { STORES } from './schema'
import type { Chapter } from '@/types'

export async function getChaptersByNovel(novelId: string): Promise<Chapter[]> {
  const db = await getDB()
  const index = db.transaction(STORES.chapters).store.index('by-novel-order')
  const range = IDBKeyRange.bound([novelId, 0], [novelId, Infinity])
  return index.getAll(range)
}

export async function getChapter(id: string): Promise<Chapter | undefined> {
  const db = await getDB()
  return db.get(STORES.chapters, id)
}

export async function putChapter(chapter: Chapter): Promise<void> {
  const db = await getDB()
  await db.put(STORES.chapters, chapter)
}

export async function putChapters(chapters: Chapter[]): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(STORES.chapters, 'readwrite')
  await Promise.all([...chapters.map((ch) => tx.store.put(ch)), tx.done])
}

export async function deleteChapter(id: string): Promise<void> {
  const db = await getDB()
  await db.delete(STORES.chapters, id)
}

export async function deleteChaptersByNovel(novelId: string): Promise<void> {
  const chapters = await getChaptersByNovel(novelId)
  const db = await getDB()
  const tx = db.transaction(STORES.chapters, 'readwrite')
  await Promise.all([...chapters.map((ch) => tx.store.delete(ch.id)), tx.done])
}
