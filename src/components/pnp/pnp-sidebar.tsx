"use client"

import { Shield, BarChart3, FileText, Search, Eye, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { PNPView } from "./pnp-dashboard"

interface PNPSidebarProps {
  currentView: PNPView
  onViewChange: (view: PNPView) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export function PNPSidebar({ currentView, onViewChange, sidebarOpen }: PNPSidebarProps) {
  const menuItems = [
    { id: "dashboard" as PNPView, icon: <BarChart3 className="h-5 w-5" />, label: "Dashboard" },
    { id: "cases" as PNPView, icon: <FileText className="h-5 w-5" />, label: "My Cases" },
    { id: "search" as PNPView, icon: <Search className="h-5 w-5" />, label: "Case Search" },
    { id: "evidence" as PNPView, icon: <Eye className="h-5 w-5" />, label: "Evidence Viewer" },
    { id: "profile" as PNPView, icon: <User className="h-5 w-5" />, label: "Profile" },
  ]

  return (
    <div
      className={`${sidebarOpen ? "w-64" : "w-16"} bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 transition-all duration-300 flex flex-col`}
    >
      <div className="p-4 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Shield className="h-6 w-6 text-white" />
          </div>
          {sidebarOpen && <span className="text-lg font-bold text-gray-900 dark:text-white">PNP Portal</span>}
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <Button
                variant="ghost"
                className={`w-full justify-start px-3 py-2 transition-colors ${
                  currentView === item.id
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                    : "text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700"
                }`}
                onClick={() => onViewChange(item.id)}
              >
                {item.icon}
                {sidebarOpen && <span className="ml-3 text-sm font-medium">{item.label}</span>}
              </Button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
