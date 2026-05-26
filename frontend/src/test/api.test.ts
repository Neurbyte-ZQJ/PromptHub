import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchApi,
  login,
  register,
  getCurrentUser,
  getPrompts,
  getPrompt,
  createPrompt,
  updatePrompt,
  deletePrompt,
  toggleFavorite,
  getTags,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/api'

const API_BASE = 'http://localhost:8000/api'

beforeEach(() => {
  vi.restoreAllMocks()
})

function mockFetchResponse(data: unknown, ok = true, status = 200) {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(data),
    blob: () => Promise.resolve(new Blob()),
  })
}

describe('fetchApi', () => {
  it('should make GET request with correct headers', async () => {
    const mockResp = mockFetchResponse({})
    globalThis.fetch = mockResp

    await fetchApi('/test', {}, 'test-token')

    expect(mockResp).toHaveBeenCalledWith(
      `${API_BASE}/test`,
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json',
        }),
      })
    )
  })

  it('should make POST request with body', async () => {
    const mockResp = mockFetchResponse({})
    globalThis.fetch = mockResp

    await fetchApi('/test', { method: 'POST', body: { name: 'test' } }, 'token')

    expect(mockResp).toHaveBeenCalledWith(
      `${API_BASE}/test`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'test' }),
      })
    )
  })

  it('should call onUnauthorized on 401', async () => {
    const onUnauthorized = vi.fn()
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({}),
    })

    await expect(fetchApi('/test', {}, 'token', onUnauthorized)).rejects.toThrow('未授权')
    expect(onUnauthorized).toHaveBeenCalled()
  })
})

describe('login', () => {
  it('should login and return token with user', async () => {
    const tokenData = { access_token: 'jwt-token', token_type: 'bearer' }
    const userData = { id: 1, username: 'testuser', email: 'test@test.com', created_at: '2024-01-01' }

    globalThis.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(tokenData),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(userData),
      })

    const result = await login({ email: 'test@test.com', password: 'pass' })
    expect(result.token.access_token).toBe('jwt-token')
    expect(result.user.username).toBe('testuser')
  })

  it('should throw on login failure', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({}),
    })

    await expect(login({ email: 'x@x.com', password: 'wrong' })).rejects.toThrow('登录失败')
  })
})

describe('register', () => {
  it('should register and return user', async () => {
    const userData = { id: 1, username: 'newuser', email: 'new@test.com', created_at: '2024-01-01' }
    globalThis.fetch = mockFetchResponse(userData, true, 201)

    const result = await register({ username: 'newuser', email: 'new@test.com', password: 'pass' })
    expect(result.username).toBe('newuser')
  })

  it('should throw on register failure', async () => {
    globalThis.fetch = mockFetchResponse({}, false, 400)

    await expect(register({ username: 'x', email: 'x', password: 'x' })).rejects.toThrow('注册失败')
  })
})

describe('getCurrentUser', () => {
  it('should get current user with token', async () => {
    const userData = { id: 1, username: 'user', email: 'e@e.com', created_at: '2024-01-01' }
    globalThis.fetch = mockFetchResponse(userData)

    const result = await getCurrentUser('token')
    expect(result.username).toBe('user')
  })
})

describe('getPrompts', () => {
  it('should fetch prompts with query params', async () => {
    const prompts = [
      { id: 1, title: 'P1', content: 'c1', is_public: false, created_at: '2024-01-01' },
    ]
    globalThis.fetch = mockFetchResponse(prompts)

    const result = await getPrompts('token', undefined, { search: 'test', page: 1 })
    expect(result).toHaveLength(1)

    const calledUrl = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string
    expect(calledUrl).toContain('search=test')
    expect(calledUrl).toContain('page=1')
  })

  it('should fetch prompts without params', async () => {
    globalThis.fetch = mockFetchResponse([])

    const result = await getPrompts('token')
    expect(result).toEqual([])

    const calledUrl = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string
    expect(calledUrl).toBe(`${API_BASE}/prompts`)
  })
})

describe('createPrompt', () => {
  it('should create a prompt', async () => {
    const newPrompt = { id: 1, title: 'New', content: 'c', is_public: false, created_at: '2024-01-01' }
    globalThis.fetch = mockFetchResponse(newPrompt)

    const result = await createPrompt(
      { title: 'New', content: 'c', category_ids: [], tag_ids: [] },
      'token'
    )
    expect(result.title).toBe('New')
  })
})

describe('updatePrompt', () => {
  it('should update a prompt', async () => {
    const updated = { id: 1, title: 'Updated', content: 'c', is_public: false, created_at: '2024-01-01' }
    globalThis.fetch = mockFetchResponse(updated)

    const result = await updatePrompt(1, { title: 'Updated' }, 'token')
    expect(result.title).toBe('Updated')
  })
})

describe('deletePrompt', () => {
  it('should delete a prompt', async () => {
    globalThis.fetch = mockFetchResponse(null, true, 200)

    await expect(deletePrompt(1, 'token')).resolves.toBeUndefined()
  })
})

describe('toggleFavorite', () => {
  it('should toggle favorite', async () => {
    const favData = { id: 1, user_id: 1, prompt_id: 1, created_at: '2024-01-01' }
    globalThis.fetch = mockFetchResponse(favData)

    const result = await toggleFavorite(1, 'token')
    expect(result.prompt_id).toBe(1)
  })
})

describe('getTags', () => {
  it('should fetch tags without auth', async () => {
    const tags = [{ id: 1, name: 'Python' }, { id: 2, name: 'JS' }]
    globalThis.fetch = mockFetchResponse(tags)

    const result = await getTags()
    expect(result).toHaveLength(2)
  })
})

describe('Category CRUD', () => {
  it('should get categories', async () => {
    globalThis.fetch = mockFetchResponse([])
    const result = await getCategories('token')
    expect(result).toEqual([])
  })

  it('should create category', async () => {
    const cat = { id: 1, name: 'Dev', parent_id: null, user_id: 1, sort_order: 0, created_at: '2024-01-01', children: [] }
    globalThis.fetch = mockFetchResponse(cat)

    const result = await createCategory({ name: 'Dev' }, 'token')
    expect(result.name).toBe('Dev')
  })

  it('should update category', async () => {
    const cat = { id: 1, name: 'Updated', parent_id: null, user_id: 1, sort_order: 0, created_at: '2024-01-01', children: [] }
    globalThis.fetch = mockFetchResponse(cat)

    const result = await updateCategory(1, { name: 'Updated' }, 'token')
    expect(result.name).toBe('Updated')
  })

  it('should delete category', async () => {
    globalThis.fetch = mockFetchResponse(null, true, 200)
    await expect(deleteCategory(1, 'token')).resolves.toBeUndefined()
  })
})
