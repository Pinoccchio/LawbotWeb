"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, onAuthStateChanged } from 'firebase/auth'
import { AuthService } from '@/lib/auth'
import { PNPOfficerService } from '@/lib/pnp-officer-service'

interface AuthContextType {
  user: User | null
  userProfile: any | null
  userRole: 'admin' | 'pnp' | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<User | void>
  signUp: (email: string, password: string, fullName: string, userType: string, metadata?: any) => Promise<User | void>
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
  const [userRole, setUserRole] = useState<'admin' | 'pnp' | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    let unsubscribe: (() => void) | null = null
    
    try {
      // Import auth dynamically to avoid SSR issues
      import('@/lib/firebase').then(({ auth }) => {
        unsubscribe = onAuthStateChanged(auth, async (user) => {
          console.log('🔄 Auth state changed:', user ? `User: ${user.uid}` : 'No user')
          setUser(user)
          
          if (user) {
            // Set a timeout to prevent infinite loading
            const timeoutId = setTimeout(() => {
              console.log('⚠️ Profile fetch timeout - setting loading to false')
              setLoading(false)
            }, 5000) // 5 second timeout
            
            // Fetch user profile from Supabase
            try {
              console.log('🔍 Fetching user profile for:', user.uid)
              const profile = await AuthService.getUserProfile(user.uid)
              
              // Clear timeout since we got a response
              clearTimeout(timeoutId)
              
              console.log('📋 User profile fetched:', profile ? 'Success' : 'Not found')
              setUserProfile(profile)
              
              // Determine user role and save to localStorage
              if (profile) {
                const role = profile.user_type === 'ADMIN' ? 'admin' : 
                           profile.user_type === 'PNP_OFFICER' ? 'pnp' : null
                
                console.log(`🔑 User role determined: ${role}`)
                setUserRole(role)
                
                // Persist authentication state
                if (role) {
                  localStorage.setItem('userRole', role)
                  localStorage.setItem('authPersistence', 'true')
                }
              } else {
                console.log('⚠️ No profile found for user')
                setUserRole(null)
                localStorage.removeItem('userRole')
                localStorage.removeItem('authPersistence')
              }
            } catch (error) {
              console.error('❌ Error fetching user profile:', error)
              setUserProfile(null)
              setUserRole(null)
              localStorage.removeItem('userRole')
              localStorage.removeItem('authPersistence')
            } finally {
              // Always set loading to false when done
              setLoading(false)
            }
          } else {
            console.log('👋 User signed out or no user')
            // Clear all cached data when user logs out
            PNPOfficerService.clearCache()
            setUserProfile(null)
            setUserRole(null)
            localStorage.removeItem('userRole')
            localStorage.removeItem('authPersistence')
            setLoading(false)
          }
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
      const user = await AuthService.signInWithEmail(email, password)
      console.log('👤 User signed in successfully:', user.uid)
      // Loading will be set to false in the onAuthStateChanged listener
      return user
    } catch (error) {
      console.error('❌ Sign in error:', error)
      setLoading(false)
      throw error
    }
  }

  const signUp = async (email: string, password: string, fullName: string, userType: string, metadata?: any) => {
    setLoading(true)
    try {
      const user = await AuthService.signUpWithEmail(email, password, fullName, userType, metadata)
      console.log('👤 User signed up successfully:', user.uid)
      // Loading will be set to false in the onAuthStateChanged listener
      return user
    } catch (error) {
      console.error('❌ Sign up error:', error)
      setLoading(false)
      throw error
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      console.log('🚪 Signing out user...')
      // Clear service caches before signing out
      PNPOfficerService.clearCache()
      await AuthService.signOut()
      console.log('✅ User signed out successfully')
      // Loading will be set to false in the onAuthStateChanged listener
    } catch (error) {
      console.error('❌ Sign out error:', error)
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
    userRole,
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