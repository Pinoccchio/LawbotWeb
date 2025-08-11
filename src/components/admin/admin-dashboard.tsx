"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "./admin-sidebar"
import { AdminHeader } from "./admin-header"
import { AdminDashboardView } from "./views/admin-dashboard-view"
import { CaseManagementView } from "./views/case-management-view"
import { UserManagementView } from "./views/user-management-view"
import { PNPUnitsView } from "./views/pnp-units-view"
// System Settings and Notifications views commented out as requested
// import { SystemSettingsView } from "./views/system-settings-view"
// import { NotificationsView } from "./views/notifications-view"

interface AdminDashboardProps {
  onViewChange: (view: "landing" | "admin" | "pnp") => void
  isDark: boolean
  toggleTheme: () => void
}

export type AdminView = "dashboard" | "cases" | "users" | "units" | "settings" | "notifications"

export function AdminDashboard({ onViewChange, isDark, toggleTheme }: AdminDashboardProps) {
  const [currentView, setCurrentView] = useState<AdminView>("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  
  // Setup event listener for view changes
  useEffect(() => {
    const handleViewChange = (e: CustomEvent) => {
      if (e.detail && typeof e.detail === 'string') {
        setCurrentView(e.detail as AdminView)
      }
    }
    
    // Add event listener
    window.addEventListener('admin-view-change', handleViewChange as EventListener)
    
    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener('admin-view-change', handleViewChange as EventListener)
    }
  }, [])

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <AdminDashboardView />
      case "cases":
        return <CaseManagementView />
      case "users":
        return <UserManagementView />
      case "units":
        return <PNPUnitsView />
      // System Settings and Notifications views removed as requested
      case "settings":
      case "notifications":
        // Fallback to dashboard if these views are somehow selected
        return <AdminDashboardView />
      default:
        return <AdminDashboardView />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900">
      <AdminSidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader
          onViewChange={onViewChange}
          onAdminViewChange={setCurrentView}
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
