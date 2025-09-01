// Officer Assignment Service - Admin functionality for assigning officers to cases
// This service provides operations for admins to manage case assignments

import { supabase } from './supabase'
import CrimeTypeMapper from './crime-type-mapping'

export interface AvailableOfficer {
  officer_id: string
  officer_name: string
  badge_number: string
  rank: string
  unit_name: string
  active_cases: number
  total_cases: number
  availability_status: 'available' | 'busy' | 'overloaded' | 'unavailable'
  last_assignment: string | null
  workload_level: 'low' | 'medium' | 'high' | 'overloaded'
}

export interface AssignmentResult {
  success: boolean
  assignment_id?: string
  officer_name?: string
  message?: string
  error?: string
}

export interface CaseAssignment {
  id: string
  complaint_id: string
  officer_id: string
  admin_id: string
  assigned_by: 'Admin' | 'System' | 'Legacy_User_Selection'
  assignment_type: 'primary' | 'reassignment' | 'temporary'
  status: 'active' | 'reassigned' | 'completed'
  notes: string | null
  created_at: string
  updated_at: string
}

class OfficerAssignmentService {
  /**
   * Get available officers for assignment based on unit or crime type
   */
  async getAvailableOfficersForAssignment(
    unitId?: string, 
    crimeType?: string
  ): Promise<AvailableOfficer[]> {
    try {
      console.log('🔍 [DEBUG] Fetching available officers via API route...')
      console.log('🔍 [DEBUG] Input parameters:', { unitId, crimeType })
      
      // Translate crime type from Flutter enum to database display name
      let translatedCrimeType = crimeType
      if (crimeType && crimeType.trim() !== '') {
        const normalizedCrimeType = CrimeTypeMapper.normalizeForDatabase(crimeType.trim())
        if (normalizedCrimeType) {
          translatedCrimeType = normalizedCrimeType
          console.log('🔄 [DEBUG] Crime type translated:', {
            original: crimeType,
            translated: translatedCrimeType
          })
        } else {
          console.warn('⚠️ [DEBUG] Crime type not found in mapping:', crimeType)
          // Try potential matches for debugging
          const potentialMatches = CrimeTypeMapper.findPotentialMatches(crimeType)
          if (potentialMatches.length > 0) {
            console.log('🔍 [DEBUG] Potential matches found:', potentialMatches.map(m => ({
              enum: m.enumName,
              display: m.displayName
            })))
          }
        }
      }
      
      // Build API URL with query parameters
      const params = new URLSearchParams()
      if (unitId && unitId.trim() !== '') {
        params.append('unitId', unitId.trim())
      }
      if (translatedCrimeType && translatedCrimeType.trim() !== '') {
        params.append('crimeType', translatedCrimeType.trim())
      }
      
      const apiUrl = `/api/officers/available${params.toString() ? `?${params.toString()}` : ''}`
      console.log('🔍 [DEBUG] API URL:', apiUrl)
      
      const response = await fetch(apiUrl)
      const responseData = await response.json()
      
      console.log('🔍 [DEBUG] API response:', { 
        status: response.status, 
        ok: response.ok, 
        data: responseData 
      })
      
      if (!response.ok) {
        console.error('❌ [DEBUG] API error response:', responseData)
        
        // Try fallback direct query with translated crime type
        console.log('🔄 [DEBUG] Attempting fallback direct query...')
        return await this.getAvailableOfficersFallback(unitId, translatedCrimeType)
      }
      
      const officers = responseData.officers || []
      console.log(`✅ [DEBUG] Successfully fetched ${officers.length} officers via API`)
      
      return officers.map((officer: any) => ({
        officer_id: officer.officer_id,
        officer_name: officer.officer_name,
        badge_number: officer.badge_number,
        rank: officer.rank,
        unit_name: officer.unit_name,
        active_cases: Number(officer.active_cases) || 0,
        total_cases: Number(officer.total_cases) || 0,
        availability_status: officer.availability_status || 'available',
        last_assignment: officer.last_assignment,
        workload_level: officer.workload_level || 'low'
      }))
      
    } catch (error: any) {
      console.error('❌ [DEBUG] Exception in getAvailableOfficersForAssignment:', {
        message: error?.message,
        name: error?.name,
        stack: error?.stack,
        fullError: error
      })
      
      // Try fallback query as last resort with translated crime type
      try {
        console.log('🔄 [DEBUG] Attempting fallback query after exception...')
        return await this.getAvailableOfficersFallback(unitId, translatedCrimeType)
      } catch (fallbackError: any) {
        console.error('❌ [DEBUG] Fallback query also failed:', fallbackError)
        throw new Error(`Failed to fetch officers: ${error?.message || 'Unknown error'}. Fallback also failed: ${fallbackError?.message || 'Unknown error'}`)
      }
    }
  }

