"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface User {
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  requestOTP: (email: string) => Promise<{ success: boolean; error?: string; expiresIn?: number }>
  verifyOTP: (email: string, otp: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("turbineai_token")
    const storedUser = localStorage.getItem("turbineai_user")
    
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const requestOTP = useCallback(async (email: string) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      
      if (res.ok) {
        return { success: true, expiresIn: data.expires_in }
      }
      return { success: false, error: data.detail || "Failed to send OTP" }
    } catch {
      return { success: false, error: "Network error. Is the backend running?" }
    }
  }, [])

  const verifyOTP = useCallback(async (email: string, otp: string) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      })
      const data = await res.json()
      
      if (res.ok && data.access_token) {
        setToken(data.access_token)
        setUser(data.user)
        localStorage.setItem("turbineai_token", data.access_token)
        localStorage.setItem("turbineai_user", JSON.stringify(data.user))
        return { success: true }
      }
      return { success: false, error: data.detail || "Invalid OTP" }
    } catch {
      return { success: false, error: "Network error" }
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("turbineai_token")
    localStorage.removeItem("turbineai_user")
  }, [])

  return (
    <AuthContext.Provider value={{ 
      user, 
      token,
      isAuthenticated: !!token, 
      isLoading,
      requestOTP, 
      verifyOTP, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Helper hook for authenticated API calls
export function useAuthFetch() {
  const { token, logout } = useAuth()
  
  return useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })
    
    if (res.status === 401) {
      logout()
      throw new Error("Session expired")
    }
    
    return res
  }, [token, logout])
}
