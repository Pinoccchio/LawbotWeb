import { supabase } from './supabase'
import { auth } from './firebase'

// Define types for PNP unit related data
export interface PNPUnit {
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
  status: 'active' | 'inactive' | 'disbanded'
  created_by: string | null
  created_at: string
  updated_at: string
  crime_types?: string[]
  availabilityStats?: {
    totalOfficers: number
    available: number
    busy: number
    overloaded: number
    onLeave: number
    averageWorkload: number
  }
}

export interface PNPOfficerProfile {
  id: string
  firebase_uid: string
  email: string
  full_name: string
  phone_number?: string
  badge_number: string
  rank: string
  unit_id: string
  region: string
  status: 'active' | 'on_leave' | 'suspended' | 'retired'
  availability_status: 'available' | 'busy' | 'overloaded' | 'on_leave'
  max_concurrent_cases: number
  current_workload_percentage: number
  specializations: string[]
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  leave_start_date?: string
  leave_end_date?: string
  leave_type?: string
  leave_reason?: string
  last_login_at?: string
  last_case_assignment_at?: string
  last_status_update_at?: string
  created_at: string
  updated_at: string
  // Computed fields
  computedAvailabilityStatus?: 'available' | 'busy' | 'overloaded' | 'on_leave'
  isOnLeave?: boolean
  workloadStatus?: 'light' | 'moderate' | 'busy' | 'overloaded'
  availableCapacity?: number
  matchingSpecializations?: string[]
}

export interface UnitAvailabilityStats {
  totalOfficers: number
  available: number
  busy: number
  overloaded: number
  onLeave: number
  averageWorkload: number
}

export interface CreatePNPUnitPayload {
  unit_name: string
  unit_code: string
  category: string
  description: string
  region: string
  max_officers: number
  primary_crime_types: string[]
}

export interface OfficerAvailabilityUpdate {
  officerId: string
  availabilityStatus: 'available' | 'busy' | 'overloaded' | 'on_leave'
  workloadPercentage?: number
}

export class PNPUnitsService {
  // Get current user ID from Firebase
  static get currentUserId(): string | null {
    return auth.currentUser?.uid || null
  }

  // =============================================
  // PNP UNITS OPERATIONS
  // =============================================

