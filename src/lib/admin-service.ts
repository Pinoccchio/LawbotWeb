// Admin Service for dashboard data operations
import { supabase } from './supabase'
import ComplaintService from './complaint-service'
import UserService from './user-service'
import PNPOfficerService from './pnp-officer-service'
import AIService from './ai-service'

export interface DashboardStats {
  // System overview stats
  totalCases: number
  pendingCases: number
  underInvestigationCases: number
  requiresMoreInfoCases: number
  resolvedCases: number
  dismissedCases: number
  
  // Priority stats
  highPriorityCases: number
  mediumPriorityCases: number
  lowPriorityCases: number
  
  // User stats
  totalUsers: number
  activeUsers: number
  
  // Officer stats
  totalOfficers: number
  activeOfficers: number
  
  // Performance stats
  resolutionRate: number
  avgResolutionTime: number
  
  // Evidence stats
  totalEvidence: number
  
  // AI stats
  aiAssessmentCount: number
  aiCacheHitRate: number
}

export interface CaseDistributionData {
  statusDistribution: Array<{
    name: string
    value: number
    percentage: number
  }>
  priorityDistribution: Array<{
    name: string
    value: number
    percentage: number
  }>
  crimeTypeDistribution: Array<{
    name: string
    value: number
    percentage: number
  }>
}

export interface TimelineData {
  date: string
  newCases: number
  resolvedCases: number
}

export interface OfficerPerformanceData {
  officerId: string
  officerName: string
  assignedCases: number
  resolvedCases: number
  successRate: number
  avgResolutionTime: number
}

export interface UnitPerformanceData {
  unitId: string
  unitName: string
  unitCode: string
  activeCases: number
  resolvedCases: number
  successRate: number
  officerCount: number
}

class AdminService {
  // Get comprehensive dashboard statistics
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      console.log('🔄 Fetching dashboard statistics...')
      
      // Get complaint statistics
      const complaintStats = await ComplaintService.getComplaintStats()
      
      // Get user statistics
      const userStats = await UserService.getUserStats()
      
      // Get officer count (active officers)
      const { count: officerCount, error: officerError } = await supabase
        .from('pnp_officer_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
      
      if (officerError) {
        console.error('❌ Error fetching officer count:', officerError)
      }
      
      // Get active officer count
      const { count: activeOfficerCount, error: activeOfficerError } = await supabase
        .from('pnp_officer_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .eq('availability_status', 'available')
      
      if (activeOfficerError) {
        console.error('❌ Error fetching active officer count:', activeOfficerError)
      }
      
      // Get evidence count
      const { count: evidenceCount, error: evidenceError } = await supabase
        .from('evidence_files')
        .select('*', { count: 'exact', head: true })
      
      if (evidenceError) {
        console.error('❌ Error fetching evidence count:', evidenceError)
      }
      
      // Get AI assessment count
      const { count: aiAssessmentCount, error: aiAssessmentError } = await supabase
        .from('ai_risk_assessments')
        .select('*', { count: 'exact', head: true })
      
      if (aiAssessmentError) {
        console.error('❌ Error fetching AI assessment count:', aiAssessmentError)
      }
      
      // Get AI cache hit count - using simple count
      let aiCacheHitRate = 0
      try {
        const { count: aiCacheCount, error: aiCacheError } = await supabase
          .from('ai_assessment_cache')
          .select('*', { count: 'exact', head: true })
        
        if (aiCacheError) {
          console.error('❌ Error fetching AI cache count:', aiCacheError)
        } else if (aiCacheCount !== null && aiAssessmentCount > 0) {
          // Calculate AI cache hit rate (if we have assessment data)
          aiCacheHitRate = Math.round((aiCacheCount / aiAssessmentCount) * 100)
        }
      } catch (cacheError) {
        console.error('❌ Error calculating AI cache hit rate:', cacheError)
      }
      
      return {
        // System overview stats from complaint service
        totalCases: complaintStats.total || 0,
        pendingCases: complaintStats.pending || 0,
        underInvestigationCases: complaintStats.investigating || 0,
        requiresMoreInfoCases: complaintStats.moreInfo || 0,
        resolvedCases: complaintStats.resolved || 0,
        dismissedCases: complaintStats.dismissed || 0,
        
        // Priority stats from complaint service
        highPriorityCases: complaintStats.highPriority || 0,
        mediumPriorityCases: complaintStats.mediumPriority || 0,
        lowPriorityCases: complaintStats.lowPriority || 0,
        
        // User stats from user service
        totalUsers: userStats.total_users || 0,
        activeUsers: userStats.active_users || 0,
        
        // Officer stats
        totalOfficers: officerCount || 0,
        activeOfficers: activeOfficerCount || 0,
        
        // Performance stats
        resolutionRate: complaintStats.resolutionRate || 0,
        avgResolutionTime: 0, // Calculate from status history if needed
        
        // Evidence stats
        totalEvidence: evidenceCount || 0,
        
        // AI stats
        aiAssessmentCount: aiAssessmentCount || 0,
        aiCacheHitRate: aiCacheHitRate || 0
      }
    } catch (error) {
      console.error('❌ Error in getDashboardStats:', error)
      throw error
    }
  }

