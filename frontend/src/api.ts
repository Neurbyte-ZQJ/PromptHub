
export interface Tag {
  id: number
  name: string
}

export interface Category {
  id: number
  name: string
  parent_id: number | null
  user_id: number | null
  owner_username?: string | null
  is_foreign?: boolean
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
  collaborator_role?: string | null
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

export interface PaginationInfo {
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationInfo
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
  refresh_token: string
  token_type: string
}

export interface PasswordResetRequestData {
  email: string
}

export interface PasswordResetData {
  token: string
  new_password: string
}

export interface PasswordResetRequestResponse {
  reset_token: string
  message: string
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
): Promise<Response> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: options.method || 'GET',
    headers: getHeaders(token),
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (response.status === 401) {
    throw new Error('UNAUTHORIZED')
  }

  return response
}

export async function refreshToken(refreshTokenValue: string): Promise<TokenResponse> {
  const response = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ refresh_token: refreshTokenValue }),
  })
  if (!response.ok) {
    throw new Error('刷新令牌失败')
  }
  return response.json()
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

export async function getCurrentUser(token: string): Promise<User> {
  const response = await fetchApi('/auth/me', {}, token)
  if (!response.ok) {
    throw new Error('获取用户信息失败')
  }
  return response.json()
}

export async function getPrompts(token: string, params: PromptListParams = {}): Promise<PaginatedResponse<Prompt>> {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value))
    }
  })
  const endpoint = query.size > 0 ? `/prompts?${query.toString()}` : '/prompts'
  const response = await fetchApi(endpoint, {}, token)
  if (!response.ok) {
    throw new Error('获取提示词失败')
  }
  const data = await response.json()
  const pagination: PaginationInfo = {
    totalCount: parseInt(response.headers.get('X-Total-Count') || '0', 10),
    page: parseInt(response.headers.get('X-Page') || '1', 10),
    pageSize: parseInt(response.headers.get('X-Page-Size') || '20', 10),
    totalPages: parseInt(response.headers.get('X-Total-Pages') || '0', 10),
  }
  return { data, pagination }
}

export async function getPrompt(id: number, token: string): Promise<PromptDetail> {
  const response = await fetchApi(`/prompts/${id}`, {}, token)
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

export async function createPrompt(data: PromptFormData, token: string): Promise<Prompt> {
  const response = await fetchApi('/prompts', { method: 'POST', body: data }, token)
  if (!response.ok) {
    throw new Error('创建提示词失败')
  }
  return response.json()
}

export async function updatePrompt(id: number, data: Partial<PromptFormData>, token: string): Promise<Prompt> {
  const response = await fetchApi(`/prompts/${id}`, { method: 'PUT', body: data }, token)
  if (!response.ok) {
    throw new Error('更新提示词失败')
  }
  return response.json()
}

export async function deletePrompt(id: number, token: string): Promise<void> {
  const response = await fetchApi(`/prompts/${id}`, { method: 'DELETE' }, token)
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

export async function toggleFavorite(promptId: number, token: string): Promise<FavoriteResponse> {
  const response = await fetchApi(`/prompts/${promptId}/favorite`, { method: 'POST' }, token)
  if (!response.ok) {
    throw new Error('收藏操作失败')
  }
  return response.json()
}

export async function getCategories(token: string): Promise<Category[]> {
  const response = await fetchApi('/categories', {}, token)
  if (!response.ok) {
    throw new Error('获取分类失败')
  }
  return response.json()
}

export async function createCategory(data: CategoryFormData, token: string): Promise<Category> {
  const response = await fetchApi('/categories', { method: 'POST', body: data }, token)
  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.detail || '创建分类失败')
  }
  return response.json()
}

export async function updateCategory(id: number, data: Partial<CategoryFormData>, token: string): Promise<Category> {
  const response = await fetchApi(`/categories/${id}`, { method: 'PUT', body: data }, token)
  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.detail || '更新分类失败')
  }
  return response.json()
}

export async function deleteCategory(id: number, token: string): Promise<void> {
  const response = await fetchApi(`/categories/${id}`, { method: 'DELETE' }, token)
  if (!response.ok) {
    throw new Error('删除分类失败')
  }
}

export interface ImportResult {
  imported: number
  skipped: number
}

