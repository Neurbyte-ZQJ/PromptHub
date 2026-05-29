
import { useState, useEffect, useCallback } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import PromptGrid from './PromptGrid'
import PromptForm from './PromptForm'
import PromptDetail from './PromptDetail'
import DeletePromptDialog from './DeletePromptDialog'
import CategoryDialog from './CategoryDialog'
import DeleteCategoryDialog from './DeleteCategoryDialog'
import ImportDialog from './ImportDialog'
import ShareDialog from './ShareDialog'
import CollaboratorDialog from './CollaboratorDialog'
import { useAuth } from '@/contexts/AuthContext'
import { useApi } from '@/hooks/useApi'
import { useToast } from '@/components/ui/toast'
import { useFavoriteToggle } from '@/hooks/useFavoriteToggle'
import type { Prompt, Tag, Category, PaginationInfo } from '@/api'

const PAGE_SIZE = 20

export default function Layout() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationInfo>({
    totalCount: 0,
    page: 1,
    pageSize: PAGE_SIZE,
    totalPages: 0,
  })
  const [refreshKey, setRefreshKey] = useState(0)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null)
  const [detailPromptId, setDetailPromptId] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Prompt | null>(null)

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryParentId, setCategoryParentId] = useState<number | null>(null)
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState<Category | null>(null)

  const [importDialogOpen, setImportDialogOpen] = useState(false)

  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [sharePromptId, setSharePromptId] = useState<number | null>(null)
  const [sharePromptTitle, setSharePromptTitle] = useState<string>('')

  const [collaboratorDialogOpen, setCollaboratorDialogOpen] = useState(false)
  const [collaboratorPromptId, setCollaboratorPromptId] = useState<number | null>(null)
  const [collaboratorPromptTitle, setCollaboratorPromptTitle] = useState<string>('')

  const { user } = useAuth()
  const { getPrompts, getTags, getCategories, deletePrompt, deleteCategory, exportPrompts } = useApi()
  const { addToast } = useToast()

  const refreshPrompts = useCallback(() => {
    setRefreshKey(k => k + 1)
  }, [])

  const { toggleFavoriteById } = useFavoriteToggle(prompts, setPrompts, refreshPrompts)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    let cancelled = false
    const fetchPrompts = async () => {
      try {
        setLoading(true)
        const result = await getPrompts({
          search: debouncedSearch || undefined,
          tag_id: selectedTagId ?? undefined,
          category_id: selectedCategoryId ?? undefined,
          favorites_only: showFavoritesOnly || undefined,
          page,
          page_size: PAGE_SIZE,
        })
        if (!cancelled) {
          setPrompts(result.data)
          setPagination(result.pagination)
        }
      } catch (error) {
        if (!cancelled) console.error('Failed to fetch prompts:', error)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchPrompts()
    return () => { cancelled = true }
  }, [getPrompts, debouncedSearch, selectedTagId, selectedCategoryId, showFavoritesOnly, page, refreshKey])

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [tagsData, categoriesData] = await Promise.all([
          getTags(),
          getCategories(),
        ])
        setTags(tagsData)
        setCategories(categoriesData)
      } catch (error) {
        console.error('Failed to fetch metadata:', error)
      }
    }
    fetchMeta()
  }, [getTags, getCategories])

  const handleTagSelect = useCallback((tagId: number | null) => {
    setSelectedTagId(tagId)
    setPage(1)
  }, [])

  const handleCategorySelect = useCallback((categoryId: number | null) => {
    setSelectedCategoryId(categoryId)
    setPage(1)
  }, [])

  const handleToggleFavorites = useCallback(() => {
    setShowFavoritesOnly(prev => !prev)
    setPage(1)
  }, [])

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
  }, [])

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

  const handleDelete = async (id: number) => {
    try {
      await deletePrompt(id)
      refreshPrompts()
    } catch (error) {
      console.error('Failed to delete prompt:', error)
    }
  }

  const handleCardDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    const prompt = prompts.find(p => p.id === id)
    if (prompt) setDeleteTarget(prompt)
  }

  const handleConfirmDelete = async () => {
    if (deleteTarget) {
      await handleDelete(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  const handleToggleFavorite = (e: React.MouseEvent, promptId: number) => {
    e.stopPropagation()
    toggleFavoriteById(promptId)
  }

  const handleCreateCategory = (parentId?: number | null) => {
    setEditingCategory(null)
    setCategoryParentId(parentId ?? null)
    setCategoryDialogOpen(true)
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setCategoryParentId(category.parent_id)
    setCategoryDialogOpen(true)
  }

  const handleDeleteCategoryConfirm = async () => {
    if (!deleteCategoryTarget) return
    try {
      await deleteCategory(deleteCategoryTarget.id)
      addToast({ message: '分类已删除', type: 'success' })
      refreshPrompts()
      const [tagsData, categoriesData] = await Promise.all([getTags(), getCategories()])
      setTags(tagsData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Failed to delete category:', error)
      addToast({ message: '删除分类失败', type: 'error' })
    }
    setDeleteCategoryTarget(null)
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

  const handleOpenShare = () => {
    const prompt = prompts.find((p) => p.id === detailPromptId)
    if (prompt) {
      setSharePromptId(prompt.id)
      setSharePromptTitle(prompt.title)
      setShareDialogOpen(true)
    }
  }

  const handleOpenCollaborators = () => {
    const prompt = prompts.find((p) => p.id === detailPromptId)
    if (prompt) {
      setCollaboratorPromptId(prompt.id)
      setCollaboratorPromptTitle(prompt.title)
      setCollaboratorDialogOpen(true)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        tags={tags}
        categories={categories}
        selectedTagId={selectedTagId}
        onTagSelect={handleTagSelect}
        selectedCategoryId={selectedCategoryId}
        onCategorySelect={handleCategorySelect}
        showFavoritesOnly={showFavoritesOnly}
        onToggleFavorites={handleToggleFavorites}
        onCreateCategory={handleCreateCategory}
        onEditCategory={handleEditCategory}
        onDeleteCategory={setDeleteCategoryTarget}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onCreateClick={handleOpenCreate}
          onExport={handleExport}
          onImportClick={() => setImportDialogOpen(true)}
        />
        <div className="flex-1 overflow-auto p-6">
          <PromptGrid
            prompts={prompts}
            loading={loading}
            currentUserId={user?.id}
            onCardClick={handleOpenDetail}
            onDelete={handleCardDelete}
            onToggleFavorite={handleToggleFavorite}
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </div>
      </main>
      <PromptForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSuccess={refreshPrompts}
        tags={tags}
        categories={categories}
        prompt={editingPrompt}
      />
      <PromptDetail
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        onEdit={handleOpenEditFromDetail}
        onDelete={handleDelete}
        onToggleFavorite={toggleFavoriteById}
        onShare={handleOpenShare}
        onManageCollaborators={handleOpenCollaborators}
        promptId={detailPromptId}
        externalFavoriteState={detailPromptId ? (() => {
          const p = prompts.find((pp) => pp.id === detailPromptId)
          return p ? { is_favorited: p.is_favorited, favorite_count: p.favorite_count } : undefined
        })() : undefined}
        currentUserId={user?.id}
      />
      <DeletePromptDialog
        target={deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        onConfirm={handleConfirmDelete}
      />
      <CategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        editingCategory={editingCategory}
        parentId={categoryParentId}
        onSuccess={() => {
          refreshPrompts()
          getCategories().then(setCategories).catch(console.error)
        }}
      />
      <DeleteCategoryDialog
        target={deleteCategoryTarget}
        onOpenChange={(open) => { if (!open) setDeleteCategoryTarget(null) }}
        onConfirm={handleDeleteCategoryConfirm}
      />
      <ImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onSuccess={refreshPrompts}
      />
      <ShareDialog
        isOpen={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        promptId={sharePromptId}
        promptTitle={sharePromptTitle}
      />
      <CollaboratorDialog
        isOpen={collaboratorDialogOpen}
        onClose={() => setCollaboratorDialogOpen(false)}
        promptId={collaboratorPromptId}
        promptTitle={collaboratorPromptTitle}
        isOwner={collaboratorPromptId ? prompts.find(p => p.id === collaboratorPromptId)?.user_id === user?.id : false}
      />
    </div>
  )
}
