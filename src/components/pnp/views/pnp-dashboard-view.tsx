"use client"

import { useState, useEffect } from "react"
import { FileText, Clock, CheckCircle, BarChart3, Calendar, AlertTriangle, Eye, UserPlus, AlertCircle, Shield, Target, Activity, Award, TrendingUp, Building2, Users, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CaseDetailModal } from "@/components/modals/case-detail-modal"
import { StatusUpdateModal } from "@/components/modals/status-update-modal"
import { EvidenceViewerModal } from "@/components/modals/evidence-viewer-modal"
import { mockCases } from "@/lib/mock-data"
import { PNPOfficerService, PNPOfficerProfile } from "@/lib/pnp-officer-service"
import { getPriorityColor, getStatusColor } from "@/lib/utils"

export function PNPDashboardView() {
  const [selectedCase, setSelectedCase] = useState<any>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false)
  const [officerProfile, setOfficerProfile] = useState<PNPOfficerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [officerCases, setOfficerCases] = useState<any[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load officer profile
      const profile = await PNPOfficerService.getCurrentOfficerProfile()
      if (profile) {
        setOfficerProfile(profile)
        
        // Load officer's cases
        const cases = await PNPOfficerService.getOfficerCases(profile.id)
        setOfficerCases(cases || [])
      } else {
        setError('Unable to load officer profile. Please contact your administrator.')
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError('Failed to load dashboard data. Please try again.')
      // Fallback to mock data for development
      const mockOfficerCases = mockCases.filter((c) => c.officer === "Officer Smith" || c.officer === "Officer Martinez")
      setOfficerCases(mockOfficerCases)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (caseData: any) => {
    setSelectedCase(caseData)
    setDetailModalOpen(true)
  }

  const handleUpdateStatus = (caseData: any) => {
    setSelectedCase(caseData)
    setStatusModalOpen(true)
  }

  const handleViewEvidence = (caseData: any) => {
    setSelectedCase(caseData)
    setEvidenceModalOpen(true)
  }

  const handleQuickAction = (action: string) => {
    alert(`${action} functionality will be implemented here`)
  }

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-lawbot-blue-500" />
          <span className="ml-2 text-lawbot-slate-600 dark:text-lawbot-slate-400">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  if (error && !officerProfile) {
    return (
      <div className="space-y-8 animate-fade-in">
        <Alert className="border-lawbot-red-200 dark:border-lawbot-red-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-lawbot-red-700 dark:text-lawbot-red-300">
            {error}
          </AlertDescription>
        </Alert>
        <Button onClick={loadDashboardData} className="btn-gradient">
          <Loader2 className="h-4 w-4 mr-2" />
          Retry Loading Dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Enhanced Officer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 animate-fade-in-up">
        <Card className="stats-card bg-gradient-to-br from-lawbot-blue-50 to-white dark:from-lawbot-blue-900/10 dark:to-lawbot-slate-800 border-lawbot-blue-200 dark:border-lawbot-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">My Cases</p>
                <p className="text-3xl font-bold text-lawbot-blue-600 dark:text-lawbot-blue-400">{officerProfile?.total_cases || 0}</p>
                <p className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400 mt-1">📋 Active investigations</p>
              </div>
              <div className="p-3 bg-lawbot-blue-500 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card bg-gradient-to-br from-lawbot-amber-50 to-white dark:from-lawbot-amber-900/10 dark:to-lawbot-slate-800 border-lawbot-amber-200 dark:border-lawbot-amber-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">Active</p>
                <p className="text-3xl font-bold text-lawbot-amber-600 dark:text-lawbot-amber-400">{officerProfile?.active_cases || 0}</p>
                <p className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400 mt-1">⚡ Active investigations</p>
              </div>
              <div className="p-3 bg-lawbot-amber-500 rounded-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card bg-gradient-to-br from-lawbot-emerald-50 to-white dark:from-lawbot-emerald-900/10 dark:to-lawbot-slate-800 border-lawbot-emerald-200 dark:border-lawbot-emerald-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">Resolved</p>
                <p className="text-3xl font-bold text-lawbot-emerald-600 dark:text-lawbot-emerald-400">{officerProfile?.resolved_cases || 0}</p>
                <p className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400 mt-1">✅ Total resolved</p>
              </div>
              <div className="p-3 bg-lawbot-emerald-500 rounded-lg">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card bg-gradient-to-br from-lawbot-purple-50 to-white dark:from-lawbot-purple-900/10 dark:to-lawbot-slate-800 border-lawbot-purple-200 dark:border-lawbot-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">Success Rate</p>
                <p className="text-3xl font-bold text-lawbot-purple-600 dark:text-lawbot-purple-400">{officerProfile?.success_rate || 0}%</p>
                <p className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400 mt-1">📈 Above average</p>
              </div>
              <div className="p-3 bg-lawbot-purple-500 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card bg-gradient-to-br from-lawbot-indigo-50 to-white dark:from-lawbot-indigo-900/10 dark:to-lawbot-slate-800 border-lawbot-indigo-200 dark:border-lawbot-indigo-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">My Unit</p>
                <p className="text-2xl font-bold text-lawbot-indigo-600 dark:text-lawbot-indigo-400 leading-tight">{officerProfile?.unit?.unit_code || 'N/A'}</p>
                <p className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400 mt-1">🏢 {officerProfile?.unit?.unit_name?.split(' ').slice(0, 2).join(' ') || 'No Unit'}</p>
              </div>
              <div className="p-3 bg-lawbot-indigo-500 rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Active Cases */}
      <Card className="card-modern animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-lawbot-blue-500 rounded-lg">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-lawbot-slate-900 dark:text-white">My Active Cases</CardTitle>
              <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400">Cases currently assigned to you for investigation</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {officerCases.slice(0, 5).map((case_, index) => (
              <Card key={case_.id} className="card-modern hover:shadow-lg transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${(index + 4) * 100}ms` }}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="font-bold text-lg text-lawbot-blue-600 dark:text-lawbot-blue-400">{case_.id}</h3>
                        <Badge className={`${getPriorityColor(case_.priority)} text-xs font-medium`}>
                          {case_.priority === 'high' ? '🔴' : case_.priority === 'medium' ? '🟡' : '🟢'} {case_.priority}
                        </Badge>
                        <Badge className={`${getStatusColor(case_.status)} text-xs font-medium`}>
                          {case_.status === 'Pending' ? '📋' : 
                           case_.status === 'Under Investigation' ? '🔍' :
                           case_.status === 'Resolved' ? '✅' :
                           case_.status === 'Dismissed' ? '❌' : '❓'} 
                          {case_.status}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-lawbot-slate-900 dark:text-white mb-3 text-lg">{case_.title}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center text-lawbot-slate-600 dark:text-lawbot-slate-400">
                          <Calendar className="h-4 w-4 mr-2 text-lawbot-blue-500" />
                          📅 {case_.date}
                        </div>
                        <div className="flex items-center text-lawbot-slate-600 dark:text-lawbot-slate-400">
                          <FileText className="h-4 w-4 mr-2 text-lawbot-emerald-500" />
                          📎 {case_.evidence} evidence files
                        </div>
                        <div className="flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2 text-lawbot-amber-500" />
                          <span className={`font-bold ${
                            case_.riskScore >= 80 ? 'text-lawbot-red-500' : 
                            case_.riskScore >= 50 ? 'text-lawbot-amber-500' : 
                            'text-lawbot-emerald-500'
                          }`}>
                            ⚠️ Risk: {case_.riskScore}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button size="sm" variant="outline" className="btn-modern border-lawbot-blue-300 text-lawbot-blue-600 hover:bg-lawbot-blue-50" onClick={() => handleViewDetails(case_)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button size="sm" className="btn-gradient" onClick={() => handleUpdateStatus(case_)}>
                        <Activity className="h-4 w-4 mr-2" />
                        Update Status
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* My Unit Information Card */}
      <Card className="card-modern bg-gradient-to-br from-lawbot-indigo-50 to-white dark:from-lawbot-indigo-900/10 dark:to-lawbot-slate-800 border-lawbot-indigo-200 dark:border-lawbot-indigo-800 animate-fade-in-up" style={{ animationDelay: '250ms' }}>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-lawbot-indigo-500 rounded-lg">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-lawbot-slate-900 dark:text-white">My Unit Assignment</CardTitle>
              <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400">Your specialized unit information and crime type coverage</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-white to-lawbot-indigo-50/30 dark:from-lawbot-slate-800 dark:to-lawbot-indigo-900/10 border border-lawbot-indigo-200 dark:border-lawbot-indigo-800 rounded-lg">
                <h4 className="font-bold text-lg text-lawbot-indigo-600 dark:text-lawbot-indigo-400 mb-2">{officerProfile?.unit?.unit_name || 'No Unit Assigned'}</h4>
                <p className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400 mb-3">🏷️ {officerProfile?.unit?.unit_code || 'N/A'}</p>
                <p className="text-sm text-lawbot-slate-700 dark:text-lawbot-slate-300 leading-relaxed">{officerProfile?.unit?.description || 'No unit description available'}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-lawbot-slate-50 dark:bg-lawbot-slate-800 rounded-lg text-center">
                  <div className="text-xl font-bold text-lawbot-indigo-600 dark:text-lawbot-indigo-400">{officerProfile?.unit?.current_officers || 0}</div>
                  <div className="text-xs text-lawbot-slate-600 dark:text-lawbot-slate-400">👥 Officers</div>
                </div>
                <div className="p-3 bg-lawbot-slate-50 dark:bg-lawbot-slate-800 rounded-lg text-center">
                  <div className="text-xl font-bold text-lawbot-emerald-600 dark:text-lawbot-emerald-400">{officerProfile?.unit?.success_rate || 0}%</div>
                  <div className="text-xs text-lawbot-slate-600 dark:text-lawbot-slate-400">🎯 Success</div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h5 className="font-semibold mb-3 text-lawbot-slate-800 dark:text-lawbot-slate-200 flex items-center">
                  <Target className="h-4 w-4 mr-2 text-lawbot-purple-500" />
                  🎯 Crime Types I Handle
                </h5>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {officerProfile?.unit?.crime_types?.slice(0, 5).map((crimeType, index) => (
                    <div key={index} className="flex items-center p-2 bg-gradient-to-r from-white to-lawbot-purple-50/30 dark:from-lawbot-slate-800 dark:to-lawbot-purple-900/10 border border-lawbot-purple-200 dark:border-lawbot-purple-800 rounded-md">
                      <div className="w-2 h-2 bg-lawbot-purple-500 rounded-full mr-2"></div>
                      <span className="text-xs font-medium text-lawbot-slate-700 dark:text-lawbot-slate-300">{crimeType}</span>
                    </div>
                  )) || (
                    <div className="text-center text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400 py-2">
                      No crime types assigned
                    </div>
                  )}
                  {officerProfile?.unit?.crime_types && officerProfile.unit.crime_types.length > 5 && (
                    <div className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400 text-center pt-2">
                      +{officerProfile.unit.crime_types.length - 5} more crime types
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gradient-to-r from-lawbot-blue-50 to-lawbot-indigo-50 dark:from-lawbot-blue-900/20 dark:to-lawbot-indigo-900/20 rounded-xl border border-lawbot-blue-200 dark:border-lawbot-blue-800">
            <Badge className="bg-gradient-to-r from-lawbot-indigo-100 to-lawbot-indigo-200 text-lawbot-indigo-800 border border-lawbot-indigo-300 dark:from-lawbot-indigo-900/30 dark:to-lawbot-indigo-800/30 dark:text-lawbot-indigo-200 dark:border-lawbot-indigo-700 text-sm font-bold px-4 py-2 mb-3">
              📊 {officerProfile?.unit?.category || 'No Category'}
            </Badge>
            <p className="text-sm text-lawbot-slate-700 dark:text-lawbot-slate-300">
              {officerProfile?.unit ? (
                <>Specializing in <strong>{officerProfile.unit.category.toLowerCase()}</strong>, your unit currently handles <strong>{officerProfile.unit.active_cases} active cases</strong> with a proven track record of <strong>{officerProfile.unit.resolved_cases} resolved cases</strong>.</>
              ) : (
                'No unit assignment found. Please contact your administrator to be assigned to a unit.'
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-modern bg-gradient-to-br from-lawbot-red-50 to-white dark:from-lawbot-red-900/10 dark:to-lawbot-slate-800 border-lawbot-red-200 dark:border-lawbot-red-800 animate-slide-in-left">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-lawbot-red-500 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lawbot-slate-900 dark:text-white">Priority Cases</CardTitle>
                <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400">High priority cases requiring immediate attention</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {officerCases
                .filter((c) => c.priority === "high")
                .slice(0, 3)
                .map((case_, index) => (
                  <div key={case_.id} className="flex items-center justify-between p-4 bg-white dark:bg-lawbot-slate-800 border border-lawbot-red-200 dark:border-lawbot-red-800 rounded-xl hover:shadow-md transition-all duration-200 animate-fade-in-up" style={{ animationDelay: `${(index + 10) * 100}ms` }}>
                    <div>
                      <p className="font-bold text-sm text-lawbot-blue-600 dark:text-lawbot-blue-400">{case_.id}</p>
                      <p className="text-xs text-lawbot-slate-600 dark:text-lawbot-slate-400 truncate max-w-32">{case_.title}</p>
                    </div>
                    <Badge className="bg-gradient-to-r from-lawbot-red-50 to-lawbot-red-100 text-lawbot-red-700 border border-lawbot-red-200 dark:from-lawbot-red-900/20 dark:to-lawbot-red-800/20 dark:text-lawbot-red-300 dark:border-lawbot-red-800 text-xs font-bold">
                      🚨 Urgent
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern bg-gradient-to-br from-lawbot-emerald-50 to-white dark:from-lawbot-emerald-900/10 dark:to-lawbot-slate-800 border-lawbot-emerald-200 dark:border-lawbot-emerald-800 animate-scale-in" style={{ animationDelay: '100ms' }}>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-lawbot-emerald-500 rounded-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lawbot-slate-900 dark:text-white">Recent Evidence</CardTitle>
                <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400">Latest evidence files uploaded</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((i, index) => (
                <div key={i} className="flex items-center space-x-3 p-4 bg-white dark:bg-lawbot-slate-800 border border-lawbot-emerald-200 dark:border-lawbot-emerald-800 rounded-xl hover:shadow-md transition-all duration-200 animate-fade-in-up" style={{ animationDelay: `${(index + 13) * 100}ms` }}>
                  <div className="w-10 h-10 bg-gradient-to-r from-lawbot-blue-500 to-lawbot-blue-600 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-lawbot-slate-900 dark:text-white">📄 Evidence_{i}.pdf</p>
                    <p className="text-xs text-lawbot-slate-600 dark:text-lawbot-slate-400">CYB-2025-00{i}</p>
                  </div>
                  <Button size="sm" variant="outline" className="btn-modern border-lawbot-emerald-300 text-lawbot-emerald-600 hover:bg-lawbot-emerald-50" onClick={() => handleViewEvidence(officerCases[0])}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern bg-gradient-to-br from-lawbot-purple-50 to-white dark:from-lawbot-purple-900/10 dark:to-lawbot-slate-800 border-lawbot-purple-200 dark:border-lawbot-purple-800 animate-slide-in-right" style={{ animationDelay: '200ms' }}>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-lawbot-purple-500 rounded-lg">
                <Award className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lawbot-slate-900 dark:text-white">Unit Performance</CardTitle>
                <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400">Your unit's performance metrics</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-purple-200 dark:border-lawbot-purple-800">
                <span className="text-sm font-medium text-lawbot-slate-700 dark:text-lawbot-slate-300">📊 My Cases Resolved</span>
                <span className="font-bold text-lawbot-emerald-600 dark:text-lawbot-emerald-400">{officerProfile?.resolved_cases || 0}/{officerProfile?.total_cases || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-purple-200 dark:border-lawbot-purple-800">
                <span className="text-sm font-medium text-lawbot-slate-700 dark:text-lawbot-slate-300">⏱️ My Success Rate</span>
                <span className="font-bold text-lawbot-blue-600 dark:text-lawbot-blue-400">{officerProfile?.success_rate || 0}%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-purple-200 dark:border-lawbot-purple-800">
                <span className="text-sm font-medium text-lawbot-slate-700 dark:text-lawbot-slate-300">🏢 Unit Active Cases</span>
                <span className="font-bold text-lawbot-blue-600 dark:text-lawbot-blue-400">{officerProfile?.unit?.active_cases || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-purple-200 dark:border-lawbot-purple-800">
                <span className="text-sm font-medium text-lawbot-slate-700 dark:text-lawbot-slate-300">🎯 Unit Success Rate</span>
                <span className="font-bold text-lawbot-emerald-600 dark:text-lawbot-emerald-400">{officerProfile?.unit?.success_rate || 0}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <CaseDetailModal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} caseData={selectedCase} />
      <StatusUpdateModal isOpen={statusModalOpen} onClose={() => setStatusModalOpen(false)} caseData={selectedCase} />
      <EvidenceViewerModal
        isOpen={evidenceModalOpen}
        onClose={() => setEvidenceModalOpen(false)}
        caseData={selectedCase}
      />
    </div>
  )
}
