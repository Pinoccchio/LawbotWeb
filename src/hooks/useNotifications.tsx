"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import NotificationService, { Notification, NotificationStats, NotificationFilters } from '@/lib/notification-service'

interface UseNotificationsOptions {
  officerId: string
  autoRefresh?: boolean
  refreshInterval?: number
  enableRealtime?: boolean
  initialFilters?: NotificationFilters
}

interface UseNotificationsReturn {
  // Data
  notifications: Notification[]
  stats: NotificationStats | null
  
  // Loading states
  isLoading: boolean
  isRefreshing: boolean
  
  // Error state
  error: string | null
  
  // Actions
  refresh: () => Promise<void>
  markAsRead: (notificationId: string) => Promise<boolean>
  markAllAsRead: () => Promise<boolean>
  
  // Real-time connection
  isConnected: boolean
  
  // Badge helpers
  unreadCount: number
  urgentCount: number
  hasUnread: boolean
  badgeText: string
}

export function useNotifications({
  officerId,
  autoRefresh = true,
  refreshInterval = 30000, // 30 seconds like Flutter app
  enableRealtime = true,
  initialFilters = {}
}: UseNotificationsOptions): UseNotificationsReturn {
  
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [stats, setStats] = useState<NotificationStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  
  // Refs for cleanup
  const realtimeChannelRef = useRef<any>(null)
  const autoRefreshTimerRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef(true)

  // Load notifications and stats
  const loadData = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setIsLoading(true)
      setIsRefreshing(!showLoading)
      setError(null)

      console.log('🔔 Loading notifications for officer:', officerId)

      const [notificationsData, statsData] = await Promise.all([
        NotificationService.getOfficerNotifications(officerId, { 
          ...initialFilters,
          limit: 50 
        }),
        NotificationService.getNotificationStats(officerId)
      ])

      if (mountedRef.current) {
        setNotifications(notificationsData)
        setStats(statsData)
        console.log(`✅ Loaded ${notificationsData.length} notifications`)
      }
    } catch (err) {
      console.error('❌ Error loading notifications:', err)
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to load notifications')
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    }
  }, [officerId, initialFilters])

  // Manual refresh function
  const refresh = useCallback(async () => {
    await loadData(false)
  }, [loadData])

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string): Promise<boolean> => {
    try {
      const success = await NotificationService.markAsRead(notificationId)
      
      if (success && mountedRef.current) {
        // Update local state
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId 
              ? { ...n, is_read: true, read_at: new Date().toISOString() }
              : n
          )
        )
        
        // Update stats
        setStats(prev => {
          if (!prev) return prev
          
          const notification = notifications.find(n => n.id === notificationId)
          if (!notification || notification.is_read) return prev
          
          return {
            ...prev,
            unread_notifications: Math.max(0, prev.unread_notifications - 1),
            urgent_notifications: notification.priority === 'urgent' 
              ? Math.max(0, prev.urgent_notifications - 1) 
              : prev.urgent_notifications
          }
        })
      }
      
      return success
    } catch (error) {
      console.error('❌ Error marking notification as read:', error)
      return false
    }
  }, [notifications])

  // Mark all notifications as read
  const markAllAsRead = useCallback(async (): Promise<boolean> => {
    try {
      const success = await NotificationService.markAllAsRead(officerId)
      
      if (success && mountedRef.current) {
        // Update local state
        const readAt = new Date().toISOString()
        setNotifications(prev => 
          prev.map(n => ({ ...n, is_read: true, read_at: readAt }))
        )
        
        // Update stats
        setStats(prev => prev ? {
          ...prev,
          unread_notifications: 0,
          urgent_notifications: 0
        } : null)
      }
      
      return success
    } catch (error) {
      console.error('❌ Error marking all as read:', error)
      return false
    }
  }, [officerId])

  // Handle real-time updates
  const handleRealtimeUpdate = useCallback((
    notification: Notification, 
    changeType: 'INSERT' | 'UPDATE' | 'DELETE'
  ) => {
    if (!mountedRef.current) return
    
    console.log('🔔 Real-time notification update:', changeType, notification.title)
    
    if (changeType === 'INSERT') {
      setNotifications(prev => [notification, ...prev])
      
      // Update stats
      setStats(prev => prev ? {
        ...prev,
        total_notifications: prev.total_notifications + 1,
        unread_notifications: notification.is_read ? prev.unread_notifications : prev.unread_notifications + 1,
        urgent_notifications: (!notification.is_read && notification.priority === 'urgent') 
          ? prev.urgent_notifications + 1 
          : prev.urgent_notifications,
        notifications_today: isToday(notification.created_at) 
          ? prev.notifications_today + 1 
          : prev.notifications_today
      } : null)
      
    } else if (changeType === 'UPDATE') {
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? notification : n)
      )
      
    } else if (changeType === 'DELETE') {
      setNotifications(prev => prev.filter(n => n.id !== notification.id))
      
      // Update stats
      setStats(prev => prev ? {
        ...prev,
        total_notifications: Math.max(0, prev.total_notifications - 1),
        unread_notifications: notification.is_read 
          ? prev.unread_notifications 
          : Math.max(0, prev.unread_notifications - 1),
        urgent_notifications: (!notification.is_read && notification.priority === 'urgent') 
          ? Math.max(0, prev.urgent_notifications - 1) 
          : prev.urgent_notifications,
        notifications_today: isToday(notification.created_at) 
          ? Math.max(0, prev.notifications_today - 1) 
          : prev.notifications_today
      } : null)
    }
  }, [])

  // Setup real-time subscription
  useEffect(() => {
    if (enableRealtime && officerId) {
      console.log('🔄 Setting up real-time subscription for notifications')
      
      const channel = NotificationService.subscribeToNotifications(officerId, handleRealtimeUpdate)
      realtimeChannelRef.current = channel
      
      // Monitor connection status
      const handleStatusChange = (status: string) => {
        console.log(`🔄 Real-time connection status: ${status}`)
        setIsConnected(status === 'SUBSCRIBED')
      }
      
      // Set connected when subscription is active
      setIsConnected(true)
    }

    return () => {
      if (realtimeChannelRef.current) {
        console.log('🔄 Cleaning up real-time subscription')
        realtimeChannelRef.current.unsubscribe()
        realtimeChannelRef.current = null
        setIsConnected(false)
      }
    }
  }, [enableRealtime, officerId, handleRealtimeUpdate])

  // Setup auto-refresh timer
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      console.log(`⏰ Starting auto-refresh timer (${refreshInterval}ms)`)
      
      autoRefreshTimerRef.current = setInterval(() => {
        if (mountedRef.current) {
          console.log('⏰ Auto-refreshing notifications...')
          loadData(false)
        }
      }, refreshInterval)
    }

    return () => {
      if (autoRefreshTimerRef.current) {
        console.log('⏹️ Stopping auto-refresh timer')
        clearInterval(autoRefreshTimerRef.current)
        autoRefreshTimerRef.current = null
      }
    }
  }, [autoRefresh, refreshInterval, loadData])

  // Initial load
  useEffect(() => {
    if (officerId) {
      loadData(true)
    }
  }, [officerId, loadData])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  // Helper function to check if date is today
  const isToday = (dateString: string): boolean => {
    try {
      const date = new Date(dateString)
      const today = new Date()
      return date.toDateString() === today.toDateString()
    } catch {
      return false
    }
  }

  // Badge helpers
  const unreadCount = stats?.unread_notifications || 0
  const urgentCount = stats?.urgent_notifications || 0
  const hasUnread = unreadCount > 0
  const badgeText = unreadCount > 99 ? '99+' : unreadCount.toString()

  return {
    // Data
    notifications,
    stats,
    
    // Loading states
    isLoading,
    isRefreshing,
    
    // Error state
    error,
    
    // Actions
    refresh,
    markAsRead,
    markAllAsRead,
    
    // Real-time connection
    isConnected,
    
    // Badge helpers
    unreadCount,
    urgentCount,
    hasUnread,
    badgeText
  }
}

export default useNotifications