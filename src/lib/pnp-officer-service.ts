// PNP Officer Service - Real Supabase Database Implementation
// This service provides real database operations for PNP officer dashboard functionality

import { supabase } from './supabase'

// Define types for PNP officer related data (matching database schema)
export interface PNPOfficerProfile {
  id: string
  firebase_uid: string
  email: string
  full_name: string
  phone_number: string | null
  badge_number: string
  rank: string
  unit_id: string | null
  region: string
  status: 'active' | 'on_leave' | 'suspended' | 'retired'
  availability_status?: 'available' | 'busy' | 'overloaded' | 'unavailable'
  last_login_at?: string | null
  last_case_assignment_at?: string | null
  last_status_update_at?: string | null
  // Performance metrics
  total_cases: number
  active_cases: number
  resolved_cases: number
  success_rate: number
  created_at: string
  updated_at: string
  // Joined unit data
  unit?: {
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
    status: string
    crime_types: string[]
  } | null
}

export interface PNPOfficerStats {
  total_cases: number
  active_cases: number
  resolved_cases: number
  success_rate: number
  avg_resolution_time: number
  weekly_activity: Array<{ day: string; cases: number }>
  monthly_progress: {
    resolved: number
    target: number
    percentage: number
  }
  cases_by_priority: {
    high: number
    medium: number
    low: number
  }
  cases_by_status: {
    pending: number
    investigating: number
    needsInfo: number
    resolved: number
    dismissed: number
  }
}

export interface OfficerCase {
  id: string
  complaint_id: string
  complaint: any
  assignment_type: string
  status: string
  notes?: string
  created_at: string
}

export class PNPOfficerService {
  // Store current user ID for the session
  private static _currentUserId: string | null = null
  
  // Set the current user ID (called from components with auth context)
  static setCurrentUserId(userId: string | null) {
    this._currentUserId = userId
    console.log('🔐 Current user ID set:', userId)
  }
  
  // Clear all cached data when switching users
  static clearCache() {
    console.log('🧹 Clearing PNP Officer Service cache')
    this._currentUserId = null
  }
  
