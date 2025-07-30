import { supabase } from './supabase'
import { auth } from './firebase'

// Define types for PNP officer related data
export interface PNPOfficerProfile {
  id: string
  firebase_uid: string
  email: string
  full_name: string
  phone_number: string | null
  badge_number: string
  rank: string
  unit_id: string | null
  region: string
  status: 'active' | 'on_leave' | 'suspended' | 'retired'
  total_cases: number
  active_cases: number
  resolved_cases: number
  success_rate: number
  created_at: string
  updated_at: string
  // Joined unit data
  unit?: {
    id: string
    unit_name: string
    unit_code: string
    category: string
    description: string
    region: string
    max_officers: number
    current_officers: number
    active_cases: number
    resolved_cases: number
    success_rate: number
    status: string
    crime_types: string[]
  } | null
}

export interface PNPOfficerStats {
  totalCases: number
  activeCases: number
  resolvedCases: number
  successRate: number
  avgResolutionTime: number
}

export class PNPOfficerService {
  // Get current user ID from Firebase
  static get currentUserId(): string | null {
    return auth.currentUser?.uid || null
  }

  /**
   * Get current logged-in officer's profile with unit information
   */
  static async getCurrentOfficerProfile(): Promise<PNPOfficerProfile | null> {
    try {
      if (!this.currentUserId) {
        console.error('No authenticated user found')
        return null
      }

      const { data, error } = await supabase
        .from('pnp_officer_profiles')
        .select(`
          *,
          pnp_units!inner (
            id,
            unit_name,
            unit_code,
            category,
            description,
            region,
            max_officers,
            current_officers,
            active_cases,
            resolved_cases,
            success_rate,
            status,
            pnp_unit_crime_types(crime_type)
          )
        `)
        .eq('firebase_uid', this.currentUserId)
        .eq('status', 'active')
        .single()

      if (error) {
        console.error('Error getting officer profile:', error)
        return null
      }

      if (!data) {
        console.error('No officer profile found for current user')
        return null
      }

      // Transform the data to match our interface
      const unitData = data.pnp_units
      const unit = unitData ? {
        id: unitData.id,
        unit_name: unitData.unit_name,
        unit_code: unitData.unit_code,
        category: unitData.category,
        description: unitData.description,
        region: unitData.region,
        max_officers: unitData.max_officers,
        current_officers: unitData.current_officers,
        active_cases: unitData.active_cases,
        resolved_cases: unitData.resolved_cases,
        success_rate: unitData.success_rate,
        status: unitData.status,
        crime_types: unitData.pnp_unit_crime_types?.map((ct: any) => ct.crime_type) || []
      } : null

      // Remove the nested unit data and add as a flat property
      const { pnp_units, ...officerData } = data

      return {
        ...officerData,
        unit
      }
    } catch (error) {
      console.error('Error getting current officer profile:', error)
      return null
    }
  }

  /**
   * Get officer profile by Firebase UID
   */
  static async getOfficerByFirebaseUid(firebaseUid: string): Promise<PNPOfficerProfile | null> {
    try {
      const { data, error } = await supabase
        .from('pnp_officer_profiles')
        .select(`
          *,
          pnp_units!inner (
            id,
            unit_name,
            unit_code,
            category,
            description,
            region,
            max_officers,
            current_officers,
            active_cases,
            resolved_cases,
            success_rate,
            status,
            pnp_unit_crime_types(crime_type)
          )
        `)
        .eq('firebase_uid', firebaseUid)
        .single()

      if (error) {
        console.error('Error getting officer profile:', error)
        return null
      }

      if (!data) {
        return null
      }

      // Transform the data to match our interface
      const unitData = data.pnp_units
      const unit = unitData ? {
        id: unitData.id,
        unit_name: unitData.unit_name,
        unit_code: unitData.unit_code,
        category: unitData.category,
        description: unitData.description,
        region: unitData.region,
        max_officers: unitData.max_officers,
        current_officers: unitData.current_officers,
        active_cases: unitData.active_cases,
        resolved_cases: unitData.resolved_cases,
        success_rate: unitData.success_rate,
        status: unitData.status,
        crime_types: unitData.pnp_unit_crime_types?.map((ct: any) => ct.crime_type) || []
      } : null

      // Remove the nested unit data and add as a flat property
      const { pnp_units, ...officerData } = data

      return {
        ...officerData,
        unit
      }
    } catch (error) {
      console.error('Error getting officer profile by Firebase UID:', error)
      return null
    }
  }

