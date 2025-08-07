import { supabase } from './supabase'

export interface ComplaintData {
  id: string
  user_id: string
  complaint_number: string
  title?: string
  crime_type: string
  description: string
  full_name: string
  email: string
  phone_number: string
  incident_date_time: string
  incident_location?: string
  estimated_loss?: number
  
  // Dynamic fields (category-specific)
  platform_website?: string
  account_reference?: string
  suspect_name?: string
  suspect_relationship?: string
  suspect_contact?: string
  suspect_details?: string
  system_details?: string
  technical_info?: string
  vulnerability_details?: string
  attack_vector?: string
  security_level?: string
  target_info?: string
  content_description?: string
  impact_assessment?: string
  
  // Case management fields
  status: string
  priority: string
  risk_score: number
  assigned_unit?: string
  unit_id?: string
  assigned_officer?: string
  assigned_officer_id?: string
  
  // AI fields
  ai_priority?: string
  ai_risk_score?: number
  ai_confidence_score?: number
  risk_factors?: any[]
  urgency_indicators?: any[]
  last_ai_assessment?: string
  ai_reasoning?: string
  
  // Timestamps
  created_at: string
  updated_at: string
  
  // Relations
  user_profiles?: {
    full_name: string
    email: string
    phone_number: string
  }
  
  evidence_files?: Array<{
    id: string
    file_name: string
    file_type: string
    file_size: number
    uploaded_at: string
  }>
}

export class ComplaintService {
  
