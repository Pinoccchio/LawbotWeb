"use client"

import { Menu, Sun, Moon, Bell, LogOut, User, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/AuthContext"

interface AdminHeaderProps {
  onViewChange: (view: "landing" | "admin" | "pnp") => void
  onAdminViewChange: (view: "dashboard" | "cases" | "users" | "units" | "settings" | "notifications") => void
  isDark: boolean
  toggleTheme: () => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export function AdminHeader({ onViewChange, onAdminViewChange, isDark, toggleTheme, sidebarOpen, setSidebarOpen }: AdminHeaderProps) {
  const { signOut, userProfile } = useAuth()

  const handleLogout = async () => {
    try {
      await signOut()
      onViewChange("landing")
    } catch (error) {
      console.error('Logout failed:', error)
      // Still redirect to landing even if logout fails
      onViewChange("landing")
    }
  }
  return (
    <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-600 dark:text-slate-400 min-h-[44px] min-w-[44px] touch-manipulation shrink-0"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
            Admin Dashboard
          </h1>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleTheme}
            className="min-h-[44px] min-w-[44px] touch-manipulation"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          {/* Notification button removed as requested */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center space-x-2 min-h-[44px] touch-manipulation"
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback>
                    {userProfile?.full_name ? userProfile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'AD'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-900 dark:text-white hidden sm:block truncate">
                  {userProfile?.full_name || 'Admin User'} {userProfile?.role && `(${userProfile.role.replace('_', ' ')})`}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem 
                onClick={() => onAdminViewChange("users")}
                className="min-h-[44px] touch-manipulation"
              >
                <User className="mr-2 h-4 w-4" />
                User Management
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="min-h-[44px] touch-manipulation"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
