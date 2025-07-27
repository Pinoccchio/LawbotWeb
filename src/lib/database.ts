import { supabase } from './supabase'
import { auth } from './firebase'

export class DatabaseService {
  // Get current user ID from Firebase
  static get currentUserId(): string | null {
    return auth.currentUser?.uid || null
  }

  // =============================================
  // USER PROFILE OPERATIONS
  // =============================================

  // Get user profile
  static async getUserProfile() {
    try {
      if (!this.currentUserId) return null
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('firebase_uid', this.currentUserId)
        .maybeSingle()

      if (error) {
        console.error('Error getting user profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error getting user profile:', error)
      return null
    }
  }

  // Update user profile
  static async updateUserProfile({
    fullName,
    phoneNumber,
    profilePictureUrl
  }: {
    fullName?: string
    phoneNumber?: string
    profilePictureUrl?: string
  }) {
    try {
      if (!this.currentUserId) {
        throw new Error('User not authenticated')
      }

      const updateData: any = {
        updated_at: new Date().toISOString()
      }

      if (fullName !== undefined) updateData.full_name = fullName
      if (phoneNumber !== undefined) updateData.phone_number = phoneNumber
      if (profilePictureUrl !== undefined) updateData.profile_picture_url = profilePictureUrl

      const { error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('firebase_uid', this.currentUserId)

      if (error) {
        throw new Error(`Failed to update user profile: ${error.message}`)
      }

      return true
    } catch (error: any) {
      console.error('Error updating user profile:', error)
      throw new Error(`Failed to update user profile: ${error.message}`)
    }
  }

  // Update user's last active timestamp
  static async updateUserLastActive() {
    try {
      if (!this.currentUserId) return

      const { error } = await supabase
        .from('user_profiles')
        .update({
          last_active: new Date().toISOString()
        })
        .eq('firebase_uid', this.currentUserId)

      if (error) {
        console.error('Error updating last active:', error)
      }
    } catch (error) {
      console.error('Error updating last active:', error)
    }
  }

  // =============================================
  // NOTIFICATION OPERATIONS
  // =============================================

  // Get notifications for current user
  static async getNotifications({
    unreadOnly = false,
    category,
    limit = 50,
    offset = 0
  }: {
    unreadOnly?: boolean
    category?: string
    limit?: number
    offset?: number
  } = {}) {
    try {
      if (!this.currentUserId) return []

      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', this.currentUserId)

      if (unreadOnly) {
        query = query.eq('is_read', false)
      }

      if (category) {
        query = query.eq('notification_category', category)
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('Error getting notifications:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error getting notifications:', error)
      return []
    }
  }

  // Get notification statistics
  static async getNotificationStats() {
    try {
      if (!this.currentUserId) return {}

      const { data: unreadData, error: unreadError } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', this.currentUserId)
        .eq('is_read', false)

      const { data: urgentData, error: urgentError } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', this.currentUserId)
        .eq('is_read', false)
        .eq('priority', 'urgent')

      if (unreadError || urgentError) {
        console.error('Error getting notification stats:', unreadError || urgentError)
        return {}
      }

      return {
        unread_notifications: unreadData?.length || 0,
        urgent_notifications: urgentData?.length || 0
      }
    } catch (error) {
      console.error('Error getting notification stats:', error)
      return {}
    }
  }

  // Mark notification as read
  static async markNotificationAsRead(notificationId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId)
        .eq('user_id', this.currentUserId)

      if (error) {
        console.error('Error marking notification as read:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error marking notification as read:', error)
      return false
    }
  }

  // Mark all notifications as read
  static async markAllNotificationsAsRead() {
    try {
      if (!this.currentUserId) return false

      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('user_id', this.currentUserId)
        .eq('is_read', false)

      if (error) {
        console.error('Error marking all notifications as read:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      return false
    }
  }

  // =============================================
  // COMPLAINT/CASE OPERATIONS (for web dashboard)
  // =============================================

  // Get all complaints/cases (for admin/PNP dashboard)
  static async getAllComplaints({
    status,
    priority,
    limit = 50,
    offset = 0
  }: {
    status?: string
    priority?: string
    limit?: number
    offset?: number
  } = {}) {
    try {
      let query = supabase
        .from('complaints')
        .select(`
          *,
          user_profiles(full_name, email, phone_number)
        `)

      if (status) {
        query = query.eq('status', status)
      }

      if (priority) {
        query = query.eq('priority', priority)
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('Error getting complaints:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error getting complaints:', error)
      return []
    }
  }

  // Get complaint by ID
  static async getComplaintById(complaintId: string) {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select(`
          *,
          user_profiles(full_name, email, phone_number)
        `)
        .eq('id', complaintId)
        .maybeSingle()

      if (error) {
        console.error('Error getting complaint:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error getting complaint:', error)
      return null
    }
  }

  // Update complaint status (for PNP officers)
  static async updateComplaintStatus(
    complaintId: string, 
    status: string, 
    remarks?: string,
    assignedOfficer?: string
  ) {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      }

      if (remarks) updateData.remarks = remarks
      if (assignedOfficer) updateData.assigned_officer = assignedOfficer

      const { error } = await supabase
        .from('complaints')
        .update(updateData)
        .eq('id', complaintId)

      if (error) {
        throw new Error(`Failed to update complaint status: ${error.message}`)
      }

      return true
    } catch (error: any) {
      console.error('Error updating complaint status:', error)
      throw new Error(`Failed to update complaint status: ${error.message}`)
    }
  }

  // Get complaints by officer (for PNP dashboard)
  static async getComplaintsByOfficer(officerName: string) {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select(`
          *,
          user_profiles(full_name, email, phone_number)
        `)
        .eq('assigned_officer', officerName)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error getting officer complaints:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error getting officer complaints:', error)
      return []
    }
  }
}