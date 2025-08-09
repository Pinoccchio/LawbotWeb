import { supabase } from "./supabase"
import { mockComplaintUpdateHistory } from "./mock-data"

interface ComplaintUpdate {
  updates: Record<string, any>
  updateReason: string
  updateType: "citizen_update" | "officer_update" | "system_update"
  requiresApproval?: boolean
}

class ComplaintService {
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