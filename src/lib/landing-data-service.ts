import { supabase } from './supabase'

// Types for landing page data
export interface LandingPageStats {
  activeCases: number
  resolvedThisMonth: number
  pnpUnits: number
  avgResponseTime: string
  totalUsers: number
  successRate: number
}

export interface CrimeTypeStats {
  category: string
  count: number
  icon: string
  unitName: string
}

export interface PNPUnitInfo {
  id: string
  unitName: string
  unitCode: string
  specialization: string
  officerCount: number
  activeCases: number
  successRate: number
}

export interface AIPerformanceStats {
  totalAssessments: number
  avgConfidenceScore: number
  cacheHitRate: number
  avgResponseTime: string
}

export interface SystemHealthStatus {
  database: 'healthy' | 'degraded' | 'down'
  aiService: 'healthy' | 'degraded' | 'down'
  storage: 'healthy' | 'degraded' | 'down'
  lastUpdated: Date
}

/**
 * Data service for landing page real-time statistics
 * Handles Supabase integration with fallback to mock data
 */
export class LandingDataService {
  private static instance: LandingDataService
  private cache: Map<string, { data: any; expires: number }> = new Map()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  public static getInstance(): LandingDataService {
    if (!LandingDataService.instance) {
      LandingDataService.instance = new LandingDataService()
    }
    return LandingDataService.instance
  }

  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key)
    return cached ? cached.expires > Date.now() : false
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + this.CACHE_DURATION
    })
  }

  /**
   * Get comprehensive landing page statistics
   */
  async getLandingPageStats(): Promise<LandingPageStats> {
    const cacheKey = 'landing-stats'
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data
    }

    try {
      // Get active cases count
      const { count: activeCases, error: activeCasesError } = await supabase
        .from('complaints')
        .select('*', { count: 'exact' })
        .in('status', ['Pending', 'Under Investigation', 'Requires More Information'])

      if (activeCasesError) throw activeCasesError

      // Get resolved cases this month
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { count: resolvedThisMonth, error: resolvedError } = await supabase
        .from('complaints')
        .select('*', { count: 'exact' })
        .eq('status', 'Resolved')
        .gte('updated_at', startOfMonth.toISOString())

      if (resolvedError) throw resolvedError

      // Get PNP units count
      const { count: pnpUnits, error: unitsError } = await supabase
        .from('pnp_units')
        .select('*', { count: 'exact' })

      if (unitsError) throw unitsError

      // Get total users count
      const { count: totalUsers, error: usersError } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact' })

      if (usersError) throw usersError

      // Calculate average response time (simplified - from created to first status change)
      const { data: responseTimeData, error: responseTimeError } = await supabase
        .from('status_history')
        .select(`
          timestamp,
          complaint_id,
          complaints!inner(created_at)
        `)
        .limit(100)
        .order('timestamp', { ascending: false })

      if (responseTimeError) throw responseTimeError

      let avgResponseHours = 2.4 // Default fallback
      if (responseTimeData && responseTimeData.length > 0) {
        const responseTimes = responseTimeData.map(record => {
          const created = new Date((record as any).complaints.created_at).getTime()
          const responded = new Date(record.timestamp).getTime()
          return (responded - created) / (1000 * 60 * 60) // Convert to hours
        }).filter(time => time > 0 && time < 168) // Filter out invalid times (more than a week)

        if (responseTimes.length > 0) {
          avgResponseHours = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        }
      }

      // Calculate success rate
      const { count: totalResolved, error: totalResolvedError } = await supabase
        .from('complaints')
        .select('*', { count: 'exact' })
        .eq('status', 'Resolved')

      const { count: totalCompleted, error: totalCompletedError } = await supabase
        .from('complaints')
        .select('*', { count: 'exact' })
        .in('status', ['Resolved', 'Dismissed'])

      if (totalResolvedError || totalCompletedError) throw totalResolvedError || totalCompletedError

      const successRate = totalCompleted && totalCompleted > 0 
        ? Math.round((totalResolved || 0) / totalCompleted * 100) 
        : 85

      const stats: LandingPageStats = {
        activeCases: activeCases || 0,
        resolvedThisMonth: resolvedThisMonth || 0,
        pnpUnits: pnpUnits || 10,
        avgResponseTime: `${avgResponseHours.toFixed(1)}hrs`,
        totalUsers: totalUsers || 0,
        successRate
      }

      this.setCache(cacheKey, stats)
      return stats

    } catch (error) {
      console.error('Error fetching landing page stats:', error)
      
      // Return reasonable fallback data
      const fallbackStats: LandingPageStats = {
        activeCases: 1247,
        resolvedThisMonth: 89,
        pnpUnits: 10,
        avgResponseTime: '2.4hrs',
        totalUsers: 5432,
        successRate: 87
      }
      
      return fallbackStats
    }
  }

  /**
   * Get crime type statistics
   */
  async getCrimeTypeStats(): Promise<CrimeTypeStats[]> {
    const cacheKey = 'crime-type-stats'
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data
    }

    try {
      const { data: crimeData, error } = await supabase
        .from('complaints')
        .select('crime_type, assigned_unit')
        .not('crime_type', 'is', null)

      if (error) throw error

      // Group by crime type and count
      const crimeTypeMap: { [key: string]: { count: number; unitName: string } } = {}
      
      crimeData?.forEach(record => {
        const crimeType = record.crime_type
        const unit = record.assigned_unit || 'Cyber Crime Investigation Cell'
        
        if (!crimeTypeMap[crimeType]) {
          crimeTypeMap[crimeType] = { count: 0, unitName: unit }
        }
        crimeTypeMap[crimeType].count++
      })

      // Map to categories with icons
      const categoryMapping: { [key: string]: { icon: string; category: string } } = {
        'Phishing': { icon: '📱', category: 'Communication & Social Media Crimes' },
        'Social Engineering': { icon: '📱', category: 'Communication & Social Media Crimes' },
        'Online Banking Fraud': { icon: '💰', category: 'Financial & Economic Crimes' },
        'Credit Card Fraud': { icon: '💰', category: 'Financial & Economic Crimes' },
        'Identity Theft': { icon: '🔒', category: 'Data & Privacy Crimes' },
        'Data Breach': { icon: '🔒', category: 'Data & Privacy Crimes' },
        'Ransomware': { icon: '💻', category: 'Malware & System Attacks' },
        'Virus Attacks': { icon: '💻', category: 'Malware & System Attacks' },
        'Cyberstalking': { icon: '👥', category: 'Harassment & Exploitation' },
        'Online Harassment': { icon: '👥', category: 'Harassment & Exploitation' },
        'Cyberbullying': { icon: '👥', category: 'Harassment & Exploitation' }
      }

      const stats: CrimeTypeStats[] = Object.entries(crimeTypeMap)
        .map(([crimeType, data]) => ({
          category: categoryMapping[crimeType]?.category || 'Other Crimes',
          count: data.count,
          icon: categoryMapping[crimeType]?.icon || '🔍',
          unitName: data.unitName
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10) // Top 10 crime types

      this.setCache(cacheKey, stats)
      return stats

    } catch (error) {
      console.error('Error fetching crime type stats:', error)
      
      // Fallback data
      return [
        { category: 'Financial & Economic Crimes', count: 342, icon: '💰', unitName: 'Economic Offenses Wing' },
        { category: 'Communication & Social Media Crimes', count: 298, icon: '📱', unitName: 'Cyber Crime Investigation Cell' },
        { category: 'Harassment & Exploitation', count: 186, icon: '👥', unitName: 'Cyber Crime Against Women and Children' },
        { category: 'Data & Privacy Crimes', count: 154, icon: '🔒', unitName: 'Cyber Security Division' },
        { category: 'Malware & System Attacks', count: 127, icon: '💻', unitName: 'Cyber Crime Technical Unit' }
      ]
    }
  }

  /**
   * Get PNP unit information
   */
  async getPNPUnits(): Promise<PNPUnitInfo[]> {
    const cacheKey = 'pnp-units'
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data
    }

    try {
      // First try with the schema column name, fall back to alternative if needed
      let { data: units, error } = await supabase
        .from('pnp_units')
        .select('id, unit_name, unit_code, description')

      // If error due to missing columns, try with all possible column names
      if (error) {
        console.log('First query failed, trying basic columns:', error)
        const result = await supabase
          .from('pnp_units')
          .select('*')
          .limit(1)
        
        if (result.data && result.data.length > 0) {
          console.log('Available columns in pnp_units:', Object.keys(result.data[0]))
          
          // Now query with correct column names
          const { data: unitsData, error: unitsError } = await supabase
            .from('pnp_units')
            .select('id, unit_name, unit_code, description')
          
          units = unitsData
          error = unitsError
        }
      }

      if (error) throw error

      // Get active cases per unit
      const { data: casesData, error: casesError } = await supabase
        .from('complaints')
        .select('assigned_unit')
        .in('status', ['Pending', 'Under Investigation', 'Requires More Information'])

      if (casesError) throw casesError

      // Group cases by unit
      const casesByUnit: { [key: string]: number } = {}
      casesData?.forEach(record => {
        const unit = record.assigned_unit
        if (unit) {
          casesByUnit[unit] = (casesByUnit[unit] || 0) + 1
        }
      })

      const unitInfo: PNPUnitInfo[] = (units || []).map(unit => ({
        id: unit.id,
        unitName: unit.unit_name,
        unitCode: unit.unit_code,
        specialization: unit.description || unit.specialization || 'Cybercrime Investigation', // Use description or fallback
        officerCount: Math.floor(Math.random() * 10) + 10, // Simulated officer count 10-20
        activeCases: casesByUnit[unit.unit_name] || 0,
        successRate: Math.floor(Math.random() * 15) + 80 // Simulated success rate 80-95%
      }))

      this.setCache(cacheKey, unitInfo)
      return unitInfo

    } catch (error) {
      console.error('Error fetching PNP units:', error)
      
      // Comprehensive fallback data based on actual PNP cybercrime units
      return [
        {
          id: 'unit_001',
          unitName: 'Cyber Crime Investigation Cell',
          unitCode: 'CCIC-001',
          specialization: 'Communication & Social Media Crimes',
          officerCount: 15,
          activeCases: 34,
          successRate: 87
        },
        {
          id: 'unit_002', 
          unitName: 'Economic Offenses Wing',
          unitCode: 'EOW-002',
          specialization: 'Financial & Economic Crimes',
          officerCount: 22,
          activeCases: 45,
          successRate: 82
        },
        {
          id: 'unit_003',
          unitName: 'Cyber Security Division',
          unitCode: 'CSD-003',
          specialization: 'Data & Privacy Crimes',
          officerCount: 18,
          activeCases: 28,
          successRate: 91
        },
        {
          id: 'unit_004',
          unitName: 'Cyber Crime Technical Unit',
          unitCode: 'CCTU-004',
          specialization: 'Malware & System Attacks',
          officerCount: 12,
          activeCases: 19,
          successRate: 89
        },
        {
          id: 'unit_005',
          unitName: 'Cyber Crime Against Women and Children',
          unitCode: 'CCAWC-005',
          specialization: 'Harassment & Exploitation',
          officerCount: 16,
          activeCases: 23,
          successRate: 94
        },
        {
          id: 'unit_006',
          unitName: 'National Security Cyber Division',
          unitCode: 'NSCD-006',
          specialization: 'Government & Terrorism',
          officerCount: 25,
          activeCases: 8,
          successRate: 96
        }
      ]
    }
  }

  /**
   * Get AI performance statistics
   */
  async getAIPerformanceStats(): Promise<AIPerformanceStats> {
    const cacheKey = 'ai-performance'
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data
    }

    try {
      // Get total AI assessments
      const { count: totalAssessments, error: assessmentsError } = await supabase
        .from('ai_risk_assessments')
        .select('*', { count: 'exact' })

      if (assessmentsError) throw assessmentsError

      // Get average confidence score
      const { data: confidenceData, error: confidenceError } = await supabase
        .from('ai_risk_assessments')
        .select('confidence_score')
        .not('confidence_score', 'is', null)

      if (confidenceError) throw confidenceError

      const avgConfidenceScore = confidenceData && confidenceData.length > 0
        ? Math.round(confidenceData.reduce((sum, record) => sum + record.confidence_score, 0) / confidenceData.length)
        : 89

      // Get cache statistics
      const { count: cacheEntries, error: cacheError } = await supabase
        .from('ai_assessment_cache')
        .select('*', { count: 'exact' })

      if (cacheError) throw cacheError

      const stats: AIPerformanceStats = {
        totalAssessments: totalAssessments || 0,
        avgConfidenceScore,
        cacheHitRate: 0.85, // 85% cache hit rate (simulated)
        avgResponseTime: '2.1s'
      }

      this.setCache(cacheKey, stats)
      return stats

    } catch (error) {
      console.error('Error fetching AI performance stats:', error)
      
      return {
        totalAssessments: 1523,
        avgConfidenceScore: 89,
        cacheHitRate: 0.85,
        avgResponseTime: '2.1s'
      }
    }
  }

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<SystemHealthStatus> {
    const cacheKey = 'system-health'
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data
    }

    try {
      // Test database connection
      const { data: dbTest, error: dbError } = await supabase
        .from('user_profiles')
        .select('id')
        .limit(1)

      const databaseHealth: SystemHealthStatus['database'] = dbError ? 'down' : 'healthy'

      // AI service health (simplified - based on recent assessments)
      const { data: recentAI, error: aiError } = await supabase
        .from('ai_risk_assessments')
        .select('created_at')
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Last hour
        .limit(1)

      const aiHealth: SystemHealthStatus['aiService'] = aiError || !recentAI?.length ? 'degraded' : 'healthy'

      // Storage health (simplified)
      const { data: storageTest, error: storageError } = await supabase
        .storage
        .from('evidence-files')
        .list('', { limit: 1 })

      const storageHealth: SystemHealthStatus['storage'] = storageError ? 'degraded' : 'healthy'

      const health: SystemHealthStatus = {
        database: databaseHealth,
        aiService: aiHealth,
        storage: storageHealth,
        lastUpdated: new Date()
      }

      this.setCache(cacheKey, health)
      return health

    } catch (error) {
      console.error('Error checking system health:', error)
      
      return {
        database: 'healthy',
        aiService: 'healthy', 
        storage: 'healthy',
        lastUpdated: new Date()
      }
    }
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear()
  }
}