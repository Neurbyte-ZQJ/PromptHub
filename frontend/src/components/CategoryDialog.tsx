import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useApi } from '@/hooks/useApi'
import { useToast } from '@/components/ui/toast'
import type { Category, CategoryFormData } from '@/api'

interface CategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingCategory: Category | null
  parentId: number | null
  onSuccess: () => void
}

export default function CategoryDialog({
  open,
  onOpenChange,
  editingCategory,
  parentId,
  onSuccess,
}: CategoryDialogProps) {
  const [form, setForm] = useState<CategoryFormData>({ name: '' })
  const { createCategory, updateCategory } = useApi()
  const { addToast } = useToast()

  useEffect(() => {
    if (open) {
      if (editingCategory) {
        setForm({ name: editingCategory.name, parent_id: editingCategory.parent_id ?? undefined })
      } else {
        setForm({ name: '', parent_id: parentId ?? undefined })
      }
    }
  }, [open, editingCategory, parentId])

  const handleSubmit = async () => {
    if (!form.name.trim()) return
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, { name: form.name.trim() })
        addToast({ message: '分类已更新', type: 'success' })
      } else {
        await createCategory({
          name: form.name.trim(),
          parent_id: parentId ?? undefined,
        })
        addToast({ message: '分类已创建', type: 'success' })
      }
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error('Failed to save category:', error)
      addToast({ message: '保存分类失败', type: 'error' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingCategory ? '编辑分类' : '新建分类'}</DialogTitle>
          <DialogDescription>
            {parentId ? '在当前分类下创建子分类' : editingCategory ? '修改分类名称' : '创建新的顶级分类'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="category-name">分类名称</Label>
            <Input
              id="category-name"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="请输入分类名称"
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={!form.name.trim()}>
            {editingCategory ? '保存' : '创建'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