  /**
   * Fallback method to get available officers using direct SQL query
   */
  private async getAvailableOfficersFallback(
    unitId?: string | null, 
    crimeType?: string | null
  ): Promise<AvailableOfficer[]> {
    try {
      console.log('🔄 [DEBUG] Executing fallback direct query...', { unitId, crimeType })
      
      let query = supabase
        .from('pnp_officer_profiles')
        .select(`
          id,
          full_name,
          badge_number,
          rank,
          active_cases,
          total_cases,
          availability_status,
          last_case_assignment_at,
          pnp_units!inner (
            id,
            unit_name,
            category
          )
        `)
        .eq('status', 'active')
      
      // Apply filters if provided
      if (unitId) {
        console.log('🔍 [DEBUG] Filtering by unit ID:', unitId)
        query = query.eq('unit_id', unitId)
      }
      
      if (crimeType) {
        console.log('🔍 [DEBUG] Filtering by crime type (should be translated):', crimeType)
        
        // First try to get the category for this crime type
        const category = CrimeTypeMapper.getCategory(crimeType)
        if (category) {
          console.log('🔍 [DEBUG] Using category filter:', category)
          query = query.eq('pnp_units.category', category)
        } else {
          // Fallback to direct crime type matching in the junction table
          console.log('🔍 [DEBUG] Using direct crime type matching via junction table')
          
          // Get unit IDs that handle this crime type
          const { data: crimeTypeUnits, error: crimeTypeError } = await supabase
            .from('pnp_unit_crime_types')
            .select('unit_id')
            .eq('crime_type', crimeType)
          
          if (!crimeTypeError && crimeTypeUnits && crimeTypeUnits.length > 0) {
            const unitIds = crimeTypeUnits.map(unit => unit.unit_id)
            console.log('🔍 [DEBUG] Found unit IDs for crime type:', unitIds)
            query = query.in('unit_id', unitIds)
          } else {
            console.warn('⚠️ [DEBUG] No units found for crime type:', crimeType)
            // Try category-based matching as final fallback
            const potentialMatches = CrimeTypeMapper.findPotentialMatches(crimeType)
            if (potentialMatches.length > 0) {
              const categories = [...new Set(potentialMatches.map(m => m.category))]
              console.log('🔍 [DEBUG] Trying categories from potential matches:', categories)
              query = query.in('pnp_units.category', categories)
            }
          }
        }
      }
      
      const { data, error } = await query.order('full_name')
      
      if (error) {
        console.error('❌ [DEBUG] Fallback query error:', error)
        throw error
      }
      
      console.log('✅ [DEBUG] Fallback query successful, found:', data?.length || 0)
      
      return (data || []).map((officer: any) => {
        const activeCases = Number(officer.active_cases) || 0
        const totalCases = Number(officer.total_cases) || 0
        const availabilityStatus = officer.availability_status || 'available'
        
        // Calculate workload level based on active cases
        const workloadLevel = 
          activeCases >= 15 ? 'overloaded' :
          activeCases >= 10 ? 'high' :
          activeCases >= 5 ? 'medium' : 'low'
        
        return {
          officer_id: officer.id,
          officer_name: officer.full_name,
          badge_number: officer.badge_number,
          rank: officer.rank,
          unit_name: officer.pnp_units?.unit_name || 'Unknown Unit',
          active_cases: activeCases,
          total_cases: totalCases,
          availability_status: availabilityStatus as 'available' | 'busy' | 'overloaded' | 'unavailable',
          last_assignment: officer.last_case_assignment_at,
          workload_level: workloadLevel as 'low' | 'medium' | 'high' | 'overloaded'
        }
      })
      
    } catch (error: any) {
      console.error('❌ [DEBUG] Fallback query failed:', error)
      throw error
    }
  }

