import type { BibleEntry } from '@/types'

export const ENTRY_TYPE_ORDER: BibleEntry['type'][] = ['character', 'location', 'faction', 'term']

export const ENTRY_TYPE_COLORS: Record<BibleEntry['type'], string> = {
  character: 'text-blue-400',
  location: 'text-green-400',
  term: 'text-purple-400',
  faction: 'text-orange-400',
}

export const ENTRY_CARD_COLORS: Record<BibleEntry['type'], string> = {
  character: 'bg-blue-900/40 text-blue-300 border-blue-800',
  location: 'bg-green-900/40 text-green-300 border-green-800',
  term: 'bg-purple-900/40 text-purple-300 border-purple-800',
  faction: 'bg-orange-900/40 text-orange-300 border-orange-800',
}
