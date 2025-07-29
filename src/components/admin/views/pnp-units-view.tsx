"use client"

import { useState, useEffect } from "react"
import { Shield, Users, BarChart3, Plus, Edit, Activity, Target, TrendingUp, Award } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { UnitAnalyticsModal } from "../modals/unit-analytics-modal"
import { CreateUnitModal } from "../modals/create-unit-modal"
import { EditUnitModal } from "../modals/edit-unit-modal"
import PNPUnitsService, { PNPUnit } from "@/lib/pnp-units-service"

export function PNPUnitsView() {
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false)
  const [isCreateUnitModalOpen, setIsCreateUnitModalOpen] = useState(false)
  const [isEditUnitModalOpen, setIsEditUnitModalOpen] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState<PNPUnit | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pnpUnits, setPnpUnits] = useState<PNPUnit[]>([])
  const [stats, setStats] = useState({
    totalUnits: 0,
    totalOfficers: 0,
    activeCases: 0,
    resolutionRate: 0
  })
  
  // Function to fetch PNP units from database
  const fetchPNPUnits = async () => {
    setIsLoading(true)
    try {
      // Get all units from database regardless of status
      // Pass null instead of undefined to ensure the status filter is not applied
      const units = await PNPUnitsService.getAllUnits({ status: null })
      setPnpUnits(units)
      
      // Calculate statistics
      let totalOfficers = 0
      let totalActiveCases = 0
      let totalResolvedCases = 0
      
      units.forEach(unit => {
        totalOfficers += unit.current_officers || 0
        totalActiveCases += unit.active_cases || 0
        totalResolvedCases += unit.resolved_cases || 0
      })
      
      const totalCases = totalActiveCases + totalResolvedCases
      const resolutionRate = totalCases > 0 ? Math.round((totalResolvedCases / totalCases) * 100) : 0
      
      setStats({
        totalUnits: units.length,
        totalOfficers,
        activeCases: totalActiveCases,
        resolutionRate
      })
    } catch (error) {
      console.error('Error fetching PNP units:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Fetch data when component mounts or when modals close
  useEffect(() => {
    fetchPNPUnits()
  }, [isCreateUnitModalOpen, isEditUnitModalOpen]) // Refetch when modal closes after creation
  
  // No longer using mock data for non-configured units

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-lawbot-emerald-600 to-lawbot-blue-600 bg-clip-text text-transparent">
            PNP Units Management
          </h2>
          <p className="text-lawbot-slate-600 dark:text-lawbot-slate-400 text-lg mt-2">
            Manage specialized cybercrime investigation units and officer assignments
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            className="btn-modern" 
            onClick={() => setIsAnalyticsModalOpen(true)}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button 
            className="btn-gradient"
            onClick={() => setIsCreateUnitModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Unit
          </Button>
        </div>
      </div>

      {/* Enhanced Unit Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <Card className="stats-card bg-gradient-to-br from-lawbot-blue-50 to-white dark:from-lawbot-blue-900/10 dark:to-lawbot-slate-800 border-lawbot-blue-200 dark:border-lawbot-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">Total Units</p>
                <p className="text-3xl font-bold text-lawbot-blue-600 dark:text-lawbot-blue-400">{stats.totalUnits}</p>
                <p className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400 mt-1">Specialized cybercrime units</p>
              </div>
              <div className="p-3 bg-lawbot-blue-500 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card bg-gradient-to-br from-lawbot-emerald-50 to-white dark:from-lawbot-emerald-900/10 dark:to-lawbot-slate-800 border-lawbot-emerald-200 dark:border-lawbot-emerald-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">Total Officers</p>
                <p className="text-3xl font-bold text-lawbot-emerald-600 dark:text-lawbot-emerald-400">{stats.totalOfficers}</p>
                <p className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400 mt-1">Active investigators</p>
              </div>
              <div className="p-3 bg-lawbot-emerald-500 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card bg-gradient-to-br from-lawbot-amber-50 to-white dark:from-lawbot-amber-900/10 dark:to-lawbot-slate-800 border-lawbot-amber-200 dark:border-lawbot-amber-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">Active Cases</p>
                <p className="text-3xl font-bold text-lawbot-amber-600 dark:text-lawbot-amber-400">{stats.activeCases}</p>
                <p className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400 mt-1">Currently under investigation</p>
              </div>
              <div className="p-3 bg-lawbot-amber-500 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card bg-gradient-to-br from-lawbot-purple-50 to-white dark:from-lawbot-purple-900/10 dark:to-lawbot-slate-800 border-lawbot-purple-200 dark:border-lawbot-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">Resolution Rate</p>
                <p className="text-3xl font-bold text-lawbot-purple-600 dark:text-lawbot-purple-400">{stats.resolutionRate}%</p>
                <p className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400 mt-1">Average across all units</p>
              </div>
              <div className="p-3 bg-lawbot-purple-500 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lawbot-blue-600"></div>
            <p className="mt-4 text-lawbot-slate-600 dark:text-lawbot-slate-400">Loading PNP units...</p>
          </div>
        </div>
      )}
      
      {/* Enhanced Units Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pnpUnits.map((unit, index) => {
            const totalCases = (unit.resolved_cases || 0) + (unit.active_cases || 0)
            const successRate = totalCases > 0 ? Math.round(((unit.resolved_cases || 0) / totalCases) * 100) : 0
            
            // Determine color based on unit category
            const unitColors: Record<string, string> = {
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
            const unitColor = unitColors[unit.category] || 'bg-lawbot-blue-500'
            
            return (
              <Card key={unit.id} className="card-modern hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${(index + 4) * 100}ms` }}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-xl ${unitColor} shadow-lg animate-pulse`}></div>
                      <div>
                        <div className="flex items-start justify-between mb-1">
                          <CardTitle className="text-lg font-bold text-lawbot-slate-900 dark:text-white">{unit.unit_name}</CardTitle>
                          <Badge className="bg-gradient-to-r from-lawbot-blue-50 to-lawbot-blue-100 text-lawbot-blue-700 border border-lawbot-blue-200 dark:from-lawbot-blue-950/20 dark:to-lawbot-blue-900/30 dark:text-lawbot-blue-300 dark:border-lawbot-blue-800 font-mono ml-2 shadow-sm">
                            {unit.unit_code}
                          </Badge>
                        </div>
                        <div className="flex items-center mt-1 bg-gradient-to-r from-lawbot-blue-50 to-lawbot-blue-100/30 dark:from-lawbot-blue-950/20 dark:to-lawbot-blue-900/10 px-2 py-1 rounded-md">
                          <span className="mr-1.5">📍</span>
                          <CardDescription className="font-medium text-lawbot-blue-700 dark:text-lawbot-blue-400 truncate">
                            {unit.category}
                          </CardDescription>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge className="bg-gradient-to-r from-lawbot-blue-50 to-lawbot-blue-100/50 text-lawbot-blue-700 border border-lawbot-blue-200 dark:from-lawbot-blue-950/20 dark:to-lawbot-blue-900/20 dark:text-lawbot-blue-300 dark:border-lawbot-blue-800">
                            <span className="mr-1">🏢</span>
                            {unit.region}
                          </Badge>
                          
                          {unit.status === 'active' && (
                            <Badge className="bg-gradient-to-r from-lawbot-blue-50 to-lawbot-blue-100 text-lawbot-blue-700 border border-lawbot-blue-200 dark:from-lawbot-blue-950/20 dark:to-lawbot-blue-900/30 dark:text-lawbot-blue-300 dark:border-lawbot-blue-800">
                              <span className="mr-1">✅</span>
                              Active
                            </Badge>
                          )}
                          
                          {unit.status === 'inactive' && (
                            <Badge className="bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-700 border border-yellow-200 dark:from-yellow-950/20 dark:to-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800">
                              <span className="mr-1">⚠️</span>
                              Inactive
                            </Badge>
                          )}
                          
                          {unit.status === 'disbanded' && (
                            <Badge className="bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200 dark:from-red-950/20 dark:to-red-900/30 dark:text-red-300 dark:border-red-800">
                              <span className="mr-1">🚫</span>
                              Disbanded
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="btn-icon hover:bg-lawbot-blue-50 dark:hover:bg-lawbot-blue-900/20"
                      onClick={() => {
                        setSelectedUnit(unit)
                        setIsEditUnitModalOpen(true)
                      }}
                    >
                      <Edit className="h-4 w-4 text-lawbot-blue-500" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Enhanced Unit Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-lawbot-slate-50 dark:bg-lawbot-slate-800 rounded-lg">
                        <div className="text-2xl font-bold text-lawbot-blue-600 dark:text-lawbot-blue-400">{unit.current_officers || 0}</div>
                        <div className="text-xs text-lawbot-slate-600 dark:text-lawbot-slate-400 font-medium">👮 Officers</div>
                      </div>
                      <div className="text-center p-3 bg-lawbot-amber-50 dark:bg-lawbot-amber-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-lawbot-amber-600 dark:text-lawbot-amber-400">{unit.active_cases || 0}</div>
                        <div className="text-xs text-lawbot-slate-600 dark:text-lawbot-slate-400 font-medium">🔍 Active</div>
                      </div>
                      <div className="text-center p-3 bg-lawbot-emerald-50 dark:bg-lawbot-emerald-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-lawbot-emerald-600 dark:text-lawbot-emerald-400">{unit.resolved_cases || 0}</div>
                        <div className="text-xs text-lawbot-slate-600 dark:text-lawbot-slate-400 font-medium">✅ Resolved</div>
                      </div>
                    </div>

                    {/* Enhanced Crime Types */}
                    <div>
                      <h4 className="font-semibold text-sm mb-3 text-lawbot-slate-700 dark:text-lawbot-slate-300 flex items-center">
                        <Target className="h-4 w-4 mr-2 text-lawbot-purple-500" />
                        Specialized Crime Types:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {(unit.crime_types || []).map((crime, index) => (
                          <Badge key={index} className="bg-gradient-to-r from-lawbot-purple-50 to-lawbot-purple-100 text-lawbot-purple-700 border border-lawbot-purple-200 dark:from-lawbot-purple-900/20 dark:to-lawbot-purple-800/20 dark:text-lawbot-purple-300 dark:border-lawbot-purple-800 text-xs font-medium">
                            {crime}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Enhanced Officers Display */}
                    <div>
                      <h4 className="font-semibold text-sm mb-3 text-lawbot-slate-700 dark:text-lawbot-slate-300 flex items-center">
                        <Users className="h-4 w-4 mr-2 text-lawbot-emerald-500" />
                        Unit Officers:
                      </h4>
                      <div className="flex items-center space-x-2">
                        <div className="flex -space-x-2">
                          {Array.from({ length: Math.min(unit.current_officers || 0, 5) }).map((_, index) => (
                            <Avatar key={index} className="h-8 w-8 border-2 border-white dark:border-lawbot-slate-800 ring-2 ring-lawbot-blue-200 dark:ring-lawbot-blue-800">
                              <AvatarFallback className="text-xs bg-gradient-to-r from-lawbot-blue-500 to-lawbot-blue-600 text-white font-bold">
                                {String.fromCharCode(65 + index)}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {(unit.current_officers || 0) > 5 && (
                            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-lawbot-slate-100 to-lawbot-slate-200 dark:from-lawbot-slate-700 dark:to-lawbot-slate-600 border-2 border-white dark:border-lawbot-slate-800 flex items-center justify-center ring-2 ring-lawbot-blue-200 dark:ring-lawbot-blue-800">
                              <span className="text-xs text-lawbot-slate-600 dark:text-lawbot-slate-300 font-bold">+{(unit.current_officers || 0) - 5}</span>
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400">total officers</div>
                      </div>
                    </div>

                    {/* Enhanced Performance Section */}
                    <div className="pt-4 border-t border-lawbot-slate-200 dark:border-lawbot-slate-700">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-lawbot-slate-700 dark:text-lawbot-slate-300 flex items-center">
                          <Award className="h-4 w-4 mr-2 text-lawbot-amber-500" />
                          Success Rate
                        </span>
                        <span className={`text-lg font-bold ${
                          successRate >= 80 ? 'text-lawbot-emerald-600' :
                          successRate >= 60 ? 'text-lawbot-amber-600' :
                          'text-lawbot-red-600'
                        }`}>
                          {successRate}%
                        </span>
                      </div>
                      <div className="w-full bg-lawbot-slate-200 dark:bg-lawbot-slate-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            successRate >= 80 ? 'bg-gradient-to-r from-lawbot-emerald-500 to-lawbot-emerald-600' :
                            successRate >= 60 ? 'bg-gradient-to-r from-lawbot-amber-500 to-lawbot-amber-600' :
                            'bg-gradient-to-r from-lawbot-red-500 to-lawbot-red-600'
                          }`}
                          style={{ width: `${successRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
          
          {/* No units message */}
          {!isLoading && pnpUnits.length === 0 && (
            <div className="col-span-2 p-6 bg-lawbot-slate-50 dark:bg-lawbot-slate-800/50 rounded-lg border border-lawbot-slate-200 dark:border-lawbot-slate-700 text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 text-lawbot-slate-400" />
              <h3 className="text-lg font-medium text-lawbot-slate-900 dark:text-white mb-2">No Units Configured</h3>
              <p className="text-lawbot-slate-600 dark:text-lawbot-slate-400 mb-6">There are no PNP units configured in the system yet. Create your first unit to get started.</p>
              <Button 
                className="btn-gradient"
                onClick={() => setIsCreateUnitModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Unit
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Additional Units section removed as requested */}

      {/* Modals */}
      <UnitAnalyticsModal 
        isOpen={isAnalyticsModalOpen} 
        onClose={() => setIsAnalyticsModalOpen(false)} 
      />
      <CreateUnitModal 
        isOpen={isCreateUnitModalOpen} 
        onClose={() => setIsCreateUnitModalOpen(false)} 
        onSuccess={() => {
          // Close modal and trigger refresh of data
          setIsCreateUnitModalOpen(false)
          fetchPNPUnits() // Immediately fetch updated data
        }} 
      />
      <EditUnitModal
        isOpen={isEditUnitModalOpen}
        onClose={() => {
          setIsEditUnitModalOpen(false)
          setSelectedUnit(null)
        }}
        onSuccess={() => {
          // Close modal and trigger refresh of data
          setIsEditUnitModalOpen(false)
          setSelectedUnit(null)
          fetchPNPUnits() // Immediately fetch updated data
        }}
        unit={selectedUnit}
      />
    </div>
  )
}