"use client"

import { useState } from "react"
import { PNPSidebar } from "./pnp-sidebar"
import { PNPHeader } from "./pnp-header"
import { PNPDashboardView } from "./views/pnp-dashboard-view"
import { MyCasesView } from "./views/my-cases-view"
import { CaseSearchView } from "./views/case-search-view"
import { EvidenceViewerView } from "./views/evidence-viewer-view"
import { ProfileView } from "./views/profile-view"

interface PNPDashboardProps {
  onViewChange: (view: "landing" | "admin" | "pnp") => void
  isDark: boolean
  toggleTheme: () => void
}

export type PNPView = "dashboard" | "cases" | "search" | "evidence" | "profile"

export function PNPDashboard({ onViewChange, isDark, toggleTheme }: PNPDashboardProps) {
  const [currentView, setCurrentView] = useState<PNPView>("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <PNPDashboardView />
      case "cases":
        return <MyCasesView />
      case "search":
        return <CaseSearchView />
      case "evidence":
        return <EvidenceViewerView />
      case "profile":
        return <ProfileView />
      default:
        return <PNPDashboardView />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900">
      <PNPSidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <PNPHeader
          onViewChange={onViewChange}
          isDark={isDark}
          toggleTheme={toggleTheme}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <main className="flex-1 overflow-y-auto p-6">{renderView()}</main>
      </div>
    </div>
  )
}
