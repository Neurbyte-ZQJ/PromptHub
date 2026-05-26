
import { useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import * as api from '../api'
import type { PromptFormData, PromptListParams, LoginData, RegisterData, CategoryFormData } from '../api'

export function useApi() {
  const { token, logout } = useAuth()

  const handleUnauthorized = useCallback(() => {
    logout()
  }, [logout])

  const login = useCallback(async (data: LoginData) => {
    return await api.login(data)
  }, [])

  const register = useCallback(async (data: RegisterData) => {
    return await api.register(data)
  }, [])

  const getPrompts = useCallback(async (params?: PromptListParams) => {
    if (!token) throw new Error('未登录')
    return await api.getPrompts(token, handleUnauthorized, params)
  }, [token, handleUnauthorized])

  const getPrompt = useCallback(async (id: number) => {
    if (!token) throw new Error('未登录')
    return await api.getPrompt(id, token, handleUnauthorized)
  }, [token, handleUnauthorized])

  const createPrompt = useCallback(async (data: PromptFormData) => {
    if (!token) throw new Error('未登录')
    return await api.createPrompt(data, token, handleUnauthorized)
  }, [token, handleUnauthorized])

  const updatePrompt = useCallback(async (id: number, data: Partial<PromptFormData>) => {
    if (!token) throw new Error('未登录')
    return await api.updatePrompt(id, data, token, handleUnauthorized)
  }, [token, handleUnauthorized])

  const deletePrompt = useCallback(async (id: number) => {
    if (!token) throw new Error('未登录')
    return await api.deletePrompt(id, token, handleUnauthorized)
  }, [token, handleUnauthorized])

  const toggleFavorite = useCallback(async (promptId: number) => {
    if (!token) throw new Error('未登录')
    return await api.toggleFavorite(promptId, token, handleUnauthorized)
  }, [token, handleUnauthorized])

  const getTags = useCallback(async () => {
    return await api.getTags()
  }, [])

  const getCategories = useCallback(async () => {
    if (!token) throw new Error('未登录')
    return await api.getCategories(token, handleUnauthorized)
  }, [token, handleUnauthorized])

  const createCategory = useCallback(async (data: CategoryFormData) => {
    if (!token) throw new Error('未登录')
    return await api.createCategory(data, token, handleUnauthorized)
  }, [token, handleUnauthorized])

  const updateCategory = useCallback(async (id: number, data: Partial<CategoryFormData>) => {
    if (!token) throw new Error('未登录')
    return await api.updateCategory(id, data, token, handleUnauthorized)
  }, [token, handleUnauthorized])

  const deleteCategory = useCallback(async (id: number) => {
    if (!token) throw new Error('未登录')
    return await api.deleteCategory(id, token, handleUnauthorized)
  }, [token, handleUnauthorized])

  const exportPrompts = useCallback(async () => {
    if (!token) throw new Error('未登录')
    return await api.exportPrompts(token, handleUnauthorized)
  }, [token, handleUnauthorized])

  const downloadImportTemplate = useCallback(async () => {
    if (!token) throw new Error('未登录')
    return await api.downloadImportTemplate(token, handleUnauthorized)
  }, [token, handleUnauthorized])

  const importPrompts = useCallback(async (file: File) => {
    if (!token) throw new Error('未登录')
    return await api.importPrompts(file, token, handleUnauthorized)
  }, [token, handleUnauthorized])

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
  }
}

