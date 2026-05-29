import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Category } from '@/api'

interface DeleteCategoryDialogProps {
  target: Category | null
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export default function DeleteCategoryDialog({ target, onOpenChange, onConfirm }: DeleteCategoryDialogProps) {
  return (
    <Dialog open={target !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>确认删除分类</DialogTitle>
          <DialogDescription>
            确定要删除分类「{target?.name}」吗？子分类将提升一级，该分类下的提示词将移至上级分类。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button variant='destructive' onClick={onConfirm}>
            确认删除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
