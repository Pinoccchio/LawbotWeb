import { supabase } from "./supabase"
import { mockComplaintUpdateHistory } from "./mock-data"

interface ComplaintUpdate {
  updates: Record<string, any>
  updateReason: string
  updateType: "citizen_update" | "officer_update" | "system_update"
  requiresApproval?: boolean
}

class ComplaintService {
  /**
   * Get all complaints with pagination and filtering
   */
  async getAllComplaints(options: { limit?: number; offset?: number; status?: string } = {}) {
    try {
      const { limit = 50, offset = 0, status } = options
      
      console.log('🔍 Fetching complaints with options:', options)
      
      let query = supabase
        .from('complaints')
        .select(`
          *,
          evidence_files(
            id,
            file_name,
            file_type,
            file_size
          ),
          status_history(
            id,
            status,
            updated_by,
            timestamp,
            remarks
          )
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error, count } = await query

      if (error) {
        console.error('❌ Error fetching complaints:', error)
        return { data: [], error, count: 0 }
      }

      console.log(`✅ Successfully fetched ${data?.length || 0} complaints`)
      
      return { 
        data: data || [], 
        error: null, 
        count: count || 0 
      }
    } catch (error) {
      console.error('❌ Exception in getAllComplaints:', error)
      return { 
        data: [], 
        error: error instanceof Error ? error : new Error('Unknown error'), 
        count: 0 
      }
    }
  }

  /**
   * Get complaint statistics
   */
  async getComplaintStats() {
    try {
      console.log('🔍 Calculating complaint statistics...')
      
      const { data, error } = await supabase
        .from('complaints')
        .select('status, priority, created_at, ai_risk_score')
      
      if (error) {
        console.error('❌ Error fetching complaint stats:', error)
        return this.getDefaultStats()
      }

      // Calculate statistics
      const total = data?.length || 0
      const pending = data?.filter(c => c.status === 'Pending').length || 0
      const investigating = data?.filter(c => c.status === 'Under Investigation').length || 0
      const moreInfo = data?.filter(c => c.status === 'Requires More Information').length || 0
      const resolved = data?.filter(c => c.status === 'Resolved').length || 0
      const dismissed = data?.filter(c => c.status === 'Dismissed').length || 0

      // Priority distribution
      const high = data?.filter(c => c.priority === 'high' || c.priority === 'urgent').length || 0
      const medium = data?.filter(c => c.priority === 'medium').length || 0
      const low = data?.filter(c => c.priority === 'low').length || 0

      // Calculate averages
      const avgRiskScore = data?.length ? 
        data.reduce((sum, c) => sum + (c.ai_risk_score || 0), 0) / data.length : 0

      const stats = {
        total,
        pending,
        investigating,
        moreInfo,
        resolved,
        dismissed,
        highPriority: high,
        mediumPriority: medium,
        lowPriority: low,
        avgRiskScore: Math.round(avgRiskScore),
        resolutionRate: total > 0 ? Math.round(((resolved + dismissed) / total) * 100) : 0
      }

      console.log('✅ Complaint statistics calculated:', stats)
      return stats
    } catch (error) {
      console.error('❌ Exception calculating complaint stats:', error)
      return this.getDefaultStats()
    }
  }

  /**
   * Get status distribution for charts
   */
  async getStatusDistribution() {
    try {
      console.log('🔍 Getting status distribution...')
      
      const { data, error } = await supabase
        .from('complaints')
        .select('status')
      
      if (error) {
        console.error('❌ Error fetching status distribution:', error)
        return []
      }

      // Count by status
      const statusCounts = data?.reduce((acc: Record<string, number>, complaint) => {
        const status = complaint.status || 'Unknown'
        acc[status] = (acc[status] || 0) + 1
        return acc
      }, {})

      // Convert to array format for charts
      const distribution = Object.entries(statusCounts || {}).map(([status, count]) => ({
        name: status,
        value: count,
        percentage: data?.length ? Math.round((count / data.length) * 100) : 0
      }))

      console.log('✅ Status distribution calculated:', distribution)
      return distribution
    } catch (error) {
      console.error('❌ Exception getting status distribution:', error)
      return []
    }
  }

  /**
   * Default stats fallback
   */
  private getDefaultStats() {
    return {
      total: 0,
      pending: 0,
      investigating: 0,
      moreInfo: 0,
      resolved: 0,
      dismissed: 0,
      highPriority: 0,
      mediumPriority: 0,
      lowPriority: 0,
      avgRiskScore: 0,
      resolutionRate: 0
    }
  }
  async updateComplaint(complaintId: string, updateData: ComplaintUpdate, firebaseUid: string) {
    try {
      // Call the database function to apply updates
      const { data, error } = await supabase.rpc('apply_complaint_update', {
        p_complaint_id: complaintId,
        p_firebase_uid: firebaseUid,  // Pass Firebase UID
        p_updates: updateData.updates,
        p_update_reason: updateData.updateReason,
        p_update_notes: `Updated via web app - ${updateData.updateType}`,
        p_device_info: {
          platform: 'web',
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      })

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error updating complaint:', error)
      throw error
    }
  }

  async getComplaintUpdateHistory(complaintId: string) {
    console.log('🔍 [ComplaintService] getComplaintUpdateHistory called with ID:', complaintId)
    console.log('🔍 [ComplaintService] Available mock data complaint IDs:', 
      mockComplaintUpdateHistory.map(update => update.complaint_id))
    
    try {
      // Check if this is a mock complaint ID and return mock data
      const mockData = mockComplaintUpdateHistory.filter(
        update => update.complaint_id === complaintId
      )
      
      console.log('🔍 [ComplaintService] Mock data filter result:', mockData.length, 'records')
      
      if (mockData.length > 0) {
        console.log('✅ [ComplaintService] Using mock update history for complaint', complaintId, ':', mockData)
        return mockData
      }

      // Otherwise fetch from database
      console.log('🔍 [ComplaintService] No mock data found, querying database for complaint:', complaintId)
      const { data, error } = await supabase
        .from('complaint_updates')
        .select('*')
        .eq('complaint_id', complaintId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ [ComplaintService] Supabase query error:', error)
        throw error
      }

      console.log('✅ [ComplaintService] Database query result:', data?.length || 0, 'records')

      // Process the data with basic updater name logic
      const processedData = data?.map(update => ({
        ...update,
        updater_name: update.update_type === 'citizen_update' 
          ? 'Citizen' 
          : update.update_type === 'officer_update' 
            ? 'Officer' 
            : 'System'
      })) || []

      return processedData
    } catch (error) {
      console.error('❌ [ComplaintService] Error fetching update history for complaint', complaintId, ':', error)
      console.error('❌ [ComplaintService] Error details:', JSON.stringify(error, null, 2))
      return []
    }
  }

  async approveFieldUpdate(updateId: string, officerId: string) {
    try {
      const { data, error } = await supabase
        .from('complaint_updates')
        .update({
          approved_by: officerId,
          approved_at: new Date().toISOString(),
          approval_status: 'approved'
        })
        .eq('id', updateId)
        .eq('requires_approval', true)
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error approving field update:', error)
      throw error
    }
  }

  async rejectFieldUpdate(updateId: string, officerId: string, rejectionReason: string) {
    try {
      const { data, error } = await supabase
        .from('complaint_updates')
        .update({
          approved_by: officerId,
          approved_at: new Date().toISOString(),
          approval_status: 'rejected',
          rejection_reason: rejectionReason
        })
        .eq('id', updateId)
        .eq('requires_approval', true)
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error rejecting field update:', error)
      throw error
    }
  }

  async getPendingApprovals(unitId?: string) {
    try {
      let query = supabase
        .from('complaint_updates')
        .select(`
          *,
          complaints(
            complaint_number,
            title,
            assigned_unit,
            assigned_officer_id
          )
        `)
        .eq('requires_approval', true)
        .is('approved_at', null)
        .order('created_at', { ascending: false })

      if (unitId) {
        query = query.eq('complaints.assigned_unit', unitId)
      }

      const { data, error } = await query

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error fetching pending approvals:', error)
      return []
    }
  }

  async getUpdateMetrics(startDate?: Date, endDate?: Date) {
    try {
      let query = supabase
        .from('complaint_updates')
        .select('*', { count: 'exact' })

      if (startDate) {
        query = query.gte('created_at', startDate.toISOString())
      }
      if (endDate) {
        query = query.lte('created_at', endDate.toISOString())
      }

      const { data, count, error } = await query

      if (error) throw error

      // Calculate metrics
      const metrics = {
        totalUpdates: count || 0,
        citizenUpdates: data?.filter(u => u.update_type === 'citizen_update').length || 0,
        officerUpdates: data?.filter(u => u.update_type === 'officer_update').length || 0,
        systemUpdates: data?.filter(u => u.update_type === 'system_update').length || 0,
        pendingApprovals: data?.filter(u => u.requires_approval && !u.approved_at).length || 0,
        approvedUpdates: data?.filter(u => u.approval_status === 'approved').length || 0,
        rejectedUpdates: data?.filter(u => u.approval_status === 'rejected').length || 0,
        aiReassessments: data?.filter(u => u.ai_reassessment_completed).length || 0,
      }

      return metrics
    } catch (error) {
      console.error('Error calculating update metrics:', error)
      return {
        totalUpdates: 0,
        citizenUpdates: 0,
        officerUpdates: 0,
        systemUpdates: 0,
        pendingApprovals: 0,
        approvedUpdates: 0,
        rejectedUpdates: 0,
        aiReassessments: 0,
      }
    }
  }
}

export default new ComplaintService()