import { supabase } from './supabase'
import { AuthService } from './auth'

export interface SuperAdminProfile {
  id: string
  firebase_uid: string
  email: string
  full_name: string
  phone_number: string | null
  role: 'SUPER_ADMIN'
  status: 'active' | 'suspended' | 'inactive'
  created_at: string
  updated_at: string
  last_login_at?: string | null
  total_cases_overseen: number
  officers_managed: number
}

export interface AdminStats {
  total_admins: number
  super_admins: number
  system_admins: number
  support_admins: number
  active_admins: number
  suspended_admins: number
  inactive_admins: number
}

export interface CreateAdminRequest {
  email: string
  password: string
  full_name: string
  phone_number?: string
  role: 'SUPER_ADMIN'
}

export interface UpdateAdminRequest {
  full_name: string
  email: string
  phone_number?: string
  role: 'SUPER_ADMIN'
  status: 'active' | 'suspended' | 'inactive'
}

class AdminManagementService {
  private static _currentAdminUid: string | null = null

  static setCurrentAdminUid(uid: string | null) {
    this._currentAdminUid = uid
  }

  static get currentAdminUid(): string | null {
    if (this._currentAdminUid) return this._currentAdminUid
    
    if (typeof window === 'undefined') return null
    
    try {
      const { auth } = require('@/lib/firebase')
      return auth.currentUser?.uid || null
    } catch {
      return null
    }
  }

  static async getAllSuperAdmins(): Promise<SuperAdminProfile[]> {
    try {
      console.log('🔄 Fetching all super admins from database...')
      
      const { data, error } = await supabase.rpc('get_all_super_admins')
      
      if (error) {
        console.error('❌ Error fetching super admins:', error)
        return []
      }
      
      console.log(`✅ Loaded ${data?.length || 0} super admins`)
      return data || []
    } catch (error) {
      console.error('❌ Exception fetching super admins:', error)
      return []
    }
  }

  static async getAdminStats(): Promise<AdminStats> {
    try {
      console.log('🔄 Fetching admin statistics...')
      
      const { data, error } = await supabase.rpc('get_admin_stats')
      
      if (error) {
        console.error('❌ Error fetching admin stats:', error)
        return this.getDefaultAdminStats()
      }
      
      const stats = data?.[0] || this.getDefaultAdminStats()
      console.log('✅ Admin statistics loaded:', stats)
      return stats
    } catch (error) {
      console.error('❌ Exception fetching admin stats:', error)
      return this.getDefaultAdminStats()
    }
  }

  private static getDefaultAdminStats(): AdminStats {
    return {
      total_admins: 0,
      super_admins: 0,
      system_admins: 0,
      support_admins: 0,
      active_admins: 0,
      suspended_admins: 0,
      inactive_admins: 0
    }
  }

  static async createSuperAdmin(adminData: CreateAdminRequest): Promise<boolean> {
    try {
      console.log('🔄 Creating new super admin:', adminData.email)
      
      const user = await AuthService.signUpWithEmail(
        adminData.email,
        adminData.password,
        adminData.full_name,
        'ADMIN',
        {
          phoneNumber: adminData.phone_number,
          role: adminData.role
        }
      )
      
      if (!user) {
        throw new Error('Failed to create Firebase user')
      }
      
      console.log('✅ Super admin created successfully')
      return true
    } catch (error) {
      console.error('❌ Error creating super admin:', error)
      throw error
    }
  }

  static async updateSuperAdmin(adminId: string, adminData: UpdateAdminRequest): Promise<boolean> {
    try {
      console.log('🔄 Updating super admin:', adminId)
      
      if (!this.currentAdminUid) {
        throw new Error('No authenticated admin found')
      }
      
      const { data, error } = await supabase.rpc('update_admin_profile', {
        p_admin_id: adminId,
        p_full_name: adminData.full_name,
        p_email: adminData.email,
        p_phone_number: adminData.phone_number || null,
        p_role: adminData.role,
        p_status: adminData.status,
        p_requesting_admin_firebase_uid: this.currentAdminUid
      })
      
      if (error) {
        console.error('❌ Database error updating admin:', error)
        throw new Error(error.message)
      }
      
      const result = data?.[0]
      if (!result?.success) {
        throw new Error(result?.message || 'Failed to update admin')
      }
      
      console.log('✅ Super admin updated successfully')
      return true
    } catch (error) {
      console.error('❌ Error updating super admin:', error)
      throw error
    }
  }

  static async deleteSuperAdmin(adminId: string): Promise<boolean> {
    try {
      console.log('🔄 Deleting super admin:', adminId)
      
      if (!this.currentAdminUid) {
        throw new Error('No authenticated admin found')
      }
      
      const { data, error } = await supabase.rpc('delete_admin_profile', {
        p_admin_id: adminId,
        p_requesting_admin_firebase_uid: this.currentAdminUid
      })
      
      if (error) {
        console.error('❌ Database error deleting admin:', error)
        throw new Error(error.message)
      }
      
      const result = data?.[0]
      if (!result?.success) {
        throw new Error(result?.message || 'Failed to delete admin')
      }
      
      console.log('✅ Super admin deleted successfully:', result.deleted_admin_name)
      return true
    } catch (error) {
      console.error('❌ Error deleting super admin:', error)
      throw error
    }
  }

  static async validateAdminRole(firebaseUid: string): Promise<SuperAdminProfile | null> {
    try {
      const { data, error } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('firebase_uid', firebaseUid)
        .eq('status', 'active')
        .single()
      
      if (error || !data) {
        return null
      }
      
      return data as SuperAdminProfile
    } catch (error) {
      console.error('❌ Error validating admin role:', error)
      return null
    }
  }

  static async sendPasswordReset(email: string): Promise<boolean> {
    try {
      await AuthService.resetPassword(email)
      return true
    } catch (error) {
      console.error('❌ Error sending password reset:', error)
      throw error
    }
  }

  static clearCache() {
    console.log('🧹 Clearing Admin Management Service cache')
    this._currentAdminUid = null
  }
}

export default AdminManagementService