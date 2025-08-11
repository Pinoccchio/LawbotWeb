"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Bell, Check, CheckCheck, Clock, AlertCircle, FileText, User, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import NotificationService, { Notification, NotificationStats } from '@/lib/notification-service'
import { PhilippineTime } from '@/lib/philippine-time'

interface NotificationsDropdownProps {
  officerId: string
  isOpen: boolean
  onClose: () => void
  onNotificationClick?: (notification: Notification) => void
  onMarkAsRead?: (notificationId: string) => Promise<boolean>
  onMarkAllAsRead?: () => Promise<boolean>
  className?: string
}

export function NotificationsDropdown({
  officerId,
  isOpen,
  onClose,
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead,
  className
}: NotificationsDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [stats, setStats] = useState<NotificationStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false)
  const [realtimeChannel, setRealtimeChannel] = useState<any>(null)

  // Load notifications and stats
  const loadNotifications = useCallback(async () => {
    try {
      setIsLoading(true)
      console.log('🔔 Loading notifications for officer:', officerId)

      const [notificationsData, statsData] = await Promise.all([
        NotificationService.getOfficerNotifications(officerId, { limit: 15 }),
        NotificationService.getNotificationStats(officerId)
      ])

      setNotifications(notificationsData)
      setStats(statsData)
      console.log(`✅ Loaded ${notificationsData.length} notifications`)
    } catch (error) {
      console.error('❌ Error loading notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }, [officerId])

  // Handle notification click and mark as read
  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Mark as read if not already read
      if (!notification.is_read) {
        // Use the provided markAsRead function if available, otherwise fallback to service
        if (onMarkAsRead) {
          console.log('📡 Using parent hook markAsRead function')
          await onMarkAsRead(notification.id)
        } else {
          console.log('📡 Using fallback NotificationService markAsRead')
          await NotificationService.markAsRead(notification.id)
          
          // Update local state only if using fallback
          setNotifications(prev => 
            prev.map(n => 
              n.id === notification.id 
                ? { ...n, is_read: true, read_at: new Date().toISOString() }
                : n
            )
          )
          
          // Update stats only if using fallback
          setStats(prev => prev ? {
            ...prev,
            unread_notifications: Math.max(0, prev.unread_notifications - 1),
            urgent_notifications: notification.priority === 'urgent' ? Math.max(0, prev.urgent_notifications - 1) : prev.urgent_notifications
          } : null)
        }
        
        // Always update local state to reflect the read status for UI
        setNotifications(prev => 
          prev.map(n => 
            n.id === notification.id 
              ? { ...n, is_read: true, read_at: new Date().toISOString() }
              : n
          )
        )
      }

      // Call external click handler if provided
      if (onNotificationClick) {
        onNotificationClick(notification)
      }
    } catch (error) {
      console.error('❌ Error handling notification click:', error)
    }
  }

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      setIsMarkingAllRead(true)
      console.log('✅ Marking all notifications as read...')

      // Use the provided markAllAsRead function if available, otherwise fallback to service
      let success = false
      if (onMarkAllAsRead) {
        console.log('📡 Using parent hook markAllAsRead function')
        success = await onMarkAllAsRead()
      } else {
        console.log('📡 Using fallback NotificationService markAllAsRead')
        success = await NotificationService.markAllAsRead(officerId)
        
        if (success) {
          // Update stats only if using fallback
          setStats(prev => prev ? {
            ...prev,
            unread_notifications: 0,
            urgent_notifications: 0
          } : null)
        }
      }
      
      if (success) {
        // Always update local state to reflect the read status for UI
        const readAt = new Date().toISOString()
        setNotifications(prev => 
          prev.map(n => ({ ...n, is_read: true, read_at: readAt }))
        )
        
        console.log('✅ All notifications marked as read')
      }
    } catch (error) {
      console.error('❌ Error marking all as read:', error)
    } finally {
      setIsMarkingAllRead(false)
    }
  }

  // Handle real-time notification updates
  const handleRealtimeUpdate = useCallback((notification: Notification, changeType: 'INSERT' | 'UPDATE' | 'DELETE') => {
    console.log('🔔 Real-time notification update:', changeType, notification.title)
    
    if (changeType === 'INSERT') {
      // Add new notification at the beginning
      setNotifications(prev => [notification, ...prev.slice(0, 14)]) // Keep only 15 items
      
      // Update stats
      setStats(prev => prev ? {
        ...prev,
        total_notifications: prev.total_notifications + 1,
        unread_notifications: notification.is_read ? prev.unread_notifications : prev.unread_notifications + 1,
        urgent_notifications: (!notification.is_read && notification.priority === 'urgent') ? prev.urgent_notifications + 1 : prev.urgent_notifications
      } : null)
      
    } else if (changeType === 'UPDATE') {
      // Update existing notification
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? notification : n)
      )
      
    } else if (changeType === 'DELETE') {
      // Remove notification
      setNotifications(prev => prev.filter(n => n.id !== notification.id))
      
      // Update stats
      setStats(prev => prev ? {
        ...prev,
        total_notifications: Math.max(0, prev.total_notifications - 1),
        unread_notifications: notification.is_read ? prev.unread_notifications : Math.max(0, prev.unread_notifications - 1),
        urgent_notifications: (!notification.is_read && notification.priority === 'urgent') ? Math.max(0, prev.urgent_notifications - 1) : prev.urgent_notifications
      } : null)
    }
  }, [])

  // Setup real-time subscription
  useEffect(() => {
    if (isOpen && officerId && !realtimeChannel) {
      console.log('🔄 Setting up real-time subscription for notifications')
      const channel = NotificationService.subscribeToNotifications(officerId, handleRealtimeUpdate)
      setRealtimeChannel(channel)
    }

    return () => {
      if (realtimeChannel) {
        console.log('🔄 Cleaning up real-time subscription')
        realtimeChannel.unsubscribe()
        setRealtimeChannel(null)
      }
    }
  }, [isOpen, officerId, realtimeChannel, handleRealtimeUpdate])

  // Load notifications when dropdown opens
  useEffect(() => {
    if (isOpen && officerId) {
      loadNotifications()
    }
  }, [isOpen, officerId, loadNotifications])

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (isOpen && !target.closest('[data-notifications-dropdown]')) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscapeKey)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [isOpen, onClose])

  // Handle escape key
  const handleEscapeKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className={cn(
        "absolute right-0 top-full mt-2 w-96 z-50",
        "animate-in slide-in-from-top-2 duration-200",
        className
      )}
      data-notifications-dropdown
    >
      <Card className="shadow-2xl border-lawbot-slate-200 dark:border-lawbot-slate-700 bg-white dark:bg-lawbot-slate-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-lawbot-blue-500 rounded-lg">
                <Bell className="h-4 w-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg text-lawbot-slate-900 dark:text-white">
                  Notifications
                </CardTitle>
                {stats && (
                  <p className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400">
                    {stats.unread_notifications > 0 ? (
                      <>
                        <span className="font-medium text-lawbot-blue-600">
                          {stats.unread_notifications} unread
                        </span>
                        {stats.urgent_notifications > 0 && (
                          <span className="ml-2">
                            • <span className="font-medium text-lawbot-red-600">
                              {stats.urgent_notifications} urgent
                            </span>
                          </span>
                        )}
                      </>
                    ) : (
                      'All caught up!'
                    )}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {stats && stats.unread_notifications > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={isMarkingAllRead}
                  className="text-lawbot-blue-600 hover:text-lawbot-blue-700"
                >
                  <CheckCheck className="h-4 w-4 mr-1" />
                  {isMarkingAllRead ? 'Marking...' : 'Mark all read'}
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <ScrollArea className="h-96">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-lawbot-slate-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-lawbot-slate-200 rounded w-3/4"></div>
                        <div className="h-3 bg-lawbot-slate-100 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 text-lawbot-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400 mb-2">
                  No notifications yet
                </h3>
                <p className="text-sm text-lawbot-slate-500 dark:text-lawbot-slate-500">
                  You'll see case assignments and updates here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-lawbot-slate-100 dark:divide-lawbot-slate-700">
                {notifications.map((notification, index) => {
                  const display = NotificationService.getNotificationDisplay(notification)
                  const timeAgo = NotificationService.formatNotificationTime(notification.created_at)
                  const isUnread = !notification.is_read

                  return (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-4 hover:bg-lawbot-slate-50 dark:hover:bg-lawbot-slate-700/50 cursor-pointer transition-colors",
                        isUnread && "bg-lawbot-blue-50/30 dark:bg-lawbot-blue-900/10 border-l-4 border-lawbot-blue-500"
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={cn("p-2 rounded-lg", display.bgColor)}>
                          <span className="text-sm">{display.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className={cn(
                                "text-sm font-medium text-lawbot-slate-900 dark:text-white truncate",
                                isUnread && "font-semibold"
                              )}>
                                {notification.title}
                              </h4>
                              <p className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                            </div>
                            {isUnread && (
                              <div className="ml-2 w-2 h-2 bg-lawbot-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center space-x-2">
                              {notification.priority === 'urgent' && (
                                <Badge variant="destructive" className="text-xs">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Urgent
                                </Badge>
                              )}
                              {notification.complaint && (
                                <Badge variant="outline" className="text-xs">
                                  <FileText className="h-3 w-3 mr-1" />
                                  {notification.complaint.complaint_number}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400">
                              <Clock className="h-3 w-3 mr-1" />
                              {timeAgo}
                            </div>
                          </div>
                          
                          {notification.sender_name && notification.sender_name !== 'System' && (
                            <div className="flex items-center mt-2 text-xs text-lawbot-slate-500">
                              <User className="h-3 w-3 mr-1" />
                              {notification.sender_name}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>

        </CardContent>
      </Card>
    </div>
  )
}

export default NotificationsDropdown