  /**
   * Fetch all complaints with basic filtering
   */
  static async getAllComplaints(options?: {
    status?: string[]
    priority?: string[]
    limit?: number
    offset?: number
  }): Promise<{ data: ComplaintData[], error: any, count: number }> {
    try {
      let query = supabase
        .from('complaints')
        .select(`
          *,
          user_profiles!inner(full_name, email, phone_number),
          evidence_files(id, file_name, file_type, file_size, uploaded_at)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })

      // Apply filters
      if (options?.status && options.status.length > 0) {
        query = query.in('status', options.status)
      }
      
      if (options?.priority && options.priority.length > 0) {
        query = query.in('priority', options.priority)
      }

      // Apply pagination
      if (options?.limit) {
        query = query.limit(options.limit)
      }
      
      if (options?.offset) {
        query = query.range(options.offset, (options.offset + (options.limit || 10)) - 1)
      }

      const { data, error, count } = await query

      return {
        data: data || [],
        error,
        count: count || 0
      }
    } catch (error) {
      console.error('Error fetching complaints:', error)
      return {
        data: [],
        error,
        count: 0
      }
    }
  }

  /**
   * Fetch complaints assigned to a specific officer
   */
  static async getOfficerComplaints(officerId: string, options?: {
    status?: string[]
    limit?: number
  }): Promise<{ data: ComplaintData[], error: any }> {
    try {
      let query = supabase
        .from('complaints')
        .select(`
          *,
          user_profiles!inner(full_name, email, phone_number),
          evidence_files(id, file_name, file_type, file_size, uploaded_at)
        `)
        .eq('assigned_officer_id', officerId)
        .order('created_at', { ascending: false })

      if (options?.status && options.status.length > 0) {
        query = query.in('status', options.status)
      }

      if (options?.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query

      return {
        data: data || [],
        error
      }
    } catch (error) {
      console.error('Error fetching officer complaints:', error)
      return {
        data: [],
        error
      }
    }
  }

  /**
   * Fetch a single complaint by ID with all details
   */
  static async getComplaintById(id: string): Promise<{ data: ComplaintData | null, error: any }> {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select(`
          *,
          user_profiles!inner(full_name, email, phone_number),
          evidence_files(id, file_name, file_type, file_size, uploaded_at)
        `)
        .eq('id', id)
        .single()

      return {
        data,
        error
      }
    } catch (error) {
      console.error('Error fetching complaint by ID:', error)
      return {
        data: null,
        error
      }
    }
  }

  /**
   * Get complaint statistics for dashboards
   */
  static async getComplaintStats(): Promise<{
    totalComplaints: number
    activeCases: number
    resolvedCases: number
    highPriority: number
    avgRiskScore: number
    recentCases: number
    error?: any
  }> {
    try {
      // Fetch all complaints for statistics
      const { data, error } = await supabase
        .from('complaints')
        .select('status, priority, risk_score, created_at')

      if (error) throw error

      if (!data) {
        return {
          totalComplaints: 0,
          activeCases: 0,
          resolvedCases: 0,
          highPriority: 0,
          avgRiskScore: 0,
          recentCases: 0
        }
      }

      // Calculate statistics
      const totalComplaints = data.length
      const activeCases = data.filter(c => 
        ['Pending', 'Under Investigation', 'Requires More Information'].includes(c.status)
      ).length
      const resolvedCases = data.filter(c => 
        ['Resolved', 'Dismissed'].includes(c.status)
      ).length
      const highPriority = data.filter(c => c.priority === 'high').length
      const avgRiskScore = Math.round(
        data.reduce((acc, c) => acc + (c.risk_score || 0), 0) / totalComplaints
      )
      
      // Recent cases (last 7 days)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const recentCases = data.filter(c => 
        new Date(c.created_at) >= weekAgo
      ).length

      return {
        totalComplaints,
        activeCases,
        resolvedCases,
        highPriority,
        avgRiskScore,
        recentCases
      }
    } catch (error) {
      console.error('Error fetching complaint stats:', error)
      return {
        totalComplaints: 0,
        activeCases: 0,
        resolvedCases: 0,
        highPriority: 0,
        avgRiskScore: 0,
        recentCases: 0,
        error
      }
    }
  }

  /**
   * Search complaints by various criteria
   */
  static async searchComplaints(searchQuery: string, options?: {
    crimeTypes?: string[]
    status?: string[]
    priority?: string[]
    limit?: number
  }): Promise<{ data: ComplaintData[], error: any }> {
    try {
      let query = supabase
        .from('complaints')
        .select(`
          *,
          user_profiles!inner(full_name, email, phone_number),
          evidence_files(id, file_name, file_type, file_size, uploaded_at)
        `)
        .order('created_at', { ascending: false })

      // Apply search query
      if (searchQuery.trim()) {
        query = query.or(`
          complaint_number.ilike.%${searchQuery}%,
          crime_type.ilike.%${searchQuery}%,
          description.ilike.%${searchQuery}%,
          full_name.ilike.%${searchQuery}%,
          assigned_officer.ilike.%${searchQuery}%,
          assigned_unit.ilike.%${searchQuery}%
        `)
      }

      // Apply filters
      if (options?.crimeTypes && options.crimeTypes.length > 0) {
        query = query.in('crime_type', options.crimeTypes)
      }
      
      if (options?.status && options.status.length > 0) {
        query = query.in('status', options.status)
      }
      
      if (options?.priority && options.priority.length > 0) {
        query = query.in('priority', options.priority)
      }

      if (options?.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query

      return {
        data: data || [],
        error
      }
    } catch (error) {
      console.error('Error searching complaints:', error)
      return {
        data: [],
        error
      }
    }
  }

  /**
   * Get status distribution for charts
   */
  static async getStatusDistribution(): Promise<Array<{
    label: string
    value: number
    color: string
  }>> {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('status')

      if (error || !data) {
        console.error('Error fetching status distribution:', error)
        return []
      }

      const statusCounts = data.reduce((acc, complaint) => {
        acc[complaint.status] = (acc[complaint.status] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      return [
        { label: "📋 Pending", value: statusCounts['Pending'] || 0, color: "amber" },
        { label: "🔍 Under Investigation", value: statusCounts['Under Investigation'] || 0, color: "blue" },
        { label: "❓ Requires More Info", value: statusCounts['Requires More Information'] || 0, color: "orange" },
        { label: "✅ Resolved", value: statusCounts['Resolved'] || 0, color: "green" },
        { label: "❌ Dismissed", value: statusCounts['Dismissed'] || 0, color: "red" }
      ]
    } catch (error) {
      console.error('Error calculating status distribution:', error)
      return []
    }
  }
}

export default ComplaintService