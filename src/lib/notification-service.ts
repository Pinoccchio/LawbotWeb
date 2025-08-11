import { supabase } from './supabase'
import { PhilippineTime } from './philippine-time'

// Notification interfaces based on actual database schema
export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success' | 'case_assignment' | 'case_update' | 'case_submitted'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  notification_category: 'complaint_status' | 'officer_assignment'
  action_url?: string
  is_read: boolean
  read_at?: string
  additional_data?: Record<string, unknown>
  sender_name: string
  related_complaint_id?: string
  created_at: string
  // Joined data
  complaint?: {
    complaint_number: string
    title?: string
    crime_type: string
    status: string
  }
}

export interface NotificationStats {
  total_notifications: number
  unread_notifications: number
  urgent_notifications: number
  notifications_today: number
  by_category: {
    officer_assignment: number
    complaint_status: number
  }
  by_priority: {
    low: number
    normal: number
    high: number
    urgent: number
  }
}

export interface NotificationFilters {
  category?: string
  priority?: string
  is_read?: boolean
  type?: string
  limit?: number
  offset?: number
}

class NotificationService {
  // Get notifications for specific PNP officer (matches Flutter getNotifications)
  static async getOfficerNotifications(
    officerId: string,
    filters: NotificationFilters = {}
  ): Promise<Notification[]> {
    try {
      console.log('🔔 Fetching notifications for officer ID:', officerId)
      
      // If no officerId provided, return empty array
      if (!officerId) {
        console.log('⚠️ No officer ID provided')
        return []
      }

      let query = supabase
        .from('notifications')
        .select(`
          *,
          complaint:related_complaint_id (
            complaint_number,
            title,
            crime_type,
            status
          )
        `)
        .eq('user_id', officerId)
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters.category) {
        query = query.eq('notification_category', filters.category)
      }
      if (filters.priority) {
        query = query.eq('priority', filters.priority)
      }
      if (filters.is_read !== undefined) {
        query = query.eq('is_read', filters.is_read)
      }
      if (filters.type) {
        query = query.eq('type', filters.type)
      }

      // Apply limit and offset
      const limit = filters.limit || 50
      const offset = filters.offset || 0
      query = query.range(offset, offset + limit - 1)

      const { data, error } = await query

      if (error) {
        console.error('❌ Error fetching officer notifications:', error)
        throw error
      }

      console.log(`✅ Fetched ${data?.length || 0} notifications for officer ID: ${officerId}`)
      
      // If no notifications found and officer ID looks like firebase_uid, try to find officer UUID
      if ((!data || data.length === 0) && officerId.length > 20) {
        console.log('🔄 No notifications found with firebase_uid, trying to find officer UUID...')
        
        try {
          const { data: officerData } = await supabase
            .from('pnp_officer_profiles')
            .select('id')
            .eq('firebase_uid', officerId)
            .single()
          
          if (officerData?.id) {
            console.log('🔄 Found officer UUID, retrying with UUID:', officerData.id)
            return await this.getOfficerNotifications(officerData.id, filters)
          }
        } catch (officerError) {
          console.log('⚠️ Could not find officer UUID:', officerError)
        }
      }
      
      return data || []
    } catch (error) {
      console.error('❌ Error in getOfficerNotifications:', error)
      return []
    }
  }

  // Get notification statistics (matches Flutter getNotificationStats)
  static async getNotificationStats(officerId: string): Promise<NotificationStats> {
    try {
      console.log('📊 Calculating notification stats for officer:', officerId)

      // Get Philippines time for today calculation
      const nowPhilippines = PhilippineTime.now()
      const todayStart = new Date(nowPhilippines.getFullYear(), nowPhilippines.getMonth(), nowPhilippines.getDate())
      const todayStartUtc = PhilippineTime.toUtc(todayStart).toISOString()
      const todayEndUtc = PhilippineTime.toUtc(new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)).toISOString()

      // Get all notifications for the officer
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', officerId)

      if (error) {
        console.error('❌ Error fetching notification stats:', error)
        throw error
      }

      const notifications = data || []
      
      // Calculate statistics
      const stats: NotificationStats = {
        total_notifications: notifications.length,
        unread_notifications: notifications.filter(n => !n.is_read).length,
        urgent_notifications: notifications.filter(n => !n.is_read && n.priority === 'urgent').length,
        notifications_today: notifications.filter(n => {
          const createdAt = new Date(n.created_at)
          return createdAt >= new Date(todayStartUtc) && createdAt < new Date(todayEndUtc)
        }).length,
        by_category: {
          officer_assignment: notifications.filter(n => n.notification_category === 'officer_assignment').length,
          complaint_status: notifications.filter(n => n.notification_category === 'complaint_status').length
        },
        by_priority: {
          low: notifications.filter(n => n.priority === 'low').length,
          normal: notifications.filter(n => n.priority === 'normal').length,
          high: notifications.filter(n => n.priority === 'high').length,
          urgent: notifications.filter(n => n.priority === 'urgent').length
        }
      }

      console.log('✅ Calculated notification stats:', stats)
      return stats
    } catch (error) {
      console.error('❌ Error calculating notification stats:', error)
      return {
        total_notifications: 0,
        unread_notifications: 0,
        urgent_notifications: 0,
        notifications_today: 0,
        by_category: { officer_assignment: 0, complaint_status: 0 },
        by_priority: { low: 0, normal: 0, high: 0, urgent: 0 }
      }
    }
  }

  // Mark notification as read (matches Flutter markNotificationAsRead)
  static async markAsRead(notificationId: string): Promise<boolean> {
    try {
      console.log('✅ Marking notification as read:', notificationId)

      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: PhilippineTime.toUtc(PhilippineTime.now()).toISOString()
        })
        .eq('id', notificationId)

      if (error) {
        console.error('❌ Error marking notification as read:', error)
        return false
      }

      console.log('✅ Notification marked as read successfully')
      return true
    } catch (error) {
      console.error('❌ Error in markAsRead:', error)
      return false
    }
  }

  // Mark all notifications as read for officer (matches Flutter markAllNotificationsAsRead)
  static async markAllAsRead(officerId: string): Promise<boolean> {
    try {
      console.log('✅ Marking all notifications as read for officer:', officerId)

      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: PhilippineTime.toUtc(PhilippineTime.now()).toISOString()
        })
        .eq('user_id', officerId)
        .eq('is_read', false)

      if (error) {
        console.error('❌ Error marking all notifications as read:', error)
        return false
      }

      console.log('✅ All notifications marked as read successfully')
      return true
    } catch (error) {
      console.error('❌ Error in markAllAsRead:', error)
      return false
    }
  }

  // Get unread notifications for officer
  static async getUnreadNotifications(officerId: string, limit = 10): Promise<Notification[]> {
    return this.getOfficerNotifications(officerId, {
      is_read: false,
      limit
    })
  }
  
  // Get recent system-wide notifications (for admin dashboard)
  static async getRecentNotifications(limit = 10): Promise<Notification[]> {
    try {
      console.log('🔔 Fetching recent system-wide notifications')
      
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          complaint:related_complaint_id (
            complaint_number,
            title,
            crime_type,
            status
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit)
      
      if (error) {
        console.error('❌ Error fetching system-wide notifications:', error)
        throw error
      }
      
      console.log(`✅ Fetched ${data?.length || 0} system-wide notifications`)
      return data || []
    } catch (error) {
      console.error('❌ Error in getRecentNotifications:', error)
      return []
    }
  }

  // Get urgent notifications for officer
  static async getUrgentNotifications(officerId: string): Promise<Notification[]> {
    return this.getOfficerNotifications(officerId, {
      is_read: false,
      priority: 'urgent'
    })
  }

  // Subscribe to real-time notifications (Supabase Realtime)
  static subscribeToNotifications(
    officerId: string, 
    onNotificationChange: (notification: Notification, changeType: 'INSERT' | 'UPDATE' | 'DELETE') => void
  ) {
    console.log('🔄 Setting up real-time notification subscription for officer:', officerId)

    const channel = supabase
      .channel(`officer_notifications_${officerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${officerId}`
        },
        (payload) => {
          console.log('🔔 Real-time notification update:', payload)
          
          if (payload.eventType === 'INSERT' && payload.new) {
            onNotificationChange(payload.new as Notification, 'INSERT')
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            onNotificationChange(payload.new as Notification, 'UPDATE')
          } else if (payload.eventType === 'DELETE' && payload.old) {
            onNotificationChange(payload.old as Notification, 'DELETE')
          }
        }
      )
      .subscribe((status) => {
        console.log(`🔄 Real-time subscription status: ${status}`)
      })

    return channel
  }

  // Format notification time (matches Flutter timeAgo)
  static formatNotificationTime(createdAt: string): string {
    try {
      const createdAtPhilippines = PhilippineTime.parseDatabaseTime(createdAt)
      if (!createdAtPhilippines) return 'Unknown time'

      const now = PhilippineTime.now()
      const diffMs = now.getTime() - createdAtPhilippines.getTime()
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

      if (diffMinutes < 1) {
        return 'Just now'
      } else if (diffHours < 1) {
        return `${diffMinutes}m ago`
      } else if (diffDays < 1) {
        return `${diffHours}h ago`
      } else if (diffDays < 30) {
        return `${diffDays}d ago`
      } else {
        return PhilippineTime.formatSpecificTime(createdAt)
      }
    } catch (error) {
      console.error('Error formatting notification time:', error)
      return 'Unknown time'
    }
  }

  // Get notification icon and color based on type and priority
  static getNotificationDisplay(notification: Notification) {
    let icon = '🔔'
    let color = 'text-lawbot-blue-600'
    let bgColor = 'bg-lawbot-blue-50'

    // Icon based on type
    switch (notification.type) {
      case 'case_assignment':
        icon = '📋'
        color = 'text-lawbot-blue-600'
        bgColor = 'bg-lawbot-blue-50'
        break
      case 'case_update':
        icon = '📄'
        color = 'text-lawbot-emerald-600'
        bgColor = 'bg-lawbot-emerald-50'
        break
      case 'success':
        icon = '✅'
        color = 'text-lawbot-emerald-600'
        bgColor = 'bg-lawbot-emerald-50'
        break
      case 'warning':
        icon = '⚠️'
        color = 'text-lawbot-amber-600'
        bgColor = 'bg-lawbot-amber-50'
        break
      case 'error':
        icon = '❌'
        color = 'text-lawbot-red-600'
        bgColor = 'bg-lawbot-red-50'
        break
      default:
        icon = '🔔'
        color = 'text-lawbot-blue-600'
        bgColor = 'bg-lawbot-blue-50'
    }

    // Override color for urgent priority
    if (notification.priority === 'urgent') {
      color = 'text-lawbot-red-600'
      bgColor = 'bg-lawbot-red-50'
    }

    return { icon, color, bgColor }
  }

  // Create sample notification for testing (matches Flutter sample notifications)
  static async createSampleNotification(officerId: string, type: 'case_assignment' | 'case_update' = 'case_assignment'): Promise<boolean> {
    try {
      console.log('🔔 Creating sample notification for officer ID:', officerId)
      
      // If officer ID looks like firebase_uid, try to get UUID first
      let targetOfficerId = officerId
      if (officerId.length > 20) {
        try {
          const { data: officerData } = await supabase
            .from('pnp_officer_profiles')
            .select('id')
            .eq('firebase_uid', officerId)
            .single()
          
          if (officerData?.id) {
            targetOfficerId = officerData.id
            console.log('🔄 Using officer UUID for notification:', targetOfficerId)
          }
        } catch (officerError) {
          console.log('⚠️ Could not find officer UUID, using original ID:', officerId)
        }
      }

      const sampleNotifications = {
        case_assignment: {
          title: 'New Case Assigned',
          message: 'You have been assigned to investigate cybercrime case CYB-2025-001. Priority: High',
          type: 'case_assignment',
          priority: 'high',
          notification_category: 'officer_assignment',
          sender_name: 'Case Management System'
        },
        case_update: {
          title: 'Case Update Required',
          message: 'Case CYB-2025-002 has been updated by the citizen. Please review the additional information provided.',
          type: 'case_update',
          priority: 'normal',
          notification_category: 'complaint_status',
          sender_name: 'System'
        }
      }

      const notification = sampleNotifications[type]

      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: targetOfficerId,
          ...notification
        })

      if (error) {
        console.error('❌ Error creating sample notification:', error)
        return false
      }

      console.log(`✅ Sample notification created successfully for officer ID: ${targetOfficerId}`)
      return true
    } catch (error) {
      console.error('❌ Error in createSampleNotification:', error)
      return false
    }
  }
}

export default NotificationService