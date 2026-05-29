
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'

export interface User {
  id: number
  username: string
  email: string
  created_at: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  refreshTokenValue: string | null
  login: (token: string, refreshToken: string, user: User) => void
  logout: () => void
  updateTokens: (accessToken: string, refreshToken: string) => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_KEY = 'prompthub_token'
const REFRESH_TOKEN_KEY = 'prompthub_refresh_token'
const USER_KEY = 'prompthub_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [refreshTokenValue, setRefreshTokenValue] = useState<string | null>(null)

  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY)
    const savedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
    const savedUser = localStorage.getItem(USER_KEY)
    if (savedToken && savedRefreshToken && savedUser) {
      setToken(savedToken)
      setRefreshTokenValue(savedRefreshToken)
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const login = useCallback((newToken: string, newRefreshToken: string, newUser: User) => {
    setToken(newToken)
    setRefreshTokenValue(newRefreshToken)
    setUser(newUser)
    localStorage.setItem(TOKEN_KEY, newToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken)
    localStorage.setItem(USER_KEY, JSON.stringify(newUser))
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setRefreshTokenValue(null)
    setUser(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }, [])

  const updateTokens = useCallback((accessToken: string, newRefreshToken: string) => {
    setToken(accessToken)
    setRefreshTokenValue(newRefreshToken)
    localStorage.setItem(TOKEN_KEY, accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        refreshTokenValue,
        login,
        logout,
        updateTokens,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