export async function exportPrompts(token: string): Promise<Blob> {
  const response = await fetch(`${API_BASE}/prompts/export`, {
    headers: getHeaders(token),
  })
  if (response.status === 401) {
    throw new Error('UNAUTHORIZED')
  }
  if (!response.ok) {
    throw new Error('导出提示词失败')
  }
  return response.blob()
}

export async function downloadImportTemplate(token: string): Promise<Blob> {
  const response = await fetch(`${API_BASE}/prompts/import-template`, {
    headers: getHeaders(token),
  })
  if (response.status === 401) {
    throw new Error('UNAUTHORIZED')
  }
  if (!response.ok) {
    throw new Error('下载模板失败')
  }
  return response.blob()
}

export async function importPrompts(file: File, token: string): Promise<ImportResult> {
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
    throw new Error('UNAUTHORIZED')
  }
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.detail || '导入提示词失败')
  }
  return response.json()
}

export async function requestPasswordReset(data: PasswordResetRequestData): Promise<PasswordResetRequestResponse> {
  const response = await fetch(`${API_BASE}/auth/password-reset-request`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.detail || '请求重置失败')
  }
  return response.json()
}

export async function resetPassword(data: PasswordResetData): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE}/auth/password-reset`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.detail || '重置密码失败')
  }
  return response.json()
}

export interface SharedLink {
  id: number
  prompt_id: number
  token: string
  has_password: boolean
  expires_at: string | null
  created_by: number
  created_at: string
}

export interface SharedLinkCreateData {
  password?: string
  expires_hours?: number
}

export interface SharedPrompt {
  title: string
  scenario?: string
  content: string
  variables?: string
  owner_username?: string
  categories: Category[]
  tags: Tag[]
}

export interface Collaborator {
  id: number
  prompt_id: number
  user_id: number
  role: string
  username?: string
  created_at: string
}

export interface CollaboratorAddData {
  user_id: number
  role: string
}

export interface CollaboratorUpdateData {
  role: string
}

export async function createShareLink(promptId: number, data: SharedLinkCreateData, token: string): Promise<SharedLink> {
  const response = await fetchApi(`/prompts/${promptId}/shares`, { method: 'POST', body: data }, token)
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.detail || '创建分享链接失败')
  }
  return response.json()
}

export async function listShareLinks(promptId: number, token: string): Promise<SharedLink[]> {
  const response = await fetchApi(`/prompts/${promptId}/shares`, {}, token)
  if (!response.ok) {
    throw new Error('获取分享链接失败')
  }
  return response.json()
}

export async function deleteShareLink(promptId: number, shareId: number, token: string): Promise<void> {
  const response = await fetchApi(`/prompts/${promptId}/shares/${shareId}`, { method: 'DELETE' }, token)
  if (!response.ok) {
    throw new Error('删除分享链接失败')
  }
}

export async function accessSharedPrompt(token: string, password?: string): Promise<SharedPrompt> {
  const query = password ? `?password=${encodeURIComponent(password)}` : ''
  const response = await fetch(`${API_BASE}/shared/${token}${query}`)
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.detail || '访问分享链接失败')
  }
  return response.json()
}

export async function addCollaborator(promptId: number, data: CollaboratorAddData, token: string): Promise<Collaborator> {
  const response = await fetchApi(`/prompts/${promptId}/collaborators`, { method: 'POST', body: data }, token)
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.detail || '添加协作者失败')
  }
  return response.json()
}

export async function listCollaborators(promptId: number, token: string): Promise<Collaborator[]> {
  const response = await fetchApi(`/prompts/${promptId}/collaborators`, {}, token)
  if (!response.ok) {
    throw new Error('获取协作者列表失败')
  }
  return response.json()
}

export async function updateCollaborator(promptId: number, userId: number, data: CollaboratorUpdateData, token: string): Promise<Collaborator> {
  const response = await fetchApi(`/prompts/${promptId}/collaborators/${userId}`, { method: 'PUT', body: data }, token)
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.detail || '更新协作者角色失败')
  }
  return response.json()
}

export async function removeCollaborator(promptId: number, userId: number, token: string): Promise<void> {
  const response = await fetchApi(`/prompts/${promptId}/collaborators/${userId}`, { method: 'DELETE' }, token)
  if (!response.ok) {
    throw new Error('移除协作者失败')
  }
}

export async function searchUsers(query: string, token: string): Promise<User[]> {
  const response = await fetchApi(`/users/search?q=${encodeURIComponent(query)}`, {}, token)
  if (!response.ok) {
    throw new Error('搜索用户失败')
  }
  return response.json()
}

