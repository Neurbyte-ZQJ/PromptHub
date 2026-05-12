
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, LogOut, User } from 'lucide-react'
import Sidebar from './Sidebar'
import PromptCard from './PromptCard'
import PromptForm from './PromptForm'
import PromptDetail from './PromptDetail'
import { useAuth } from '@/contexts/AuthContext'
import { useApi } from '@/hooks/useApi'
import type { Prompt, Tag } from '@/api'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function Layout() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null)
  const [detailPromptId, setDetailPromptId] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Prompt | null>(null)
  const { user, logout } = useAuth()
  const { getPrompts, getTags, deletePrompt } = useApi()

  const fetchData = async () => {
    try {
      const [promptsData, tagsData] = await Promise.all([
        getPrompts(),
        getTags(),
      ])
      setPrompts(promptsData)
      setTags(tagsData)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [getPrompts, getTags])

  const filteredPrompts = prompts.filter((prompt) => {
    const matchesTag = selectedTagId === null 
      ? true 
      : prompt.tags.some((tag) => tag.id === selectedTagId)
    const matchesSearch = searchQuery === '' 
      ? true 
      : prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.content.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTag && matchesSearch
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

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        tags={tags}
        selectedTagId={selectedTagId}
        onTagSelect={setSelectedTagId}
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
                  <PromptCard prompt={prompt} onDelete={(e, id) => handleCardDelete(e, prompt)} />
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
        prompt={editingPrompt}
      />
      <PromptDetail
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        onEdit={handleOpenEditFromDetail}
        onDelete={handleDelete}
        promptId={detailPromptId}
      />

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
    </div>
  )
}

