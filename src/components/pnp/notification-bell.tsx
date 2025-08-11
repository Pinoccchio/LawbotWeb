"use client"

import React, { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import NotificationService from '@/lib/notification-service'
import NotificationsDropdown from '@/components/pnp/notifications-dropdown'

interface NotificationBellProps {
  officerId: string
  className?: string
}

export function NotificationBell({ officerId, className }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Load unread count
  const loadUnreadCount = async () => {
    try {
      if (!officerId) {
        setUnreadCount(0)
        setIsLoading(false)
        return
      }

      console.log('🔔 Loading unread count for officer:', officerId)
      const notifications = await NotificationService.getUnreadNotifications(officerId)
      const count = notifications.length
      
      console.log('✅ Unread notifications count:', count)
      setUnreadCount(count)
    } catch (error) {
      console.error('❌ Error loading unread count:', error)
      setUnreadCount(0)
    } finally {
      setIsLoading(false)
    }
  }

  // Load count on mount and when officerId changes
  useEffect(() => {
    loadUnreadCount()
  }, [officerId])

  // Handle notification bell click
  const handleBellClick = () => {
    setIsOpen(!isOpen)
  }

  // Handle notification click (mark as read and update count)
  const handleNotificationClick = async (notificationId: string): Promise<boolean> => {
    try {
      console.log('📖 Marking notification as read:', notificationId)
      const success = await NotificationService.markAsRead(notificationId)
      
      if (success) {
        // Decrease unread count
        setUnreadCount(prev => Math.max(0, prev - 1))
        console.log('✅ Notification marked as read, updated count')
      }
      
      return success
    } catch (error) {
      console.error('❌ Error marking notification as read:', error)
      return false
    }
  }

  // Handle mark all as read
  const handleMarkAllAsRead = async (): Promise<boolean> => {
    try {
      console.log('📖 Marking all notifications as read for officer:', officerId)
      const success = await NotificationService.markAllAsRead(officerId)
      
      if (success) {
        setUnreadCount(0)
        console.log('✅ All notifications marked as read')
      }
      
      return success
    } catch (error) {
      console.error('❌ Error marking all as read:', error)
      return false
    }
  }

  // Auto-refresh unread count every 30 seconds
  useEffect(() => {
    if (!officerId) return

    const interval = setInterval(() => {
      console.log('⏰ Auto-refreshing unread count...')
      loadUnreadCount()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [officerId])

  return (
    <div className={`relative ${className || ''}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleBellClick}
        disabled={isLoading}
        className={`relative transition-colors ${isOpen ? 'bg-lawbot-slate-100 dark:bg-lawbot-slate-700' : ''}`}
        title={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <div className="relative">
          <Bell 
            className={`h-5 w-5 ${
              unreadCount > 0 
                ? 'text-lawbot-blue-600 dark:text-lawbot-blue-400' 
                : 'text-lawbot-slate-600 dark:text-lawbot-slate-400'
            }`} 
          />
          
          {/* Simple Badge - Similar to availability dot but for notifications */}
          {unreadCount > 0 && (
            <div className="absolute -top-2 -right-2 flex items-center justify-center min-w-5 h-5 px-1 bg-red-500 rounded-full border-2 border-white dark:border-slate-800 text-white text-xs font-bold z-50">
              {unreadCount > 99 ? '99+' : unreadCount}
            </div>
          )}
          
        </div>
      </Button>

      {/* Notifications Dropdown */}
      {officerId && (
        <NotificationsDropdown
          officerId={officerId}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onNotificationClick={(notification) => {
            if (!notification.is_read) {
              handleNotificationClick(notification.id)
            }
          }}
          onMarkAsRead={handleNotificationClick}
          onMarkAllAsRead={handleMarkAllAsRead}
        />
      )}
    </div>
  )
}

export default NotificationBell