'use client'

import { useState, useCallback, useEffect } from 'react'
import { useEditorStore } from '@/store/useEditorStore'
import { useChapterStore } from '@/store/useChapterStore'
import { useAutoSave } from '@/hooks/useAutoSave'
import { useFullscreen } from '@/hooks/useFullscreen'
import { putChapter } from '@/lib/db/chapters'
import { debounce } from '@/lib/utils'
import { cn } from '@/lib/utils'
import EditorToolbar from './EditorToolbar'
import MarkdownTextarea from './MarkdownTextarea'
import AiRevisionPanel from './AiRevisionPanel'
import ChapterScanPanel from './ChapterScanPanel'

interface Props {
  chapterId: string
  novelId: string
  highlightLine?: number
}

export default function ChapterEditor({ chapterId, novelId, highlightLine }: Props) {
  const { chapters, updateChapter } = useChapterStore()
  const { openAiPanel, selectedText, selectedRange } = useEditorStore()
  const { isFullscreen: fullscreen } = useFullscreen()

  const chapter = chapters.find((ch) => ch.id === chapterId)
  const [content, setContent] = useState(chapter?.content ?? '')
  const [title, setTitle] = useState(chapter?.title ?? '')
  const [scanOpen, setScanOpen] = useState(false)

  useEffect(() => {
    if (chapter) {
      setContent(chapter.content)
      setTitle(chapter.title)
    }
  }, [chapterId])

  const { onChange: onContentChange } = useAutoSave(chapterId)

  function handleContentChange(val: string) {
    setContent(val)
    onContentChange(val)
  }

  const saveTitle = useCallback(
    debounce(async (newTitle: string) => {
      if (!chapter) return
      const updated = { ...chapter, title: newTitle, updatedAt: Date.now() }
      updateChapter(chapterId, { title: newTitle, updatedAt: updated.updatedAt })
      await putChapter(updated)
    }, 800),
    [chapter, chapterId, updateChapter]
  )

  function handleTitleChange(val: string) {
    setTitle(val)
    saveTitle(val)
  }

  // Cmd+S force-save
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        onContentChange(content)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [content, onContentChange])

  function handleSelectionChange(text: string, start: number, end: number) {
    openAiPanel(text, { start, end })
  }

  function handleAiApply(result: string) {
    if (!selectedRange) return
    const newContent =
      content.slice(0, selectedRange.start) + result + content.slice(selectedRange.end)
    handleContentChange(newContent)
  }

  const wordCount = content.trim() === '' ? 0 : content.trim().split(/\s+/).length

  if (!chapter) {
    return (
      <div className="flex h-full items-center justify-center text-zinc-600">
        Chapter not found.
      </div>
    )
  }

  return (
    <div className={cn('relative flex flex-1 flex-col overflow-hidden', fullscreen && 'fixed inset-0 z-40 bg-zinc-950')}>
      <EditorToolbar
        wordCount={wordCount}
        chapterTitle={title}
        onTitleChange={handleTitleChange}
        onAiOpen={() => openAiPanel(selectedText || '', selectedRange ?? { start: 0, end: 0 })}
        onScanOpen={() => setScanOpen(true)}
      />
      <div className="relative flex flex-1 overflow-hidden">
        <MarkdownTextarea
          content={content}
          onChange={handleContentChange}
          onSelectionChange={handleSelectionChange}
          highlightLine={highlightLine}
        />
        <AiRevisionPanel novelId={novelId} onApply={handleAiApply} />
        <ChapterScanPanel
          open={scanOpen}
          onClose={() => setScanOpen(false)}
          chapterId={chapterId}
          chapterTitle={title}
          chapterContent={content}
          novelId={novelId}
        />
      </div>
    </div>
  )
}
