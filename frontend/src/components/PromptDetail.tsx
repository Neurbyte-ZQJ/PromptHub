
import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { X, Copy, Edit, Trash2, Globe, Lock, User } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { useApi } from '@/hooks/useApi'
import type { PromptDetail as PromptDetailType } from '@/api'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface PromptDetailProps {
  isOpen: boolean
  onClose: () => void
  onEdit: () => void
  onDelete: (id: number) => void
  promptId: number | null
}

export default function PromptDetail({
  isOpen,
  onClose,
  onEdit,
  onDelete,
  promptId,
}: PromptDetailProps) {
  const [prompt, setPrompt] = useState<PromptDetailType | null>(null)
  const [loading, setLoading] = useState(false)
  const [currentVersion, setCurrentVersion] = useState<string>('')
  const [variableValues, setVariableValues] = useState<Record<string, string>>(
    {}
  )
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { addToast } = useToast()
  const { getPrompt } = useApi()

  const extractVariables = useCallback((content: string): string[] => {
    const variables = new Set<string>()
    const doubleBraceRegex = /\{\{(\w+)\}\}/g
    const bracketRegex = /\[(\w+)\]/g

    let match
    while ((match = doubleBraceRegex.exec(content)) !== null) {
      variables.add(match[1])
    }
    while ((match = bracketRegex.exec(content)) !== null) {
      variables.add(match[1])
    }

    return Array.from(variables)
  }, [])

  const getCurrentContent = useCallback(() => {
    if (!prompt) return ''
    if (!currentVersion || currentVersion === 'latest') {
      return prompt.content
    }
    const version = prompt.versions.find(
      (v) => v.version_number.toString() === currentVersion
    )
    return version?.content || prompt.content
  }, [prompt, currentVersion])

  const variables = extractVariables(getCurrentContent())

  useEffect(() => {
    if (promptId && isOpen) {
      const fetchPromptData = async () => {
        setLoading(true)
        try {
          const data = await getPrompt(promptId)
          setPrompt(data)
          setCurrentVersion('latest')
          setVariableValues({})
        } catch (error) {
          console.error('Failed to fetch prompt:', error)
        } finally {
          setLoading(false)
        }
      }
      fetchPromptData()
    }
  }, [promptId, isOpen, getPrompt])

  useEffect(() => {
    const newVariables = extractVariables(getCurrentContent())
    setVariableValues((prev) => {
      const newValues: Record<string, string> = {}
      newVariables.forEach((v) => {
        newValues[v] = prev[v] || ''
      })
      return newValues
    })
  }, [currentVersion, prompt, extractVariables, getCurrentContent])

  const handleVariableChange = (variable: string, value: string) => {
    setVariableValues((prev) => ({ ...prev, [variable]: value }))
  }

  const handleCopy = async () => {
    try {
      let content = getCurrentContent()
      Object.entries(variableValues).forEach(([variable, value]) => {
        content = content.replace(
          new RegExp(`\\{\\{${variable}\\}\\}`, 'g'),
          value
        )
        content = content.replace(new RegExp(`\\[${variable}\\]`, 'g'), value)
      })
      await navigator.clipboard.writeText(content)
      addToast({ message: '复制成功', type: 'success' })
    } catch (error) {
      console.error('Failed to copy:', error)
      addToast({ message: '复制失败', type: 'error' })
    }
  }

  const handleDelete = () => {
    if (prompt) {
      onDelete(prompt.id)
      setShowDeleteConfirm(false)
      onClose()
    }
  }

  if (!isOpen) return null

  const versions = prompt?.versions || []
  const sortedVersions = [...versions].sort(
    (a, b) => b.version_number - a.version_number
  )

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
      <div className='bg-background rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] flex flex-col'>
        <div className='flex items-center justify-between p-6 border-b'>
          <div className='flex items-center gap-4'>
            <div>
              <h2 className='text-xl font-semibold flex items-center gap-2'>
                {prompt?.title || ''}
                {prompt?.is_public ? (
                  <Globe className='h-4 w-4 text-muted-foreground' />
                ) : (
                  <Lock className='h-4 w-4 text-muted-foreground' />
                )}
              </h2>
              {prompt?.owner_username && (
                <p className='text-sm text-muted-foreground mt-1 flex items-center gap-1'>
                  <User className='h-3.5 w-3.5' />
                  创建者：{prompt.owner_username}
                </p>
              )}
            </div>
            <Button variant='outline' size='sm' onClick={onEdit}>
              <Edit className='h-4 w-4 mr-2' />
              编辑
            </Button>
            <Button variant='outline' size='sm' onClick={() => setShowDeleteConfirm(true)} className='text-destructive hover:bg-destructive hover:text-white'>
              <Trash2 className='h-4 w-4 mr-2' />
              删除
            </Button>
          </div>
          <button
            onClick={onClose}
            className='text-muted-foreground hover:text-foreground'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        <div className='flex-1 overflow-auto p-6'>
          {loading ? (
            <div className='flex items-center justify-center h-32'>
              <p className='text-muted-foreground'>加载中...</p>
            </div>
          ) : (
            <div className='space-y-6'>
              {prompt?.scenario && (
                <div>
                  <Label className='text-muted-foreground'>适用场景</Label>
                  <p className='mt-1'>{prompt.scenario}</p>
                </div>
              )}

              {sortedVersions.length > 0 && (
                <div className='space-y-2'>
                  <Label>版本</Label>
                  <Select value={currentVersion} onValueChange={setCurrentVersion}>
                    <SelectTrigger>
                      <SelectValue placeholder='选择版本' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='latest'>最新版本</SelectItem>
                      {sortedVersions.map((version) => (
                        <SelectItem
                          key={version.id}
                          value={version.version_number.toString()}
                        >
                          版本 {version.version_number} -{' '}
                          {new Date(version.created_at).toLocaleString('zh-CN')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {variables.length > 0 && (
                <>
                  <Separator />
                  <div className='space-y-4'>
                    <Label>变量填充</Label>
                    {variables.map((variable) => (
                      <div key={variable} className='space-y-2'>
                        <Label htmlFor={`var-${variable}`}>{variable}</Label>
                        <Input
                          id={`var-${variable}`}
                          value={variableValues[variable] || ''}
                          onChange={(e) =>
                            handleVariableChange(variable, e.target.value)
                          }
                          placeholder={`请输入 ${variable}`}
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}

              <Separator />
              <div className='space-y-2'>
                <Label>提示词内容</Label>
                <pre className='whitespace-pre-wrap bg-muted p-4 rounded-lg text-sm'>
                  {getCurrentContent()}
                </pre>
              </div>

              {prompt?.variables && (
                <div>
                  <Label className='text-muted-foreground'>变量说明</Label>
                  <div className='mt-1 text-sm whitespace-pre-wrap'>
                    {prompt.variables.split('\n').map((line, index) => (
                      <p key={index} className={index > 0 ? 'mt-2' : ''}>{line}</p>
                    ))}
                  </div>
                </div>
              )}

              {prompt?.tags && prompt.tags.length > 0 && (
                <div className='flex flex-wrap gap-2'>
                  {prompt.tags.map((tag) => (
                    <Badge
                      key={tag.id}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className='p-6 border-t flex justify-end'>
          <Button onClick={handleCopy} size='lg' className='gap-2'>
            <Copy className='h-4 w-4' />
            复制
          </Button>
        </div>
      </div>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除提示词「{prompt?.title}」吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setShowDeleteConfirm(false)}>
              取消
            </Button>
            <Button variant='destructive' onClick={handleDelete}>
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

