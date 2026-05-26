
import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, LogOut, User, Download, Upload } from 'lucide-react'
import Sidebar from './Sidebar'
import PromptCard from './PromptCard'
import PromptForm from './PromptForm'
import PromptDetail from './PromptDetail'
import { useAuth } from '@/contexts/AuthContext'
import { useApi } from '@/hooks/useApi'
import { useToast } from '@/components/ui/toast'
import type { Prompt, Tag, Category, CategoryFormData } from '@/api'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

export default function Layout() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null)
  const [detailPromptId, setDetailPromptId] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Prompt | null>(null)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  // 分类对话框状态
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryForm, setCategoryForm] = useState<CategoryFormData>({ name: '' })
  const [categoryParentId, setCategoryParentId] = useState<number | null>(null)
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState<Category | null>(null)

  // 导入对话框状态
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)

  const { user, logout } = useAuth()
  const { getPrompts, getTags, getCategories, createCategory, updateCategory, deleteCategory, deletePrompt, toggleFavorite, exportPrompts, downloadImportTemplate, importPrompts } = useApi()
  const { addToast } = useToast()

  const fetchData = useCallback(async () => {
    try {
      const [promptsData, tagsData, categoriesData] = await Promise.all([
        getPrompts(),
        getTags(),
        getCategories(),
      ])
      setPrompts(promptsData)
      setTags(tagsData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }, [getPrompts, getTags, getCategories])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredPrompts = prompts.filter((prompt) => {
    const matchesTag = selectedTagId === null
      ? true
      : prompt.tags.some((tag) => tag.id === selectedTagId)
    const matchesCategory = selectedCategoryId === null
      ? true
      : prompt.categories.some((cat) => cat.id === selectedCategoryId)
    const matchesSearch = searchQuery === ''
      ? true
      : prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFavorite = showFavoritesOnly ? prompt.is_favorited : true
    return matchesTag && matchesCategory && matchesSearch && matchesFavorite
  })

  const handleOpenCreate = () => {
    setEditingPrompt(null)
    setIsFormOpen(true)
  }

  const handleOpenDetail = (prompt: Prompt) => {
    setDetailPromptId(prompt.id)
    setIsDetailOpen(true)
  }

  const handleCloseDetail = () => {
    setIsDetailOpen(false)
    setDetailPromptId(null)
  }

  const handleOpenEditFromDetail = () => {
    const prompt = prompts.find((p) => p.id === detailPromptId)
    if (prompt) {
      setEditingPrompt(prompt)
      setIsDetailOpen(false)
      setIsFormOpen(true)
    }
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingPrompt(null)
  }

  const handleFormSuccess = () => {
    fetchData()
  }

  const handleDelete = async (id: number) => {
    try {
      await deletePrompt(id)
      fetchData()
    } catch (error) {
      console.error('Failed to delete prompt:', error)
    }
  }

  const handleCardDelete = (e: React.MouseEvent, prompt: Prompt) => {
    e.stopPropagation()
    setDeleteTarget(prompt)
  }

  const handleConfirmDelete = async () => {
    if (deleteTarget) {
      await handleDelete(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  const handleToggleFavorite = async (e: React.MouseEvent, promptId: number) => {
    e.stopPropagation()
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
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
      addToast({ message: '收藏操作失败', type: 'error' })
    }
  }

  const handleToggleFavoriteDetail = async (promptId: number) => {
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
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
      addToast({ message: '收藏操作失败', type: 'error' })
    }
  }

  // 分类操作
  const handleCreateCategory = (parentId?: number | null) => {
    setEditingCategory(null)
    setCategoryParentId(parentId ?? null)
    setCategoryForm({ name: '', parent_id: parentId ?? undefined })
    setCategoryDialogOpen(true)
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setCategoryParentId(category.parent_id)
    setCategoryForm({ name: category.name, parent_id: category.parent_id ?? undefined })
    setCategoryDialogOpen(true)
  }

  const handleDeleteCategoryConfirm = async () => {
    if (!deleteCategoryTarget) return
    try {
      await deleteCategory(deleteCategoryTarget.id)
      addToast({ message: '分类已删除', type: 'success' })
      fetchData()
    } catch (error) {
      console.error('Failed to delete category:', error)
      addToast({ message: '删除分类失败', type: 'error' })
    }
    setDeleteCategoryTarget(null)
  }

  const handleCategoryFormSubmit = async () => {
    if (!categoryForm.name.trim()) return
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, { name: categoryForm.name.trim() })
        addToast({ message: '分类已更新', type: 'success' })
      } else {
        await createCategory({
          name: categoryForm.name.trim(),
          parent_id: categoryParentId ?? undefined,
        })
        addToast({ message: '分类已创建', type: 'success' })
      }
      setCategoryDialogOpen(false)
      fetchData()
    } catch (error) {
      console.error('Failed to save category:', error)
      addToast({ message: '保存分类失败', type: 'error' })
    }
  }

  const handleExport = async () => {
    try {
      const blob = await exportPrompts()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'prompts_export.xlsx'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      addToast({ message: '导出成功', type: 'success' })
    } catch (error) {
      console.error('Failed to export prompts:', error)
      addToast({ message: '导出失败', type: 'error' })
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      const blob = await downloadImportTemplate()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'prompts_import_template.xlsx'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download template:', error)
      addToast({ message: '下载模板失败', type: 'error' })
    }
  }

  const handleImport = async () => {
    if (!importFile) return
    setImporting(true)
    try {
      const result = await importPrompts(importFile)
      setImportDialogOpen(false)
      setImportFile(null)
      fetchData()
      addToast({
        message: `导入完成：成功 ${result.imported} 条，跳过 ${result.skipped} 条`,
        type: 'success',
      })
    } catch (error) {
      console.error('Failed to import prompts:', error)
      addToast({ message: (error as Error).message || '导入失败', type: 'error' })
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        tags={tags}
        categories={categories}
        selectedTagId={selectedTagId}
        onTagSelect={setSelectedTagId}
        selectedCategoryId={selectedCategoryId}
        onCategorySelect={setSelectedCategoryId}
        showFavoritesOnly={showFavoritesOnly}
        onToggleFavorites={() => setShowFavoritesOnly(prev => !prev)}
        onCreateCategory={handleCreateCategory}
        onEditCategory={handleEditCategory}
        onDeleteCategory={setDeleteCategoryTarget}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="p-6 border-b flex items-center gap-4 justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索提示词..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={handleOpenCreate}>
              <Plus className="h-4 w-4 mr-2" />
              新建提示词
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              导出
            </Button>
            <Button variant="outline" onClick={() => { setImportFile(null); setImportDialogOpen(true) }}>
              <Upload className="h-4 w-4 mr-2" />
              导入
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{user?.username}</span>
            </div>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              退出登录
            </Button>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">加载中...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrompts.map((prompt) => (
                <div key={prompt.id} onClick={() => handleOpenDetail(prompt)}>
                  <PromptCard prompt={prompt} onDelete={(e) => handleCardDelete(e, prompt)} onToggleFavorite={handleToggleFavorite} />
                </div>
              ))}
            </div>
          )}
          {!loading && filteredPrompts.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">没有找到匹配的提示词</p>
            </div>
          )}
        </div>
      </main>
      <PromptForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSuccess={handleFormSuccess}
        tags={tags}
        categories={categories}
        prompt={editingPrompt}
      />
      <PromptDetail
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        onEdit={handleOpenEditFromDetail}
        onDelete={handleDelete}
        onToggleFavorite={handleToggleFavoriteDetail}
        promptId={detailPromptId}
        externalFavoriteState={detailPromptId ? (() => {
          const p = prompts.find((pp) => pp.id === detailPromptId)
          return p ? { is_favorited: p.is_favorited, favorite_count: p.favorite_count } : undefined
        })() : undefined}
      />

      {/* 删除提示词确认 */}
      <Dialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除提示词「{deleteTarget?.title}」吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setDeleteTarget(null)}>
              取消
            </Button>
            <Button variant='destructive' onClick={handleConfirmDelete}>
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 分类创建/编辑对话框 */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? '编辑分类' : '新建分类'}</DialogTitle>
            <DialogDescription>
              {categoryParentId ? '在当前分类下创建子分类' : editingCategory ? '修改分类名称' : '创建新的顶级分类'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">分类名称</Label>
              <Input
                id="category-name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="请输入分类名称"
                onKeyDown={(e) => { if (e.key === 'Enter') handleCategoryFormSubmit() }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCategoryFormSubmit} disabled={!categoryForm.name.trim()}>
              {editingCategory ? '保存' : '创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除分类确认 */}
      <Dialog open={deleteCategoryTarget !== null} onOpenChange={(open) => { if (!open) setDeleteCategoryTarget(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除分类</DialogTitle>
            <DialogDescription>
              确定要删除分类「{deleteCategoryTarget?.name}」吗？子分类将提升一级，该分类下的提示词将移至上级分类。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setDeleteCategoryTarget(null)}>
              取消
            </Button>
            <Button variant='destructive' onClick={handleDeleteCategoryConfirm}>
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 导入提示词对话框 */}
      <Dialog open={importDialogOpen} onOpenChange={(open) => { if (!open) setImportDialogOpen(false) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>批量导入提示词</DialogTitle>
            <DialogDescription>
              请选择之前导出的 Excel 文件，系统将自动导入其中的提示词。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>没有模板？</span>
              <button
                onClick={handleDownloadTemplate}
                className="text-primary hover:underline cursor-pointer"
              >
                下载导入模板
              </button>
              <span>（含填写说明和示例）</span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="import-file">选择文件</Label>
              <Input
                id="import-file"
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              />
              {importFile && (
                <p className="text-sm text-muted-foreground">
                  已选择：{importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleImport} disabled={!importFile || importing}>
              {importing ? '导入中...' : '确认导入'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
