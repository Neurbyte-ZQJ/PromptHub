
import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { X } from 'lucide-react'
import { useApi } from '@/hooks/useApi'
import type { Prompt, Tag, PromptFormData } from '@/api'

interface PromptFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  tags: Tag[]
  prompt?: Prompt | null
}

export default function PromptForm({
  isOpen,
  onClose,
  onSuccess,
  tags,
  prompt,
}: PromptFormProps) {
  const [formData, setFormData] = useState<PromptFormData>({
    title: '',
    scenario: '',
    content: '',
    variables: '',
    is_public: false,
    tag_ids: [],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [newTagInput, setNewTagInput] = useState('')
  const [newTags, setNewTags] = useState<string[]>([])
  const tagInputRef = useRef<HTMLInputElement>(null)
  const { createPrompt, updatePrompt } = useApi()

  useEffect(() => {
    if (prompt) {
      setFormData({
        title: prompt.title,
        scenario: prompt.scenario || '',
        content: prompt.content,
        variables: prompt.variables || '',
        is_public: prompt.is_public,
        tag_ids: prompt.tags.map((t) => t.id),
      })
    } else {
      setFormData({
        title: '',
        scenario: '',
        content: '',
        variables: '',
        is_public: false,
        tag_ids: [],
      })
    }
    setErrors({})
    setNewTagInput('')
    setNewTags([])
  }, [prompt])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!formData.title.trim()) {
      newErrors.title = '请输入提示词名称'
    }
    if (!formData.content.trim()) {
      newErrors.content = '请输入提示词内容'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const submitData = {
        ...formData,
        new_tags: newTags.length > 0 ? newTags : undefined,
      }
      if (prompt) {
        await updatePrompt(prompt.id, submitData)
      } else {
        await createPrompt(submitData)
      }
      onSuccess()
      onClose()
    } catch (error) {
      console.error('提交失败:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleTag = (tagId: number) => {
    setFormData((prev) => ({
      ...prev,
      tag_ids: prev.tag_ids.includes(tagId)
        ? prev.tag_ids.filter((id) => id !== tagId)
        : [...prev.tag_ids, tagId],
    }))
  }

  const handleAddNewTag = () => {
    const trimmed = newTagInput.trim()
    if (!trimmed) return
    const allTagNames = [...tags.map((t) => t.name), ...newTags]
    if (allTagNames.includes(trimmed)) return
    setNewTags((prev) => [...prev, trimmed])
    setNewTagInput('')
    tagInputRef.current?.focus()
  }

  const handleRemoveNewTag = (tagName: string) => {
    setNewTags((prev) => prev.filter((t) => t !== tagName))
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddNewTag()
    }
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='bg-background rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
        <div className='flex items-center justify-between p-6 border-b'>
          <h2 className='text-xl font-semibold'>
            {prompt ? '编辑提示词' : '新建提示词'}
          </h2>
          <button
            onClick={onClose}
            className='text-muted-foreground hover:text-foreground'
          >
            <X className='h-5 w-5' />
          </button>
        </div>
        <form onSubmit={handleSubmit} className='p-6 space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='title'>名称 *</Label>
            <Input
              id='title'
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder='请输入提示词名称'
            />
            {errors.title && (
              <p className='text-sm text-destructive'>{errors.title}</p>
            )}
          </div>
          <div className='space-y-2'>
            <Label htmlFor='scenario'>适用场景</Label>
            <Input
              id='scenario'
              value={formData.scenario}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, scenario: e.target.value }))
              }
              placeholder='请输入适用场景'
            />
          </div>
          <div className='flex items-center gap-2 space-y-0'>
            <Checkbox
              id='is_public'
              checked={formData.is_public}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, is_public: checked === true }))
              }
            />
            <Label htmlFor='is_public' className='cursor-pointer'>公开到团队</Label>
          </div>
          <div className='space-y-2'>
            <Label>标签</Label>
            <div className='flex flex-wrap gap-2'>
              {tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant={formData.tag_ids.includes(tag.id) ? 'default' : 'outline'}
                  className='cursor-pointer'
                  onClick={() => toggleTag(tag.id)}
                >
                  {tag.name}
                </Badge>
              ))}
              {newTags.map((tagName) => (
                <Badge
                  key={`new-${tagName}`}
                  variant='default'
                  className='gap-1 pr-1'
                >
                  {tagName}
                  <X
                    className='h-3 w-3 cursor-pointer hover:text-destructive'
                    onClick={() => handleRemoveNewTag(tagName)}
                  />
                </Badge>
              ))}
            </div>
            <div className='flex gap-2 mt-2'>
              <Input
                ref={tagInputRef}
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                placeholder='输入新标签后按回车添加'
                className='flex-1'
              />
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={handleAddNewTag}
                disabled={!newTagInput.trim()}
              >
                添加
              </Button>
            </div>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='content'>提示词内容 *</Label>
            <Textarea
              id='content'
              value={formData.content}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, content: e.target.value }))
              }
              placeholder='请输入提示词内容'
              rows={10}
            />
            {errors.content && (
              <p className='text-sm text-destructive'>{errors.content}</p>
            )}
          </div>
          <div className='space-y-2'>
            <Label htmlFor='variables'>变量说明</Label>
            <Textarea
              id='variables'
              value={formData.variables}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, variables: e.target.value }))
              }
              placeholder='请输入变量说明'
              rows={4}
            />
          </div>
          <div className='flex justify-end gap-3 pt-4'>
            <Button type='button' variant='outline' onClick={onClose}>
              取消
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting ? '提交中...' : (prompt ? '保存' : '创建')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

