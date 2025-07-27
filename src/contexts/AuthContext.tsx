"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, onAuthStateChanged } from 'firebase/auth'
import { AuthService } from '@/lib/auth'

interface AuthContextType {
  user: User | null
  userProfile: any | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string, userType: string, metadata?: any) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    let unsubscribe: (() => void) | null = null
    
    try {
      // Import auth dynamically to avoid SSR issues
      import('@/lib/firebase').then(({ auth }) => {
        unsubscribe = onAuthStateChanged(auth, async (user) => {
          setUser(user)
          
          if (user) {
            // Fetch user profile from Supabase
            try {
              const profile = await AuthService.getUserProfile(user.uid)
              setUserProfile(profile)
            } catch (error) {
              console.error('Error fetching user profile:', error)
              setUserProfile(null)
            }
          } else {
            setUserProfile(null)
          }
          
          setLoading(false)
        })
      }).catch((error) => {
        console.error('Error initializing Firebase Auth:', error)
        setAuthError(error.message)
        setLoading(false)
      })
    } catch (error: any) {
      console.error('Error setting up auth:', error)
      setAuthError(error.message)
      setLoading(false)
    }

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      await AuthService.signInWithEmail(email, password)
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signUp = async (email: string, password: string, fullName: string, userType: string, metadata?: any) => {
    setLoading(true)
    try {
      await AuthService.signUpWithEmail(email, password, fullName, userType, metadata)
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      await AuthService.signOut()
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    try {
      await AuthService.resetPassword(email)
    } catch (error) {
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword
  }

  // Show error if Firebase initialization failed
  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 dark:bg-red-900/20">
        <div className="max-w-md mx-auto p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-red-200 dark:border-red-800">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            Firebase Configuration Error
          </h2>
          <p className="text-red-600 dark:text-red-300 text-sm mb-4">
            {authError}
          </p>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            <p className="mb-2">Please check your environment variables in <code>.env.local</code>:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>NEXT_PUBLIC_FIREBASE_API_KEY</li>
              <li>NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN</li>
              <li>NEXT_PUBLIC_FIREBASE_PROJECT_ID</li>
              <li>NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET</li>
              <li>NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID</li>
              <li>NEXT_PUBLIC_FIREBASE_APP_ID</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}