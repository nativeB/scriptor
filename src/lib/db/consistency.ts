import { getDB } from './client'
import { STORES } from './schema'
import type { ConsistencyReport } from '@/types'

type StoredReport = ConsistencyReport & { id: string }

export async function getConsistencyReport(novelId: string): Promise<ConsistencyReport | undefined> {
  const db = await getDB()
  const stored = await db.get(STORES.consistencyReports, novelId) as StoredReport | undefined
  return stored
}

export async function putConsistencyReport(report: ConsistencyReport): Promise<void> {
  const db = await getDB()
  const stored: StoredReport = { ...report, id: report.novelId }
  await db.put(STORES.consistencyReports, stored)
}

export async function deleteConsistencyReport(novelId: string): Promise<void> {
  const db = await getDB()
  await db.delete(STORES.consistencyReports, novelId)
}
