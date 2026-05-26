import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider } from '@/contexts/AuthContext'
import PromptForm from '@/components/PromptForm'
import type { Tag, Category, Prompt } from '@/api'

const mockTags: Tag[] = [
  { id: 1, name: 'Python' },
  { id: 2, name: 'JavaScript' },
]

const mockCategories: Category[] = [
  { id: 1, name: '开发工具', parent_id: null, user_id: 1, sort_order: 0, created_at: '2024-01-01', children: [] },
]

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onSuccess: vi.fn(),
  tags: mockTags,
  categories: mockCategories,
}

describe('PromptForm', () => {
  it('should render create form when no prompt is provided', () => {
    render(
      <AuthProvider>
        <PromptForm {...defaultProps} />
      </AuthProvider>
    )

    expect(screen.getByText('新建提示词')).toBeInTheDocument()
    expect(screen.getByLabelText('名称 *')).toBeInTheDocument()
    expect(screen.getByLabelText('提示词内容 *')).toBeInTheDocument()
  })

  it('should render edit form when prompt is provided', () => {
    const mockPrompt: Prompt = {
      id: 1,
      title: '测试提示词',
      content: '测试内容',
      is_public: false,
      created_at: '2024-01-01',
      categories: [],
      tags: [{ id: 1, name: 'Python' }],
      favorite_count: 0,
      is_favorited: false,
    }

    render(
      <AuthProvider>
        <PromptForm {...defaultProps} prompt={mockPrompt} />
      </AuthProvider>
    )

    expect(screen.getByText('编辑提示词')).toBeInTheDocument()
    expect(screen.getByDisplayValue('测试提示词')).toBeInTheDocument()
    expect(screen.getByDisplayValue('测试内容')).toBeInTheDocument()
  })

  it('should show validation errors for empty required fields', async () => {
    render(
      <AuthProvider>
        <PromptForm {...defaultProps} />
      </AuthProvider>
    )

    const submitBtn = screen.getByText('创建')
    await userEvent.click(submitBtn)

    expect(screen.getByText('请输入提示词名称')).toBeInTheDocument()
    expect(screen.getByText('请输入提示词内容')).toBeInTheDocument()
  })

  it('should not render when isOpen is false', () => {
    render(
      <AuthProvider>
        <PromptForm {...defaultProps} isOpen={false} />
      </AuthProvider>
    )

    expect(screen.queryByText('新建提示词')).not.toBeInTheDocument()
  })

  it('should display tags and allow toggling', () => {
    render(
      <AuthProvider>
        <PromptForm {...defaultProps} />
      </AuthProvider>
    )

    expect(screen.getByText('Python')).toBeInTheDocument()
    expect(screen.getByText('JavaScript')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Python'))
  })

  it('should display categories and allow toggling', () => {
    render(
      <AuthProvider>
        <PromptForm {...defaultProps} />
      </AuthProvider>
    )

    expect(screen.getByText('开发工具')).toBeInTheDocument()

    fireEvent.click(screen.getByText('开发工具'))
  })

  it('should call onClose when cancel button is clicked', async () => {
    const onClose = vi.fn()
    render(
      <AuthProvider>
        <PromptForm {...defaultProps} onClose={onClose} />
      </AuthProvider>
    )

    await userEvent.click(screen.getByText('取消'))
    expect(onClose).toHaveBeenCalled()
  })
})
