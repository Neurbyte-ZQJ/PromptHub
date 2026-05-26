
export interface Tag {
  id: number
  name: string
}

export interface Category {
  id: number
  name: string
  parent_id: number | null
  user_id: number | null
  sort_order: number
  created_at: string
  children: Category[]
}

export interface CategoryFormData {
  name: string
  parent_id?: number | null
  sort_order?: number
}

export interface PromptVersion {
  id: number
  prompt_id: number
  content: string
  version_number: number
  created_at: string
}

export interface Prompt {
  id: number
  title: string
  scenario?: string
  content: string
  variables?: string
  user_id?: number
  owner_username?: string
  is_public: boolean
  created_at: string
  updated_at?: string
  categories: Category[]
  tags: Tag[]
  favorite_count: number
  is_favorited: boolean
}

export interface PromptDetail extends Prompt {
  versions: PromptVersion[]
}

export type PromptSortBy = 'created_at' | 'updated_at' | 'title' | 'id'
export type SortOrder = 'asc' | 'desc'

export interface PromptListParams {
  search?: string
  tag_id?: number
  category_id?: number
  favorites_only?: boolean
  page?: number
  page_size?: number
  skip?: number
  limit?: number
  sort_by?: PromptSortBy
  sort_order?: SortOrder
}

export interface PromptFormData {
  title: string
  scenario?: string
  content: string
  variables?: string
  is_public?: boolean
  category_ids: number[]
  tag_ids: number[]
  new_tags?: string[]
}

export interface User {
  id: number
  username: string
  email: string
  created_at: string
}

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api'

function getHeaders(token?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
}

export async function fetchApi(
  endpoint: string,
  options: FetchOptions = {},
  token?: string,
  onUnauthorized?: () => void
): Promise<Response> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: options.method || 'GET',
    headers: getHeaders(token),
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (response.status === 401) {
    onUnauthorized?.()
    throw new Error('未授权，请重新登录')
  }

  return response
}

export async function login(data: LoginData): Promise<{ token: TokenResponse; user: User }> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error('登录失败')
  }
  const token = await response.json()
  
  const userResponse = await fetch(`${API_BASE}/auth/me`, {
    headers: getHeaders(token.access_token),
  })
  if (!userResponse.ok) {
    throw new Error('获取用户信息失败')
  }
  const user = await userResponse.json()
  
  return { token, user }
}

export async function register(data: RegisterData): Promise<User> {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error('注册失败')
  }
  return response.json()
}

export async function getCurrentUser(token: string, onUnauthorized?: () => void): Promise<User> {
  const response = await fetchApi('/auth/me', {}, token, onUnauthorized)
  if (!response.ok) {
    throw new Error('获取用户信息失败')
  }
  return response.json()
}

export async function getPrompts(token: string, onUnauthorized?: () => void, params: PromptListParams = {}): Promise<Prompt[]> {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value))
    }
  })
  const endpoint = query.size > 0 ? `/prompts?${query.toString()}` : '/prompts'
  const response = await fetchApi(endpoint, {}, token, onUnauthorized)
  if (!response.ok) {
    throw new Error('获取提示词失败')
  }
  return response.json()
}

export async function getPrompt(id: number, token: string, onUnauthorized?: () => void): Promise<PromptDetail> {
  const response = await fetchApi(`/prompts/${id}`, {}, token, onUnauthorized)
  if (!response.ok) {
    throw new Error('获取提示词失败')
  }
  return response.json()
}

export async function getTags(): Promise<Tag[]> {
  const response = await fetch(`${API_BASE}/tags`)
  if (!response.ok) {
    throw new Error('获取标签失败')
  }
  return response.json()
}

export async function createPrompt(data: PromptFormData, token: string, onUnauthorized?: () => void): Promise<Prompt> {
  const response = await fetchApi('/prompts', { method: 'POST', body: data }, token, onUnauthorized)
  if (!response.ok) {
    throw new Error('创建提示词失败')
  }
  return response.json()
}

export async function updatePrompt(id: number, data: Partial<PromptFormData>, token: string, onUnauthorized?: () => void): Promise<Prompt> {
  const response = await fetchApi(`/prompts/${id}`, { method: 'PUT', body: data }, token, onUnauthorized)
  if (!response.ok) {
    throw new Error('更新提示词失败')
  }
  return response.json()
}

export async function deletePrompt(id: number, token: string, onUnauthorized?: () => void): Promise<void> {
  const response = await fetchApi(`/prompts/${id}`, { method: 'DELETE' }, token, onUnauthorized)
  if (!response.ok) {
    throw new Error('删除提示词失败')
  }
}

export interface FavoriteResponse {
  id: number
  user_id: number
  prompt_id: number
  created_at: string
}

export async function toggleFavorite(promptId: number, token: string, onUnauthorized?: () => void): Promise<FavoriteResponse> {
  const response = await fetchApi(`/prompts/${promptId}/favorite`, { method: 'POST' }, token, onUnauthorized)
  if (!response.ok) {
    throw new Error('收藏操作失败')
  }
  return response.json()
}

export async function getCategories(token: string, onUnauthorized?: () => void): Promise<Category[]> {
  const response = await fetchApi('/categories', {}, token, onUnauthorized)
  if (!response.ok) {
    throw new Error('获取分类失败')
  }
  return response.json()
}

export async function createCategory(data: CategoryFormData, token: string, onUnauthorized?: () => void): Promise<Category> {
  const response = await fetchApi('/categories', { method: 'POST', body: data }, token, onUnauthorized)
  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.detail || '创建分类失败')
  }
  return response.json()
}

export async function updateCategory(id: number, data: Partial<CategoryFormData>, token: string, onUnauthorized?: () => void): Promise<Category> {
  const response = await fetchApi(`/categories/${id}`, { method: 'PUT', body: data }, token, onUnauthorized)
  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.detail || '更新分类失败')
  }
  return response.json()
}

export async function deleteCategory(id: number, token: string, onUnauthorized?: () => void): Promise<void> {
  const response = await fetchApi(`/categories/${id}`, { method: 'DELETE' }, token, onUnauthorized)
  if (!response.ok) {
    throw new Error('删除分类失败')
  }
}

export interface ImportResult {
  imported: number
  skipped: number
}

export async function exportPrompts(token: string, onUnauthorized?: () => void): Promise<Blob> {
  const response = await fetch(`${API_BASE}/prompts/export`, {
    headers: getHeaders(token),
  })
  if (response.status === 401) {
    onUnauthorized?.()
    throw new Error('未授权，请重新登录')
  }
  if (!response.ok) {
    throw new Error('导出提示词失败')
  }
  return response.blob()
}

export async function downloadImportTemplate(token: string, onUnauthorized?: () => void): Promise<Blob> {
  const response = await fetch(`${API_BASE}/prompts/import-template`, {
    headers: getHeaders(token),
  })
  if (response.status === 401) {
    onUnauthorized?.()
    throw new Error('未授权，请重新登录')
  }
  if (!response.ok) {
    throw new Error('下载模板失败')
  }
  return response.blob()
}

export async function importPrompts(file: File, token: string, onUnauthorized?: () => void): Promise<ImportResult> {
  const formData = new FormData()
  formData.append('file', file)
  const response = await fetch(`${API_BASE}/prompts/import`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  })
  if (response.status === 401) {
    onUnauthorized?.()
    throw new Error('未授权，请重新登录')
  }
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.detail || '导入提示词失败')
  }
  return response.json()
}

