// PNP Units Service - Real Supabase Database Implementation
// This service provides real database operations for PNP unit management

import { supabase } from './supabase'

// Define types for PNP unit related data (matching database schema)
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
  // Get current user ID (this would come from auth context in real implementation)
  static get currentUserId(): string | null {
    // In real implementation, this would get the current admin's Firebase UID
    // For now, return a placeholder that matches database
    return 'firebase_admin_001'
  }

  // =============================================
  // PNP UNITS OPERATIONS (REAL DATABASE)
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
      console.log('🔄 Fetching PNP units from database...')
      
      let query = supabase
        .from('pnp_units')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)
      
      // Apply filters if provided
      if (status) {
        query = query.eq('status', status)
      }
      
      if (region) {
        query = query.eq('region', region)
      }
      
      if (category) {
        query = query.eq('category', category)
      }
      
      const { data: units, error } = await query
      
      if (error) {
        console.error('❌ Database error fetching PNP units:', error)
        
        // If table doesn't exist, return empty array instead of throwing
        if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
          console.log('ℹ️ PNP units table not found - returning empty array')
          return []
        }
        
        throw error
      }
      
      if (!units || units.length === 0) {
        console.log('ℹ️ No PNP units found in database')
        return []
      }
      
      // Process units and add crime types
      const processedUnits: PNPUnit[] = await Promise.all(units.map(async (unit: any) => {
        // Get crime types for this unit (handle table not existing)
        let crimeTypes = null
        try {
          const { data, error } = await supabase
            .from('pnp_unit_crime_types')
            .select('crime_type')
            .eq('unit_id', unit.id)
          
          if (error && !error.message?.includes('does not exist')) {
            console.error('❌ Error fetching crime types for unit:', error)
          } else {
            crimeTypes = data
          }
        } catch (e) {
          console.log('ℹ️ Crime types table not available, continuing without crime types')
        }
        
        let availabilityStats = undefined
        
        if (includeAvailabilityStats) {
          // Get officer availability stats (handle table not existing)
          try {
            const { data: officers, error } = await supabase
              .from('pnp_officer_profiles')
              .select('availability_status')
              .eq('unit_id', unit.id)
              .eq('status', 'active')
            
            if (error && !error.message?.includes('does not exist')) {
              console.error('❌ Error fetching officers for unit:', error)
            } else if (officers) {
              availabilityStats = {
                totalOfficers: officers.length,
                available: officers.filter(o => o.availability_status === 'available').length,
                busy: officers.filter(o => o.availability_status === 'busy').length,
                overloaded: officers.filter(o => o.availability_status === 'overloaded').length,
                unavailable: officers.filter(o => o.availability_status === 'unavailable').length
              }
            }
          } catch (e) {
            console.log('ℹ️ Officer profiles table not available, continuing without availability stats')
          }
        }
        
        return {
          ...unit,
          crime_types: crimeTypes?.map(ct => ct.crime_type) || [],
          availabilityStats
        }
      }))
      
      console.log(`✅ Found ${processedUnits.length} PNP units from database`)
      return processedUnits
    } catch (error) {
      console.error('❌ Error fetching PNP units:', error)
      return []
    }
  }

  /**
   * Get a PNP unit by ID with optional availability statistics
   */
  static async getUnitById(unitId: string, includeAvailabilityStats: boolean = false) {
    try {
      console.log('🔄 Fetching PNP unit by ID from database:', unitId)
      
      const { data: unit, error } = await supabase
        .from('pnp_units')
        .select('*')
        .eq('id', unitId)
        .single()
      
      if (error) {
        console.error('❌ Database error fetching PNP unit:', error)
        throw error
      }
      
      if (!unit) {
        console.log('ℹ️ PNP unit not found:', unitId)
        return null
      }
      
      // Get crime types for this unit
      const { data: crimeTypes } = await supabase
        .from('pnp_unit_crime_types')
        .select('crime_type')
        .eq('unit_id', unit.id)
      
      let availabilityStats = undefined
      
      if (includeAvailabilityStats) {
        // Get officer availability stats
        const { data: officers } = await supabase
          .from('pnp_officer_profiles')
          .select('availability_status')
          .eq('unit_id', unit.id)
          .eq('status', 'active')
        
        if (officers) {
          availabilityStats = {
            totalOfficers: officers.length,
            available: officers.filter(o => o.availability_status === 'available').length,
            busy: officers.filter(o => o.availability_status === 'busy').length,
            overloaded: officers.filter(o => o.availability_status === 'overloaded').length,
            unavailable: officers.filter(o => o.availability_status === 'unavailable').length
          }
        }
      }
      
      console.log('✅ Found PNP unit from database')
      return {
        ...unit,
        crime_types: crimeTypes?.map(ct => ct.crime_type) || [],
        availabilityStats
      }
    } catch (error) {
      console.error('❌ Error fetching PNP unit:', error)
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
        .ilike('unit_code', unitCode)
        .limit(1)
      
      if (error) {
        console.error('❌ Database error checking unit code:', error)
        return false
      }
      
      const exists = data && data.length > 0
      console.log(`✅ Unit code ${unitCode} exists:`, exists)
      return exists
    } catch (error) {
      console.error('❌ Unit code check failed:', error)
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
      console.log('🔄 Creating new PNP unit in database...')
      
      // Check if unit code already exists
      const codeExists = await this.checkUnitCodeExists(unitData.unit_code)
      if (codeExists) {
        throw new Error(`Unit code '${unitData.unit_code}' already exists. Please use a different code or generate a new one.`)
      }
      
      // Create the unit
      const { data: unit, error: unitError } = await supabase
        .from('pnp_units')
        .insert({
          unit_name: unitData.unit_name,
          unit_code: unitData.unit_code,
          category: unitData.category,
          description: unitData.description,
          region: unitData.region,
          max_officers: unitData.max_officers,
          created_by: this.currentUserId
        })
        .select()
        .single()
      
      if (unitError) {
        console.error('❌ Database error creating PNP unit:', unitError)
        throw unitError
      }
      
      if (!unit) {
        throw new Error('Failed to create unit - no data returned')
      }
      
      // Create crime type associations
      if (unitData.primary_crime_types && unitData.primary_crime_types.length > 0) {
        const crimeTypeInserts = unitData.primary_crime_types.map(crimeType => ({
          unit_id: unit.id,
          crime_type: crimeType
        }))
        
        const { error: crimeTypeError } = await supabase
          .from('pnp_unit_crime_types')
          .insert(crimeTypeInserts)
        
        if (crimeTypeError) {
          console.error('❌ Database error creating crime type associations:', crimeTypeError)
          // Note: Unit was already created, so we don't throw here to avoid partial state
          console.log('⚠️ Unit created but some crime type associations failed')
        }
      }
      
      console.log(`✅ PNP Unit created successfully with ID: ${unit.id}`)
      return unit.id
    } catch (error: any) {
      console.error('❌ Error creating PNP unit:', error)
      throw new Error(`Failed to create PNP unit: ${error.message}`)
    }
  }

  /**
   * Update a PNP unit
   */
  static async updatePNPUnit(unitId: string, unitData: Partial<CreatePNPUnitPayload>) {
    try {
      console.log('🔄 Updating PNP unit in database...', unitId)
      
      // Extract crime types from unitData
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
        console.error('❌ Database error updating PNP unit:', unitError)
        throw unitError
      }
      
      // Update crime types if provided
      if (primary_crime_types) {
        // Delete existing crime type associations
        await supabase
          .from('pnp_unit_crime_types')
          .delete()
          .eq('unit_id', unitId)
        
        // Insert new crime type associations
        if (primary_crime_types.length > 0) {
          const crimeTypeInserts = primary_crime_types.map(crimeType => ({
            unit_id: unitId,
            crime_type: crimeType
          }))
          
          const { error: crimeTypeError } = await supabase
            .from('pnp_unit_crime_types')
            .insert(crimeTypeInserts)
          
          if (crimeTypeError) {
            console.error('❌ Database error updating crime type associations:', crimeTypeError)
            throw crimeTypeError
          }
        }
      }
      
      console.log(`✅ PNP Unit ${unitId} updated successfully`)
      return true
    } catch (error: any) {
      console.error('❌ Error updating PNP unit:', error)
      throw new Error(`Failed to update PNP unit: ${error.message}`)
    }
  }

  /**
   * Change a PNP unit's status
   */
  static async changeUnitStatus(unitId: string, status: 'active' | 'inactive' | 'disbanded') {
    try {
      console.log('🔄 Changing unit status in database...', unitId, status)
      
      const { error } = await supabase
        .from('pnp_units')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', unitId)
      
      if (error) {
        console.error('❌ Database error changing unit status:', error)
        throw error
      }
      
      console.log(`✅ Unit ${unitId} status changed to: ${status}`)
      return true
    } catch (error: any) {
      console.error('❌ Error changing unit status:', error)
      throw new Error(`Failed to change unit status: ${error.message}`)
    }
  }

  /**
   * Get officers assigned to a unit
   */
  static async getUnitOfficers(unitId: string) {
    try {
      console.log('🔄 Fetching unit officers from database...', unitId)
      
      const { data: officers, error } = await supabase
        .from('pnp_officer_profiles')
        .select('*')
        .eq('unit_id', unitId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('❌ Database error fetching unit officers:', error)
        
        // If table doesn't exist, return empty array instead of throwing
        if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
          console.log('ℹ️ Officer profiles table not found - returning empty array')
          return []
        }
        
        // For other errors, still return empty array to prevent crashes
        console.error('❌ Returning empty array due to error:', error.message)
        return []
      }
      
      console.log(`✅ Found ${officers?.length || 0} officers for unit ${unitId}`)
      
      // Debug: Log the first officer to see the structure
      if (officers && officers.length > 0) {
        console.log('📝 Sample officer data:', {
          id: officers[0].id,
          full_name: officers[0].full_name,
          badge_number: officers[0].badge_number,
          unit_id: officers[0].unit_id,
          status: officers[0].status
        })
      }
      
      return officers || []
    } catch (error) {
      console.error('❌ Error fetching unit officers:', error)
      return []
    }
  }

  /**
   * Get unit officers by availability status
   */
  static async getUnitOfficersByAvailability(
    unitId: string, 
    availabilityStatus?: 'available' | 'busy' | 'overloaded' | 'unavailable'
  ) {
    try {
      console.log('🔄 Fetching officers by availability from database...', unitId, availabilityStatus)
      
      let query = supabase
        .from('pnp_officer_profiles')
        .select('*')
        .eq('unit_id', unitId)
        .eq('status', 'active')
      
      if (availabilityStatus) {
        query = query.eq('availability_status', availabilityStatus)
      }
      
      const { data: officers, error } = await query.order('created_at', { ascending: false })
      
      if (error) {
        console.error('❌ Database error fetching officers by availability:', error)
        throw error
      }
      
      console.log(`✅ Found ${officers?.length || 0} officers with availability: ${availabilityStatus || 'all'}`)
      return officers || []
    } catch (error) {
      console.error('❌ Error fetching officers by availability:', error)
      return []
    }
  }

  /**
   * Get unit availability statistics
   */
  static async getUnitAvailabilityStats(unitId: string): Promise<UnitAvailabilityStats> {
    try {
      console.log('🔄 Fetching unit availability stats from database...', unitId)
      
      const { data: officers, error } = await supabase
        .from('pnp_officer_profiles')
        .select('availability_status')
        .eq('unit_id', unitId)
        .eq('status', 'active')
      
      if (error) {
        console.error('❌ Database error fetching availability stats:', error)
        throw error
      }
      
      const stats = {
        totalOfficers: officers?.length || 0,
        available: officers?.filter(o => o.availability_status === 'available').length || 0,
        busy: officers?.filter(o => o.availability_status === 'busy').length || 0,
        overloaded: officers?.filter(o => o.availability_status === 'overloaded').length || 0,
        unavailable: officers?.filter(o => o.availability_status === 'unavailable').length || 0
      }
      
      console.log('✅ Unit availability stats from database:', stats)
      return stats
    } catch (error) {
      console.error('❌ Error fetching unit availability stats:', error)
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
   * Find available officers for case assignment
   */
  static async findAvailableOfficersForCase(unitId: string) {
    try {
      console.log('🔄 Finding available officers for case assignment...', unitId)
      
      const { data: officers, error } = await supabase
        .from('pnp_officer_profiles')
        .select('*')
        .eq('unit_id', unitId)
        .eq('status', 'active')
        .in('availability_status', ['available', 'busy'])
        .order('active_cases', { ascending: true }) // Sort by lowest active cases first
      
      if (error) {
        console.error('❌ Database error finding available officers:', error)
        throw error
      }
      
      console.log(`✅ Found ${officers?.length || 0} available officers for case assignment`)
      return officers || []
    } catch (error) {
      console.error('❌ Error finding available officers for case:', error)
      return []
    }
  }

  /**
   * Get cases assigned to a unit
   */
  static async getUnitCases(unitId: string, status?: string) {
    try {
      console.log('🔄 Fetching unit cases from database...', unitId, status)
      
      let query = supabase
        .from('complaints')
        .select(`
          *,
          user_profiles!inner(full_name, email, phone_number)
        `)
        .eq('unit_id', unitId)
        .order('created_at', { ascending: false })
      
      // Filter by status if provided
      if (status) {
        query = query.eq('status', status)
      }
      
      const { data: cases, error } = await query
      
      if (error) {
        console.error('❌ Database error fetching unit cases:', error)
        throw error
      }
      
      console.log(`✅ Found ${cases?.length || 0} cases for unit ${unitId}`)
      return cases || []
    } catch (error) {
      console.error('❌ Error fetching unit cases:', error)
      return []
    }
  }

  /**
   * Delete a PNP unit
   */
  static async deletePNPUnit(unitId: string) {
    try {
      console.log('🔄 Deleting PNP unit from database...', unitId)
      
      // Check if unit has active officers
      const { data: officers, error: officerError } = await supabase
        .from('pnp_officer_profiles')
        .select('id')
        .eq('unit_id', unitId)
        .eq('status', 'active')
      
      if (officerError) {
        console.error('❌ Database error checking unit officers:', officerError)
        throw officerError
      }
      
      if (officers && officers.length > 0) {
        throw new Error(`Cannot delete unit: ${officers.length} active officers are still assigned to this unit. Please reassign them first.`)
      }
      
      // Delete crime type associations first (due to foreign key constraints)
      const { error: crimeTypeError } = await supabase
        .from('pnp_unit_crime_types')
        .delete()
        .eq('unit_id', unitId)
      
      if (crimeTypeError) {
        console.error('❌ Database error deleting crime type associations:', crimeTypeError)
        throw crimeTypeError
      }
      
      // Delete the unit
      const { error: unitError } = await supabase
        .from('pnp_units')
        .delete()
        .eq('id', unitId)
      
      if (unitError) {
        console.error('❌ Database error deleting PNP unit:', unitError)
        throw unitError
      }
      
      console.log(`✅ PNP Unit ${unitId} deleted successfully`)
      return true
    } catch (error: any) {
      console.error('❌ Error deleting PNP unit:', error)
      throw new Error(`Failed to delete PNP unit: ${error.message}`)
    }
  }

  /**
   * Update officer availability status
   */
  static async updateOfficerAvailability(
    officerId: string, 
    availabilityStatus: 'available' | 'busy' | 'overloaded' | 'unavailable'
  ) {
    try {
      console.log('🔄 Updating officer availability in database...', officerId, availabilityStatus)
      
      const { error } = await supabase
        .from('pnp_officer_profiles')
        .update({ 
          availability_status: availabilityStatus,
          last_status_update_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', officerId)
      
      if (error) {
        console.error('❌ Database error updating officer availability:', error)
        throw error
      }
      
      console.log(`✅ Officer ${officerId} availability updated to: ${availabilityStatus}`)
      return true
    } catch (error: any) {
      console.error('❌ Error updating officer availability:', error)
      throw new Error(`Failed to update officer availability: ${error.message}`)
    }
  }

  /**
   * Bulk update multiple officers' availability
   */
  static async bulkUpdateOfficerAvailability(
    updates: Array<{
      officerId: string
      availabilityStatus: 'available' | 'busy' | 'overloaded' | 'unavailable'
    }>
  ) {
    try {
      console.log('🔄 Bulk updating officer availability in database...', updates.length)
      
      const updatePromises = updates.map(update => 
        this.updateOfficerAvailability(update.officerId, update.availabilityStatus)
      )
      
      const results = await Promise.allSettled(updatePromises)
      
      const successful = results.filter(r => r.status === 'fulfilled').length
      const failed = results.filter(r => r.status === 'rejected').length
      
      console.log(`✅ Bulk availability update completed: ${successful} successful, ${failed} failed`)
      
      return {
        successful,
        failed,
        results
      }
    } catch (error: any) {
      console.error('❌ Error in bulk officer availability update:', error)
      throw new Error(`Bulk update failed: ${error.message}`)
    }
  }

  /**
   * Manually refresh unit officer counts and statistics
   * Since the database has triggers that handle this automatically, 
   * this is just a placeholder that returns success
   */
  static async refreshUnitStatistics(unitId?: string) {
    try {
      console.log('ℹ️ Unit statistics are managed automatically by database triggers')
      
      // The database schema has triggers that automatically update unit statistics
      // when officers are added, removed, or their status changes
      // So we don't need to manually refresh anything
      
      if (unitId) {
        console.log(`✅ Unit ${unitId} statistics are up to date (managed by triggers)`)
      } else {
        console.log('✅ All unit statistics are up to date (managed by triggers)')
      }
      
      return true
    } catch (error: any) {
      console.error('❌ Error in refresh unit statistics:', error)
      // Even if there's an error, return true since statistics are managed by triggers
      return true
    }
  }
}

export default PNPUnitsService