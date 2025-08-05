"use client"

import { useState, useEffect } from "react"
import { Menu, Sun, Moon, Bell, LogOut, User, Settings, Shield, Building2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/AuthContext"
import { PNPOfficerService, PNPOfficerProfile } from "@/lib/pnp-officer-service"

interface PNPHeaderProps {
  onViewChange: (view: "landing" | "admin" | "pnp") => void
  onPNPViewChange: (view: "dashboard" | "cases" | "search" | "evidence" | "profile") => void
  isDark: boolean
  toggleTheme: () => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  refreshTrigger?: number // Add refresh trigger prop
}

export function PNPHeader({ onViewChange, onPNPViewChange, isDark, toggleTheme, sidebarOpen, setSidebarOpen, refreshTrigger }: PNPHeaderProps) {
  const { signOut, userProfile } = useAuth()
  const [officerProfile, setOfficerProfile] = useState<PNPOfficerProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOfficerProfile()
  }, [refreshTrigger]) // Add refreshTrigger as dependency

  const loadOfficerProfile = async () => {
    try {
      setLoading(true)
      const profile = await PNPOfficerService.getCurrentOfficerProfile()
      if (profile) {
        setOfficerProfile(profile)
      }
    } catch (err) {
      console.error('Error loading officer profile in header:', err)
    } finally {
      setLoading(false)
    }
  }

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
    <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-600 dark:text-slate-400"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Officer Portal</h1>
            <div className="hidden md:flex items-center space-x-3">
              {loading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-3 w-3 animate-spin text-lawbot-indigo-500" />
                  <span className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400">Loading...</span>
                </div>
              ) : officerProfile?.unit ? (
                <>
                  <Badge className="bg-gradient-to-r from-lawbot-indigo-100 to-lawbot-indigo-200 text-lawbot-indigo-800 border border-lawbot-indigo-300 dark:from-lawbot-indigo-900/30 dark:to-lawbot-indigo-800/30 dark:text-lawbot-indigo-200 dark:border-lawbot-indigo-700 font-bold px-3 py-1">
                    <Building2 className="h-3 w-3 mr-1" />
                    {officerProfile.unit.unit_code}
                  </Badge>
                  <span className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400 font-medium hidden lg:block">
                    {officerProfile.unit.category}
                  </span>
                </>
              ) : (
                <Badge className="bg-gradient-to-r from-lawbot-amber-100 to-lawbot-amber-200 text-lawbot-amber-800 border border-lawbot-amber-300 dark:from-lawbot-amber-900/30 dark:to-lawbot-amber-800/30 dark:text-lawbot-amber-200 dark:border-lawbot-amber-700 font-bold px-3 py-1">
                  <Building2 className="h-3 w-3 mr-1" />
                  No Unit
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={toggleTheme}>
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm">
            <Bell className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" />
                    <AvatarFallback>
                      {userProfile?.full_name ? userProfile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'PO'}
                    </AvatarFallback>
                  </Avatar>
                  {/* Availability Status Indicator Dot */}
                  {!loading && officerProfile && (
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-800 ${
                      (officerProfile?.availability_status || 'available') === 'available' 
                        ? 'bg-lawbot-emerald-500' 
                      : (officerProfile?.availability_status || 'available') === 'busy' 
                        ? 'bg-lawbot-amber-500'
                      : (officerProfile?.availability_status || 'available') === 'overloaded' 
                        ? 'bg-lawbot-red-500'
                      : 'bg-lawbot-slate-500'
                    }`} title={`Work Status: ${(officerProfile?.availability_status || 'available').toUpperCase()}`}>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {loading ? 'Loading...' : (officerProfile?.full_name || userProfile?.full_name || 'PNP Officer')}
                  </span>
                  <span className="text-xs text-lawbot-slate-600 dark:text-lawbot-slate-400">
                    {loading ? 'Loading...' : `${officerProfile?.rank || userProfile?.rank || 'Officer'} • ${officerProfile?.badge_number || 'N/A'}`}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <div className="px-2 py-2 border-b border-lawbot-slate-200 dark:border-lawbot-slate-700">
                {loading ? (
                  <div className="flex items-center space-x-2 py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-lawbot-blue-500" />
                    <span className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400">Loading profile...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-lawbot-slate-900 dark:text-white">
                      {officerProfile?.full_name || userProfile?.full_name || 'PNP Officer'}
                    </p>
                    <p className="text-xs text-lawbot-slate-600 dark:text-lawbot-slate-400">
                      {officerProfile?.rank || userProfile?.rank || 'Officer'} • {officerProfile?.badge_number || 'N/A'}
                    </p>
                    <div className="flex items-center mt-2 space-x-2">
                      {officerProfile?.unit ? (
                        <Badge className="bg-gradient-to-r from-lawbot-indigo-50 to-lawbot-indigo-100 text-lawbot-indigo-700 border border-lawbot-indigo-200 dark:from-lawbot-indigo-900/20 dark:to-lawbot-indigo-800/20 dark:text-lawbot-indigo-300 dark:border-lawbot-indigo-800 text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          {officerProfile.unit.unit_code}
                        </Badge>
                      ) : (
                        <Badge className="bg-gradient-to-r from-lawbot-amber-50 to-lawbot-amber-100 text-lawbot-amber-700 border border-lawbot-amber-200 dark:from-lawbot-amber-900/20 dark:to-lawbot-amber-800/20 dark:text-lawbot-amber-300 dark:border-lawbot-amber-800 text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          No Unit
                        </Badge>
                      )}
                      {/* Availability Status Badge */}
                      <Badge className={`text-xs font-bold border-0 ${
                        (officerProfile?.availability_status || 'available') === 'available' 
                          ? 'bg-lawbot-emerald-100 text-lawbot-emerald-800 dark:bg-lawbot-emerald-900/30 dark:text-lawbot-emerald-200' 
                        : (officerProfile?.availability_status || 'available') === 'busy' 
                          ? 'bg-lawbot-amber-100 text-lawbot-amber-800 dark:bg-lawbot-amber-900/30 dark:text-lawbot-amber-200'
                        : (officerProfile?.availability_status || 'available') === 'overloaded' 
                          ? 'bg-lawbot-red-100 text-lawbot-red-800 dark:bg-lawbot-red-900/30 dark:text-lawbot-red-200'
                        : 'bg-lawbot-slate-100 text-lawbot-slate-800 dark:bg-lawbot-slate-900/30 dark:text-lawbot-slate-200'
                      }`}>
                        {(officerProfile?.availability_status || 'available') === 'available' && '🟢'}
                        {(officerProfile?.availability_status || 'available') === 'busy' && '🟡'}
                        {(officerProfile?.availability_status || 'available') === 'overloaded' && '🔴'}
                        {(officerProfile?.availability_status || 'available') === 'unavailable' && '⚫'}
                        {' '}{(officerProfile?.availability_status || 'available').toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400 mt-1">
                      {officerProfile?.unit?.unit_name || 'No unit assigned'}
                    </p>
                  </>
                )}
              </div>
              <DropdownMenuItem onClick={() => onPNPViewChange("profile")}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
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
