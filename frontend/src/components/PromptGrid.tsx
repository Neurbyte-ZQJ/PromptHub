import PromptCard from './PromptCard'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Prompt, PaginationInfo } from '@/api'

interface PromptGridProps {
  prompts: Prompt[]
  loading: boolean
  currentUserId?: number
  onCardClick: (prompt: Prompt) => void
  onDelete: (e: React.MouseEvent, id: number) => void
  onToggleFavorite: (e: React.MouseEvent, id: number) => void
  pagination: PaginationInfo
  onPageChange: (page: number) => void
}

export default function PromptGrid({
  prompts,
  loading,
  currentUserId,
  onCardClick,
  onDelete,
  onToggleFavorite,
  pagination,
  onPageChange,
}: PromptGridProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    )
  }

  if (prompts.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">没有找到匹配的提示词</p>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {prompts.map((prompt) => (
          <div key={prompt.id} onClick={() => onCardClick(prompt)}>
            <PromptCard
              prompt={prompt}
              onDelete={onDelete}
              onToggleFavorite={onToggleFavorite}
              currentUserId={currentUserId}
            />
          </div>
        ))}
      </div>
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 mt-6 border-t">
          <p className="text-sm text-muted-foreground">
            共 {pagination.totalCount} 条，第 {pagination.page}/{pagination.totalPages} 页
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              上一页
            </Button>
            <div className="flex items-center gap-1">
              {generatePageNumbers(pagination.page, pagination.totalPages).map((p, i) =>
                p === '...' ? (
                  <span key={`ellipsis-${i}`} className="px-2 text-sm text-muted-foreground">...</span>
                ) : (
                  <Button
                    key={p}
                    variant={p === pagination.page ? 'default' : 'outline'}
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => onPageChange(p as number)}
                  >
                    {p}
                  </Button>
                )
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
            >
              下一页
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function generatePageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  const pages: (number | '...')[] = [1]
  if (current > 3) pages.push('...')
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
}
