"use client"

import { useState } from "react"
import { X, Send, CheckCircle, AlertTriangle, MessageSquare, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserProfile } from "@/lib/user-service"

interface TestPushNotificationModalProps {
  isOpen: boolean
  onClose: () => void
  user: UserProfile | null
}

export function TestPushNotificationModal({ isOpen, onClose, user }: TestPushNotificationModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [result, setResult] = useState<any>(null)
  
  // Form state
  const [notificationType, setNotificationType] = useState<'test' | 'case_update' | 'custom'>('test')
  const [customTitle, setCustomTitle] = useState('')
  const [customMessage, setCustomMessage] = useState('')
  const [mockCaseNumber, setMockCaseNumber] = useState('CYB-2025-TEST')
  const [mockStatus, setMockStatus] = useState('Under Investigation')
  const [mockOfficerName, setMockOfficerName] = useState('Test Officer')

  const handleClose = () => {
    setError(null)
    setSuccess(false)
    setResult(null)
    setIsLoading(false)
    onClose()
  }

  const handleTestNotification = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !user.fcm_token) return

    setIsLoading(true)
    setError(null)
    setSuccess(false)
    setResult(null)

    try {
      console.log('🔄 Testing FCM push notification for user:', user.firebase_uid)

      let notificationData
      
      if (notificationType === 'test') {
        notificationData = {
          userId: user.firebase_uid,
          title: 'LawBot Test Notification',
          body: `Hello ${user.full_name}! This is a test push notification from the Admin Portal.`,
          data: {
            type: 'test_notification',
            timestamp: new Date().toISOString(),
            test_id: `test_${Date.now()}`
          }
        }
      } else if (notificationType === 'case_update') {
        notificationData = {
          userId: user.firebase_uid,
          caseNumber: mockCaseNumber,
          oldStatus: 'Pending',
          newStatus: mockStatus,
          officerName: mockOfficerName,
          message: 'This is a test case status update notification.',
          notificationType: 'status_update'
        }
      } else {
        notificationData = {
          userId: user.firebase_uid,
          title: customTitle || 'Custom Test Notification',
          body: customMessage || `Test notification for ${user.full_name}`,
          data: {
            type: 'custom_test',
            timestamp: new Date().toISOString()
          }
        }
      }

      console.log('📤 Sending test notification:', notificationData)

      // Determine which API endpoint to use
      const apiEndpoint = notificationType === 'case_update' 
        ? '/api/notifications/send-push' 
        : '/api/notifications/send-test-push'

      // Call the FCM API
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData)
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.message || `HTTP ${response.status}: Failed to send notification`)
      }

      console.log('✅ Test notification response:', responseData)
      
      setResult(responseData)
      setSuccess(true)

    } catch (error) {
      console.error('❌ Error sending test notification:', error)
      setError(error instanceof Error ? error.message : 'Failed to send test notification')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen || !user) return null

  const canSendNotification = user.fcm_token && user.user_status === 'active'

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-lawbot-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-lawbot-slate-200 dark:border-lawbot-slate-700 bg-gradient-to-r from-lawbot-blue-50 to-lawbot-emerald-50 dark:from-lawbot-blue-900/20 dark:to-lawbot-emerald-900/20">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-lawbot-blue-500 rounded-lg">
              <Bell className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-lawbot-slate-900 dark:text-white">
                Test Push Notification
              </h2>
              <p className="text-lawbot-slate-600 dark:text-lawbot-slate-400">
                Send a test FCM notification to {user.full_name}
              </p>
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
          <form onSubmit={handleTestNotification} className="p-6 space-y-6">
            
            {/* User Info */}
            <Card className="card-modern">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12 ring-2 ring-lawbot-blue-200 dark:ring-lawbot-blue-800">
                    <AvatarImage src={user.profile_picture_url || undefined} />
                    <AvatarFallback className="bg-gradient-to-r from-lawbot-blue-500 to-lawbot-blue-600 text-white font-semibold">
                      {user.full_name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-lawbot-slate-900 dark:text-white">{user.full_name}</p>
                    <p className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400">{user.email}</p>
                    <p className="text-xs text-lawbot-slate-500 font-mono">ID: {user.firebase_uid.substring(0, 8)}...</p>
                  </div>
                  <div className="text-right">
                    {user.fcm_token ? (
                      <Badge className="bg-gradient-to-r from-lawbot-emerald-50 to-lawbot-emerald-100 text-lawbot-emerald-700 border border-lawbot-emerald-200 dark:from-lawbot-emerald-900/20 dark:to-lawbot-emerald-800/20 dark:text-lawbot-emerald-300 dark:border-lawbot-emerald-800">
                        📱 FCM Ready
                      </Badge>
                    ) : (
                      <Badge className="bg-gradient-to-r from-lawbot-red-50 to-lawbot-red-100 text-lawbot-red-700 border border-lawbot-red-200 dark:from-lawbot-red-900/20 dark:to-lawbot-red-800/20 dark:text-lawbot-red-300 dark:border-lawbot-red-800">
                        ❌ No FCM Token
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FCM Status Check */}
            {!canSendNotification && (
              <div className="bg-lawbot-amber-50 dark:bg-lawbot-amber-900/20 border border-lawbot-amber-200 dark:border-lawbot-amber-800 rounded-xl p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-lawbot-amber-500" />
                  <div>
                    <p className="text-lawbot-amber-700 dark:text-lawbot-amber-300 font-medium">
                      Cannot send push notification
                    </p>
                    <p className="text-lawbot-amber-600 dark:text-lawbot-amber-400 text-sm">
                      {!user.fcm_token ? 'User does not have an FCM token (app not installed/logged in)' : 
                       user.user_status !== 'active' ? 'User account is not active' : 'Unknown issue'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && result && (
              <div className="bg-lawbot-emerald-50 dark:bg-lawbot-emerald-900/20 border border-lawbot-emerald-200 dark:border-lawbot-emerald-800 rounded-xl p-4 animate-fade-in">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-lawbot-emerald-500 mt-0.5" />
                  <div>
                    <p className="text-lawbot-emerald-700 dark:text-lawbot-emerald-300 font-medium">
                      Push notification sent successfully!
                    </p>
                    <p className="text-lawbot-emerald-600 dark:text-lawbot-emerald-400 text-sm mt-1">
                      {result.message}
                    </p>
                    {result.processingTimeMs && (
                      <p className="text-lawbot-emerald-600 dark:text-lawbot-emerald-400 text-xs">
                        Processing time: {result.processingTimeMs}ms
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
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

            {/* Notification Type Selection */}
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-lawbot-slate-900 dark:text-white flex items-center">
                  <MessageSquare className="h-5 w-5 text-lawbot-blue-500 mr-2" />
                  Notification Type
                </CardTitle>
                <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400">
                  Choose the type of test notification to send
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="notificationType">Notification Type</Label>
                    <Select value={notificationType} onValueChange={(value: 'test' | 'case_update' | 'custom') => setNotificationType(value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="test">
                          <div className="flex items-center space-x-2">
                            <Bell className="h-4 w-4 text-lawbot-blue-500" />
                            <span>Simple Test Notification</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="case_update">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-lawbot-emerald-500" />
                            <span>Mock Case Status Update</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="custom">
                          <div className="flex items-center space-x-2">
                            <MessageSquare className="h-4 w-4 text-lawbot-purple-500" />
                            <span>Custom Message</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Case Update Fields */}
                  {notificationType === 'case_update' && (
                    <div className="space-y-4 bg-lawbot-emerald-50 dark:bg-lawbot-emerald-900/20 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="mockCaseNumber">Mock Case Number</Label>
                          <Input
                            id="mockCaseNumber"
                            value={mockCaseNumber}
                            onChange={(e) => setMockCaseNumber(e.target.value)}
                            className="mt-1"
                            placeholder="CYB-2025-TEST"
                          />
                        </div>
                        <div>
                          <Label htmlFor="mockStatus">New Status</Label>
                          <Select value={mockStatus} onValueChange={setMockStatus}>
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Under Investigation">Under Investigation</SelectItem>
                              <SelectItem value="Requires More Information">Requires More Information</SelectItem>
                              <SelectItem value="Resolved">Resolved</SelectItem>
                              <SelectItem value="Dismissed">Dismissed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="mockOfficerName">Officer Name</Label>
                        <Input
                          id="mockOfficerName"
                          value={mockOfficerName}
                          onChange={(e) => setMockOfficerName(e.target.value)}
                          className="mt-1"
                          placeholder="Test Officer"
                        />
                      </div>
                    </div>
                  )}

                  {/* Custom Message Fields */}
                  {notificationType === 'custom' && (
                    <div className="space-y-4 bg-lawbot-purple-50 dark:bg-lawbot-purple-900/20 p-4 rounded-lg">
                      <div>
                        <Label htmlFor="customTitle">Custom Title</Label>
                        <Input
                          id="customTitle"
                          value={customTitle}
                          onChange={(e) => setCustomTitle(e.target.value)}
                          className="mt-1"
                          placeholder="Custom notification title..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="customMessage">Custom Message</Label>
                        <Textarea
                          id="customMessage"
                          value={customMessage}
                          onChange={(e) => setCustomMessage(e.target.value)}
                          className="mt-1"
                          rows={3}
                          placeholder="Enter your custom notification message..."
                        />
                      </div>
                    </div>
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
            onClick={handleTestNotification}
            disabled={isLoading || !canSendNotification}
            className="btn-gradient"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Test Notification
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}