import { supabase } from './supabase'

export interface UserProfile {
  id: string
  firebase_uid: string
  full_name: string
  email: string
  phone_number: string
  user_type: 'CLIENT' | 'ADMIN'
  user_status: 'active' | 'suspended' | 'deleted'
  profile_picture_url?: string
  fcm_token?: string
  created_at: string
  updated_at: string
  last_active: string
  // Computed fields
  cases: number
  active_cases: number
  resolved_cases: number
  dismissed_cases: number
  status: string // mapped from user_status for consistency
}

export interface UserStats {
  total_users: number
  active_users: number
  suspended_users: number
  deleted_users: number
  users_with_fcm: number
  users_without_fcm: number
  total_cases: number
}

class UserService {
  /**
   * Fetch all client user profiles with case counts
   */
  static async getClientUsers(): Promise<UserProfile[]> {
    try {
      console.log('🔄 Fetching client users from database...')

      // Query user profiles joined with case counts
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          complaints!inner(
            id,
            status,
            user_id
          )
        `)
        .eq('user_type', 'CLIENT')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching client users:', error)
        throw error
      }

      // Transform and aggregate data
      const transformedUsers: UserProfile[] = []
      const userMap = new Map()

      // Process each record (users may appear multiple times due to JOIN)
      data?.forEach((record: any) => {
        const userId = record.firebase_uid
        
        if (!userMap.has(userId)) {
          // Initialize user object
          userMap.set(userId, {
            id: record.id,
            firebase_uid: record.firebase_uid,
            full_name: record.full_name,
            email: record.email,
            phone_number: record.phone_number,
            user_type: record.user_type,
            user_status: record.user_status,
            profile_picture_url: record.profile_picture_url,
            fcm_token: record.fcm_token,
            created_at: record.created_at,
            updated_at: record.updated_at,
            last_active: record.last_active,
            status: record.user_status, // Map for consistency
            cases: 0,
            active_cases: 0,
            resolved_cases: 0,
            dismissed_cases: 0,
            complaint_statuses: []
          })
        }

        // Count cases by status
        const user = userMap.get(userId)
        if (record.complaints) {
          user.cases++
          user.complaint_statuses.push(record.complaints.status)

          switch (record.complaints.status) {
            case 'Pending':
            case 'Under Investigation':
            case 'Requires More Information':
              user.active_cases++
              break
            case 'Resolved':
              user.resolved_cases++
              break
            case 'Dismissed':
              user.dismissed_cases++
              break
          }
        }
      })

      // Convert map to array and clean up
      userMap.forEach((user) => {
        delete user.complaint_statuses // Remove temporary field
        transformedUsers.push(user)
      })

      console.log(`✅ Successfully fetched ${transformedUsers.length} client users`)
      return transformedUsers

    } catch (error) {
      console.error('❌ Error in getClientUsers:', error)
      throw error
    }
  }

  /**
   * Fetch users without any complaints (for separate query optimization)
   */
  static async getClientUsersWithoutComplaints(): Promise<UserProfile[]> {
    try {
      console.log('🔄 Fetching client users without complaints...')

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_type', 'CLIENT')
        .not('firebase_uid', 'in', 
          supabase
            .from('complaints')
            .select('user_id')
        )
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching users without complaints:', error)
        throw error
      }

      // Transform data
      const transformedUsers: UserProfile[] = data?.map((record: any) => ({
        id: record.id,
        firebase_uid: record.firebase_uid,
        full_name: record.full_name,
        email: record.email,
        phone_number: record.phone_number,
        user_type: record.user_type,
        user_status: record.user_status,
        profile_picture_url: record.profile_picture_url,
        fcm_token: record.fcm_token,
        created_at: record.created_at,
        updated_at: record.updated_at,
        last_active: record.last_active,
        status: record.user_status, // Map for consistency
        cases: 0,
        active_cases: 0,
        resolved_cases: 0,
        dismissed_cases: 0
      })) || []

      console.log(`✅ Successfully fetched ${transformedUsers.length} users without complaints`)
      return transformedUsers

    } catch (error) {
      console.error('❌ Error in getClientUsersWithoutComplaints:', error)
      throw error
    }
  }

  /**
   * Get comprehensive user statistics
   */
  static async getUserStats(): Promise<UserStats> {
    try {
      console.log('🔄 Calculating user statistics...')

      // Get user counts by status
      const { data: userCounts, error: userError } = await supabase
        .from('user_profiles')
        .select('user_status, fcm_token')
        .eq('user_type', 'CLIENT')

      if (userError) {
        console.error('❌ Error fetching user statistics:', userError)
        throw userError
      }

      // Get total case count
      const { count: totalCases, error: caseError } = await supabase
        .from('complaints')
        .select('*', { count: 'exact', head: true })

      if (caseError) {
        console.error('❌ Error fetching case count:', caseError)
        throw caseError
      }

      // Calculate statistics
      const stats: UserStats = {
        total_users: userCounts?.length || 0,
        active_users: userCounts?.filter(u => u.user_status === 'active').length || 0,
        suspended_users: userCounts?.filter(u => u.user_status === 'suspended').length || 0,
        deleted_users: userCounts?.filter(u => u.user_status === 'deleted').length || 0,
        users_with_fcm: userCounts?.filter(u => u.fcm_token).length || 0,
        users_without_fcm: userCounts?.filter(u => !u.fcm_token).length || 0,
        total_cases: totalCases || 0
      }

      console.log('✅ User statistics calculated:', stats)
      return stats

    } catch (error) {
      console.error('❌ Error calculating user statistics:', error)
      throw error
    }
  }

  /**
   * Get all client users (with and without complaints) - optimized query
   */
  static async getAllClientUsers(): Promise<UserProfile[]> {
    try {
      console.log('🔄 Fetching all client users with optimized query...')

      // First get all users
      const { data: users, error: userError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_type', 'CLIENT')
        .order('created_at', { ascending: false })

      if (userError) {
        console.error('❌ Error fetching users:', userError)
        throw userError
      }

      // Then get case counts for each user
      const { data: caseCounts, error: caseError } = await supabase
        .from('complaints')
        .select('user_id, status')

      if (caseError) {
        console.error('❌ Error fetching case counts:', caseError)
        throw caseError
      }

      // Create case count map
      const caseCountMap = new Map()
      caseCounts?.forEach((complaint: any) => {
        const userId = complaint.user_id
        if (!caseCountMap.has(userId)) {
          caseCountMap.set(userId, {
            total: 0,
            active: 0,
            resolved: 0,
            dismissed: 0
          })
        }
        
        const counts = caseCountMap.get(userId)
        counts.total++
        
        switch (complaint.status) {
          case 'Pending':
          case 'Under Investigation':
          case 'Requires More Information':
            counts.active++
            break
          case 'Resolved':
            counts.resolved++
            break
          case 'Dismissed':
            counts.dismissed++
            break
        }
      })

      // Transform and merge data
      const transformedUsers: UserProfile[] = users?.map((user: any) => {
        const counts = caseCountMap.get(user.firebase_uid) || {
          total: 0,
          active: 0,
          resolved: 0,
          dismissed: 0
        }

        return {
          id: user.id,
          firebase_uid: user.firebase_uid,
          full_name: user.full_name,
          email: user.email,
          phone_number: user.phone_number,
          user_type: user.user_type,
          user_status: user.user_status,
          profile_picture_url: user.profile_picture_url,
          fcm_token: user.fcm_token,
          created_at: user.created_at,
          updated_at: user.updated_at,
          last_active: user.last_active,
          status: user.user_status, // Map for consistency with existing UI
          cases: counts.total,
          active_cases: counts.active,
          resolved_cases: counts.resolved,
          dismissed_cases: counts.dismissed
        }
      }) || []

      console.log(`✅ Successfully fetched ${transformedUsers.length} client users with case counts`)
      return transformedUsers

    } catch (error) {
      console.error('❌ Error in getAllClientUsers:', error)
      throw error
    }
  }

  /**
   * Update user status (admin action)
   */
  static async updateUserStatus(userId: string, newStatus: 'active' | 'suspended' | 'deleted'): Promise<boolean> {
    try {
      console.log(`🔄 Updating user ${userId} status to: ${newStatus}`)

      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          user_status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('firebase_uid', userId)

      if (error) {
        console.error('❌ Error updating user status:', error)
        throw error
      }

      console.log(`✅ Successfully updated user ${userId} status to ${newStatus}`)
      return true

    } catch (error) {
      console.error('❌ Error in updateUserStatus:', error)
      throw error
    }
  }
}

export default UserService