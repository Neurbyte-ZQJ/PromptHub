import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Users, Search, Trash2, Shield, Eye } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { useApi } from '@/hooks/useApi'
import type { Collaborator, User } from '@/api'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface CollaboratorDialogProps {
  isOpen: boolean
  onClose: () => void
  promptId: number | null
  promptTitle?: string
  isOwner: boolean
}

export default function CollaboratorDialog({
  isOpen,
  onClose,
  promptId,
  promptTitle,
  isOwner,
}: CollaboratorDialogProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedRole, setSelectedRole] = useState<string>('viewer')
  const [adding, setAdding] = useState(false)
  const [searching, setSearching] = useState(false)
  const { addToast } = useToast()
  const { listCollaborators, addCollaborator, updateCollaborator, removeCollaborator, searchUsers } = useApi()

  const fetchCollaborators = useCallback(async () => {
    if (!promptId) return
    try {
      const collabs = await listCollaborators(promptId)
      setCollaborators(collabs)
    } catch (error) {
      console.error('Failed to fetch collaborators:', error)
    }
  }, [promptId, listCollaborators])

  useEffect(() => {
    if (isOpen && promptId) {
      fetchCollaborators()
      setSearchQuery('')
      setSearchResults([])
      setSelectedUser(null)
    }
  }, [isOpen, promptId, fetchCollaborators])

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return
    setSearching(true)
    try {
      const results = await searchUsers(searchQuery.trim())
      const existingUserIds = collaborators.map((c) => c.user_id)
      setSearchResults(results.filter((u) => !existingUserIds.includes(u.id)))
    } catch (error) {
      console.error('Failed to search users:', error)
    } finally {
      setSearching(false)
    }
  }, [searchQuery, searchUsers, collaborators])

  const handleAdd = async () => {
    if (!promptId || !selectedUser) return
    setAdding(true)
    try {
      await addCollaborator(promptId, { user_id: selectedUser.id, role: selectedRole })
      setSelectedUser(null)
      setSearchResults([])
      setSearchQuery('')
      fetchCollaborators()
      addToast({ message: `已添加 ${selectedUser.username} 为协作者`, type: 'success' })
    } catch (error) {
      addToast({ message: (error as Error).message || '添加协作者失败', type: 'error' })
    } finally {
      setAdding(false)
    }
  }

  const handleRoleChange = async (userId: number, newRole: string) => {
    if (!promptId) return
    try {
      await updateCollaborator(promptId, userId, { role: newRole })
      fetchCollaborators()
      addToast({ message: '角色已更新', type: 'success' })
    } catch (error) {
      addToast({ message: (error as Error).message || '更新角色失败', type: 'error' })
    }
  }

  const handleRemove = async (userId: number, username?: string) => {
    if (!promptId) return
    try {
      await removeCollaborator(promptId, userId)
      fetchCollaborators()
      addToast({ message: `已移除协作者 ${username || ''}`, type: 'success' })
    } catch (error) {
      addToast({ message: '移除协作者失败', type: 'error' })
    }
  }

  const roleIcon = (role: string) => {
    if (role === 'editor') return <Shield className="h-3.5 w-3.5 text-blue-500" />
    return <Eye className="h-3.5 w-3.5 text-muted-foreground" />
  }

  const roleLabel = (role: string) => {
    if (role === 'editor') return '可编辑'
    return '仅查看'
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            协作管理
          </DialogTitle>
          <DialogDescription>
            管理「{promptTitle}」的协作者，可编辑角色的协作者可以修改提示词内容
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isOwner && (
            <div className="space-y-3 border rounded-lg p-4">
              <h4 className="text-sm font-medium">添加协作者</h4>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索用户名或邮箱..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSearch() }}
                  />
                </div>
                <Button variant="outline" onClick={handleSearch} disabled={searching} size="sm">
                  {searching ? '搜索中...' : '搜索'}
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-1 max-h-32 overflow-auto">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className={`flex items-center justify-between p-2 rounded cursor-pointer text-sm ${
                        selectedUser?.id === user.id ? 'bg-primary/10 border border-primary/30' : 'hover:bg-muted'
                      }`}
                      onClick={() => setSelectedUser(user)}
                    >
                      <span>{user.username}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  ))}
                </div>
              )}

              {selectedUser && (
                <div className="flex items-center gap-3">
                  <div className="flex-1 text-sm">
                    已选择：<span className="font-medium">{selectedUser.username}</span>
                  </div>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">仅查看</SelectItem>
                      <SelectItem value="editor">可编辑</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAdd} disabled={adding} size="sm">
                    {adding ? '添加中...' : '添加'}
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <h4 className="text-sm font-medium">当前协作者</h4>
            {collaborators.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">暂无协作者</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-auto">
                {collaborators.map((collab) => (
                  <div
                    key={collab.id}
                    className="flex items-center justify-between p-3 rounded-lg border text-sm"
                  >
                    <div className="flex items-center gap-2">
                      {roleIcon(collab.role)}
                      <span className="font-medium">{collab.username || `用户 ${collab.user_id}`}</span>
                      <Badge variant="outline" className="text-xs">
                        {roleLabel(collab.role)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      {isOwner && (
                        <Select
                          value={collab.role}
                          onValueChange={(value) => handleRoleChange(collab.user_id, value)}
                        >
                          <SelectTrigger className="h-7 w-24 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="viewer">仅查看</SelectItem>
                            <SelectItem value="editor">可编辑</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => handleRemove(collab.user_id, collab.username)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
