
export interface Tag {
  id: number
  name: string
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
  tags: Tag[]
}

export interface PromptDetail extends Prompt {
  versions: PromptVersion[]
}

export interface PromptFormData {
  title: string
  scenario?: string
  content: string
  variables?: string
  is_public?: boolean
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

const API_BASE = 'http://localhost:8000/api'

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

export async function getPrompts(token: string, onUnauthorized?: () => void): Promise<Prompt[]> {
  const response = await fetchApi('/prompts', {}, token, onUnauthorized)
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

