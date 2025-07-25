"use client"

import { useState } from "react"
import { LandingPage } from "@/components/landing-page"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { PNPDashboard } from "@/components/pnp/pnp-dashboard"

type UserRole = "landing" | "admin" | "pnp"

export default function LawBotSystem() {
  const [currentView, setCurrentView] = useState<UserRole>("landing")
  const [isDark, setIsDark] = useState(false)

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle("dark")
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