  /**
   * Assign an officer to an unassigned case using API route
   * Goes directly to 'Under Investigation' when officer is assigned
   */
  async assignOfficerToCase(
    complaintId: string,
    officerId: string,
    adminId: string,
    notes?: string
  ): Promise<AssignmentResult> {
    try {
      console.log('👮 [DEBUG] Assigning officer to case via API route...', {
        complaintId,
        officerId,
        adminId,
        notes
      })
      
      // Get officer information to resolve UUID if needed
      let officerData
      let officerError
      
      // First try to get by ID (UUID format)
      if (officerId.includes('-')) {
        const result = await supabase
          .from('pnp_officer_profiles')
          .select('id, full_name, badge_number, rank, firebase_uid')
          .eq('id', officerId)
          .single()
        officerData = result.data
        officerError = result.error
        
        // If not found by ID, try by firebase_uid
        if (officerError || !officerData) {
          const fallbackResult = await supabase
            .from('pnp_officer_profiles')
            .select('id, full_name, badge_number, rank, firebase_uid')
            .eq('firebase_uid', officerId)
            .single()
          officerData = fallbackResult.data
          officerError = fallbackResult.error
        }
      } else {
        // Try by firebase_uid first for non-UUID format
        const result = await supabase
          .from('pnp_officer_profiles')
          .select('id, full_name, badge_number, rank, firebase_uid')
          .eq('firebase_uid', officerId)
          .single()
        officerData = result.data
        officerError = result.error
      }
      
      if (officerError) {
        console.error('❌ [DEBUG] Error fetching officer:', officerError)
        return {
          success: false,
          error: 'Officer not found'
        }
      }
      
      console.log('✅ [DEBUG] Officer found:', {
        id: officerData.id,
        name: officerData.full_name,
        rank: officerData.rank
      })
      
      // Get admin UUID if needed
      let adminUuid = adminId
      
      // If adminId looks like Firebase UID, convert to admin profile UUID
      if (!adminId.includes('-')) {
        const { data: adminData, error: adminError } = await supabase
          .from('admin_profiles')
          .select('id')
          .eq('firebase_uid', adminId)
          .single()
        
        if (adminError || !adminData) {
          console.error('❌ [DEBUG] Admin not found:', adminError)
          return {
            success: false,
            error: 'Admin not found'
          }
        }
        
        adminUuid = adminData.id
        console.log('✅ [DEBUG] Admin UUID resolved:', adminUuid)
      }
      
      // Call the API route for assignment
      console.log('🔍 [DEBUG] Calling assignment API route...')
      const response = await fetch('/api/officers/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          complaintId,
          officerId: officerData.id, // Use the database UUID
          adminId: adminUuid,
          notes: notes || 'Case assigned by administrator via web interface'
        })
      })
      
      const responseData = await response.json()
      
      console.log('🔍 [DEBUG] API assignment response:', { 
        status: response.status, 
        ok: response.ok, 
        data: responseData 
      })
      
      if (!response.ok) {
        console.error('❌ [DEBUG] API assignment error:', responseData)
        return {
          success: false,
          error: responseData.error || `Assignment failed with status ${response.status}`
        }
      }
      
      if (!responseData.success) {
        console.error('❌ [DEBUG] Assignment failed:', responseData.error)
        return {
          success: false,
          error: responseData.error || 'Assignment failed'
        }
      }
      
      console.log('✅ [DEBUG] Officer assigned successfully via API:', responseData)
      return {
        success: true,
        assignment_id: responseData.assignment_id,
        officer_name: responseData.officer_name,
        message: responseData.message || `Officer ${responseData.officer_name} assigned and investigation started`
      }
      
    } catch (error: any) {
      console.error('❌ [DEBUG] Exception in assignOfficerToCase:', {
        message: error?.message,
        name: error?.name,
        stack: error?.stack,
        fullError: error
      })
      return {
        success: false,
        error: error.message || 'Failed to assign officer'
      }
    }
  }

  /**
   * Reassign a case from one officer to another
   */
  async reassignCase(
    complaintId: string,
    newOfficerId: string,
    adminId: string,
    reason: string
  ): Promise<AssignmentResult> {
    try {
      console.log('🔄 Reassigning case to different officer...', {
        complaintId,
        newOfficerId,
        adminId,
        reason
      })
      
      const { data, error } = await supabase.rpc('reassign_case_to_officer', {
        p_complaint_id: complaintId,
        p_new_officer_id: newOfficerId,
        p_admin_id: adminId,
        p_reason: reason
      })
      
      if (error) {
        console.error('❌ Error reassigning case:', error)
        throw error
      }
      
      if (!data.success) {
        console.error('❌ Reassignment failed:', data.error)
        return {
          success: false,
          error: data.error || 'Reassignment failed'
        }
      }
      
      console.log('✅ Case reassigned successfully:', data)
      return {
        success: true,
        assignment_id: data.assignment_id,
        officer_name: data.new_officer_name,
        message: data.message
      }
    } catch (error: any) {
      console.error('❌ Failed to reassign case:', error)
      return {
        success: false,
        error: error.message || 'Failed to reassign case'
      }
    }
  }

  /**
   * Get officer workload statistics
   */
  async getOfficerWorkload(officerId: string): Promise<{
    active_cases: number
    total_cases: number
    resolved_cases: number
    success_rate: number
    workload_level: string
  } | null> {
    try {
      console.log('📊 Fetching officer workload...', officerId)
      
      const { data, error } = await supabase
        .from('pnp_officer_profiles')
        .select('active_cases, total_cases, resolved_cases, success_rate')
        .eq('id', officerId)
        .single()
      
      if (error) {
        console.error('❌ Error fetching workload:', error)
        throw error
      }
      
      if (!data) {
        return null
      }
      
      // Calculate workload level
      const workloadLevel = 
        data.active_cases >= 15 ? 'overloaded' :
        data.active_cases >= 10 ? 'high' :
        data.active_cases >= 5 ? 'medium' : 'low'
      
      console.log('✅ Workload fetched:', { ...data, workload_level: workloadLevel })
      return {
        ...data,
        workload_level: workloadLevel
      }
    } catch (error) {
      console.error('❌ Failed to get officer workload:', error)
      return null
    }
  }

  /**
   * Get assignment history for a complaint
   */
  async getAssignmentHistory(complaintId: string): Promise<CaseAssignment[]> {
    try {
      console.log('📜 Fetching assignment history...', complaintId)
      
      const { data, error } = await supabase
        .from('case_assignments')
        .select(`
          *,
          officer:pnp_officer_profiles!officer_id(
            id,
            full_name,
            badge_number,
            rank
          ),
          admin:admin_profiles!admin_id(
            id,
            full_name,
            email
          )
        `)
        .eq('complaint_id', complaintId)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('❌ Error fetching assignment history:', error)
        throw error
      }
      
      console.log(`✅ Found ${data?.length || 0} assignment records`)
      return data || []
    } catch (error) {
      console.error('❌ Failed to get assignment history:', error)
      return []
    }
  }

  /**
   * Get unassigned cases count
   */
  async getUnassignedCasesCount(): Promise<number> {
    try {
      console.log('📊 Counting unassigned cases...')
      
      const { count, error } = await supabase
        .from('complaints')
        .select('*', { count: 'exact', head: true })
        .is('assigned_officer_id', null)
        .eq('status', 'To Be Assigned')
      
      if (error) {
        console.error('❌ Error counting unassigned cases:', error)
        throw error
      }
      
      console.log(`✅ Found ${count || 0} unassigned cases`)
      return count || 0
    } catch (error) {
      console.error('❌ Failed to count unassigned cases:', error)
      return 0
    }
  }

  /**
   * Get unassigned cases list
   */
  async getUnassignedCases(limit: number = 10): Promise<any[]> {
    try {
      console.log('📋 Fetching unassigned cases...')
      
      const { data, error } = await supabase
        .from('complaints')
        .select(`
          id,
          complaint_number,
          title,
          crime_type,
          priority,
          risk_score,
          ai_risk_score,
          created_at,
          assigned_unit,
          unit_id
        `)
        .is('assigned_officer_id', null)
        .eq('status', 'To Be Assigned')
        .order('created_at', { ascending: false })
        .limit(limit)
      
      if (error) {
        console.error('❌ Error fetching unassigned cases:', error)
        throw error
      }
      
      console.log(`✅ Fetched ${data?.length || 0} unassigned cases`)
      return data || []
    } catch (error) {
      console.error('❌ Failed to get unassigned cases:', error)
      return []
    }
  }

  /**
   * Batch assign multiple cases to officers
   */
  async batchAssignCases(
    assignments: Array<{
      complaintId: string
      officerId: string
    }>,
    adminId: string,
    notes?: string
  ): Promise<{
    successful: number
    failed: number
    results: AssignmentResult[]
  }> {
    console.log('📦 Starting batch assignment...', {
      totalCases: assignments.length,
      adminId
    })
    
    const results: AssignmentResult[] = []
    let successful = 0
    let failed = 0
    
    for (const assignment of assignments) {
      const result = await this.assignOfficerToCase(
        assignment.complaintId,
        assignment.officerId,
        adminId,
        notes
      )
      
      if (result.success) {
        successful++
      } else {
        failed++
      }
      
      results.push(result)
      
      // Add small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    console.log('✅ Batch assignment complete:', {
      successful,
      failed,
      total: assignments.length
    })
    
    return {
      successful,
      failed,
      results
    }
  }

  /**
   * Get suggested officer for a case based on workload and specialization
   */
  async getSuggestedOfficer(
    unitId: string,
    crimeType: string
  ): Promise<AvailableOfficer | null> {
    try {
      console.log('🤖 Getting AI-suggested officer...', { unitId, crimeType })
      
      const availableOfficers = await this.getAvailableOfficersForAssignment(unitId, crimeType)
      
      if (availableOfficers.length === 0) {
        console.log('⚠️ No available officers found')
        return null
      }
      
      // Sort by workload level and active cases
      const sorted = availableOfficers.sort((a, b) => {
        // Prioritize by workload level
        const workloadOrder = { low: 0, medium: 1, high: 2, overloaded: 3 }
        const workloadDiff = workloadOrder[a.workload_level] - workloadOrder[b.workload_level]
        if (workloadDiff !== 0) return workloadDiff
        
        // Then by active cases
        return a.active_cases - b.active_cases
      })
      
      const suggested = sorted[0]
      console.log('✅ Suggested officer:', suggested.officer_name)
      return suggested
    } catch (error) {
      console.error('❌ Failed to get suggested officer:', error)
      return null
    }
  }
}

export default new OfficerAssignmentService()