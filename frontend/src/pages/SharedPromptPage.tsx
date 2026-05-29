import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Copy, Lock, User, Folder, AlertCircle } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { accessSharedPrompt } from '@/api'
import type { SharedPrompt } from '@/api'

export default function SharedPromptPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [prompt, setPrompt] = useState<SharedPrompt | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [needsPassword, setNeedsPassword] = useState(false)
  const [password, setPassword] = useState('')
  const { addToast } = useToast()

  const fetchPrompt = useCallback(async (pwd?: string) => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const data = await accessSharedPrompt(token, pwd)
      setPrompt(data)
      setNeedsPassword(false)
    } catch (err) {
      const msg = (err as Error).message
      if (msg.includes('密码错误')) {
        setNeedsPassword(true)
        setError(msg)
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchPrompt()
  }, [fetchPrompt])

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchPrompt(password)
  }

  const handleCopy = async () => {
    if (!prompt) return
    try {
      await navigator.clipboard.writeText(prompt.content)
      addToast({ message: '复制成功', type: 'success' })
    } catch {
      addToast({ message: '复制失败', type: 'error' })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    )
  }

  if (needsPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <Lock className="h-12 w-12 mx-auto text-muted-foreground" />
            <h1 className="text-xl font-semibold">需要访问密码</h1>
            <p className="text-sm text-muted-foreground">此分享链接需要密码才能访问</p>
          </div>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">访问密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="请输入访问密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {error}
              </p>
            )}
            <Button type="submit" className="w-full">
              验证
            </Button>
          </form>
        </div>
      </div>
    )
  }

  if (error || !prompt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
          <h1 className="text-xl font-semibold">无法访问</h1>
          <p className="text-sm text-muted-foreground">{error || '分享链接无效或已过期'}</p>
          <Button variant="outline" onClick={() => navigate('/login')}>
            返回登录
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>PromptHub 分享</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
            登录 / 注册
          </Button>
        </div>

        <div className="bg-card rounded-lg border shadow-sm">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-semibold">{prompt.title}</h1>
            {prompt.owner_username && (
              <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                创建者：{prompt.owner_username}
              </p>
            )}
          </div>

          <div className="p-6 space-y-6">
            {prompt.scenario && (
              <div>
                <Label className="text-muted-foreground">适用场景</Label>
                <p className="mt-1">{prompt.scenario}</p>
              </div>
            )}

            <Separator />

            <div className="space-y-2">
              <Label>提示词内容</Label>
              <pre className="whitespace-pre-wrap bg-muted p-4 rounded-lg text-sm">
                {prompt.content}
              </pre>
            </div>

            {prompt.variables && (
              <div>
                <Label className="text-muted-foreground">变量说明</Label>
                <div className="mt-1 text-sm whitespace-pre-wrap">
                  {prompt.variables.split('\n').map((line, index) => (
                    <p key={index} className={index > 0 ? 'mt-2' : ''}>{line}</p>
                  ))}
                </div>
              </div>
            )}

            {prompt.categories && prompt.categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {prompt.categories.map((cat) => (
                  <Badge key={cat.id} variant="outline" className="gap-1">
                    <Folder className="h-3 w-3" />
                    {cat.name}
                  </Badge>
                ))}
              </div>
            )}

            {prompt.tags && prompt.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {prompt.tags.map((tag) => (
                  <Badge key={tag.id}>{tag.name}</Badge>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 border-t flex justify-end">
            <Button onClick={handleCopy} size="lg" className="gap-2">
              <Copy className="h-4 w-4" />
              复制
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
