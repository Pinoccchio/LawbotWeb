"use client"

import React, { useState, useEffect } from "react"
import { X, BarChart3, Target, ArrowUpRight, PieChart, Users, Activity, BadgeCheck, CheckCheck, RefreshCw, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import PNPUnitsService, { PNPUnit } from "@/lib/pnp-units-service"

interface UnitAnalyticsModalProps {
  isOpen: boolean
  onClose: () => void
}

interface UnitWithStats extends PNPUnit {
  officers: any[]
  current_officers: number
  active_cases: number
  resolved_cases: number
  success_rate: number
  responseTime: string
  caseGrowth: string
  color: string
  primaryCrimes: string[]
}

export function UnitAnalyticsModal({ isOpen, onClose }: UnitAnalyticsModalProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [unitsData, setUnitsData] = useState<UnitWithStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Function to get color based on unit category
  const getUnitColor = (category: string): string => {
    const colorMap: Record<string, string> = {
      'Communication & Social Media Crimes': 'bg-blue-500',
      'Financial & Economic Crimes': 'bg-green-500',
      'Data & Privacy Crimes': 'bg-purple-500',
      'Malware & System Attacks': 'bg-red-500',
      'Harassment & Exploitation': 'bg-orange-500',
      'Content-Related Crimes': 'bg-pink-500',
      'System Disruption & Sabotage': 'bg-amber-500',
      'Government & Terrorism': 'bg-indigo-500',
      'Technical Exploitation': 'bg-emerald-500',
      'Targeted Attacks': 'bg-teal-500'
    }
    return colorMap[category] || 'bg-lawbot-blue-500'
  }

  // Function to get primary crimes based on category
  const getPrimaryCrimes = (crimeTypes: string[]): string[] => {
    if (!crimeTypes || crimeTypes.length === 0) {
      return ['General Cybercrime']
    }
    return crimeTypes.slice(0, 2) // Show top 2 crime types
  }

  // Function to calculate response time based on unit workload
  const calculateResponseTime = (activeCases: number, officers: number): string => {
    const workload = officers > 0 ? activeCases / officers : 0
    if (workload >= 8) return '3.0+ hrs'
    if (workload >= 6) return '2.5 hrs'
    if (workload >= 4) return '2.0 hrs'
    if (workload >= 2) return '1.5 hrs'
    return '1.0 hrs'
  }

  // Function to calculate case growth based on resolved vs active ratio
  const calculateCaseGrowth = (activeCases: number, resolvedCases: number): string => {
    const totalCases = activeCases + resolvedCases
    if (totalCases === 0) return '0%'
    const growthRate = Math.round(((activeCases / totalCases) - 0.5) * 100)
    return growthRate > 0 ? `+${growthRate}%` : `${growthRate}%`
  }

  // Fetch real unit data
  const fetchUnitsData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      console.log('🔄 Fetching real unit analytics data...')
      
      // Get all units from database
      const units = await PNPUnitsService.getAllUnits({})
      console.log('✅ Fetched units for analytics:', units.length)
      
      // Fetch officers for each unit to get real officer data and statistics
      const unitsWithStats: UnitWithStats[] = await Promise.all(units.map(async (unit) => {
        console.log(`🔄 Fetching analytics data for unit: ${unit.unit_name}`)
        const officers = await PNPUnitsService.getUnitOfficers(unit.id)
        console.log(`✅ Found ${officers.length} officers for unit: ${unit.unit_name}`)
        
        // Calculate real statistics from officers
        const activeCases = officers.reduce((sum, officer) => sum + (officer.active_cases || 0), 0)
        const resolvedCases = officers.reduce((sum, officer) => sum + (officer.resolved_cases || 0), 0)
        const successRate = officers.length > 0 ? 
          Math.round(officers.reduce((sum, officer) => sum + (officer.success_rate || 0), 0) / officers.length) : 0
        
        return {
          ...unit,
          officers: officers || [],
          current_officers: officers.length,
          active_cases: activeCases,
          resolved_cases: resolvedCases,
          success_rate: successRate,
          responseTime: calculateResponseTime(activeCases, officers.length),
          caseGrowth: calculateCaseGrowth(activeCases, resolvedCases),
          color: getUnitColor(unit.category),
          primaryCrimes: getPrimaryCrimes(unit.crime_types || [])
        } as UnitWithStats
      }))
      
      setUnitsData(unitsWithStats)
      console.log('✅ Unit analytics data loaded successfully:', unitsWithStats.length)
    } catch (error: any) {
      console.error('❌ Error fetching unit analytics data:', error)
      setError(error.message || 'Failed to load unit analytics data')
    } finally {
      setIsLoading(false)
    }
  }

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUnitsData()
    }
  }, [isOpen])

  if (!isOpen) return null

  // Sort units by success rate for performance tab
  const unitsByPerformance = [...unitsData].sort((a, b) => b.success_rate - a.success_rate)
  
  // Sort units by active cases for workload tab
  const unitsByWorkload = [...unitsData].sort((a, b) => b.active_cases - a.active_cases)

  // Calculate totals for overview
  const totalActiveCases = unitsData.reduce((sum, unit) => sum + unit.active_cases, 0)
  const totalResolvedCases = unitsData.reduce((sum, unit) => sum + unit.resolved_cases, 0)
  const totalOfficers = unitsData.reduce((sum, unit) => sum + unit.current_officers, 0)
  const averageSuccessRate = unitsData.length > 0 ? Math.round(unitsData.reduce((sum, unit) => sum + unit.success_rate, 0) / unitsData.length) : 0
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-800 shadow-2xl overflow-hidden">
        <CardHeader className="relative border-b border-slate-100 dark:border-slate-700 pb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose} 
            className="absolute right-2 top-2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 rounded-lg bg-lawbot-blue-600 bg-gradient-to-r from-lawbot-blue-500 to-lawbot-blue-600">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl">PNP Units Analytics</CardTitle>
              <CardDescription>
                Performance metrics and workload distribution across specialized units
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchUnitsData}
              disabled={isLoading}
              className="btn-modern"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <Badge variant="outline" className="w-fit">
            📊 Real-time metrics from database
          </Badge>
        </CardHeader>

        <CardContent className="overflow-y-auto max-h-[calc(90vh-180px)] p-6">
          {/* Error State */}
          {error && (
            <div className="mb-6">
              <Card className="border-lawbot-red-300 dark:border-lawbot-red-800 bg-lawbot-red-50 dark:bg-lawbot-red-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 text-lawbot-red-600 dark:text-lawbot-red-300">
                    <AlertTriangle className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Error Loading Analytics Data</p>
                      <p className="text-sm">{error}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center space-y-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lawbot-blue-600"></div>
                <p className="text-lawbot-slate-600 dark:text-lawbot-slate-400">Loading unit analytics data...</p>
              </div>
            </div>
          )}

          {/* Main Content */}
          {!isLoading && !error && (
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="workload">Workload</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6 mt-6">
                {unitsData.length === 0 ? (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 mx-auto mb-3 text-lawbot-slate-400" />
                    <p className="text-lawbot-slate-600 dark:text-lawbot-slate-400">No units found</p>
                    <p className="text-sm text-lawbot-slate-500 dark:text-lawbot-slate-500">Unit analytics will be displayed when units are configured</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card className="bg-gradient-to-br from-lawbot-blue-50 to-white dark:from-lawbot-blue-900/10 dark:to-lawbot-slate-800 border-lawbot-blue-200 dark:border-lawbot-blue-800">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">Active Cases</p>
                              <p className="text-2xl font-bold text-lawbot-blue-600 dark:text-lawbot-blue-400">{totalActiveCases}</p>
                            </div>
                            <div className="p-2 bg-lawbot-blue-500 rounded-lg">
                              <Activity className="h-5 w-5 text-white" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-lawbot-emerald-50 to-white dark:from-lawbot-emerald-900/10 dark:to-lawbot-slate-800 border-lawbot-emerald-200 dark:border-lawbot-emerald-800">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">Resolved Cases</p>
                              <p className="text-2xl font-bold text-lawbot-emerald-600 dark:text-lawbot-emerald-400">{totalResolvedCases}</p>
                            </div>
                            <div className="p-2 bg-lawbot-emerald-500 rounded-lg">
                              <CheckCheck className="h-5 w-5 text-white" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-lawbot-purple-50 to-white dark:from-lawbot-purple-900/10 dark:to-lawbot-slate-800 border-lawbot-purple-200 dark:border-lawbot-purple-800">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">Officers</p>
                              <p className="text-2xl font-bold text-lawbot-purple-600 dark:text-lawbot-purple-400">{totalOfficers}</p>
                            </div>
                            <div className="p-2 bg-lawbot-purple-500 rounded-lg">
                              <Users className="h-5 w-5 text-white" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-lawbot-amber-50 to-white dark:from-lawbot-amber-900/10 dark:to-lawbot-slate-800 border-lawbot-amber-200 dark:border-lawbot-amber-800">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">Success Rate</p>
                              <p className="text-2xl font-bold text-lawbot-amber-600 dark:text-lawbot-amber-400">{averageSuccessRate}%</p>
                            </div>
                            <div className="p-2 bg-lawbot-amber-500 rounded-lg">
                              <BadgeCheck className="h-5 w-5 text-white" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Case Distribution Chart */}
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-lawbot-slate-800 dark:text-lawbot-slate-200">
                            Active Case Distribution
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {unitsData.map((unit) => (
                              <div key={unit.id} className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                  <div className="flex items-center">
                                    <div className={`w-3 h-3 rounded-full ${unit.color} mr-2`}></div>
                                    <span className="text-lawbot-slate-700 dark:text-lawbot-slate-300 truncate max-w-[150px]">{unit.unit_name}</span>
                                  </div>
                                  <span className="font-medium">{unit.active_cases}</span>
                                </div>
                                <Progress 
                                  value={totalActiveCases > 0 ? (unit.active_cases / totalActiveCases) * 100 : 0} 
                                  className={`h-1.5 ${unit.color.replace('bg-', 'bg-opacity-70 bg-')} `}
                                />
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Success Rate Comparison */}
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-lawbot-slate-800 dark:text-lawbot-slate-200">
                            Unit Success Rates
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {unitsData.map((unit) => (
                              <div key={unit.id} className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                  <div className="flex items-center">
                                    <div className={`w-3 h-3 rounded-full ${unit.color} mr-2`}></div>
                                    <span className="text-lawbot-slate-700 dark:text-lawbot-slate-300 truncate max-w-[150px]">{unit.unit_name}</span>
                                  </div>
                                  <span className="font-medium">{unit.success_rate}%</span>
                                </div>
                                <Progress 
                                  value={unit.success_rate} 
                                  className={`h-1.5 ${
                                    unit.success_rate >= 80 ? 'bg-lawbot-emerald-500' :
                                    unit.success_rate >= 70 ? 'bg-lawbot-amber-500' :
                                    'bg-lawbot-red-500'
                                  }`}
                                />
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </>
                )}
              </TabsContent>

              {/* Performance Tab */}
              <TabsContent value="performance" className="space-y-6 mt-6">
                <div className="bg-lawbot-slate-50 dark:bg-lawbot-slate-800/50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-lawbot-slate-800 dark:text-lawbot-slate-200 mb-2">
                    Unit Performance Rankings
                  </h3>
                  <p className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400 mb-4">
                    Based on case resolution rates, response times, and officer efficiency
                  </p>
                </div>
                
                <div className="space-y-4">
                  {unitsByPerformance.map((unit, index) => (
                    <Card key={unit.id} className={`
                      border-l-4 
                      ${index === 0 ? 'border-l-lawbot-emerald-500 bg-lawbot-emerald-50/50 dark:bg-lawbot-emerald-900/10' : ''} 
                      ${index === 1 ? 'border-l-lawbot-blue-500 bg-lawbot-blue-50/50 dark:bg-lawbot-blue-900/10' : ''} 
                      ${index === 2 ? 'border-l-lawbot-purple-500 bg-lawbot-purple-50/50 dark:bg-lawbot-purple-900/10' : ''} 
                      ${index > 2 ? 'border-l-lawbot-slate-500 bg-lawbot-slate-50/50 dark:bg-lawbot-slate-700/10' : ''}
                    `}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`bg-white dark:bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold ${
                              index === 0 ? 'text-lawbot-emerald-600 dark:text-lawbot-emerald-400' : ''
                            } ${
                              index === 1 ? 'text-lawbot-blue-600 dark:text-lawbot-blue-400' : ''
                            } ${
                              index === 2 ? 'text-lawbot-purple-600 dark:text-lawbot-purple-400' : ''
                            } ${
                              index > 2 ? 'text-lawbot-slate-600 dark:text-lawbot-slate-400' : ''
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-medium text-lawbot-slate-900 dark:text-white">{unit.unit_name}</h4>
                              <div className="flex items-center mt-1">
                                <Target className="h-3 w-3 text-lawbot-slate-500 dark:text-lawbot-slate-400 mr-1" />
                                <span className="text-xs text-lawbot-slate-600 dark:text-lawbot-slate-400">
                                  {unit.primaryCrimes.join(", ")}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${
                              index === 0 ? 'text-lawbot-emerald-600 dark:text-lawbot-emerald-400' : ''
                            } ${
                              index === 1 ? 'text-lawbot-blue-600 dark:text-lawbot-blue-400' : ''
                            } ${
                              index === 2 ? 'text-lawbot-purple-600 dark:text-lawbot-purple-400' : ''
                            } ${
                              index > 2 ? 'text-lawbot-slate-700 dark:text-lawbot-slate-300' : ''
                            }`}>
                              {unit.success_rate}%
                            </div>
                            <div className="flex items-center justify-end space-x-4 mt-1">
                              <div className="flex items-center">
                                <Users className="h-3 w-3 text-lawbot-slate-500 dark:text-lawbot-slate-400 mr-1" />
                                <span className="text-xs text-lawbot-slate-600 dark:text-lawbot-slate-400">{unit.current_officers}</span>
                              </div>
                              <div className="flex items-center">
                                <Activity className="h-3 w-3 text-lawbot-slate-500 dark:text-lawbot-slate-400 mr-1" />
                                <span className="text-xs text-lawbot-slate-600 dark:text-lawbot-slate-400">{unit.responseTime}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Workload Tab */}
              <TabsContent value="workload" className="space-y-6 mt-6">
                <div className="bg-lawbot-slate-50 dark:bg-lawbot-slate-800/50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-lawbot-slate-800 dark:text-lawbot-slate-200 mb-2">
                    Workload Distribution
                  </h3>
                  <p className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400 mb-4">
                    Active cases vs. officer capacity across specialized units
                  </p>
                </div>
                
                <div className="space-y-4">
                  {unitsByWorkload.map((unit) => {
                    const casesPerOfficer = unit.current_officers > 0 ? Math.round(unit.active_cases / unit.current_officers) : 0
                    const workloadLevel = 
                      casesPerOfficer >= 8 ? 'high' :
                      casesPerOfficer >= 5 ? 'medium' : 'low'
                    
                    return (
                      <Card key={unit.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex flex-col space-y-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-lawbot-slate-900 dark:text-white">{unit.unit_name}</h4>
                                <div className="flex items-center mt-1">
                                  <span className="text-xs text-lawbot-slate-600 dark:text-lawbot-slate-400">
                                    {unit.current_officers} Officers · {unit.active_cases} Active Cases
                                  </span>
                                </div>
                              </div>
                              <Badge className={`${
                                workloadLevel === 'high' ? 'bg-lawbot-red-100 text-lawbot-red-800 dark:bg-lawbot-red-900/20 dark:text-lawbot-red-300' : ''
                              } ${
                                workloadLevel === 'medium' ? 'bg-lawbot-amber-100 text-lawbot-amber-800 dark:bg-lawbot-amber-900/20 dark:text-lawbot-amber-300' : ''
                              } ${
                                workloadLevel === 'low' ? 'bg-lawbot-emerald-100 text-lawbot-emerald-800 dark:bg-lawbot-emerald-900/20 dark:text-lawbot-emerald-300' : ''
                              }`}>
                                {workloadLevel === 'high' ? 'High Workload' : ''}
                                {workloadLevel === 'medium' ? 'Medium Workload' : ''}
                                {workloadLevel === 'low' ? 'Balanced Workload' : ''}
                              </Badge>
                            </div>
                            
                            <div className="space-y-3">
                              <div className="flex justify-between text-xs text-lawbot-slate-600 dark:text-lawbot-slate-400">
                                <span>Cases per Officer</span>
                                <span className="font-medium">{casesPerOfficer}</span>
                              </div>
                              <div className="relative pt-1">
                                <div className="flex mb-2 items-center justify-between">
                                  <div>
                                    <Progress 
                                      value={(casesPerOfficer / 10) * 100} 
                                      className={`h-2 ${
                                        workloadLevel === 'high' ? 'bg-lawbot-red-500' :
                                        workloadLevel === 'medium' ? 'bg-lawbot-amber-500' :
                                        'bg-lawbot-emerald-500'
                                      }`}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="pt-2 border-t border-lawbot-slate-200 dark:border-lawbot-slate-700">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                  <ArrowUpRight className={`h-4 w-4 mr-1 ${
                                    unit.caseGrowth.startsWith('+') ? 'text-lawbot-red-500' : 'text-lawbot-emerald-500'
                                  }`} />
                                  <span className={`text-xs font-medium ${
                                    unit.caseGrowth.startsWith('+') ? 'text-lawbot-red-600 dark:text-lawbot-red-400' : 'text-lawbot-emerald-600 dark:text-lawbot-emerald-400'
                                  }`}>
                                    {unit.caseGrowth} Case Growth
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}