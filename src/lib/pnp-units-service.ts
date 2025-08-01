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
    unavailable: number
  }
}

export interface PNPOfficerProfile {
  id: string
  firebase_uid: string
  email: string
  full_name: string
  phone_number?: string | null
  badge_number: string
  rank: string
  unit_id: string | null
  region: string
  status: 'active' | 'on_leave' | 'suspended' | 'retired'
  availability_status?: 'available' | 'busy' | 'overloaded' | 'unavailable'
  total_cases: number
  active_cases: number
  resolved_cases: number
  success_rate: number
  last_login_at?: string | null
  last_case_assignment_at?: string | null
  last_status_update_at?: string | null
  created_at: string
  updated_at: string
}

export interface UnitAvailabilityStats {
  totalOfficers: number
  available: number
  busy: number
  overloaded: number
  unavailable: number
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
  availabilityStatus: 'available' | 'busy' | 'overloaded' | 'unavailable'
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
   * Get officers assigned to a unit (simplified for basic availability)
   */
  static async getUnitOfficers(unitId: string) {
    try {
      const { data, error } = await supabase
        .from('pnp_officer_profiles')
        .select(`
          id,
          firebase_uid,
          email,
          full_name,
          phone_number,
          badge_number,
          rank,
          unit_id,
          region,
          status,
          availability_status,
          total_cases,
          active_cases,
          resolved_cases,
          success_rate,
          created_at,
          updated_at
        `)
        .eq('unit_id', unitId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error getting unit officers:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error getting unit officers:', error)
      return []
    }
  }

  /**
   * Get unit officers by availability status (simplified)
   */
  static async getUnitOfficersByAvailability(
    unitId: string, 
    availabilityStatus?: 'available' | 'busy' | 'overloaded' | 'unavailable'
  ) {
    try {
      let query = supabase
        .from('pnp_officer_profiles')
        .select(`
          id,
          firebase_uid,
          email,
          full_name,
          phone_number,
          badge_number,
          rank,
          unit_id,
          region,
          status,
          availability_status,
          active_cases,
          created_at,
          updated_at
        `)
        .eq('unit_id', unitId)
        .eq('status', 'active')

      if (availabilityStatus) {
        query = query.eq('availability_status', availabilityStatus)
      }

      const { data, error } = await query
        .order('active_cases', { ascending: true })

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
   * Get unit availability statistics (simplified)
   */
  static async getUnitAvailabilityStats(unitId: string) {
    try {
      const { data, error } = await supabase
        .from('pnp_officer_profiles')
        .select(`
          availability_status,
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
          unavailable: 0
        }
      }

      const officers = data || []
      
      let available = 0
      let busy = 0
      let overloaded = 0
      let unavailable = 0

      officers.forEach(officer => {
        const status = officer.availability_status || 'available'
        
        switch (status) {
          case 'available':
            available++
            break
          case 'busy':
            busy++
            break
          case 'overloaded':
            overloaded++
            break
          case 'unavailable':
            unavailable++
            break
          default:
            available++
        }
      })

      return {
        totalOfficers: officers.length,
        available,
        busy,
        overloaded,
        unavailable
      }
    } catch (error) {
      console.error('Error getting unit availability stats:', error)
      return {
        totalOfficers: 0,
        available: 0,
        busy: 0,
        overloaded: 0,
        unavailable: 0
      }
    }
  }

  /**
   * Find available officers for case assignment (simplified)
   */
  static async findAvailableOfficersForCase(unitId: string) {
    try {
      const { data, error } = await supabase
        .from('pnp_officer_profiles')
        .select(`
          id,
          firebase_uid,
          email,
          full_name,
          phone_number,
          badge_number,
          rank,
          unit_id,
          region,
          status,
          availability_status,
          active_cases,
          total_cases,
          resolved_cases,
          success_rate,
          created_at,
          updated_at
        `)
        .eq('unit_id', unitId)
        .eq('status', 'active')
        .in('availability_status', ['available', 'busy']) // Only available and busy officers

      if (error) {
        console.error('Error finding available officers:', error)
        return []
      }

      const officers = data || []
      
      // Sort by active cases (ascending) - least busy first
      const sortedOfficers = officers.sort((a, b) => {
        return (a.active_cases || 0) - (b.active_cases || 0)
      })

      return sortedOfficers
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
   * Update officer availability status (simplified)
   */
  static async updateOfficerAvailability(
    officerId: string, 
    availabilityStatus: 'available' | 'busy' | 'overloaded' | 'unavailable'
  ) {
    try {
      if (!this.currentUserId) {
        throw new Error('User not authenticated')
      }

      const updateData = {
        availability_status: availabilityStatus,
        last_status_update_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('pnp_officer_profiles')
        .update(updateData)
        .eq('id', officerId)

      if (error) {
        throw new Error(`Failed to update officer availability: ${error.message}`)
      }

      console.log(`✅ Officer availability updated: ${availabilityStatus}`)
      return true
    } catch (error: any) {
      console.error('Error updating officer availability:', error)
      throw new Error(`Failed to update officer availability: ${error.message}`)
    }
  }

  /**
   * Bulk update multiple officers' availability (simplified)
   */
  static async bulkUpdateOfficerAvailability(
    updates: Array<{
      officerId: string
      availabilityStatus: 'available' | 'busy' | 'overloaded' | 'unavailable'
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
            update.availabilityStatus
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

  /**
   * Manually refresh unit officer counts and statistics (fix for missing triggers)
   */
  static async refreshUnitStatistics(unitId?: string) {
    try {
      if (!this.currentUserId) {
        throw new Error('User not authenticated')
      }

      let unitsToUpdate: string[] = []

      if (unitId) {
        // Update specific unit
        unitsToUpdate = [unitId]
      } else {
        // Update all units
        const { data: units, error: unitsError } = await supabase
          .from('pnp_units')
          .select('id')

        if (unitsError) {
          throw new Error(`Failed to fetch units: ${unitsError.message}`)
        }

        unitsToUpdate = units?.map(unit => unit.id) || []
      }

      console.log(`🔄 Refreshing statistics for ${unitsToUpdate.length} units...`)

      for (const id of unitsToUpdate) {
        // Count active officers in this unit
        const { data: officers, error: officersError } = await supabase
          .from('pnp_officer_profiles')
          .select('id, active_cases, resolved_cases')
          .eq('unit_id', id)
          .eq('status', 'active')

        if (officersError) {
          console.error(`Error counting officers for unit ${id}:`, officersError)
          continue
        }

        const officerCount = officers?.length || 0
        const totalActiveCases = officers?.reduce((sum, officer) => sum + (officer.active_cases || 0), 0) || 0
        const totalResolvedCases = officers?.reduce((sum, officer) => sum + (officer.resolved_cases || 0), 0) || 0
        const totalCases = totalActiveCases + totalResolvedCases
        const successRate = totalCases > 0 ? Math.round((totalResolvedCases / totalCases) * 100) : 0

        // Update unit statistics
        const { error: updateError } = await supabase
          .from('pnp_units')
          .update({
            current_officers: officerCount,
            active_cases: totalActiveCases,
            resolved_cases: totalResolvedCases,
            success_rate: successRate,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)

        if (updateError) {
          console.error(`Error updating unit ${id} statistics:`, updateError)
        } else {
          console.log(`✅ Updated unit ${id}: ${officerCount} officers, ${totalActiveCases} active cases, ${successRate}% success rate`)
        }
      }

      return true
    } catch (error: any) {
      console.error('Error refreshing unit statistics:', error)
      throw new Error(`Failed to refresh unit statistics: ${error.message}`)
    }
  }
}

export default PNPUnitsService