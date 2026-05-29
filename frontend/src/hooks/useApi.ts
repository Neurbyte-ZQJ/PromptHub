import { useCallback, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import * as api from '../api'
import type { PromptFormData, PromptListParams, PaginatedResponse, LoginData, RegisterData, CategoryFormData, SharedLinkCreateData, CollaboratorAddData, CollaboratorUpdateData } from '../api'

export function useApi() {
  const { token, refreshTokenValue, logout, updateTokens } = useAuth()
  const isRefreshing = useRef(false)
  const refreshPromise = useRef<Promise<boolean> | null>(null)

  const tryRefresh = useCallback(async (): Promise<boolean> => {
    if (isRefreshing.current && refreshPromise.current) {
      return refreshPromise.current
    }

    if (!refreshTokenValue) {
      return false
    }

    isRefreshing.current = true
    refreshPromise.current = (async () => {
      try {
        const tokenResponse = await api.refreshToken(refreshTokenValue)
        updateTokens(tokenResponse.access_token, tokenResponse.refresh_token)
        return true
      } catch {
        logout()
        return false
      } finally {
        isRefreshing.current = false
        refreshPromise.current = null
      }
    })()

    return refreshPromise.current
  }, [refreshTokenValue, logout, updateTokens])

  const withRefresh = useCallback(async <T>(fn: () => Promise<T>): Promise<T> => {
    try {
      return await fn()
    } catch (error) {
      const isUnauthorized =
        error instanceof Error &&
        (error.message === 'UNAUTHORIZED' || error.message.includes('401'))

      if (!isUnauthorized) {
        throw error
      }

      const refreshed = await tryRefresh()
      if (!refreshed) {
        throw new Error('未授权，请重新登录')
      }

      return await fn()
    }
  }, [tryRefresh])

  const login = useCallback(async (data: LoginData) => {
    return await api.login(data)
  }, [])

  const register = useCallback(async (data: RegisterData) => {
    return await api.register(data)
  }, [])

  const getPrompts = useCallback(async (params?: PromptListParams): Promise<PaginatedResponse<api.Prompt>> => {
    if (!token) throw new Error('未登录')
    return withRefresh(() => api.getPrompts(token, params))
  }, [token, withRefresh])

  const getPrompt = useCallback(async (id: number) => {
    if (!token) throw new Error('未登录')
    return withRefresh(() => api.getPrompt(id, token))
  }, [token, withRefresh])

  const createPrompt = useCallback(async (data: PromptFormData) => {
    if (!token) throw new Error('未登录')
    return withRefresh(() => api.createPrompt(data, token))
  }, [token, withRefresh])

  const updatePrompt = useCallback(async (id: number, data: Partial<PromptFormData>) => {
    if (!token) throw new Error('未登录')
    return withRefresh(() => api.updatePrompt(id, data, token))
  }, [token, withRefresh])

  const deletePrompt = useCallback(async (id: number) => {
    if (!token) throw new Error('未登录')
    return withRefresh(() => api.deletePrompt(id, token))
  }, [token, withRefresh])

  const toggleFavorite = useCallback(async (promptId: number) => {
    if (!token) throw new Error('未登录')
    return withRefresh(() => api.toggleFavorite(promptId, token))
  }, [token, withRefresh])

  const getTags = useCallback(async () => {
    return await api.getTags()
  }, [])

  const getCategories = useCallback(async () => {
    if (!token) throw new Error('未登录')
    return withRefresh(() => api.getCategories(token))
  }, [token, withRefresh])

  const createCategory = useCallback(async (data: CategoryFormData) => {
    if (!token) throw new Error('未登录')
    return withRefresh(() => api.createCategory(data, token))
  }, [token, withRefresh])

  const updateCategory = useCallback(async (id: number, data: Partial<CategoryFormData>) => {
    if (!token) throw new Error('未登录')
    return withRefresh(() => api.updateCategory(id, data, token))
  }, [token, withRefresh])

  const deleteCategory = useCallback(async (id: number) => {
    if (!token) throw new Error('未登录')
    return withRefresh(() => api.deleteCategory(id, token))
  }, [token, withRefresh])

  const exportPrompts = useCallback(async () => {
    if (!token) throw new Error('未登录')
    return withRefresh(() => api.exportPrompts(token))
  }, [token, withRefresh])

  const downloadImportTemplate = useCallback(async () => {
    if (!token) throw new Error('未登录')
    return withRefresh(() => api.downloadImportTemplate(token))
  }, [token, withRefresh])

  const importPrompts = useCallback(async (file: File) => {
    if (!token) throw new Error('未登录')
    return withRefresh(() => api.importPrompts(file, token))
  }, [token, withRefresh])

  const createShareLink = useCallback(async (promptId: number, data: SharedLinkCreateData) => {
    if (!token) throw new Error('未登录')
    return withRefresh(() => api.createShareLink(promptId, data, token))
  }, [token, withRefresh])

  const listShareLinks = useCallback(async (promptId: number) => {
    if (!token) throw new Error('未登录')
    return withRefresh(() => api.listShareLinks(promptId, token))
  }, [token, withRefresh])

  const deleteShareLink = useCallback(async (promptId: number, shareId: number) => {
    if (!token) throw new Error('未登录')
    return withRefresh(() => api.deleteShareLink(promptId, shareId, token))
  }, [token, withRefresh])

  const addCollaborator = useCallback(async (promptId: number, data: CollaboratorAddData) => {
    if (!token) throw new Error('未登录')
    return withRefresh(() => api.addCollaborator(promptId, data, token))
  }, [token, withRefresh])

  const listCollaborators = useCallback(async (promptId: number) => {
    if (!token) throw new Error('未登录')
    return withRefresh(() => api.listCollaborators(promptId, token))
  }, [token, withRefresh])

  const updateCollaborator = useCallback(async (promptId: number, userId: number, data: CollaboratorUpdateData) => {
    if (!token) throw new Error('未登录')
    return withRefresh(() => api.updateCollaborator(promptId, userId, data, token))
  }, [token, withRefresh])

  const removeCollaborator = useCallback(async (promptId: number, userId: number) => {
    if (!token) throw new Error('未登录')
    return withRefresh(() => api.removeCollaborator(promptId, userId, token))
  }, [token, withRefresh])

  const searchUsers = useCallback(async (query: string) => {
    if (!token) throw new Error('未登录')
    return withRefresh(() => api.searchUsers(query, token))
  }, [token, withRefresh])

  return {
    login,
    register,
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
    exportPrompts,
    downloadImportTemplate,
    importPrompts,
    createShareLink,
    listShareLinks,
    deleteShareLink,
    addCollaborator,
    listCollaborators,
    updateCollaborator,
    removeCollaborator,
    searchUsers,
  }
}
