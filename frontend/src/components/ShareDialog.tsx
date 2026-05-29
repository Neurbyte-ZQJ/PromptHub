import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Copy, Link, Trash2, Clock, Lock } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { useApi } from '@/hooks/useApi'
import type { SharedLink } from '@/api'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ShareDialogProps {
  isOpen: boolean
  onClose: () => void
  promptId: number | null
  promptTitle?: string
}

export default function ShareDialog({ isOpen, onClose, promptId, promptTitle }: ShareDialogProps) {
  const [sharedLinks, setSharedLinks] = useState<SharedLink[]>([])
  const [password, setPassword] = useState('')
  const [expiresHours, setExpiresHours] = useState<string>('0')
  const [creating, setCreating] = useState(false)
  const { addToast } = useToast()
  const { createShareLink, listShareLinks, deleteShareLink } = useApi()

  const fetchLinks = useCallback(async () => {
    if (!promptId) return
    try {
      const links = await listShareLinks(promptId)
      setSharedLinks(links)
    } catch (error) {
      console.error('Failed to fetch share links:', error)
    }
  }, [promptId, listShareLinks])

  useEffect(() => {
    if (isOpen && promptId) {
      fetchLinks()
    }
  }, [isOpen, promptId, fetchLinks])

  const handleCreate = async () => {
    if (!promptId) return
    setCreating(true)
    try {
      const data: { password?: string; expires_hours?: number } = {}
      if (password.trim()) data.password = password.trim()
      const hours = parseInt(expiresHours)
      if (hours > 0) data.expires_hours = hours

      await createShareLink(promptId, data)
      setPassword('')
      setExpiresHours('0')
      fetchLinks()
      addToast({ message: '分享链接已创建', type: 'success' })
    } catch (error) {
      addToast({ message: (error as Error).message || '创建分享链接失败', type: 'error' })
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (shareId: number) => {
    if (!promptId) return
    try {
      await deleteShareLink(promptId, shareId)
      fetchLinks()
      addToast({ message: '分享链接已删除', type: 'success' })
    } catch (error) {
      addToast({ message: '删除分享链接失败', type: 'error' })
    }
  }

  const handleCopyLink = async (token: string) => {
    const url = `${window.location.origin}/shared/${token}`
    try {
      await navigator.clipboard.writeText(url)
      addToast({ message: '链接已复制到剪贴板', type: 'success' })
    } catch {
      addToast({ message: '复制失败', type: 'error' })
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '永不过期'
    return new Date(dateStr).toLocaleString('zh-CN')
  }

  const isExpired = (dateStr: string | null) => {
    if (!dateStr) return false
    return new Date(dateStr) < new Date()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            分享提示词
          </DialogTitle>
          <DialogDescription>
            为「{promptTitle}」创建分享链接，任何人均可通过链接查看此提示词
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3 border rounded-lg p-4">
            <h4 className="text-sm font-medium">创建新链接</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="share-password" className="text-xs">访问密码（可选）</Label>
                <Input
                  id="share-password"
                  type="text"
                  placeholder="不设密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="share-expires" className="text-xs">有效期</Label>
                <Select value={expiresHours} onValueChange={setExpiresHours}>
                  <SelectTrigger id="share-expires">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">永不过期</SelectItem>
                    <SelectItem value="1">1 小时</SelectItem>
                    <SelectItem value="24">24 小时</SelectItem>
                    <SelectItem value="72">3 天</SelectItem>
                    <SelectItem value="168">7 天</SelectItem>
                    <SelectItem value="720">30 天</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleCreate} disabled={creating} size="sm" className="w-full">
              {creating ? '创建中...' : '创建分享链接'}
            </Button>
          </div>

          {sharedLinks.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">已有链接</h4>
              <div className="space-y-2 max-h-48 overflow-auto">
                {sharedLinks.map((link) => (
                  <div
                    key={link.id}
                    className={`flex items-center justify-between p-3 rounded-lg border text-sm ${
                      isExpired(link.expires_at) ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs truncate">
                          {link.token.slice(0, 12)}...
                        </span>
                        {link.has_password && (
                          <Lock className="h-3 w-3 text-amber-500 shrink-0" />
                        )}
                        {link.expires_at && (
                          <Clock className={`h-3 w-3 shrink-0 ${isExpired(link.expires_at) ? 'text-red-500' : 'text-muted-foreground'}`} />
                        )}
                        {isExpired(link.expires_at) && (
                          <span className="text-xs text-red-500">已过期</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        创建于 {formatDate(link.created_at)}
                        {link.expires_at && ` · 过期于 ${formatDate(link.expires_at)}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleCopyLink(link.token)}
                        disabled={isExpired(link.expires_at)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(link.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
