"use client"

import { useState } from "react"
import { AdminSidebar } from "./admin-sidebar"
import { AdminHeader } from "./admin-header"
import { AdminDashboardView } from "./views/admin-dashboard-view"
import { CaseManagementView } from "./views/case-management-view"
import { UserManagementView } from "./views/user-management-view"
import { PNPUnitsView } from "./views/pnp-units-view"
import { SystemSettingsView } from "./views/system-settings-view"
import { NotificationsView } from "./views/notifications-view"

interface AdminDashboardProps {
  onViewChange: (view: "landing" | "admin" | "pnp") => void
  isDark: boolean
  toggleTheme: () => void
}

export type AdminView = "dashboard" | "cases" | "users" | "units" | "settings" | "notifications"

export function AdminDashboard({ onViewChange, isDark, toggleTheme }: AdminDashboardProps) {
  const [currentView, setCurrentView] = useState<AdminView>("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(true)

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
      case "settings":
        return <SystemSettingsView />
      case "notifications":
        return <NotificationsView />
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
