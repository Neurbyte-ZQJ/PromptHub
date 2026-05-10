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
  tag_ids: number[]
  new_tags?: string[]
}

const API_BASE = 'http://localhost:8000/api'

export async function getPrompts(): Promise<Prompt[]> {
  const response = await fetch(`${API_BASE}/prompts`)
  if (!response.ok) {
    throw new Error('Failed to fetch prompts')
  }
  return response.json()
}

export async function getPrompt(id: number): Promise<PromptDetail> {
  const response = await fetch(`${API_BASE}/prompts/${id}`)
  if (!response.ok) {
    throw new Error('Failed to fetch prompt')
  }
  return response.json()
}

export async function getTags(): Promise<Tag[]> {
  const response = await fetch(`${API_BASE}/tags`)
  if (!response.ok) {
    throw new Error('Failed to fetch tags')
  }
  return response.json()
}

export async function createPrompt(data: PromptFormData): Promise<Prompt> {
  const response = await fetch(`${API_BASE}/prompts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error('Failed to create prompt')
  }
  return response.json()
}

export async function updatePrompt(id: number, data: Partial<PromptFormData>): Promise<Prompt> {
  const response = await fetch(`${API_BASE}/prompts/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error('Failed to update prompt')
  }
  return response.json()
}

export async function deletePrompt(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/prompts/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error('Failed to delete prompt')
  }
}
