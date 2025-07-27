"use client"

import { useState, useEffect } from "react"
import { LandingPage } from "@/components/landing-page"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { PNPDashboard } from "@/components/pnp/pnp-dashboard"

type UserRole = "landing" | "admin" | "pnp"

export default function LawBotSystem() {
  const [currentView, setCurrentView] = useState<UserRole>("landing")
  const [isDark, setIsDark] = useState(false)

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

  if (currentView === "landing") {
    return <LandingPage onViewChange={setCurrentView} isDark={isDark} toggleTheme={toggleTheme} />
  } else if (currentView === "admin") {
    return <AdminDashboard onViewChange={setCurrentView} isDark={isDark} toggleTheme={toggleTheme} />
  } else if (currentView === "pnp") {
    return <PNPDashboard onViewChange={setCurrentView} isDark={isDark} toggleTheme={toggleTheme} />
  }

  return <LandingPage onViewChange={setCurrentView} isDark={isDark} toggleTheme={toggleTheme} />
}
