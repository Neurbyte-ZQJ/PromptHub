
import { useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import * as api from '../api'
import type { PromptFormData, LoginData, RegisterData } from '../api'

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

  const getPrompts = useCallback(async () => {
    if (!token) throw new Error('未登录')
    return await api.getPrompts(token, handleUnauthorized)
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

  const getTags = useCallback(async () => {
    return await api.getTags()
  }, [])

  return {
    login,
    register,
    getPrompts,
    getPrompt,
    createPrompt,
    updatePrompt,
    deletePrompt,
    getTags,
  }
}

