import { openDB, type IDBPDatabase } from 'idb'
import { DB_NAME, DB_VERSION, STORES } from './schema'

let db: IDBPDatabase | null = null

export async function getDB(): Promise<IDBPDatabase> {
  if (db) return db

  db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains(STORES.novels)) {
        database.createObjectStore(STORES.novels, { keyPath: 'id' })
      }

      if (!database.objectStoreNames.contains(STORES.chapters)) {
        const chaptersStore = database.createObjectStore(STORES.chapters, { keyPath: 'id' })
        chaptersStore.createIndex('by-novel', 'novelId')
        chaptersStore.createIndex('by-novel-order', ['novelId', 'order'])
      }

      if (!database.objectStoreNames.contains(STORES.bibleEntries)) {
        const bibleStore = database.createObjectStore(STORES.bibleEntries, { keyPath: 'id' })
        bibleStore.createIndex('by-novel', 'novelId')
        bibleStore.createIndex('by-novel-type', ['novelId', 'type'])
      }

      if (!database.objectStoreNames.contains(STORES.consistencyReports)) {
        database.createObjectStore(STORES.consistencyReports, { keyPath: 'id' })
      }
    },
  })

  return db
}
