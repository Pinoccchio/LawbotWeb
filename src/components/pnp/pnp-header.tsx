"use client"

import React, { useState } from 'react'
import { Menu, Sun, Moon, Bell, LogOut, User, Settings, Shield, Building2 } from "lucide-react"
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
import { PNPOfficerProfile } from "@/lib/pnp-officer-service"
import NotificationBell from "@/components/pnp/notification-bell"

interface PNPHeaderProps {
  onViewChange: (view: "landing" | "admin" | "pnp") => void
  onPNPViewChange: (view: "dashboard" | "cases" | "search" | "evidence" | "profile") => void
  isDark: boolean
  toggleTheme: () => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  refreshTrigger?: number // Add refresh trigger prop
  officerProfile?: PNPOfficerProfile | null // Real officer profile from database
}

export function PNPHeader({ onViewChange, onPNPViewChange, isDark, toggleTheme, sidebarOpen, setSidebarOpen, refreshTrigger, officerProfile }: PNPHeaderProps) {
  const { signOut, userProfile } = useAuth()
  
  // Get officer ID for notifications - try both firebase_uid and UUID id
  const officerFirebaseUid = officerProfile?.firebase_uid || userProfile?.firebase_uid
  const officerUuid = officerProfile?.id
  const officerId = officerFirebaseUid || officerUuid || ''

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



  // Helper function to get availability status styling
  const getAvailabilityStatusStyling = (status: string = 'available') => {
    switch (status) {
      case 'available':
        return {
          dotColor: 'bg-lawbot-emerald-500',
          badgeColor: 'bg-lawbot-emerald-100 text-lawbot-emerald-800 dark:bg-lawbot-emerald-900/30 dark:text-lawbot-emerald-200',
          emoji: '🟢',
          text: 'AVAILABLE',
          title: 'Work Status: AVAILABLE'
        }
      case 'busy':
        return {
          dotColor: 'bg-lawbot-amber-500',
          badgeColor: 'bg-lawbot-amber-100 text-lawbot-amber-800 dark:bg-lawbot-amber-900/30 dark:text-lawbot-amber-200',
          emoji: '🟡',
          text: 'BUSY',
          title: 'Work Status: BUSY'
        }
      case 'overloaded':
        return {
          dotColor: 'bg-lawbot-red-500',
          badgeColor: 'bg-lawbot-red-100 text-lawbot-red-800 dark:bg-lawbot-red-900/30 dark:text-lawbot-red-200',
          emoji: '🔴',
          text: 'OVERLOADED',
          title: 'Work Status: OVERLOADED'
        }
      case 'unavailable':
        return {
          dotColor: 'bg-lawbot-slate-500',
          badgeColor: 'bg-lawbot-slate-100 text-lawbot-slate-800 dark:bg-lawbot-slate-900/30 dark:text-lawbot-slate-200',
          emoji: '⚫',
          text: 'UNAVAILABLE',
          title: 'Work Status: UNAVAILABLE'
        }
      default:
        return {
          dotColor: 'bg-lawbot-emerald-500',
          badgeColor: 'bg-lawbot-emerald-100 text-lawbot-emerald-800 dark:bg-lawbot-emerald-900/30 dark:text-lawbot-emerald-200',
          emoji: '🟢',
          text: 'AVAILABLE',
          title: 'Work Status: AVAILABLE'
        }
    }
  }

  // Get current availability status styling
  const availabilityStatus = officerProfile?.availability_status || 'available'
  const statusStyling = getAvailabilityStatusStyling(availabilityStatus)
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
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white truncate">Officer Portal</h1>
            <div className="hidden sm:flex items-center space-x-2 lg:space-x-3 min-w-0">
              {officerProfile?.unit ? (
                <>
                  <Badge className="bg-gradient-to-r from-lawbot-indigo-100 to-lawbot-indigo-200 text-lawbot-indigo-800 border border-lawbot-indigo-300 dark:from-lawbot-indigo-900/30 dark:to-lawbot-indigo-800/30 dark:text-lawbot-indigo-200 dark:border-lawbot-indigo-700 font-bold px-2 sm:px-3 py-1 shrink-0">
                    <Building2 className="h-3 w-3 sm:mr-1" />
                    <span className="hidden sm:inline">{officerProfile.unit.unit_code}</span>
                  </Badge>
                  <span className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400 font-medium hidden lg:block truncate">
                    {officerProfile.unit.unit_name}
                  </span>
                </>
              ) : (
                <Badge className="bg-gradient-to-r from-lawbot-amber-100 to-lawbot-amber-200 text-lawbot-amber-800 border border-lawbot-amber-300 dark:from-lawbot-amber-900/30 dark:to-lawbot-amber-800/30 dark:text-lawbot-amber-200 dark:border-lawbot-amber-700 font-bold px-2 sm:px-3 py-1 shrink-0">
                  <Building2 className="h-3 w-3 sm:mr-1" />
                  <span className="hidden sm:inline">No Unit</span>
                </Badge>
              )}
            </div>
          </div>
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
          
          {/* Notification Bell */}
          {officerId && (
            <div className="min-h-[44px] flex items-center">
              <NotificationBell officerId={officerId} />
            </div>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center space-x-2 min-h-[44px] touch-manipulation"
              >
                <div className="relative shrink-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" />
                    <AvatarFallback>
                      {userProfile?.full_name ? userProfile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'PO'}
                    </AvatarFallback>
                  </Avatar>
                  {/* Dynamic Availability Status Indicator Dot */}
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-800 ${statusStyling.dotColor}`} title={statusStyling.title}>
                  </div>
                </div>
                <div className="flex flex-col items-start min-w-0 hidden sm:block">
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px] lg:max-w-[250px]">
                    {officerProfile?.full_name || userProfile?.full_name || 'PNP Officer'}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 sm:w-80">
              <div className="px-3 py-3 border-b border-lawbot-slate-200 dark:border-lawbot-slate-700">
                <p className="text-sm font-semibold text-lawbot-slate-900 dark:text-white break-words">
                  {officerProfile?.full_name || userProfile?.full_name || 'PNP Officer'}
                </p>
                <p className="text-xs text-lawbot-slate-600 dark:text-lawbot-slate-400 break-words">
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
                  {/* Dynamic Availability Status Badge */}
                  <Badge className={`${statusStyling.badgeColor} text-xs font-bold border-0`}>
                    {statusStyling.emoji} {statusStyling.text}
                  </Badge>
                </div>
                <p className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400 mt-1">
                  {officerProfile?.unit?.unit_name || 'No unit assigned'}
                </p>
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
