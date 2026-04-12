'use client'

import { useCallback, useRef } from 'react'
import { putChapter } from '@/lib/db/chapters'
import { useChapterStore } from '@/store/useChapterStore'
import { useEditorStore } from '@/store/useEditorStore'
import { debounce, countWords } from '@/lib/utils'
import type { Chapter } from '@/types'

export function useAutoSave(chapterId: string) {
  const { updateChapter } = useChapterStore()
  const { setSaveStatus } = useEditorStore()

  const save = useCallback(
    async (content: string) => {
      setSaveStatus('saving')
      const patch: Partial<Chapter> = {
        content,
        wordCount: countWords(content),
        updatedAt: Date.now(),
      }
      updateChapter(chapterId, patch)
      const chapter = useChapterStore.getState().chapters.find((ch) => ch.id === chapterId)
      if (chapter) await putChapter({ ...chapter, ...patch })
      setSaveStatus('saved')
    },
    [chapterId, updateChapter, setSaveStatus]
  )

  const debouncedSave = useRef(debounce(save, 800)).current

  return {
    onChange(content: string) {
      setSaveStatus('unsaved')
      debouncedSave(content)
    },
  }
}
