'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import BibleEntryForm from './BibleEntryForm'
import type { BibleEntry } from '@/types'

interface Props {
  open: boolean
  onClose: () => void
  novelId: string
  initial?: BibleEntry
  defaultType?: BibleEntry['type']
  onSave: (data: Omit<BibleEntry, 'id' | 'novelId'>) => void
}

export default function BibleEntryModal({ open, onClose, novelId, initial, defaultType, onSave }: Props) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="border-zinc-800 bg-zinc-950 text-zinc-100 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">{initial ? 'Edit Entry' : 'New Entry'}</DialogTitle>
        </DialogHeader>
        <BibleEntryForm
          novelId={novelId}
          initial={initial}
          defaultType={defaultType}
          onSave={(data) => {
            onSave(data)
            onClose()
          }}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  )
}