  /**
   * Get officer's assigned cases
   */
  static async getOfficerCases(officerId?: string, status?: string) {
    try {
      if (!officerId && !this.currentUserId) {
        throw new Error('No officer ID or authenticated user found')
      }

      // If no officer ID provided, get current officer's ID
      let targetOfficerId = officerId
      if (!targetOfficerId) {
        const profile = await this.getCurrentOfficerProfile()
        if (!profile) {
          throw new Error('Could not find officer profile')
        }
        targetOfficerId = profile.id
      }

      let query = supabase
        .from('case_assignments')
        .select(`
          *,
          complaints!inner(
            id,
            complaint_number,
            crime_type,
            title,
            description,
            status,
            priority,
            risk_score,
            estimated_loss,
            incident_date_time,
            incident_location,
            created_at,
            updated_at,
            user_profiles(full_name, email, phone_number)
          )
        `)
        .eq('officer_id', targetOfficerId)

      if (status) {
        query = query.eq('complaints.status', status)
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error getting officer cases:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error getting officer cases:', error)
      return []
    }
  }

  /**
   * Get officer's performance statistics
   */
  static async getOfficerStats(officerId?: string): Promise<PNPOfficerStats | null> {
    try {
      if (!officerId && !this.currentUserId) {
        throw new Error('No officer ID or authenticated user found')
      }

      // If no officer ID provided, get current officer's profile
      let profile: PNPOfficerProfile | null = null
      if (officerId) {
        // Get profile by officer ID (need to fetch by firebase_uid)
        const { data, error } = await supabase
          .from('pnp_officer_profiles')
          .select('*')
          .eq('id', officerId)
          .single()
        
        if (!error && data) {
          profile = data as PNPOfficerProfile
        }
      } else {
        profile = await this.getCurrentOfficerProfile()
      }

      if (!profile) {
        throw new Error('Could not find officer profile')
      }

      // Calculate average resolution time from resolved cases
      const { data: resolvedCases, error: casesError } = await supabase
        .from('case_assignments')
        .select(`
          created_at,
          complaints!inner(
            status,
            created_at,
            updated_at
          )
        `)
        .eq('officer_id', profile.id)
        .in('complaints.status', ['Resolved', 'Dismissed'])

      let avgResolutionTime = 0
      if (!casesError && resolvedCases && resolvedCases.length > 0) {
        const totalDays = resolvedCases.reduce((total, assignment) => {
          const complaint = Array.isArray(assignment.complaints) ? assignment.complaints[0] : assignment.complaints
          if (complaint && complaint.created_at && complaint.updated_at) {
            const startDate = new Date(complaint.created_at)
            const endDate = new Date(complaint.updated_at)
            const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
            return total + daysDiff
          }
          return total
        }, 0)
        
        avgResolutionTime = Math.round((totalDays / resolvedCases.length) * 10) / 10
      }

      return {
        totalCases: profile.total_cases,
        activeCases: profile.active_cases,
        resolvedCases: profile.resolved_cases,
        successRate: profile.success_rate,
        avgResolutionTime
      }
    } catch (error) {
      console.error('Error getting officer stats:', error)
      return null
    }
  }

  /**
   * Update officer profile
   */
  static async updateOfficerProfile(
    updates: Partial<Pick<PNPOfficerProfile, 'full_name' | 'phone_number' | 'email'>>
  ): Promise<boolean> {
    try {
      if (!this.currentUserId) {
        throw new Error('User not authenticated')
      }

      const { error } = await supabase
        .from('pnp_officer_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('firebase_uid', this.currentUserId)

      if (error) {
        console.error('Error updating officer profile:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error updating officer profile:', error)
      return false
    }
  }

  /**
   * Get officers in the same unit
   */
  static async getUnitColleagues(unitId?: string): Promise<PNPOfficerProfile[]> {
    try {
      let targetUnitId = unitId
      
      if (!targetUnitId) {
        const profile = await this.getCurrentOfficerProfile()
        if (!profile?.unit_id) {
          throw new Error('Could not determine unit ID')
        }
        targetUnitId = profile.unit_id
      }

      const { data, error } = await supabase
        .from('pnp_officer_profiles')
        .select(`
          *,
          pnp_units!inner (
            id,
            unit_name,
            unit_code,
            category,
            description
          )
        `)
        .eq('unit_id', targetUnitId)
        .eq('status', 'active')
        .order('rank', { ascending: false })

      if (error) {
        console.error('Error getting unit colleagues:', error)
        return []
      }

      return data?.map(officer => ({
        ...officer,
        unit: officer.pnp_units ? {
          id: officer.pnp_units.id,
          unit_name: officer.pnp_units.unit_name,
          unit_code: officer.pnp_units.unit_code,
          category: officer.pnp_units.category,
          description: officer.pnp_units.description,
          region: '',
          max_officers: 0,
          current_officers: 0,
          active_cases: 0,
          resolved_cases: 0,
          success_rate: 0,
          status: 'active',
          crime_types: []
        } : null,
        pnp_units: undefined
      })) || []
    } catch (error) {
      console.error('Error getting unit colleagues:', error)
      return []
    }
  }
}

export default PNPOfficerService