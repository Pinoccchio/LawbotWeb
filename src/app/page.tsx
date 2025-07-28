"use client"

import { useState, useEffect } from "react"
import { LandingPage } from "@/components/landing-page"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { PNPDashboard } from "@/components/pnp/pnp-dashboard"
import { useAuth } from "@/contexts/AuthContext"

type UserRole = "landing" | "admin" | "pnp"

export default function LawBotSystem() {
  const { user, userRole, loading } = useAuth()
  const [currentView, setCurrentView] = useState<UserRole>("landing")
  const [isDark, setIsDark] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize theme based on system preference and localStorage
  useEffect(() => {
    // Check if user has a saved preference
    const savedTheme = localStorage.getItem('theme')
    
    if (savedTheme) {
      // Use saved preference
      const isSystemDark = savedTheme === 'dark'
      setIsDark(isSystemDark)
      if (isSystemDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    } else {
      // Use system preference
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setIsDark(isSystemDark)
      if (isSystemDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      // Save the system preference as initial choice
      localStorage.setItem('theme', isSystemDark ? 'dark' : 'light')
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // Only auto-update if user hasn't manually changed theme
      const savedTheme = localStorage.getItem('theme')
      if (!savedTheme) {
        setIsDark(e.matches)
        if (e.matches) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
    }

    mediaQuery.addEventListener('change', handleSystemThemeChange)
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange)
  }, [])

  // Check authentication state and redirect to appropriate dashboard
  useEffect(() => {
    if (!loading && !isInitialized) {
      console.log('🔍 Checking authentication state...', { user: !!user, userRole, loading })
      
      if (user && userRole) {
        // User is authenticated, redirect to their dashboard
        console.log(`✅ User authenticated with role: ${userRole}, redirecting...`)
        setCurrentView(userRole)
      } else {
        // User is not authenticated, stay on landing page
        console.log('❌ User not authenticated, staying on landing page')
        setCurrentView("landing")
      }
      
      setIsInitialized(true)
    }
  }, [user, userRole, loading, isInitialized])

  // Handle view changes from child components
  const handleViewChange = (newView: UserRole) => {
    console.log(`🔄 View change requested: ${currentView} → ${newView}`)
    setCurrentView(newView)
  }

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    
    if (newIsDark) {
      document.documentElement.classList.add("dark")
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem('theme', 'light')
    }
  }

  // Show loading state while authentication is being checked
  if (loading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Loading LawBot System...</p>
        </div>
      </div>
    )
  }

  if (currentView === "landing") {
    return <LandingPage onViewChange={handleViewChange} isDark={isDark} toggleTheme={toggleTheme} />
  } else if (currentView === "admin") {
    return <AdminDashboard onViewChange={handleViewChange} isDark={isDark} toggleTheme={toggleTheme} />
  } else if (currentView === "pnp") {
    return <PNPDashboard onViewChange={handleViewChange} isDark={isDark} toggleTheme={toggleTheme} />
  }

  return <LandingPage onViewChange={handleViewChange} isDark={isDark} toggleTheme={toggleTheme} />
}
