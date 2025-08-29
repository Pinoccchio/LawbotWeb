// Officer Assignment Service - Admin functionality for assigning officers to cases
// This service provides operations for admins to manage case assignments

import { supabase } from './supabase'

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
      console.log('🔍 Fetching available officers for assignment...', { unitId, crimeType })
      
      const { data, error } = await supabase.rpc('get_available_officers_for_assignment', {
        p_unit_id: unitId || null,
        p_crime_type: crimeType || null
      })
      
      if (error) {
        console.error('❌ Error fetching available officers:', error)
        throw error
      }
      
      console.log(`✅ Found ${data?.length || 0} available officers`)
      return data || []
    } catch (error) {
      console.error('❌ Failed to get available officers:', error)
      return []
    }
  }

  /**
   * Assign an officer to an unassigned case
   */
  async assignOfficerToCase(
    complaintId: string,
    officerId: string,
    adminId: string,
    notes?: string
  ): Promise<AssignmentResult> {
    try {
      console.log('👮 Assigning officer to case...', {
        complaintId,
        officerId,
        adminId
      })
      
      const { data, error } = await supabase.rpc('assign_officer_to_complaint', {
        p_complaint_id: complaintId,
        p_officer_id: officerId,
        p_admin_id: adminId,
        p_notes: notes || null
      })
      
      if (error) {
        console.error('❌ Error assigning officer:', error)
        throw error
      }
      
      if (!data.success) {
        console.error('❌ Assignment failed:', data.error)
        return {
          success: false,
          error: data.error || 'Assignment failed'
        }
      }
      
      console.log('✅ Officer assigned successfully:', data)
      return {
        success: true,
        assignment_id: data.assignment_id,
        officer_name: data.officer_name,
        message: data.message
      }
    } catch (error: any) {
      console.error('❌ Failed to assign officer:', error)
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
        .eq('status', 'Pending')
      
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
        .eq('status', 'Pending')
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