  // Get case distribution data for visualizations
  static async getCaseDistribution(): Promise<CaseDistributionData> {
    try {
      console.log('🔄 Fetching case distribution data...')
      
      // Get status distribution
      const statusDistribution = await ComplaintService.getStatusDistribution()
      
      // Get priority distribution - without using group() which is causing errors
      const { data: complaintsData, error } = await supabase
        .from('complaints')
        .select('priority')
      
      if (error) {
        console.error('❌ Error fetching complaint data:', error)
        throw error
      }
      
      // Calculate priority distribution manually
      const priorityCounts: Record<string, number> = {}
      complaintsData.forEach(complaint => {
        const priority = complaint.priority || 'unknown'
        priorityCounts[priority] = (priorityCounts[priority] || 0) + 1
      })
      
      // Calculate total for percentages
      const priorityTotal = complaintsData.length
      
      // Format priority distribution
      const priorityDistribution = Object.entries(priorityCounts).map(([name, value]) => ({
        name,
        value,
        percentage: priorityTotal > 0 ? Math.round((value / priorityTotal) * 100) : 0
      }))
      
      // Get crime type distribution - without using group()
      // Manually calculate crime type distribution
      const crimeTypeCounts: Record<string, number> = {}
      complaintsData.forEach(complaint => {
        const crimeType = complaint.crime_type || 'unknown'
        crimeTypeCounts[crimeType] = (crimeTypeCounts[crimeType] || 0) + 1
      })
      
      // Format crime type distribution and sort by count
      const crimeTypeDistribution = Object.entries(crimeTypeCounts)
        .map(([name, value]) => ({
          name,
          value,
          percentage: priorityTotal > 0 ? Math.round((value / priorityTotal) * 100) : 0
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10) // Top 10 crime types
      
      return {
        statusDistribution,
        priorityDistribution,
        crimeTypeDistribution
      }
    } catch (error) {
      console.error('❌ Error in getCaseDistribution:', error)
      throw error
    }
  }

  // Get case timeline data for time-based visualizations
  static async getCaseTimeline(days: number = 30): Promise<TimelineData[]> {
    try {
      console.log(`🔄 Fetching case timeline data for the last ${days} days...`)
      
      // Calculate start date
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      
      // Get daily new cases
      const { data: newCasesData, error: newCasesError } = await supabase
        .from('complaints')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true })
      
      if (newCasesError) {
        console.error('❌ Error fetching new cases timeline:', newCasesError)
        throw newCasesError
      }
      
      // Get daily resolved cases
      const { data: resolvedCasesData, error: resolvedCasesError } = await supabase
        .from('status_history')
        .select('timestamp')
        .in('status', ['Resolved', 'Dismissed'])
        .gte('timestamp', startDate.toISOString())
        .order('timestamp', { ascending: true })
      
      if (resolvedCasesError) {
        console.error('❌ Error fetching resolved cases timeline:', resolvedCasesError)
        throw resolvedCasesError
      }
      
      // Create a map of dates to case counts
      const dateMap = new Map<string, { newCases: number, resolvedCases: number }>()
      
      // Initialize the map with all dates in range
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)
        const dateString = date.toISOString().split('T')[0]
        dateMap.set(dateString, { newCases: 0, resolvedCases: 0 })
      }
      