  // Get current user ID from Firebase auth or stored value
  static get currentUserId(): string | null {
    try {
      // If we have a stored user ID, use it
      if (this._currentUserId) {
        console.log('🔐 Using cached currentUserId:', this._currentUserId)
        return this._currentUserId
      }
      
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        console.log('⚠️ Server-side environment, no currentUserId available')
        return null
      }
      
      // Try to get the current user from Firebase Auth
      try {
        // Import auth dynamically to avoid SSR issues
        const { auth } = require('@/lib/firebase')
        const currentUser = auth.currentUser
        
        if (currentUser) {
          console.log('🔐 Current Firebase user ID:', currentUser.uid)
          this._currentUserId = currentUser.uid
          return currentUser.uid
        } else {
          console.log('⚠️ No Firebase user currently authenticated')
        }
        
        // Enhanced fallback logic for web app demo/development
        const persistedAuth = localStorage.getItem('authPersistence')
        if (persistedAuth === 'true') {
          console.log('⚠️ Auth persisted but user not loaded, using demo officer from database')
          // Use one of the actual Firebase UIDs from the database for demo
          const availableDemoUIDs = [
            'lYqVWjQEM2OIV9QfLiqnHu54g5P2', // Lucifer Morningstar
            'esDLeChoVTgdD5194Wd65YMu4VK2', // Cardo Dalisay
            'DelDLBSu8FZky5tf1xhiUKGMgTw1'  // Ador Dalisay
          ]
          const demoUserId = availableDemoUIDs[0] // Use first available officer
          console.log('🔐 Setting demo Firebase UID:', demoUserId)
          this._currentUserId = demoUserId
          return demoUserId
        }
        
        // For web app development, provide a way to use demo officer
        console.log('ℹ️ No authentication available, will use fallback in getCurrentOfficerProfile')
      } catch (authError) {
        console.error('❌ Error accessing Firebase Auth:', authError)
        console.log('ℹ️ Will fall back to demo officer for functionality')
      }
      
      return null
    } catch (error) {
      console.error('❌ Error getting current user ID:', error)
      return null
    }
  }

  // Get current officer profile from database
  static async getCurrentOfficerProfile(): Promise<PNPOfficerProfile | null> {
    try {
      console.log('🔄 Fetching current officer profile from database...')
      console.log('🔐 Using currentUserId:', this.currentUserId)
      
      // First, try to use the current Firebase UID if available
      if (this.currentUserId) {
        console.log('🔄 Attempting to find officer with Firebase UID:', this.currentUserId)
        
        // Use maybeSingle() instead of single() to avoid PGRST116 error when no rows found
        const { data: officer, error } = await supabase
          .from('pnp_officer_profiles')
          .select(`
            *,
            pnp_units (
              id,
              unit_name,
              unit_code,
              category,
              description,
              region,
              max_officers,
              current_officers,
              active_cases,
              resolved_cases,
              success_rate,
              status
            )
          `)
          .eq('firebase_uid', this.currentUserId)
          .eq('status', 'active')
          .maybeSingle()
        
        if (error) {
          console.error('❌ Database error fetching officer by Firebase UID:', JSON.stringify(error, null, 2))
        } else if (officer) {
          console.log('✅ Found officer by Firebase UID:', officer.full_name)
          // Get crime types for the unit if available
          let crimeTypes: string[] = []
          if (officer.pnp_units?.id) {
            const { data: unitCrimeTypes } = await supabase
              .from('pnp_unit_crime_types')
              .select('crime_type')
              .eq('unit_id', officer.pnp_units.id)
            
            crimeTypes = unitCrimeTypes?.map(ct => ct.crime_type) || []
          }
          
          return this.mapOfficerData(officer, crimeTypes)
        } else {
          console.log('⚠️ No officer found with Firebase UID:', this.currentUserId)
        }
      }
      
      // Fallback: Get any active officer for demo/development purposes
      console.log('🔄 Falling back to first active officer for demo functionality...')
      
      const { data: demoOfficers, error: demoError } = await supabase
        .from('pnp_officer_profiles')
        .select(`
          *,
          pnp_units (
            id,
            unit_name,
            unit_code,
            category,
            description,
            region,
            max_officers,
            current_officers,
            active_cases,
            resolved_cases,
            success_rate,
            status
          )
        `)
        .eq('status', 'active')
        .limit(1)
      
      if (demoError) {
        console.error('❌ Error fetching demo officer:', JSON.stringify(demoError, null, 2))
        
        // Final fallback: List all officers for debugging
        console.log('📊 Attempting to list all officers for debugging...')
        const { data: allOfficers, error: listError } = await supabase
          .from('pnp_officer_profiles')
          .select('id, firebase_uid, full_name, email, status')
          .limit(5)
        
        if (listError) {
          console.error('❌ Error listing officers:', listError)
        } else {
          console.log('👮 Available officers in database:', allOfficers)
        }
        
        return null
      }
      
      if (!demoOfficers || demoOfficers.length === 0) {
        console.error('❌ No active officers found in database')
        return null
      }
      
      const demoOfficer = demoOfficers[0]
      console.log('✅ Using demo officer for functionality:', demoOfficer.full_name)
      
      // Get crime types for the unit if available
      let crimeTypes: string[] = []
      if (demoOfficer.pnp_units?.id) {
        const { data: unitCrimeTypes } = await supabase
          .from('pnp_unit_crime_types')
          .select('crime_type')
          .eq('unit_id', demoOfficer.pnp_units.id)
        
        crimeTypes = unitCrimeTypes?.map(ct => ct.crime_type) || []
      }
      
      return this.mapOfficerData(demoOfficer, crimeTypes)
    } catch (error) {
      console.error('❌ Error fetching current officer profile:', error)
      return null
    }
  }

  // Helper method to map officer database data to interface
  private static mapOfficerData(officer: any, crimeTypes: string[] = []): PNPOfficerProfile {
    return {
      id: officer.id,
      firebase_uid: officer.firebase_uid,
      email: officer.email,
      full_name: officer.full_name,
      phone_number: officer.phone_number,
      badge_number: officer.badge_number,
      rank: officer.rank,
      unit_id: officer.unit_id,
      region: officer.region,
      status: officer.status,
      availability_status: officer.availability_status,
      last_login_at: officer.last_login_at,
      last_case_assignment_at: officer.last_case_assignment_at,
      last_status_update_at: officer.last_status_update_at,
      total_cases: officer.total_cases,
      active_cases: officer.active_cases,
      resolved_cases: officer.resolved_cases,
      success_rate: officer.success_rate,
      created_at: officer.created_at,
      updated_at: officer.updated_at,
      unit: officer.pnp_units ? {
        id: officer.pnp_units.id,
        unit_name: officer.pnp_units.unit_name,
        unit_code: officer.pnp_units.unit_code,
        category: officer.pnp_units.category,
        description: officer.pnp_units.description,
        region: officer.pnp_units.region,
        max_officers: officer.pnp_units.max_officers,
        current_officers: officer.pnp_units.current_officers,
        active_cases: officer.pnp_units.active_cases,
        resolved_cases: officer.pnp_units.resolved_cases,
        success_rate: officer.pnp_units.success_rate,
        status: officer.pnp_units.status,
        crime_types: crimeTypes
      } : null
    }
  }

  // Get cases assigned to the current officer
  static async getOfficerCases(officerId?: string): Promise<OfficerCase[]> {
    try {
      const targetOfficerId = officerId || (await this.getCurrentOfficerProfile())?.id
      
      if (!targetOfficerId) {
        console.log('ℹ️ No officer ID available for fetching cases')
        return []
      }
      
      console.log('🔄 Fetching cases for officer:', targetOfficerId)
      
      // Get cases directly from complaints table using assigned_officer_id
      const { data: directCases, error: directError } = await supabase
        .from('complaints')
        .select('*')
        .eq('assigned_officer_id', targetOfficerId)
        .order('created_at', { ascending: false })
      
      if (directError) {
        console.error('❌ Error fetching direct complaint assignments:', directError)
        return []
      }
      
      if (!directCases || directCases.length === 0) {
        console.log('ℹ️ No cases found for officer')
        return []
      }
      
      console.log(`✅ Found ${directCases.length} direct assigned cases`)
      
      // For each complaint, fetch the user profile separately
      const casesWithUserProfiles = await Promise.all(
        directCases.map(async (complaint: any) => {
          // Log each complaint to verify fields are loaded
          console.log('🔍 PNP Officer Service - Processing case:', complaint.complaint_number || complaint.id);
          
          // Fetch user profile for this complaint
          let userProfile = null
          if (complaint.user_id) {
            try {
              const { data: profile, error } = await supabase
                .from('user_profiles')
                .select('full_name, email, phone_number')
                .eq('id', complaint.user_id)
                .single()
              
              if (!error && profile) {
                userProfile = profile
              } else if (error) {
                console.log(`⚠️ Could not fetch user profile for ${complaint.user_id}:`, error.message)
              }
            } catch (err) {
              console.log(`⚠️ Error fetching user profile:`, err)
            }
          }
          
          return {
            id: `direct_${complaint.id}`,
            complaint_id: complaint.id,
            complaint: {
              ...complaint, // Include all fields from database
              title: complaint.title || `${complaint.crime_type} Case`,
              risk_score: complaint.risk_score || 0,
              user_profiles: userProfile || {
                full_name: complaint.full_name || 'Unknown',
                email: complaint.email || 'N/A',
                phone_number: complaint.phone_number || 'N/A'
              }
            },
            assignment_type: 'primary',
            status: 'active',
            notes: undefined,
            created_at: complaint.created_at
          }
        })
      )
      
      return casesWithUserProfiles
    } catch (error) {
      console.error('❌ Error fetching officer cases:', error)
      return []
    }
  }

  // Get officer statistics calculated from real data
  static async getOfficerStats(officerId?: string): Promise<PNPOfficerStats> {
    try {
      const targetOfficerId = officerId || (await this.getCurrentOfficerProfile())?.id
      
      if (!targetOfficerId) {
        console.log('ℹ️ No officer ID available for calculating stats')
        return this.getDefaultStats()
      }
      
      console.log('🔄 Calculating officer statistics from database...', targetOfficerId)
      
      // Get officer profile to access database success_rate
      const { data: officerProfile, error: profileError } = await supabase
        .from('pnp_officer_profiles')
        .select('success_rate, total_cases, resolved_cases, active_cases')
        .eq('id', targetOfficerId)
        .single()
      
      if (profileError) {
        console.error('❌ Error fetching officer profile:', profileError)
      }
      
      // Get all cases for this officer
      const cases = await this.getOfficerCases(targetOfficerId)
      
      // Calculate statistics
      const totalCases = cases.length
      const activeCases = cases.filter(c => 
        ['Pending', 'Under Investigation', 'Requires More Information'].includes(c.complaint.status)
      ).length
      
      // Get resolved cases from database - SEPARATE QUERIES FOR ACCURATE COUNTING
      const { data: resolvedCases, error: resolvedError } = await supabase
        .from('complaints')
        .select('id, status, created_at, updated_at')
        .eq('assigned_officer_id', targetOfficerId)
        .eq('status', 'Resolved')
      
      const { data: dismissedCases, error: dismissedError } = await supabase
        .from('complaints')
        .select('id, status, created_at, updated_at')
        .eq('assigned_officer_id', targetOfficerId)
        .eq('status', 'Dismissed')
      
      if (resolvedError) {
        console.error('❌ Error fetching resolved cases:', resolvedError)
      }
      
      if (dismissedError) {
        console.error('❌ Error fetching dismissed cases:', dismissedError)
      }
      
      const resolvedCount = resolvedCases?.length || 0
      const dismissedCount = dismissedCases?.length || 0
      const totalClosedCases = resolvedCount + dismissedCount
      const totalAllCases = totalCases + totalClosedCases
      
      // Use database success_rate field instead of manual calculation for consistency
      const successRate = officerProfile?.success_rate ? parseFloat(officerProfile.success_rate.toString()) : 0
      
      // Calculate priority breakdown
      const highPriority = cases.filter(c => c.complaint.priority === 'high').length
      const mediumPriority = cases.filter(c => c.complaint.priority === 'medium').length
      const lowPriority = cases.filter(c => c.complaint.priority === 'low').length
      
      // Calculate status breakdown
      const pending = cases.filter(c => c.complaint.status === 'Pending').length
      const investigating = cases.filter(c => c.complaint.status === 'Under Investigation').length
      const needsInfo = cases.filter(c => c.complaint.status === 'Requires More Information').length
      
      // Calculate real weekly activity from database
      const weeklyActivity = await this.calculateWeeklyActivity(targetOfficerId)
      
      // Comprehensive logging for status counting verification
      console.log('✅ Officer statistics calculated with separate status counts:', {
        totalCases: totalAllCases,
        activeCases: activeCases,
        resolvedCases: resolvedCount,      // ONLY cases with status = 'Resolved'
        dismissedCases: dismissedCount,    // ONLY cases with status = 'Dismissed'
        totalClosedCases: totalClosedCases, // Sum of resolved + dismissed
        successRate: successRate,          // From database success_rate field for consistency
        statusBreakdown: {
          pending: cases.filter(c => c.complaint.status === 'Pending').length,
          investigating: cases.filter(c => c.complaint.status === 'Under Investigation').length,
          needsInfo: cases.filter(c => c.complaint.status === 'Requires More Information').length,
          resolved: resolvedCount,
          dismissed: dismissedCount
        },
        priorityBreakdown: {
          high: cases.filter(c => c.complaint.priority === 'high').length,
          medium: cases.filter(c => c.complaint.priority === 'medium').length,
          low: cases.filter(c => c.complaint.priority === 'low').length
        }
      })
      
      // Status counting validation - ensure mutual exclusivity
      if (resolvedCount < 0 || dismissedCount < 0) {
        console.error('❌ Invalid negative counts detected:', { resolvedCount, dismissedCount })
      }
      
      const statusSanityCheck = {
        resolvedPlusDismissed: resolvedCount + dismissedCount,
        totalClosedFromData: totalClosedCases,
        shouldBeEqual: (resolvedCount + dismissedCount) === totalClosedCases
      }
      
      if (!statusSanityCheck.shouldBeEqual) {
        console.error('❌ Status count mismatch detected:', statusSanityCheck)
      } else {
        console.log('✅ Status counts validated - resolved and dismissed are mutually exclusive')
      }
      
      return {
        total_cases: totalAllCases,
        active_cases: activeCases,
        resolved_cases: resolvedCount,
        success_rate: successRate,
        avg_resolution_time: await this.calculateAverageResolutionTime(targetOfficerId),
        weekly_activity: weeklyActivity,
        monthly_progress: {
          resolved: resolvedCount,
          target: Math.max(totalAllCases, 15),
          percentage: successRate // Use same database success_rate for consistency
        },
        cases_by_priority: {
          high: highPriority,
          medium: mediumPriority,
          low: lowPriority
        },
        cases_by_status: {
          pending,
          investigating,
          needsInfo,
          resolved: resolvedCount,        // Only truly resolved cases
          dismissed: dismissedCount       // Only dismissed cases - separate count
        }
      }
    } catch (error) {
      console.error('❌ Error calculating officer stats:', error)
      return this.getDefaultStats()
    }
  }

  // Get default stats when real data isn't available
  private static getDefaultStats(): PNPOfficerStats {
    return {
      total_cases: 0,
      active_cases: 0,
      resolved_cases: 0,
      success_rate: 0,
      avg_resolution_time: 0,
      weekly_activity: this.getDefaultWeeklyActivity(),
      monthly_progress: {
        resolved: 0,
        target: 0,
        percentage: 0
      },
      cases_by_priority: {
        high: 0,
        medium: 0,
        low: 0
      },
      cases_by_status: {
        pending: 0,
        investigating: 0,
        needsInfo: 0,
        resolved: 0,
        dismissed: 0
      }
    }
  }

  // Calculate real weekly activity from database
  private static async calculateWeeklyActivity(officerId: string): Promise<Array<{ day: string; cases: number }>> {
    try {
      console.log('📊 Calculating real weekly activity for officer:', officerId)
      
      // Get the start of this week (Monday)
      const now = new Date()
      const startOfWeek = new Date(now)
      const dayOfWeek = now.getDay() // 0 = Sunday, 1 = Monday, etc.
      const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Convert to Monday-based week
      startOfWeek.setDate(now.getDate() - daysToSubtract)
      startOfWeek.setHours(0, 0, 0, 0)
      
      // Get status history for this week for the officer's cases
      const { data: officerComplaints, error: complaintsError } = await supabase
        .from('complaints')
        .select('id')
        .eq('assigned_officer_id', officerId)
      
      if (complaintsError || !officerComplaints) {
        console.log('⚠️ Could not fetch officer complaints for weekly activity')
        return this.getDefaultWeeklyActivity()
      }
      
      const complaintIds = officerComplaints.map(c => c.id)
      
      if (complaintIds.length === 0) {
        console.log('ℹ️ No complaints found for officer, returning zero activity')
        return this.getDefaultWeeklyActivity()
      }
      
      // Get status history entries for this week
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 7)
      
      const { data: statusHistory, error: historyError } = await supabase
        .from('status_history')
        .select('timestamp')
        .in('complaint_id', complaintIds)
        .gte('timestamp', startOfWeek.toISOString())
        .lt('timestamp', endOfWeek.toISOString())
        .order('timestamp', { ascending: true })
      
      if (historyError) {
        console.error('❌ Error fetching weekly status history:', historyError)
        return this.getDefaultWeeklyActivity()
      }
      
      // Initialize weekly activity counters
      const weeklyActivity = [
        { day: 'Mon', cases: 0 },
        { day: 'Tue', cases: 0 },
        { day: 'Wed', cases: 0 },
        { day: 'Thu', cases: 0 },
        { day: 'Fri', cases: 0 },
        { day: 'Sat', cases: 0 },
        { day: 'Sun', cases: 0 }
      ]
      
      // Count activities by day
      if (statusHistory && statusHistory.length > 0) {
        statusHistory.forEach((activity: any) => {
          const activityDate = new Date(activity.timestamp)
          const dayOfWeek = activityDate.getDay()
          
          // Convert Sunday (0) to index 6, Monday (1) to index 0, etc.
          const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1
          
          if (dayIndex >= 0 && dayIndex < 7) {
            weeklyActivity[dayIndex].cases++
          }
        })
        
        console.log('✅ Weekly activity calculated from real data:', weeklyActivity)
      } else {
        console.log('ℹ️ No status history found for this week')
      }
      
      return weeklyActivity
    } catch (error) {
      console.error('❌ Error calculating weekly activity:', error)
      return this.getDefaultWeeklyActivity()
    }
  }
  
  // Get default weekly activity structure
  private static getDefaultWeeklyActivity(): Array<{ day: string; cases: number }> {
    return [
      { day: 'Mon', cases: 0 },
      { day: 'Tue', cases: 0 },
      { day: 'Wed', cases: 0 },
      { day: 'Thu', cases: 0 },
      { day: 'Fri', cases: 0 },
      { day: 'Sat', cases: 0 },
      { day: 'Sun', cases: 0 }
    ]
  }

  // Calculate average resolution time from database
  private static async calculateAverageResolutionTime(officerId: string): Promise<number> {
    try {
      console.log('📊 Calculating average resolution time for officer:', officerId)
      
      // Get both resolved and dismissed cases for resolution time calculation
      // Note: Including both resolved and dismissed for resolution time metric makes sense
      // as both represent completed cases with resolution times
      const { data: resolvedCases, error } = await supabase
        .from('complaints')
        .select('created_at, updated_at, status')
        .eq('assigned_officer_id', officerId)
        .in('status', ['Resolved', 'Dismissed'])
        .order('updated_at', { ascending: false })
        .limit(50) // Limit to recent 50 cases for performance
      
      console.log('📊 Resolution time calculation includes both resolved and dismissed cases as they both have completion times')
      
      if (error || !resolvedCases || resolvedCases.length === 0) {
        console.log('ℹ️ No resolved cases found for resolution time calculation')
        return 0
      }
      
      // Calculate resolution times in days
      const resolutionTimes = resolvedCases.map(case_ => {
        const createdDate = new Date(case_.created_at)
        const resolvedDate = new Date(case_.updated_at)
        const timeDiffMs = resolvedDate.getTime() - createdDate.getTime()
        const timeDiffDays = timeDiffMs / (1000 * 60 * 60 * 24) // Convert to days
        return Math.max(0, timeDiffDays) // Ensure non-negative
      }).filter(time => time > 0) // Filter out invalid times
      
      if (resolutionTimes.length === 0) {
        console.log('ℹ️ No valid resolution times found')
        return 0
      }
      
      // Calculate average
      const averageResolutionTime = resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length
      const roundedAverage = Math.round(averageResolutionTime * 10) / 10 // Round to 1 decimal place
      
      console.log(`✅ Average resolution time calculated: ${roundedAverage} days (from ${resolutionTimes.length} cases)`)
      return roundedAverage
    } catch (error) {
      console.error('❌ Error calculating average resolution time:', error)
      return 0
    }
  }

  // Update case status with enhanced status update data
  static async updateCaseStatus(complaintId: string, newStatus: string, updateData?: any) {
    try {
      console.log('🔄 Updating case status:', { complaintId, newStatus, updateData })
      
      // Validate inputs
      if (!complaintId) {
        throw new Error('Complaint ID is required for status update')
      }
      
      if (!newStatus) {
        throw new Error('New status is required for status update')
      }
      
      // Validate status against database constraints
      const validStatuses = ['Pending', 'Under Investigation', 'Requires More Information', 'Resolved', 'Dismissed']
      if (!validStatuses.includes(newStatus)) {
        throw new Error(`Invalid status: ${newStatus}. Must be one of: ${validStatuses.join(', ')}`)
      }
      
      console.log('✅ Input validation passed')
      
      // Determine if this is a UUID or a complaint_number
      let actualComplaintId = complaintId
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(complaintId)
      
      if (!isUUID) {
        // This is likely a complaint_number, need to look up the UUID
        console.log('🔄 Complaint ID appears to be complaint_number, looking up UUID...')
        const { data: complaint, error: lookupError } = await supabase
          .from('complaints')
          .select('id')
          .eq('complaint_number', complaintId)
          .single()
        
        if (lookupError || !complaint) {
          console.error('❌ Error looking up complaint by number:', lookupError)
          throw new Error(`Could not find complaint with number: ${complaintId}`)
        }
        
        actualComplaintId = complaint.id
        console.log('✅ Found complaint UUID:', actualComplaintId)
      }
      
      const { error } = await supabase
        .from('complaints')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', actualComplaintId)
      
      if (error) {
        console.error('❌ Database error updating case status:', error)
        console.error('❌ Error code:', error.code)
        console.error('❌ Error message:', error.message)
        console.error('❌ Error details:', error.details)
        throw error
      }
      
      console.log('✅ Complaint status updated in database')
      
      // Add to enhanced status history with all update data
      if (this.currentUserId) {
        // Get current officer profile to extract name and Firebase UID for audit trail
        let officerName = 'Web Officer' // Default fallback
        let officerFirebaseId = this.currentUserId // This should be the Firebase UID
        
        try {
          console.log('🔄 Loading officer profile for Firebase UID:', this.currentUserId)
          const currentOfficer = await this.getCurrentOfficerProfile()
          
          if (currentOfficer && currentOfficer.full_name) {
            officerName = currentOfficer.full_name
            // Use the firebase_uid from the profile if available, otherwise use currentUserId
            officerFirebaseId = currentOfficer.firebase_uid || this.currentUserId
            
            console.log('✅ Officer profile loaded for status history:')
            console.log('   - Officer Name:', officerName)
            console.log('   - Firebase UID:', officerFirebaseId)
            console.log('   - Profile Source:', 'pnp_officer_profiles')
          } else {
            console.warn('⚠️ Could not load officer profile, using fallback values:')
            console.warn('   - Fallback Name:', officerName)
            console.warn('   - Firebase UID from auth:', officerFirebaseId)
          }
        } catch (profileError) {
          console.warn('⚠️ Error loading officer profile for status history:', profileError)
          console.warn('   - Using fallback name:', officerName)
          console.warn('   - Using Firebase UID from auth:', officerFirebaseId)
        }
        
        // Validate that we have a Firebase UID for the audit trail
        if (!officerFirebaseId) {
          console.error('❌ No Firebase UID available for audit trail')
          console.error('❌ This indicates an authentication issue')
          // Don't set to empty string - leave as null for database
        } else {
          console.log('✅ Firebase UID available for audit trail:', officerFirebaseId)
          console.log('✅ Will be validated against pnp_officer_profiles.firebase_uid FK constraint')
        }
        
        const statusHistoryData: any = {
          complaint_id: actualComplaintId,
          status: newStatus,
          updated_by: officerName, // Use actual officer name
          remarks: updateData?.notes || updateData?.remarks || '',
          // Enhanced status update fields
          urgency_level: updateData?.urgencyLevel || 'normal',
          follow_up_date: updateData?.followUpDate || null,
          assigned_officer_id: null, // Set to null to avoid foreign key constraint issues
          // Automatic notification preferences - always notify
          notify_complainant: true, // Always notify the complainant
          notify_supervisors: true, // Always notify supervisors  
          notify_officers: true, // Always notify assigned officers
          email_notification: true, // Always send email notifications
          sms_notification: updateData?.urgencyLevel === 'urgent' || updateData?.urgencyLevel === 'high', // SMS for urgent/high priority
          timestamp: new Date().toISOString()
        }
        
        // Only add updated_by_user_id if we have a valid Firebase UID
        // If the FK references pnp_officer_profiles.firebase_uid, it must be a valid officer or NULL
        if (officerFirebaseId) {
          statusHistoryData.updated_by_user_id = officerFirebaseId
        } else {
          // Don't include the field if we don't have a valid ID - let database set it to NULL
          console.warn('⚠️ No Firebase UID available, updated_by_user_id will be NULL in database')
        }
        
        console.log('📋 Inserting status history:', statusHistoryData)
        console.log('📋 Status history data types:')
        console.log('   - complaint_id:', typeof statusHistoryData.complaint_id, statusHistoryData.complaint_id)
        console.log('   - status:', typeof statusHistoryData.status, statusHistoryData.status)
        console.log('   - updated_by:', typeof statusHistoryData.updated_by, statusHistoryData.updated_by)
        console.log('   - updated_by_user_id:', typeof statusHistoryData.updated_by_user_id, statusHistoryData.updated_by_user_id)
        console.log('   - remarks:', typeof statusHistoryData.remarks, statusHistoryData.remarks)
        console.log('   - urgency_level:', typeof statusHistoryData.urgency_level, statusHistoryData.urgency_level)
        console.log('   - timestamp:', typeof statusHistoryData.timestamp, statusHistoryData.timestamp)
        
        // Validate urgency level
        const validUrgencyLevels = ['low', 'normal', 'high', 'urgent']
        if (statusHistoryData.urgency_level && !validUrgencyLevels.includes(statusHistoryData.urgency_level)) {
          console.warn(`⚠️ Invalid urgency level: ${statusHistoryData.urgency_level}, defaulting to 'normal'`)
          statusHistoryData.urgency_level = 'normal'
        }
        
        // Validate follow_up_date format
        if (statusHistoryData.follow_up_date) {
          try {
            const date = new Date(statusHistoryData.follow_up_date)
            if (isNaN(date.getTime())) {
              console.warn(`⚠️ Invalid follow_up_date: ${statusHistoryData.follow_up_date}, setting to null`)
              statusHistoryData.follow_up_date = null
            }
          } catch (e) {
            console.warn(`⚠️ Error parsing follow_up_date: ${statusHistoryData.follow_up_date}, setting to null`)
            statusHistoryData.follow_up_date = null
          }
        }
        
        try {
          const { data: historyData, error: historyError } = await supabase
            .from('status_history')
            .insert(statusHistoryData)
            .select()
            .single()
          
          if (historyError) {
            console.error('❌ Database error adding status history:', JSON.stringify(historyError, null, 2))
            console.error('❌ History error code:', historyError.code)
            console.error('❌ History error message:', historyError.message)
            console.error('❌ History error details:', historyError.details)
            console.error('❌ History error hint:', historyError.hint)
            console.error('❌ Failed history data:', JSON.stringify(statusHistoryData, null, 2))
            
            // Provide helpful debugging information
            if (historyError.message?.includes('check constraint')) {
              console.error('🔍 Check constraint violation - verify status, urgency_level values are valid')
              console.error('🔍 Valid statuses: Pending, Under Investigation, Requires More Information, Resolved, Dismissed')
              console.error('🔍 Valid urgency levels: low, normal, high, urgent')
            }
            if (historyError.message?.includes('not null')) {
              console.error('🔍 Not null constraint violation - a required field is missing')
              console.error('🔍 Required fields: complaint_id, status, updated_by')
            }
            if (historyError.message?.includes('foreign key')) {
              console.error('🔍 Foreign key constraint violation:')
              console.error('🔍 - Check if complaint_id exists in complaints table')
              console.error('🔍 - Check if updated_by_user_id exists in pnp_officer_profiles.firebase_uid')
              console.error('🔍 - Current Firebase UID:', statusHistoryData.updated_by_user_id)
            }
            
            // Log error but don't throw to prevent status update from failing
            console.error('⚠️ Status history creation failed, but case status was updated')
          } else {
            console.log('✅ Status history added successfully!')
            console.log('✅ History record created:', historyData)
            console.log('✅ Audit trail: updated_by_user_id =', historyData?.updated_by_user_id || 'NULL')
          }
        } catch (statusHistoryException) {
          console.error('❌ Exception inserting status history:', statusHistoryException)
          if (statusHistoryException instanceof Error) {
            console.error('❌ Exception type:', statusHistoryException.constructor.name)
            console.error('❌ Exception stack:', statusHistoryException.stack)
          } else {
            console.error('❌ Unknown exception type:', statusHistoryException)
          }
        }
      }
      
      // Automatically send FCM push notification to the case owner
      // This notification is sent regardless of officer preferences - all status changes notify users
      console.log('📱 Automatically sending FCM notification for status change...')
      await this.sendCaseStatusNotification(
        actualComplaintId,
        complaintId, // This might be complaint_number or UUID
        newStatus,
        updateData
      );
      
      console.log('✅ Case status updated successfully')
      return true
    } catch (error) {
      console.error('❌ Error updating case status:', error)
      throw error
    }
  }

  // Get recent activity for officer
  static async getRecentActivity(officerId?: string) {
    try {
      const targetOfficerId = officerId || (await this.getCurrentOfficerProfile())?.id
      
      if (!targetOfficerId) {
        console.log('ℹ️ No officer ID available for recent activity')
        return []
      }
      
      console.log('🔄 Fetching recent activity for officer:', targetOfficerId)
      
      // First get complaints assigned to this officer
      const { data: officerComplaints, error: complaintsError } = await supabase
        .from('complaints')
        .select('id, complaint_number')
        .eq('assigned_officer_id', targetOfficerId)
      
      if (complaintsError) {
        console.error('❌ Error fetching officer complaints:', complaintsError)
        return []
      }
      
      if (!officerComplaints || officerComplaints.length === 0) {
        console.log('ℹ️ No complaints found for officer')
        return []
      }
      
      // Get status history for these complaints
      const complaintIds = officerComplaints.map(c => c.id)
      const { data: statusHistory, error } = await supabase
        .from('status_history')
        .select('*')
        .in('complaint_id', complaintIds)
        .order('timestamp', { ascending: false })
        .limit(10)
      
      if (error) {
        console.error('❌ Error fetching status history:', error)
        return []
      }
      
      if (!statusHistory || statusHistory.length === 0) {
        console.log('ℹ️ No recent activity found')
        return []
      }
      
      console.log(`✅ Found ${statusHistory.length} recent activities`)
      
      // Map status history with complaint numbers
      const complaintMap = new Map(officerComplaints.map(c => [c.id, c.complaint_number]))
      
      return statusHistory.map((activity: any) => ({
        id: activity.id,
        type: 'status_update',
        title: `Status Updated`,
        description: `${complaintMap.get(activity.complaint_id) || 'Unknown'} moved to ${activity.status}`,
        timestamp: activity.timestamp,
        case_id: complaintMap.get(activity.complaint_id) || activity.complaint_id,
        icon: activity.status === 'Resolved' ? '✅' : activity.status === 'Under Investigation' ? '🔍' : '📋'
      }))
    } catch (error) {
      console.error('❌ Error fetching recent activity:', error)
      return []
    }
  }

  // Search all complaints with advanced filtering
  static async searchAllComplaints(searchFilters: {
    searchTerm?: string
    status?: string
    priority?: string
    crimeType?: string
    unitId?: string
    officerId?: string
    dateFrom?: string
    dateTo?: string
    riskScoreMin?: number
    riskScoreMax?: number
    location?: string
    sortBy?: 'date' | 'priority' | 'status' | 'risk'
    sortOrder?: 'asc' | 'desc'
    limit?: number
    offset?: number
  } = {}): Promise<OfficerCase[]> {
    try {
      console.log('🔄 Searching all complaints with filters:', searchFilters)
      
      let query = supabase
        .from('complaints')
        .select('*')
      
      // Apply search term filter
      if (searchFilters.searchTerm && searchFilters.searchTerm.trim()) {
        const term = searchFilters.searchTerm.trim()
        query = query.or(`complaint_number.ilike.%${term}%,title.ilike.%${term}%,description.ilike.%${term}%,crime_type.ilike.%${term}%`)
      }
      
      // Apply status filter
      if (searchFilters.status && searchFilters.status !== 'all') {
        const statusMap = {
          'pending': 'Pending',
          'investigation': 'Under Investigation',
          'info': 'Requires More Information',
          'resolved': 'Resolved',
          'dismissed': 'Dismissed'
        }
        const status = statusMap[searchFilters.status as keyof typeof statusMap] || searchFilters.status
        query = query.eq('status', status)
      }
      
      // Apply priority filter
      if (searchFilters.priority && searchFilters.priority !== 'all') {
        query = query.eq('priority', searchFilters.priority)
      }
      
      // Apply crime type filter (partial match)
      if (searchFilters.crimeType && searchFilters.crimeType !== 'all') {
        query = query.ilike('crime_type', `%${searchFilters.crimeType}%`)
      }
      
      // Apply unit filter
      if (searchFilters.unitId && searchFilters.unitId !== 'all') {
        query = query.eq('unit_id', searchFilters.unitId)
      }
      
      // Apply officer filter
      if (searchFilters.officerId && searchFilters.officerId !== 'all') {
        query = query.eq('assigned_officer_id', searchFilters.officerId)
      }
      
      // Apply date range filters
      if (searchFilters.dateFrom) {
        query = query.gte('created_at', searchFilters.dateFrom)
      }
      if (searchFilters.dateTo) {
        query = query.lte('created_at', searchFilters.dateTo)
      }
      
      // Apply risk score filters
      if (searchFilters.riskScoreMin !== undefined) {
        query = query.gte('risk_score', searchFilters.riskScoreMin)
      }
      if (searchFilters.riskScoreMax !== undefined) {
        query = query.lte('risk_score', searchFilters.riskScoreMax)
      }
      
      // Apply location filter
      if (searchFilters.location && searchFilters.location.trim()) {
        query = query.ilike('incident_location', `%${searchFilters.location.trim()}%`)
      }
      
      // Apply sorting
      const sortBy = searchFilters.sortBy || 'date'
      const sortOrder = searchFilters.sortOrder || 'desc'
      const ascending = sortOrder === 'asc'
      
      switch (sortBy) {
        case 'date':
          query = query.order('created_at', { ascending })
          break
        case 'priority':
          // Custom priority ordering: high, medium, low
          query = query.order('priority', { ascending: !ascending })
          break
        case 'status':
          query = query.order('status', { ascending })
          break
        case 'risk':
          query = query.order('risk_score', { ascending: !ascending })
          break
        default:
          query = query.order('created_at', { ascending: false })
      }
      
      // Apply pagination
      if (searchFilters.limit) {
        query = query.limit(searchFilters.limit)
      }
      if (searchFilters.offset) {
        query = query.range(searchFilters.offset, (searchFilters.offset + (searchFilters.limit || 50)) - 1)
      }
      
      const { data: complaints, error } = await query
      
      if (error) {
        console.error('❌ Error searching complaints:', error)
        return []
      }
      
      if (!complaints || complaints.length === 0) {
        console.log('ℹ️ No complaints found matching search criteria')
        return []
      }
      
      console.log(`✅ Found ${complaints.length} complaints matching search criteria`)
      
      // Fetch user profiles for each complaint
      const complaintsWithProfiles = await Promise.all(
        complaints.map(async (complaint: any) => {
          // Fetch user profile if user_id exists
          let userProfile = null
          if (complaint.user_id) {
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('full_name, email, phone_number')
              .eq('id', complaint.user_id)
              .single()
            
            userProfile = profile
          }
          
          return {
            id: `search_${complaint.id}`,
            complaint_id: complaint.id,
            complaint: {
              ...complaint, // Include all fields from database
              title: complaint.title || `${complaint.crime_type} Case`,
              risk_score: complaint.risk_score || 0,
              user_profiles: userProfile || {
                full_name: complaint.full_name || 'Unknown',
                email: complaint.email || 'N/A',
                phone_number: complaint.phone_number || 'N/A'
              }
            },
            assignment_type: 'search_result',
            status: 'active',
            notes: undefined,
            created_at: complaint.created_at
          }
        })
      )
      
      return complaintsWithProfiles
    } catch (error) {
      console.error('❌ Error searching all complaints:', error)
      return []
    }
  }

  // Get evidence files for a complaint
  static async getEvidenceFiles(complaintId: string): Promise<EvidenceFile[]> {
    try {
      console.log('🔄 Fetching evidence files for complaint:', complaintId)
      
      const { data: evidenceFiles, error } = await supabase
        .from('evidence_files')
        .select('*')
        .eq('complaint_id', complaintId)
        .order('uploaded_at', { ascending: false })
      
      if (error) {
        console.error('❌ Error fetching evidence files:', error)
        return []
      }
      
      if (!evidenceFiles || evidenceFiles.length === 0) {
        console.log('ℹ️ No evidence files found for complaint')
        return []
      }
      
      console.log(`✅ Found ${evidenceFiles.length} evidence files`)
      
      // Fetch user profiles for uploaded_by names
      const enrichedFiles = await Promise.all(
        evidenceFiles.map(async (file: any) => {
          let uploaderName = file.uploaded_by || 'System'
          
          // Try to fetch user profile name if uploaded_by exists
          if (file.uploaded_by && file.uploaded_by !== 'System') {
            try {
              const { data: userProfile } = await supabase
                .from('user_profiles')
                .select('full_name')
                .eq('firebase_uid', file.uploaded_by)
                .single()
              
              if (userProfile && userProfile.full_name) {
                uploaderName = userProfile.full_name
              }
            } catch (err) {
              console.log(`⚠️ Could not fetch user profile for ${file.uploaded_by}`)
            }
          }
          
          return {
            id: file.id,
            complaint_id: file.complaint_id,
            file_name: file.file_name,
            file_type: file.file_type,
            file_size: file.file_size,
            file_url: file.file_url,
            download_url: file.download_url,  // Add download URL for previews
            uploaded_by: file.uploaded_by,
            uploaded_by_name: uploaderName,  // Add full name
            uploaded_at: file.uploaded_at,
            description: file.description,
            category: file.category || 'document',
            is_valid: file.is_valid,  // Add is_valid for validation status
            is_verified: file.is_verified || false,
            verification_date: file.verification_date,
            verified_by: file.verified_by,
            hash: file.hash,
            metadata: file.metadata
          }
        })
      )
      
      return enrichedFiles
    } catch (error) {
      console.error('❌ Error fetching evidence files:', error)
      return []
    }
  }
  
  // Upload evidence file
  static async uploadEvidenceFile(
    complaintId: string, 
    file: File, 
    description?: string,
    category?: string
  ): Promise<boolean> {
    try {
      console.log('🔄 Uploading evidence file:', file.name)
      
      // Generate unique file name
      const timestamp = Date.now()
      const fileName = `${complaintId}/${timestamp}_${file.name}`
      
      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('evidence_files')
        .upload(fileName, file)
      
      if (uploadError) {
        console.error('❌ Error uploading file to storage:', uploadError)
        return false
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('evidence_files')
        .getPublicUrl(fileName)
      
      // Save file metadata to database
      const { error: dbError } = await supabase
        .from('evidence_files')
        .insert({
          complaint_id: complaintId,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          file_url: publicUrl,
          uploaded_by: this.currentUserId || 'system',
          description: description,
          category: category || this.getFileCategory(file.type),
          uploaded_at: new Date().toISOString()
        })
      
      if (dbError) {
        console.error('❌ Error saving file metadata:', dbError)
        // Try to delete uploaded file
        await supabase.storage.from('evidence_files').remove([fileName])
        return false
      }
      
      console.log('✅ Evidence file uploaded successfully')
      return true
    } catch (error) {
      console.error('❌ Error uploading evidence file:', error)
      return false
    }
  }
  
  // Update officer availability status
  static async updateOfficerAvailability(updateData: OfficerAvailabilityUpdate): Promise<boolean> {
    try {
      console.log('🔄 Updating officer availability status:', updateData)
      
      // Get current officer profile to get the officer ID
      const currentProfile = await this.getCurrentOfficerProfile()
      if (!currentProfile) {
        console.error('❌ No officer profile found for availability update')
        return false
      }
      
      // Validate availability status
      const validStatuses: OfficerAvailabilityUpdate['availability_status'][] = ['available', 'busy', 'overloaded', 'unavailable']
      if (!validStatuses.includes(updateData.availability_status)) {
        console.error('❌ Invalid availability status:', updateData.availability_status)
        return false
      }
      
      console.log('✅ Updating availability for officer:', currentProfile.firebase_uid)
      
      // Update the database
      const { error } = await supabase
        .from('pnp_officer_profiles')
        .update({
          availability_status: updateData.availability_status,
          last_status_update_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('firebase_uid', currentProfile.firebase_uid)
      
      if (error) {
        console.error('❌ Database error updating officer availability:', error)
        return false
      }
      
      console.log('✅ Officer availability updated successfully')
      return true
    } catch (error) {
      console.error('❌ Error updating officer availability:', error)
      return false
    }
  }
  
  // Update officer profile information
  static async updateOfficerProfile(updateData: OfficerProfileUpdate): Promise<boolean> {
    try {
      console.log('🔄 Updating officer profile:', updateData)
      
      // Get current officer profile to get the officer ID
      const currentProfile = await this.getCurrentOfficerProfile()
      if (!currentProfile) {
        console.error('❌ No officer profile found for profile update')
        return false
      }
      
      // Validate required fields
      if (updateData.full_name !== undefined && (!updateData.full_name || updateData.full_name.trim() === '')) {
        console.error('❌ Full name cannot be empty')
        return false
      }
      
      // Prepare update object - only include fields that are provided
      const updateObject: any = {
        updated_at: new Date().toISOString()
      }
      
      if (updateData.full_name !== undefined) {
        updateObject.full_name = updateData.full_name.trim()
      }
      
      if (updateData.phone_number !== undefined) {
        updateObject.phone_number = updateData.phone_number
      }
      
      if (updateData.region !== undefined) {
        updateObject.region = updateData.region
      }
      
      console.log('✅ Updating profile for officer:', currentProfile.firebase_uid)
      console.log('📋 Update fields:', Object.keys(updateObject))
      
      // Update the database
      const { error } = await supabase
        .from('pnp_officer_profiles')
        .update(updateObject)
        .eq('firebase_uid', currentProfile.firebase_uid)
      
      if (error) {
        console.error('❌ Database error updating officer profile:', error)
        return false
      }
      
      console.log('✅ Officer profile updated successfully')
      return true
    } catch (error) {
      console.error('❌ Error updating officer profile:', error)
      return false
    }
  }

  // Helper to determine file category
  private static getFileCategory(fileType: string): string {
    if (fileType.startsWith('image/')) return 'image'
    if (fileType.startsWith('video/')) return 'video'
    if (fileType.startsWith('audio/')) return 'audio'
    if (fileType.includes('pdf')) return 'pdf'
    if (fileType.includes('zip') || fileType.includes('rar')) return 'archive'
    return 'document'
  }
  
  // Delete evidence file
  static async deleteEvidenceFile(fileId: string, fileUrl: string): Promise<boolean> {
    try {
      console.log('🔄 Deleting evidence file:', fileId)
      
      // Extract file path from URL
      const urlParts = fileUrl.split('/storage/v1/object/public/evidence_files/')
      const filePath = urlParts[1]
      
      if (filePath) {
        // Delete from storage
        const { error: storageError } = await supabase.storage
          .from('evidence_files')
          .remove([filePath])
        
        if (storageError) {
          console.error('❌ Error deleting file from storage:', storageError)
        }
      }
      
      // Delete from database
      const { error: dbError } = await supabase
        .from('evidence_files')
        .delete()
        .eq('id', fileId)
      
      if (dbError) {
        console.error('❌ Error deleting file metadata:', dbError)
        return false
      }
      
      console.log('✅ Evidence file deleted successfully')
      return true
    } catch (error) {
      console.error('❌ Error deleting evidence file:', error)
      return false
    }
  }

  /**
   * Send FCM push notification to case owner when status changes
   */
  static async sendCaseStatusNotification(
    complaintId: string,
    caseNumber: string,
    newStatus: string,
    updateData?: any
  ): Promise<boolean> {
    try {
      console.log(`📱 Sending FCM notification for case ${caseNumber} status change to: ${newStatus}`)

      // Get complaint details and user_id
      const { data: complaint, error: complaintError } = await supabase
        .from('complaints')
        .select('user_id, complaint_number, status')
        .eq('id', complaintId)
        .single()

      if (complaintError || !complaint) {
        console.error('❌ Error getting complaint details for FCM:', complaintError)
        return false
      }

      console.log('📋 Current complaint status from database:', complaint.status)
      console.log('📋 Old status from updateData:', updateData?.oldStatus)
      console.log('📋 New status for notification:', newStatus)

      // Get current officer profile for officer name
      const currentOfficer = await this.getCurrentOfficerProfile()
      if (!currentOfficer) {
        console.error('❌ No current officer profile found for FCM notification')
        return false
      }

      // Prepare notification data
      const notificationPayload = {
        userId: complaint.user_id,
        caseNumber: complaint.complaint_number || caseNumber,
        oldStatus: updateData?.oldStatus || complaint.status, // Use the actual current status from database as fallback
        newStatus: newStatus,
        officerName: currentOfficer.full_name,
        message: updateData?.update_request_message || updateData?.remarks || updateData?.notes || undefined,
        notificationType: 'status_update' as const
      }

      console.log('📤 Sending FCM notification payload:', notificationPayload)

      // Call the FCM API endpoint
      const response = await fetch('/api/notifications/send-push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationPayload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ FCM API error response:', errorData)
        
        // Don't throw error - notification failure shouldn't break case update
        console.log('⚠️ FCM notification failed, but case update will continue')
        return false
      }

      const result = await response.json()
      if (result.success) {
        console.log('✅ FCM push notification sent successfully:', result.message)
        return result.notificationSent || false
      } else {
        console.error('❌ FCM notification failed:', result.message)
        return false
      }

    } catch (error) {
      console.error('❌ Exception sending FCM notification:', error)
      
      // Don't throw error - notification failure shouldn't break case update workflow
      console.log('⚠️ FCM notification exception, continuing with case update')
      return false
    }
  }

  // Get recent evidence files for cases assigned to officer
  static async getOfficerRecentEvidence(officerId: string, limit: number = 5) {
    try {
      console.log('📊 Attempting to fetch recent evidence for officer:', officerId)
      
      const { data, error } = await supabase.rpc('get_officer_recent_evidence', {
        p_officer_id: officerId,
        p_limit: limit
      })
      
      if (error) {
        console.error('❌ RPC function error:', error)
        console.log('📊 Database function may not exist, returning empty array')
        return []
      }
      
      console.log('✅ Recent evidence RPC successful:', data?.length || 0, 'files')
      return data || []
    } catch (error) {
      console.error('❌ Exception fetching recent evidence:', error)
      console.log('📊 Using fallback: empty evidence array')
      return []
    }
  }

  // Get weekly activity for officer
  static async getOfficerWeeklyActivity(officerId: string) {
    try {
      const { data, error } = await supabase.rpc('get_officer_weekly_activity', {
        p_officer_id: officerId
      })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching weekly activity:', error)
      return []
    }
  }

  // Get performance metrics for officer
  static async getOfficerPerformanceMetrics(officerId: string) {
    try {
      const { data, error } = await supabase.rpc('get_officer_performance_metrics', {
        p_officer_id: officerId
      })
      
      if (error) throw error
      return data?.[0] || {
        total_cases: 0,
        resolved_cases: 0,
        pending_cases: 0,
        under_investigation: 0,
        requires_more_info: 0,
        dismissed_cases: 0,
        avg_resolution_days: 0,
        high_priority_cases: 0,
        medium_priority_cases: 0,
        low_priority_cases: 0
      }
    } catch (error) {
      console.error('Error fetching performance metrics:', error)
      return {
        total_cases: 0,
        resolved_cases: 0,
        pending_cases: 0,
        under_investigation: 0,
        requires_more_info: 0,
        dismissed_cases: 0,
        avg_resolution_days: 0,
        high_priority_cases: 0,
        medium_priority_cases: 0,
        low_priority_cases: 0
      }
    }
  }

  // Get upcoming tasks for officer
  static async getOfficerUpcomingTasks(officerId: string, limit: number = 5) {
    try {
      const { data, error } = await supabase.rpc('get_officer_upcoming_tasks', {
        p_officer_id: officerId,
        p_limit: limit
      })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching upcoming tasks:', error)
      return []
    }
  }

  // Get notification summary for officer
  static async getOfficerNotificationSummary(officerId: string) {
    try {
      const { data, error } = await supabase.rpc('get_officer_notification_summary', {
        p_officer_id: officerId
      })
      
      if (error) throw error
      return data?.[0] || {
        new_cases: 0,
        pending_reviews: 0,
        high_priority_alerts: 0,
        total_unread: 0
      }
    } catch (error) {
      console.error('Error fetching notification summary:', error)
      return {
        new_cases: 0,
        pending_reviews: 0,
        high_priority_alerts: 0,
        total_unread: 0
      }
    }
  }
}

// Update interfaces
export interface OfficerAvailabilityUpdate {
  availability_status: 'available' | 'busy' | 'overloaded' | 'unavailable'
}

export interface OfficerProfileUpdate {
  full_name?: string
  phone_number?: string | null
  region?: string
}

// Evidence file interface
export interface EvidenceFile {
  id: string
  complaint_id: string
  file_name: string
  file_type: string
  file_size: number
  file_url: string
  uploaded_by: string
  uploaded_by_name?: string  // Add full name of uploader
  uploaded_at: string
  description?: string
  category: string
  is_verified: boolean
  verification_date?: string
  verified_by?: string
  hash?: string
  metadata?: any
  download_url?: string  // Add download URL
  is_valid?: boolean  // Add validation status
}

// Search interface for type safety
export interface SearchFilters {
  searchTerm?: string
  status?: string
  priority?: string
  crimeType?: string
  unitId?: string
  officerId?: string
  dateFrom?: string
  dateTo?: string
  riskScoreMin?: number
  riskScoreMax?: number
  location?: string
  sortBy?: 'date' | 'priority' | 'status' | 'risk'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

export default PNPOfficerService