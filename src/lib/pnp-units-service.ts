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

export class PNPUnitsService {
  // Get current user ID from Firebase
  static get currentUserId(): string | null {
    return auth.currentUser?.uid || null
  }

  // =============================================
  // PNP UNITS OPERATIONS
  // =============================================

  /**
   * Get all PNP units with optional filtering
   */
  static async getAllUnits({
    status,
    region,
    category,
    limit = 50,
    offset = 0
  }: {
    status?: string
    region?: string
    category?: string
    limit?: number
    offset?: number
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
      const unitsWithCrimeTypes = data?.map(unit => {
        // Extract crime types from the nested array
        const crimeTypes = unit.pnp_unit_crime_types?.map((ct: any) => ct.crime_type) || []
        
        // Remove the nested array and add as a flat property
        const { pnp_unit_crime_types, ...unitData } = unit
        
        return {
          ...unitData,
          crime_types: crimeTypes
        }
      }) || []

      return unitsWithCrimeTypes
    } catch (error) {
      console.error('Error getting PNP units:', error)
      return []
    }
  }

  /**
   * Get a PNP unit by ID
   */
  static async getUnitById(unitId: string) {
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
      
      return {
        ...unitData,
        crime_types: crimeTypes
      }
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
   * Get officers assigned to a unit
   */
  static async getUnitOfficers(unitId: string) {
    try {
      const { data, error } = await supabase
        .from('pnp_officer_profiles')
        .select('*')
        .eq('unit_id', unitId)

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
}

export default PNPUnitsService