  /**
   * Get all PNP units with optional filtering and availability statistics
   */
  static async getAllUnits({
    status,
    region,
    category,
    limit = 50,
    offset = 0,
    includeAvailabilityStats = false
  }: {
    status?: string
    region?: string
    category?: string
    limit?: number
    offset?: number
    includeAvailabilityStats?: boolean
  } = {}) {
    try {
      // Start building query
      let query = supabase
        .from('pnp_units')
        .select(`
          *,
          pnp_unit_crime_types(crime_type)
        `)

      // Add filters if provided
      if (status) {
        query = query.eq('status', status)
      }

      if (region) {
        query = query.eq('region', region)
      }

      if (category) {
        query = query.eq('category', category)
      }

      // Execute query with pagination
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('Error getting PNP units:', error)
        return []
      }

      // Transform data to include crime types as string array
      const unitsWithCrimeTypes = (data as any[])?.map(unit => {
        // Extract crime types from the nested array
        const crimeTypes = unit.pnp_unit_crime_types?.map((ct: any) => ct.crime_type) || []
        
        // Remove the nested array and add as a flat property
        const { pnp_unit_crime_types, ...unitData } = unit
        
        return {
          ...unitData,
          crime_types: crimeTypes
        }
      }) || []

      // Add availability statistics if requested
      if (includeAvailabilityStats) {
        const unitsWithStats = await Promise.all(
          unitsWithCrimeTypes.map(async (unit) => {
            const availabilityStats = await this.getUnitAvailabilityStats(unit.id)
            return {
              ...unit,
              availabilityStats
            }
          })
        )
        return unitsWithStats
      }

      return unitsWithCrimeTypes
    } catch (error) {
      console.error('Error getting PNP units:', error)
      return []
    }
  }

  /**
   * Get a PNP unit by ID with optional availability statistics
   */
  static async getUnitById(unitId: string, includeAvailabilityStats: boolean = false) {
    try {
      const { data, error } = await supabase
        .from('pnp_units')
        .select(`
          *,
          pnp_unit_crime_types(crime_type)
        `)
        .eq('id', unitId)
        .single()

      if (error) {
        console.error('Error getting PNP unit:', error)
        return null
      }

      // Transform data to include crime types as string array
      const crimeTypes = data.pnp_unit_crime_types?.map((ct: any) => ct.crime_type) || []
      
      // Remove the nested array and add as a flat property
      const { pnp_unit_crime_types, ...unitData } = data
      
      let unitWithCrimeTypes = {
        ...unitData,
        crime_types: crimeTypes
      }

      // Add availability statistics if requested
      if (includeAvailabilityStats) {
        const availabilityStats = await this.getUnitAvailabilityStats(unitId)
        unitWithCrimeTypes = {
          ...unitWithCrimeTypes,
          availabilityStats
        }
      }
      
      return unitWithCrimeTypes
    } catch (error) {
      console.error('Error getting PNP unit:', error)
      return null
    }
  }

  /**
   * Check if a unit code already exists
   */
  static async checkUnitCodeExists(unitCode: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('pnp_units')
        .select('id')
        .eq('unit_code', unitCode.toUpperCase())
        .limit(1)

      if (error) {
        console.error('Error checking unit code:', error)
        return false // In case of error, allow creation (better than blocking)
      }

      return data && data.length > 0
    } catch (error) {
      console.error('Unit code check failed:', error)
      return false
    }
  }

  /**
   * Generate a unique unit code
   */
  static async generateUniqueUnitCode(category: string, maxAttempts: number = 10): Promise<string> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      // Generate random 3-digit number
      const randomNum = Math.floor(100 + Math.random() * 900)
      const unitCode = `PCU-${randomNum}`
      
      // Check if this code already exists
      const exists = await this.checkUnitCodeExists(unitCode)
      
      if (!exists) {
        console.log(`✅ Generated unique unit code: ${unitCode} (attempt ${attempt})`)
        return unitCode
      }
      
      console.log(`⚠️ Unit code ${unitCode} already exists, trying again... (attempt ${attempt})`)
    }
    
    // If we can't generate a unique code after max attempts, throw error
    throw new Error(`Failed to generate unique unit code after ${maxAttempts} attempts. Please try again.`)
  }

  /**
   * Create a new PNP unit with crime types
   */
  static async createPNPUnit(unitData: CreatePNPUnitPayload) {
    try {
      if (!this.currentUserId) {
        throw new Error('User not authenticated')
      }

      // Check if unit code already exists
      const codeExists = await this.checkUnitCodeExists(unitData.unit_code)
      if (codeExists) {
        throw new Error(`Unit code '${unitData.unit_code}' already exists. Please use a different code or generate a new one.`)
      }

      // Get admin ID using firebase_uid
      const { data: adminData, error: adminError } = await supabase
        .from('admin_profiles')
        .select('id')
        .eq('firebase_uid', this.currentUserId)
        .single()

      if (adminError) {
        throw new Error(`Failed to get admin profile: ${adminError.message}`)
      }

      // Start a transaction using the REST API approach
      const { data: unit, error: unitError } = await supabase
        .from('pnp_units')
        .insert({
          unit_name: unitData.unit_name,
          unit_code: unitData.unit_code.toUpperCase(), // Ensure uppercase
          category: unitData.category,
          description: unitData.description,
          region: unitData.region,
          max_officers: parseInt(unitData.max_officers.toString()),
          created_by: adminData.id
        })
        .select('id')
        .single()

      if (unitError) {
        // Check if it's a unique constraint violation
        if (unitError.code === '23505' && unitError.message.includes('unit_code')) {
          throw new Error(`Unit code '${unitData.unit_code}' already exists. Please use a different code.`)
        }
        throw new Error(`Failed to create PNP unit: ${unitError.message}`)
      }

      // Insert crime types
      if (unitData.primary_crime_types && unitData.primary_crime_types.length > 0) {
        const crimeTypeInserts = unitData.primary_crime_types.map(crimeType => ({
          unit_id: unit.id,
          crime_type: crimeType
        }))

        const { error: crimeTypesError } = await supabase
          .from('pnp_unit_crime_types')
          .insert(crimeTypeInserts)

        if (crimeTypesError) {
          // If crime types fail, clean up the unit record
          await supabase.from('pnp_units').delete().eq('id', unit.id)
          throw new Error(`Failed to add crime types: ${crimeTypesError.message}`)
        }
      }

      console.log(`✅ PNP Unit created successfully with code: ${unitData.unit_code}`)
      return unit.id
    } catch (error: any) {
      console.error('Error creating PNP unit:', error)
      throw new Error(`Failed to create PNP unit: ${error.message}`)
    }
  }

  /**
   * Update a PNP unit
   */
  static async updatePNPUnit(unitId: string, unitData: Partial<CreatePNPUnitPayload>) {
    try {
      if (!this.currentUserId) {
        throw new Error('User not authenticated')
      }

      // Prepare update data without crime types
      const { primary_crime_types, ...updateData } = unitData

      // Update the unit
      const { error: unitError } = await supabase
        .from('pnp_units')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', unitId)

      if (unitError) {
        // Check if it's a unique constraint violation for unit_code
        if (unitError.code === '23505' && unitError.message.includes('unit_code')) {
          throw new Error(`Unit code already exists. Please use a different unit code.`)
        }
        throw new Error(`Failed to update PNP unit: ${unitError.message}`)
      }

      // If crime types are provided, update them
      if (primary_crime_types !== undefined) {
        // First delete existing crime types
        const { error: deleteError } = await supabase
          .from('pnp_unit_crime_types')
          .delete()
          .eq('unit_id', unitId)

        if (deleteError) {
          throw new Error(`Failed to update crime types: ${deleteError.message}`)
        }

        // Then insert new crime types
        if (primary_crime_types.length > 0) {
          const crimeTypeInserts = primary_crime_types.map(crimeType => ({
            unit_id: unitId,
            crime_type: crimeType
          }))

          const { error: crimeTypesError } = await supabase
            .from('pnp_unit_crime_types')
            .insert(crimeTypeInserts)

          if (crimeTypesError) {
            throw new Error(`Failed to update crime types: ${crimeTypesError.message}`)
          }
        }
      }

      return true
    } catch (error: any) {
      console.error('Error updating PNP unit:', error)
      throw new Error(`Failed to update PNP unit: ${error.message}`)
    }
  }

  /**
   * Change a PNP unit's status
   */
  static async changeUnitStatus(unitId: string, status: 'active' | 'inactive' | 'disbanded') {
    try {
      if (!this.currentUserId) {
        throw new Error('User not authenticated')
      }

      const { error } = await supabase
        .from('pnp_units')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', unitId)

      if (error) {
        throw new Error(`Failed to change unit status: ${error.message}`)
      }

      return true
    } catch (error: any) {
      console.error('Error changing unit status:', error)
      throw new Error(`Failed to change unit status: ${error.message}`)
    }
  }

  /**
   * Get officers assigned to a unit with enhanced availability data
   */
  static async getUnitOfficers(unitId: string, includeAvailabilityData: boolean = true) {
    try {
      let selectClause = '*'
      
      if (includeAvailabilityData) {
        selectClause = `
          *,
          availability_status,
          max_concurrent_cases,
          current_workload_percentage,
          specializations,
          skill_level,
          leave_start_date,
          leave_end_date,
          leave_type,
          leave_reason,
          last_login_at,
          last_case_assignment_at,
          last_status_update_at
        `
      }

      const { data, error } = await supabase
        .from('pnp_officer_profiles')
        .select(selectClause)
        .eq('unit_id', unitId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error getting unit officers:', error)
        return []
      }

      // Transform data to include computed availability metrics
      const enhancedOfficers = (data as unknown as PNPOfficerProfile[])?.map(officer => {
        const workloadPercentage = officer.current_workload_percentage || 0
        const isOnLeave = officer.leave_start_date && officer.leave_end_date && 
          new Date() >= new Date(officer.leave_start_date) && 
          new Date() <= new Date(officer.leave_end_date)
        
        return {
          ...officer,
          // Computed availability status based on workload and leave
          computedAvailabilityStatus: isOnLeave ? 'on_leave' : 
            workloadPercentage >= 100 ? 'overloaded' :
            workloadPercentage >= 80 ? 'busy' : 'available',
          isOnLeave,
          workloadStatus: workloadPercentage >= 100 ? 'overloaded' :
            workloadPercentage >= 80 ? 'busy' :
            workloadPercentage >= 50 ? 'moderate' : 'light',
          availableCapacity: Math.max(0, (officer.max_concurrent_cases || 10) - Math.floor((officer.max_concurrent_cases || 10) * workloadPercentage / 100))
        }
      }) || []

      return enhancedOfficers
    } catch (error) {
      console.error('Error getting unit officers:', error)
      return []
    }
  }

  /**
   * Get unit officers by availability status
   */
  static async getUnitOfficersByAvailability(
    unitId: string, 
    availabilityStatus?: 'available' | 'busy' | 'overloaded' | 'on_leave'
  ) {
    try {
      let query = supabase
        .from('pnp_officer_profiles')
        .select(`
          *,
          availability_status,
          max_concurrent_cases,
          current_workload_percentage,
          specializations,
          skill_level,
          leave_start_date,
          leave_end_date,
          leave_type
        `)
        .eq('unit_id', unitId)

      if (availabilityStatus) {
        query = query.eq('availability_status', availabilityStatus)
      }

      const { data, error } = await query
        .order('current_workload_percentage', { ascending: true })

      if (error) {
        console.error('Error getting officers by availability:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error getting officers by availability:', error)
      return []
    }
  }

  /**
   * Get unit availability statistics
   */
  static async getUnitAvailabilityStats(unitId: string) {
    try {
      const { data, error } = await supabase
        .from('pnp_officer_profiles')
        .select(`
          availability_status,
          current_workload_percentage,
          leave_start_date,
          leave_end_date,
          status
        `)
        .eq('unit_id', unitId)
        .eq('status', 'active') // Only count active officers

      if (error) {
        console.error('Error getting unit availability stats:', error)
        return {
          totalOfficers: 0,
          available: 0,
          busy: 0,
          overloaded: 0,
          onLeave: 0,
          averageWorkload: 0
        }
      }

      const officers = data || []
      const now = new Date()
      
      let available = 0
      let busy = 0
      let overloaded = 0
      let onLeave = 0
      let totalWorkload = 0

      officers.forEach(officer => {
        const workload = officer.current_workload_percentage || 0
        totalWorkload += workload
        
        // Check if on leave
        const isOnLeave = officer.leave_start_date && officer.leave_end_date &&
          now >= new Date(officer.leave_start_date) && 
          now <= new Date(officer.leave_end_date)
        
        if (isOnLeave) {
          onLeave++
        } else if (workload >= 100) {
          overloaded++
        } else if (workload >= 80) {
          busy++
        } else {
          available++
        }
      })

      return {
        totalOfficers: officers.length,
        available,
        busy,
        overloaded,
        onLeave,
        averageWorkload: officers.length > 0 ? Math.round(totalWorkload / officers.length) : 0
      }
    } catch (error) {
      console.error('Error getting unit availability stats:', error)
      return {
        totalOfficers: 0,
        available: 0,
        busy: 0,
        overloaded: 0,
        onLeave: 0,
        averageWorkload: 0
      }
    }
  }

  /**
   * Find available officers for case assignment
   */
  static async findAvailableOfficersForCase(
    unitId: string,
    requiredSpecializations?: string[],
    maxWorkloadThreshold: number = 80
  ) {
    try {
      const { data, error } = await supabase
        .from('pnp_officer_profiles')
        .select(`
          *,
          availability_status,
          max_concurrent_cases,
          current_workload_percentage,
          specializations,
          skill_level,
          leave_start_date,
          leave_end_date
        `)
        .eq('unit_id', unitId)
        .eq('status', 'active')
        .lte('current_workload_percentage', maxWorkloadThreshold)

      if (error) {
        console.error('Error finding available officers:', error)
        return []
      }

      const officers = data || []
      const now = new Date()
      
      // Filter officers based on availability criteria
      const availableOfficers = officers.filter(officer => {
        // Check if not on leave
        const isOnLeave = officer.leave_start_date && officer.leave_end_date &&
          now >= new Date(officer.leave_start_date) && 
          now <= new Date(officer.leave_end_date)
        
        if (isOnLeave) return false
        
        // Check availability status
        if (officer.availability_status === 'on_leave' || officer.availability_status === 'overloaded') {
          return false
        }
        
        // Check specializations if required
        if (requiredSpecializations && requiredSpecializations.length > 0) {
          const officerSpecs = officer.specializations || []
          const hasRequiredSpec = requiredSpecializations.some(spec => 
            officerSpecs.includes(spec)
          )
          if (!hasRequiredSpec) return false
        }
        
        return true
      })

      // Sort by workload (lowest first) and skill level
      const sortedOfficers = availableOfficers.sort((a, b) => {
        // Primary sort: workload percentage (ascending)
        const workloadDiff = (a.current_workload_percentage || 0) - (b.current_workload_percentage || 0)
        if (workloadDiff !== 0) return workloadDiff
        
        // Secondary sort: skill level (expert > advanced > intermediate > beginner)
        const skillOrder = { expert: 4, advanced: 3, intermediate: 2, beginner: 1 }
        const aSkill = skillOrder[a.skill_level as keyof typeof skillOrder] || 2
        const bSkill = skillOrder[b.skill_level as keyof typeof skillOrder] || 2
        return bSkill - aSkill
      })

      return sortedOfficers.map(officer => ({
        ...officer,
        availableCapacity: Math.max(0, (officer.max_concurrent_cases || 10) - 
          Math.floor((officer.max_concurrent_cases || 10) * (officer.current_workload_percentage || 0) / 100)),
        matchingSpecializations: requiredSpecializations ? 
          (officer.specializations || []).filter((spec: string) => requiredSpecializations.includes(spec)) : []
      }))
    } catch (error) {
      console.error('Error finding available officers for case:', error)
      return []
    }
  }

  /**
   * Get cases assigned to a unit
   */
  static async getUnitCases(unitId: string, status?: string) {
    try {
      let query = supabase
        .from('complaints')
        .select(`
          *,
          user_profiles(full_name, email, phone_number)
        `)
        .eq('unit_id', unitId)

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error getting unit cases:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error getting unit cases:', error)
      return []
    }
  }

  /**
   * Delete a PNP unit
   */
  static async deletePNPUnit(unitId: string) {
    try {
      if (!this.currentUserId) {
        throw new Error('User not authenticated')
      }

      // First, delete associated crime types
      const { error: crimeTypesError } = await supabase
        .from('pnp_unit_crime_types')
        .delete()
        .eq('unit_id', unitId)

      if (crimeTypesError) {
        throw new Error(`Failed to delete unit crime types: ${crimeTypesError.message}`)
      }

      // Then, delete the unit itself
      const { error: unitError } = await supabase
        .from('pnp_units')
        .delete()
        .eq('id', unitId)

      if (unitError) {
        throw new Error(`Failed to delete PNP unit: ${unitError.message}`)
      }

      return true
    } catch (error: any) {
      console.error('Error deleting PNP unit:', error)
      throw new Error(`Failed to delete PNP unit: ${error.message}`)
    }
  }

  /**
   * Update officer availability status
   */
  static async updateOfficerAvailability(
    officerId: string, 
    availabilityStatus: 'available' | 'busy' | 'overloaded' | 'on_leave',
    workloadPercentage?: number
  ) {
    try {
      if (!this.currentUserId) {
        throw new Error('User not authenticated')
      }

      const updateData: any = {
        availability_status: availabilityStatus,
        last_status_update_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      if (workloadPercentage !== undefined) {
        updateData.current_workload_percentage = Math.max(0, Math.min(100, workloadPercentage))
      }

      const { error } = await supabase
        .from('pnp_officer_profiles')
        .update(updateData)
        .eq('id', officerId)

      if (error) {
        throw new Error(`Failed to update officer availability: ${error.message}`)
      }

      console.log(`✅ Officer availability updated: ${availabilityStatus}${workloadPercentage !== undefined ? ` (${workloadPercentage}%)` : ''}`)
      return true
    } catch (error: any) {
      console.error('Error updating officer availability:', error)
      throw new Error(`Failed to update officer availability: ${error.message}`)
    }
  }

  /**
   * Bulk update multiple officers' availability
   */
  static async bulkUpdateOfficerAvailability(
    updates: Array<{
      officerId: string
      availabilityStatus: 'available' | 'busy' | 'overloaded' | 'on_leave'
      workloadPercentage?: number
    }>
  ) {
    try {
      if (!this.currentUserId) {
        throw new Error('User not authenticated')
      }

      const results = await Promise.allSettled(
        updates.map(update => 
          this.updateOfficerAvailability(
            update.officerId, 
            update.availabilityStatus, 
            update.workloadPercentage
          )
        )
      )

      const successful = results.filter(result => result.status === 'fulfilled').length
      const failed = results.filter(result => result.status === 'rejected').length

      console.log(`✅ Bulk availability update completed: ${successful} successful, ${failed} failed`)
      
      return {
        successful,
        failed,
        results
      }
    } catch (error: any) {
      console.error('Error in bulk officer availability update:', error)
      throw new Error(`Bulk update failed: ${error.message}`)
    }
  }
}

export default PNPUnitsService