"use client"

import { useState, useEffect } from 'react'
import { 
  LandingDataService, 
  LandingPageStats, 
  CrimeTypeStats, 
  PNPUnitInfo, 
  AIPerformanceStats,
  SystemHealthStatus 
} from '@/lib/landing-data-service'

interface UseLandingDataReturn {
  stats: LandingPageStats | null
  crimeTypes: CrimeTypeStats[]
  pnpUnits: PNPUnitInfo[]
  aiPerformance: AIPerformanceStats | null
  systemHealth: SystemHealthStatus | null
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useLandingData(): UseLandingDataReturn {
  const [stats, setStats] = useState<LandingPageStats | null>(null)
  const [crimeTypes, setCrimeTypes] = useState<CrimeTypeStats[]>([])
  const [pnpUnits, setPNPUnits] = useState<PNPUnitInfo[]>([])
  const [aiPerformance, setAIPerformance] = useState<AIPerformanceStats | null>(null)
  const [systemHealth, setSystemHealth] = useState<SystemHealthStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const dataService = LandingDataService.getInstance()
      
      // Load all data in parallel
      const [
        statsData,
        crimeTypesData,
        unitsData,
        aiData,
        healthData
      ] = await Promise.all([
        dataService.getLandingPageStats(),
        dataService.getCrimeTypeStats(),
        dataService.getPNPUnits(),
        dataService.getAIPerformanceStats(),
        dataService.getSystemHealth()
      ])
      
      setStats(statsData)
      setCrimeTypes(crimeTypesData)
      setPNPUnits(unitsData)
      setAIPerformance(aiData)
      setSystemHealth(healthData)
      
    } catch (err) {
      console.error('Error loading landing page data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const refresh = () => {
    // Clear cache and reload
    const dataService = LandingDataService.getInstance()
    dataService.clearCache()
    loadData()
  }

  useEffect(() => {
    loadData()
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      loadData()
    }, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  return {
    stats,
    crimeTypes,
    pnpUnits,
    aiPerformance,
    systemHealth,
    loading,
    error,
    refresh
  }
}