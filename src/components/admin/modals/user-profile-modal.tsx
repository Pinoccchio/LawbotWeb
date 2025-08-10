"use client"

import { useState, useEffect } from "react"
import { X, User, Mail, Phone, Calendar, Shield, Activity, FileText, CheckCircle, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserProfile } from "@/lib/user-service"

interface UserProfileModalProps {
  isOpen: boolean
  onClose: () => void
  user: UserProfile | null
}

export function UserProfileModal({ isOpen, onClose, user }: UserProfileModalProps) {
  if (!isOpen || !user) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-lawbot-emerald-500" />
      case 'suspended':
        return <AlertTriangle className="h-4 w-4 text-lawbot-amber-500" />
      case 'deleted':
        return <X className="h-4 w-4 text-lawbot-red-500" />
      default:
        return <Shield className="h-4 w-4 text-lawbot-slate-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-gradient-to-r from-lawbot-emerald-50 to-lawbot-emerald-100 text-lawbot-emerald-700 border border-lawbot-emerald-200 dark:from-lawbot-emerald-900/20 dark:to-lawbot-emerald-800/20 dark:text-lawbot-emerald-300 dark:border-lawbot-emerald-800">
            ✅ Active
          </Badge>
        )
      case 'suspended':
        return (
          <Badge className="bg-gradient-to-r from-lawbot-amber-50 to-lawbot-amber-100 text-lawbot-amber-700 border border-lawbot-amber-200 dark:from-lawbot-amber-900/20 dark:to-lawbot-amber-800/20 dark:text-lawbot-amber-300 dark:border-lawbot-amber-800">
            ⚠️ Suspended
          </Badge>
        )
      case 'deleted':
        return (
          <Badge className="bg-gradient-to-r from-lawbot-red-50 to-lawbot-red-100 text-lawbot-red-700 border border-lawbot-red-200 dark:from-lawbot-red-900/20 dark:to-lawbot-red-800/20 dark:text-lawbot-red-300 dark:border-lawbot-red-800">
            ❌ Deleted
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gradient-to-r from-lawbot-slate-50 to-lawbot-slate-100 text-lawbot-slate-700 border border-lawbot-slate-200 dark:from-lawbot-slate-900/20 dark:to-lawbot-slate-800/20 dark:text-lawbot-slate-300 dark:border-lawbot-slate-800">
            ❓ Unknown
          </Badge>
        )
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-lawbot-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-lawbot-slate-200 dark:border-lawbot-slate-700 bg-gradient-to-r from-lawbot-purple-50 to-lawbot-blue-50 dark:from-lawbot-purple-900/20 dark:to-lawbot-blue-900/20">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16 ring-4 ring-lawbot-purple-200 dark:ring-lawbot-purple-800">
              <AvatarImage src={user.profile_picture_url || undefined} />
              <AvatarFallback className="bg-gradient-to-r from-lawbot-purple-500 to-lawbot-purple-600 text-white font-semibold text-lg">
                {user.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold text-lawbot-slate-900 dark:text-white">
                {user.full_name}
              </h2>
              <p className="text-lawbot-slate-600 dark:text-lawbot-slate-400 font-mono text-sm">
                ID: {user.firebase_uid.substring(0, 8)}...
              </p>
              {getStatusBadge(user.user_status)}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-lawbot-slate-500 hover:text-lawbot-slate-700 dark:text-lawbot-slate-400 dark:hover:text-lawbot-slate-200"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6 space-y-6">
            
            {/* Contact Information */}
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-lawbot-slate-900 dark:text-white flex items-center">
                  <Mail className="h-5 w-5 text-lawbot-blue-500 mr-2" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-lawbot-blue-500" />
                      <span className="text-lawbot-slate-600 dark:text-lawbot-slate-400">Email:</span>
                    </div>
                    <span className="font-medium text-lawbot-slate-900 dark:text-white">
                      {user.email}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-lawbot-emerald-500" />
                      <span className="text-lawbot-slate-600 dark:text-lawbot-slate-400">Phone:</span>
                    </div>
                    <span className="font-medium text-lawbot-slate-900 dark:text-white">
                      {user.phone_number}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Shield className="h-4 w-4 text-lawbot-purple-500" />
                      <span className="text-lawbot-slate-600 dark:text-lawbot-slate-400">User Type:</span>
                    </div>
                    <Badge className="bg-gradient-to-r from-lawbot-purple-50 to-lawbot-purple-100 text-lawbot-purple-700 border border-lawbot-purple-200 dark:from-lawbot-purple-900/20 dark:to-lawbot-purple-800/20 dark:text-lawbot-purple-300 dark:border-lawbot-purple-800">
                      {user.user_type}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Status & Activity */}
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-lawbot-slate-900 dark:text-white flex items-center">
                  <Activity className="h-5 w-5 text-lawbot-emerald-500 mr-2" />
                  Account Status & Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(user.user_status)}
                      <span className="text-lawbot-slate-600 dark:text-lawbot-slate-400">Account Status:</span>
                    </div>
                    {getStatusBadge(user.user_status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-lawbot-blue-500" />
                      <span className="text-lawbot-slate-600 dark:text-lawbot-slate-400">Last Active:</span>
                    </div>
                    <span className="font-medium text-lawbot-slate-900 dark:text-white">
                      {formatDate(user.last_active)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-lawbot-emerald-500" />
                      <span className="text-lawbot-slate-600 dark:text-lawbot-slate-400">Account Created:</span>
                    </div>
                    <span className="font-medium text-lawbot-slate-900 dark:text-white">
                      {formatDate(user.created_at)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Push Notification Status */}
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-lawbot-slate-900 dark:text-white flex items-center">
                  <FileText className="h-5 w-5 text-lawbot-blue-500 mr-2" />
                  Push Notification Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Shield className="h-4 w-4 text-lawbot-blue-500" />
                      <span className="text-lawbot-slate-600 dark:text-lawbot-slate-400">FCM Token:</span>
                    </div>
                    {user.fcm_token ? (
                      <Badge className="bg-gradient-to-r from-lawbot-emerald-50 to-lawbot-emerald-100 text-lawbot-emerald-700 border border-lawbot-emerald-200 dark:from-lawbot-emerald-900/20 dark:to-lawbot-emerald-800/20 dark:text-lawbot-emerald-300 dark:border-lawbot-emerald-800">
                        📱 FCM Ready
                      </Badge>
                    ) : (
                      <Badge className="bg-gradient-to-r from-lawbot-amber-50 to-lawbot-amber-100 text-lawbot-amber-700 border border-lawbot-amber-200 dark:from-lawbot-amber-900/20 dark:to-lawbot-amber-800/20 dark:text-lawbot-amber-300 dark:border-lawbot-amber-800">
                        📱 No FCM Token
                      </Badge>
                    )}
                  </div>
                  {user.fcm_token && (
                    <div className="bg-lawbot-slate-50 dark:bg-lawbot-slate-700 p-3 rounded-lg">
                      <p className="text-xs text-lawbot-slate-600 dark:text-lawbot-slate-400 break-all font-mono">
                        {user.fcm_token.substring(0, 50)}...
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Case Statistics */}
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-lawbot-slate-900 dark:text-white flex items-center">
                  <FileText className="h-5 w-5 text-lawbot-amber-500 mr-2" />
                  Case Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-lawbot-blue-50 dark:bg-lawbot-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-lawbot-blue-600 dark:text-lawbot-blue-400">
                      {user.cases}
                    </div>
                    <div className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400">Total Cases</div>
                  </div>
                  <div className="text-center p-4 bg-lawbot-amber-50 dark:bg-lawbot-amber-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-lawbot-amber-600 dark:text-lawbot-amber-400">
                      {user.active_cases}
                    </div>
                    <div className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400">Active</div>
                  </div>
                  <div className="text-center p-4 bg-lawbot-emerald-50 dark:bg-lawbot-emerald-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-lawbot-emerald-600 dark:text-lawbot-emerald-400">
                      {user.resolved_cases}
                    </div>
                    <div className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400">Resolved</div>
                  </div>
                  <div className="text-center p-4 bg-lawbot-slate-50 dark:bg-lawbot-slate-700 rounded-lg">
                    <div className="text-2xl font-bold text-lawbot-slate-600 dark:text-lawbot-slate-400">
                      {user.dismissed_cases}
                    </div>
                    <div className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400">Dismissed</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-lawbot-slate-200 dark:border-lawbot-slate-700 bg-lawbot-slate-50 dark:bg-lawbot-slate-700/50">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}