import { useCallback } from 'react'
import { useApi } from '@/hooks/useApi'
import { useToast } from '@/components/ui/toast'
import type { Prompt } from '@/api'

export function useFavoriteToggle(
  prompts: Prompt[],
  setPrompts: React.Dispatch<React.SetStateAction<Prompt[]>>,
  onSuccess?: () => void
) {
  const { toggleFavorite } = useApi()
  const { addToast } = useToast()

  const toggleFavoriteById = useCallback(async (promptId: number) => {
    const prompt = prompts.find(p => p.id === promptId)
    if (!prompt) return
    const wasFavorited = prompt.is_favorited
    try {
      await toggleFavorite(promptId)
      setPrompts(prev => prev.map(p => {
        if (p.id === promptId) {
          return {
            ...p,
            is_favorited: !wasFavorited,
            favorite_count: wasFavorited ? p.favorite_count - 1 : p.favorite_count + 1,
          }
        }
        return p
      }))
      addToast({
        message: wasFavorited ? '已取消收藏' : '已收藏',
        type: 'success',
      })
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
      addToast({ message: '收藏操作失败', type: 'error' })
    }
  }, [prompts, toggleFavorite, setPrompts, addToast, onSuccess])

  return { toggleFavoriteById }
}
