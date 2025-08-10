"use client"

import { useState, useEffect } from "react"
import { X, User, Mail, Phone, Save, AlertTriangle, CheckCircle, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserProfile } from "@/lib/user-service"
import UserService from "@/lib/user-service"

interface UserEditModalProps {
  isOpen: boolean
  onClose: () => void
  user: UserProfile | null
  onUserUpdated: () => void
}

export function UserEditModal({ isOpen, onClose, user, onUserUpdated }: UserEditModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  // Form state
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [userStatus, setUserStatus] = useState<'active' | 'suspended' | 'deleted'>('active')

  // Reset form when modal opens with new user
  useEffect(() => {
    if (isOpen && user) {
      setFullName(user.full_name)
      setEmail(user.email)
      setPhoneNumber(user.phone_number)
      setUserStatus(user.user_status)
      setError(null)
      setSuccess(false)
    }
  }, [isOpen, user])

  const handleClose = () => {
    setError(null)
    setSuccess(false)
    setIsLoading(false)
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      console.log('🔄 Updating user:', user.firebase_uid)
      console.log('📝 New data:', { fullName, email, phoneNumber, userStatus })

      // Update user status if it changed
      if (userStatus !== user.user_status) {
        const statusUpdateResult = await UserService.updateUserStatus(user.firebase_uid, userStatus)
        if (!statusUpdateResult) {
          throw new Error('Failed to update user status')
        }
      }

      // Note: For a full implementation, you would also need methods to update
      // other user profile fields like name, email, phone in UserService
      // For now, we'll focus on status updates since that's what was requested

      console.log('✅ User updated successfully')
      setSuccess(true)

      // Show success message briefly, then refresh data and close
      setTimeout(() => {
        onUserUpdated() // Refresh the user list
        handleClose()
      }, 1500)

    } catch (error) {
      console.error('❌ Error updating user:', error)
      setError(error instanceof Error ? error.message : 'Failed to update user')
    } finally {
      setIsLoading(false)
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
        return null
    }
  }

  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-lawbot-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-lawbot-slate-200 dark:border-lawbot-slate-700 bg-gradient-to-r from-lawbot-emerald-50 to-lawbot-blue-50 dark:from-lawbot-emerald-900/20 dark:to-lawbot-blue-900/20">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16 ring-4 ring-lawbot-emerald-200 dark:ring-lawbot-emerald-800">
              <AvatarImage src={user.profile_picture_url || undefined} />
              <AvatarFallback className="bg-gradient-to-r from-lawbot-emerald-500 to-lawbot-emerald-600 text-white font-semibold text-lg">
                {user.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold text-lawbot-slate-900 dark:text-white">
                Edit User Profile
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
            onClick={handleClose}
            className="text-lawbot-slate-500 hover:text-lawbot-slate-700 dark:text-lawbot-slate-400 dark:hover:text-lawbot-slate-200"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Success/Error Messages */}
            {success && (
              <div className="bg-lawbot-emerald-50 dark:bg-lawbot-emerald-900/20 border border-lawbot-emerald-200 dark:border-lawbot-emerald-800 rounded-xl p-4 animate-fade-in">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-lawbot-emerald-500" />
                  <p className="text-lawbot-emerald-700 dark:text-lawbot-emerald-300 font-medium">
                    User profile updated successfully!
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-lawbot-red-50 dark:bg-lawbot-red-900/20 border border-lawbot-red-200 dark:border-lawbot-red-800 rounded-xl p-4 animate-fade-in">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-lawbot-red-500" />
                  <p className="text-lawbot-red-700 dark:text-lawbot-red-300 font-medium">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Basic Information */}
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-lawbot-slate-900 dark:text-white flex items-center">
                  <User className="h-5 w-5 text-lawbot-blue-500 mr-2" />
                  Basic Information
                </CardTitle>
                <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400">
                  Note: Name, email, and phone changes are currently display-only. Status changes are functional.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName" className="text-lawbot-slate-700 dark:text-lawbot-slate-300">
                        Full Name
                      </Label>
                      <Input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="mt-1"
                        disabled // For display purposes - would need backend implementation
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-lawbot-slate-700 dark:text-lawbot-slate-300">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1"
                        disabled // For display purposes - would need backend implementation
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber" className="text-lawbot-slate-700 dark:text-lawbot-slate-300">
                      Phone Number
                    </Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="mt-1"
                      disabled // For display purposes - would need backend implementation
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-lawbot-slate-900 dark:text-white flex items-center">
                  <Shield className="h-5 w-5 text-lawbot-emerald-500 mr-2" />
                  Account Status
                </CardTitle>
                <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400">
                  Change the user's account status. This will affect their ability to use the mobile app.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="userStatus" className="text-lawbot-slate-700 dark:text-lawbot-slate-300">
                      Current Status
                    </Label>
                    <Select value={userStatus} onValueChange={(value: 'active' | 'suspended' | 'deleted') => setUserStatus(value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-lawbot-emerald-500" />
                            <span>Active - User can access the app normally</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="suspended">
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="h-4 w-4 text-lawbot-amber-500" />
                            <span>Suspended - User access is temporarily restricted</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="deleted">
                          <div className="flex items-center space-x-2">
                            <X className="h-4 w-4 text-lawbot-red-500" />
                            <span>Deleted - User account is deactivated</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {userStatus !== user.user_status && (
                    <div className="bg-lawbot-amber-50 dark:bg-lawbot-amber-900/20 border border-lawbot-amber-200 dark:border-lawbot-amber-800 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-lawbot-amber-500" />
                        <p className="text-lawbot-amber-700 dark:text-lawbot-amber-300 text-sm">
                          <strong>Status Change:</strong> {user.user_status} → {userStatus}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* FCM Status (Read-only) */}
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-lawbot-slate-900 dark:text-white flex items-center">
                  <Mail className="h-5 w-5 text-lawbot-blue-500 mr-2" />
                  Push Notification Status
                </CardTitle>
                <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400">
                  Read-only information about the user's push notification capability.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-lawbot-slate-600 dark:text-lawbot-slate-400">FCM Token Status:</span>
                  {user.fcm_token ? (
                    <Badge className="bg-gradient-to-r from-lawbot-emerald-50 to-lawbot-emerald-100 text-lawbot-emerald-700 border border-lawbot-emerald-200 dark:from-lawbot-emerald-900/20 dark:to-lawbot-emerald-800/20 dark:text-lawbot-emerald-300 dark:border-lawbot-emerald-800">
                      📱 FCM Ready - Can receive push notifications
                    </Badge>
                  ) : (
                    <Badge className="bg-gradient-to-r from-lawbot-amber-50 to-lawbot-amber-100 text-lawbot-amber-700 border border-lawbot-amber-200 dark:from-lawbot-amber-900/20 dark:to-lawbot-amber-800/20 dark:text-lawbot-amber-300 dark:border-lawbot-amber-800">
                      📱 No FCM Token - Cannot receive push notifications
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </form>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-lawbot-slate-200 dark:border-lawbot-slate-700 bg-lawbot-slate-50 dark:bg-lawbot-slate-700/50">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading}
            className="btn-gradient"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}