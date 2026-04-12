import { getDB } from './client'
import { STORES } from './schema'
import type { BibleEntry } from '@/types'

export async function getBibleEntriesByNovel(novelId: string): Promise<BibleEntry[]> {
  const db = await getDB()
  const index = db.transaction(STORES.bibleEntries).store.index('by-novel')
  return index.getAll(novelId)
}

export async function putBibleEntry(entry: BibleEntry): Promise<void> {
  const db = await getDB()
  await db.put(STORES.bibleEntries, entry)
}

export async function putBibleEntries(entries: BibleEntry[]): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(STORES.bibleEntries, 'readwrite')
  await Promise.all([...entries.map((e) => tx.store.put(e)), tx.done])
}

export async function deleteBibleEntry(id: string): Promise<void> {
  const db = await getDB()
  await db.delete(STORES.bibleEntries, id)
}

export async function deleteBibleEntriesByNovel(novelId: string): Promise<void> {
  const entries = await getBibleEntriesByNovel(novelId)
  const db = await getDB()
  const tx = db.transaction(STORES.bibleEntries, 'readwrite')
  await Promise.all([...entries.map((e) => tx.store.delete(e.id)), tx.done])
}
