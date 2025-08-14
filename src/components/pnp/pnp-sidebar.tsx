"use client"

import { Shield, BarChart3, FileText, Search, Eye, User, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { PNPView } from "./pnp-dashboard"

interface PNPSidebarProps {
  currentView: PNPView
  onViewChange: (view: PNPView) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export function PNPSidebar({ currentView, onViewChange, sidebarOpen, setSidebarOpen }: PNPSidebarProps) {
  const menuItems = [
    { id: "dashboard" as PNPView, icon: <BarChart3 className="h-5 w-5" />, label: "Dashboard" },
    { id: "cases" as PNPView, icon: <FileText className="h-5 w-5" />, label: "My Cases" },
    // Case Search temporarily disabled - uncomment to re-enable
    // { id: "search" as PNPView, icon: <Search className="h-5 w-5" />, label: "Case Search" },
    { id: "evidence" as PNPView, icon: <Eye className="h-5 w-5" />, label: "Evidence Viewer" },
    { id: "profile" as PNPView, icon: <User className="h-5 w-5" />, label: "Profile" },
  ]

  return (
    <>
      {/* Mobile backdrop overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Responsive sidebar */}
      <div
        className={`${
          sidebarOpen 
            ? "w-64 translate-x-0" 
            : "-translate-x-full lg:translate-x-0 lg:w-16"
        } fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 transition-all duration-300 flex flex-col lg:flex shadow-xl lg:shadow-none`}
      >
      <div className="p-4 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="bg-blue-600 p-2 rounded-lg shrink-0">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className={`text-lg font-bold text-gray-900 dark:text-white truncate ${sidebarOpen ? "block" : "hidden"}`}>
              PNP Portal
            </span>
          </div>
          {/* Mobile close button - only show on mobile when sidebar is open */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className={`text-gray-600 dark:text-slate-400 min-h-[44px] min-w-[44px] touch-manipulation shrink-0 lg:hidden ${sidebarOpen ? "block" : "hidden"}`}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <Button
                variant="ghost"
                className={`w-full ${sidebarOpen ? "justify-start" : "justify-center"} px-3 py-3 transition-colors min-h-[44px] touch-manipulation ${
                  currentView === item.id
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                    : "text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700"
                }`}
                onClick={() => onViewChange(item.id)}
              >
                <span className="shrink-0">{item.icon}</span>
                <span className={`ml-3 text-sm font-medium truncate ${sidebarOpen ? "block" : "hidden"}`}>
                  {item.label}
                </span>
              </Button>
            </li>
          ))}
        </ul>
      </nav>
      </div>
    </>
  )
}
