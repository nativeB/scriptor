import { getDB } from './client'
import { STORES } from './schema'
import type { Novel } from '@/types'

export async function getAllNovels(): Promise<Novel[]> {
  const db = await getDB()
  return db.getAll(STORES.novels)
}

export async function getNovel(id: string): Promise<Novel | undefined> {
  const db = await getDB()
  return db.get(STORES.novels, id)
}

export async function putNovel(novel: Novel): Promise<void> {
  const db = await getDB()
  await db.put(STORES.novels, novel)
}

export async function deleteNovel(id: string): Promise<void> {
  const db = await getDB()
  await db.delete(STORES.novels, id)
}