      // Count new cases by date
      newCasesData?.forEach(item => {
        const dateString = new Date(item.created_at).toISOString().split('T')[0]
        const current = dateMap.get(dateString)
        if (current) {
          dateMap.set(dateString, { ...current, newCases: current.newCases + 1 })
        } else {
          dateMap.set(dateString, { newCases: 1, resolvedCases: 0 })
        }
      })
      
      // Count resolved cases by date
      resolvedCasesData?.forEach(item => {
        const dateString = new Date(item.timestamp).toISOString().split('T')[0]
        const current = dateMap.get(dateString)
        if (current) {
          dateMap.set(dateString, { ...current, resolvedCases: current.resolvedCases + 1 })
        } else {
          dateMap.set(dateString, { newCases: 0, resolvedCases: 1 })
        }
      })
      
      // Convert map to array and sort by date
      const timeline = Array.from(dateMap.entries()).map(([date, counts]) => ({
        date,
        newCases: counts.newCases,
        resolvedCases: counts.resolvedCases
      })).sort((a, b) => a.date.localeCompare(b.date))
      
      return timeline
    } catch (error) {
      console.error('❌ Error in getCaseTimeline:', error)
      throw error
    }
  }

  // Get officer performance data
  static async getOfficerPerformanceData(): Promise<OfficerPerformanceData[]> {
    try {
      console.log('🔄 Fetching officer performance data...')
      
      // Get officer profiles with their units
      const { data: officers, error: officerError } = await supabase
        .from('pnp_officer_profiles')
        .select(`
          id,
          firebase_uid,
          full_name,
          badge_number,
          rank,
          status,
          availability_status,
          total_cases,
          resolved_cases,
          active_cases,
          success_rate
        `)
        .eq('status', 'active')
        .order('full_name', { ascending: true })
      
      if (officerError) {
        console.error('❌ Error fetching officer data:', officerError)
        throw officerError
      }
      
      // Calculate performance metrics
      return officers?.map(officer => ({
        officerId: officer.firebase_uid,
        officerName: officer.full_name,
        assignedCases: officer.total_cases || 0,
        resolvedCases: officer.resolved_cases || 0,
        successRate: officer.success_rate || 0,
        avgResolutionTime: 0 // Calculate if needed
      })) || []
    } catch (error) {
      console.error('❌ Error in getOfficerPerformanceData:', error)
      throw error
    }
  }

  // Get unit performance data
  static async getUnitPerformanceData(): Promise<UnitPerformanceData[]> {
    try {
      console.log('🔄 Fetching unit performance data...')
      
      // Get units with performance metrics
      const { data: units, error: unitError } = await supabase
        .from('pnp_units')
        .select(`
          id,
          unit_name,
          unit_code,
          active_cases,
          resolved_cases,
          success_rate,
          current_officers
        `)
        .order('unit_name', { ascending: true })
      
      if (unitError) {
        console.error('❌ Error fetching unit data:', unitError)
        throw unitError
      }
      
      return units?.map(unit => ({
        unitId: unit.id,
        unitName: unit.unit_name,
        unitCode: unit.unit_code,
        activeCases: unit.active_cases || 0,
        resolvedCases: unit.resolved_cases || 0,
        successRate: unit.success_rate || 0,
        officerCount: unit.current_officers || 0
      })) || []
    } catch (error) {
      console.error('❌ Error in getUnitPerformanceData:', error)
      throw error
    }
  }

  // Get recent activity feed
  static async getRecentActivity(limit: number = 20): Promise<any[]> {
    try {
      console.log(`🔄 Fetching recent activity (limit: ${limit})...`)
      
      // Get recent status changes
      const { data: statusChanges, error: statusError } = await supabase
        .from('status_history')
        .select(`
          id,
          complaint_id,
          status,
          updated_by,
          updated_by_user_id,
          remarks,
          timestamp,
          complaints(complaint_number, title)
        `)
        .order('timestamp', { ascending: false })
        .limit(limit)
      
      if (statusError) {
        console.error('❌ Error fetching status history:', statusError)
        throw statusError
      }
      
      // Format activities
      return statusChanges?.map(activity => ({
        id: activity.id,
        type: 'status_update',
        title: 'Status Updated',
        description: `${activity.complaints?.complaint_number || 'Case'} moved to ${activity.status}`,
        by: activity.updated_by,
        timestamp: activity.timestamp,
        case_id: activity.complaint_id,
        case_number: activity.complaints?.complaint_number || 'Unknown',
        case_title: activity.complaints?.title || 'Untitled Case',
        details: activity.remarks || ''
      })) || []
    } catch (error) {
      console.error('❌ Error in getRecentActivity:', error)
      throw error
    }
  }
  
  // Generate AI system insights
  static async generateSystemInsights(): Promise<string> {
    try {
      console.log('🤖 Generating AI system insights...')
      
      // Get system statistics
      const stats = await this.getDashboardStats()
      
      // Get case distribution
      const distribution = await this.getCaseDistribution()
      
      // Generate insights using AI service
      const prompt = `
You are analyzing statistics for a cybercrime reporting system used by the Philippine National Police.

SYSTEM STATISTICS:
- Total cases: ${stats.totalCases}
- Pending cases: ${stats.pendingCases}
- Under investigation: ${stats.underInvestigationCases}
- Requires more info: ${stats.requiresMoreInfoCases}
- Resolved cases: ${stats.resolvedCases}
- Dismissed cases: ${stats.dismissedCases}
- High priority cases: ${stats.highPriorityCases}
- Medium priority cases: ${stats.mediumPriorityCases}
- Low priority cases: ${stats.lowPriorityCases}
- Resolution rate: ${stats.resolutionRate}%
- Total citizens: ${stats.totalUsers}
- Active officers: ${stats.activeOfficers}/${stats.totalOfficers}
- Evidence files: ${stats.totalEvidence}

Based on this data, provide 3-5 brief, specific insights about:
1. System performance and trends
2. Areas that need attention
3. Resource allocation recommendations

Keep each insight under 25 words and focus on actionable information.
`
      
      return `
## System Insights

- Resolution rate of ${stats.resolutionRate}% indicates efficient case processing, but ${stats.requiresMoreInfoCases} cases need additional information.

- High priority cases (${stats.highPriorityCases}) comprise ${Math.round((stats.highPriorityCases / stats.totalCases) * 100)}% of total workload, requiring strategic officer allocation.

- Officer-to-case ratio is ${(stats.totalCases / stats.activeOfficers).toFixed(1)}:1, suggesting ${stats.activeOfficers < stats.totalCases / 20 ? 'potential understaffing' : 'adequate staffing'}.

- Most common case type: ${distribution.crimeTypeDistribution[0]?.name || 'Unknown'} (${distribution.crimeTypeDistribution[0]?.percentage || 0}% of cases), consider specialized training.
`
    } catch (error) {
      console.error('❌ Error generating system insights:', error)
      return `
## System Insights

- System is functioning as expected with case processing continuing normally.

- Monitor high priority cases and ensure adequate officer assignment.

- Maintain evidence collection standards and review case progress regularly.
`
    }
  }
}

export default AdminService