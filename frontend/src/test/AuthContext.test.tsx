import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'

const TOKEN_KEY = 'prompthub_token'
const REFRESH_TOKEN_KEY = 'prompthub_refresh_token'
const USER_KEY = 'prompthub_user'

beforeEach(() => {
  localStorage.clear()
})

function createWrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}

describe('AuthProvider', () => {
  it('should initialize with no auth state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper })
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
    expect(result.current.token).toBeNull()
  })

  it('should restore auth from localStorage', () => {
    const savedUser = JSON.stringify({ id: 1, username: 'testuser', email: 't@t.com', created_at: '2024-01-01' })
    localStorage.setItem(TOKEN_KEY, 'saved-token')
    localStorage.setItem(REFRESH_TOKEN_KEY, 'saved-refresh-token')
    localStorage.setItem(USER_KEY, savedUser)

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper })
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.token).toBe('saved-token')
    expect(result.current.refreshTokenValue).toBe('saved-refresh-token')
    expect(result.current.user?.username).toBe('testuser')
  })

  it('should login and persist to localStorage', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper })

    act(() => {
      result.current.login('new-token', 'new-refresh-token', { id: 1, username: 'user', email: 'e@e.com', created_at: '2024-01-01' })
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.token).toBe('new-token')
    expect(result.current.refreshTokenValue).toBe('new-refresh-token')
    expect(result.current.user?.username).toBe('user')
    expect(localStorage.getItem(TOKEN_KEY)).toBe('new-token')
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBe('new-refresh-token')
    expect(JSON.parse(localStorage.getItem(USER_KEY)!).username).toBe('user')
  })

  it('should logout and clear localStorage', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper })

    act(() => {
      result.current.login('token', 'refresh-token', { id: 1, username: 'u', email: 'e', created_at: '2024' })
    })
    expect(result.current.isAuthenticated).toBe(true)

    act(() => {
      result.current.logout()
    })
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
    expect(result.current.token).toBeNull()
    expect(result.current.refreshTokenValue).toBeNull()
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull()
    expect(localStorage.getItem(USER_KEY)).toBeNull()
  })
})

describe('useAuth', () => {
  it('should throw when used outside AuthProvider', () => {
    expect(() => {
      renderHook(() => useAuth())
    }).toThrow('useAuth must be used within an AuthProvider')
  })
})
