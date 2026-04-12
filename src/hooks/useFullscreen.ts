'use client'

import { useEffect } from 'react'
import { useEditorStore } from '@/store/useEditorStore'

export function useFullscreen() {
  const { isFullscreen, toggleFullscreen } = useEditorStore()

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && isFullscreen) toggleFullscreen()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isFullscreen, toggleFullscreen])

  return { isFullscreen }
}
