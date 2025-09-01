"use client"

import { useState, useEffect } from "react"
import { FileText, Clock, CheckCircle, BarChart3, Calendar, AlertTriangle, Eye, UserPlus, AlertCircle, Shield, Target, Activity, Award, TrendingUp, Building2, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CaseDetailModal } from "@/components/modals/case-detail-modal"
import { StatusUpdateModal } from "@/components/modals/status-update-modal" 
import { EvidenceViewerModal } from "@/components/modals/evidence-viewer-modal"
import PNPOfficerService, { PNPOfficerProfile, PNPOfficerStats, OfficerCase } from "@/lib/pnp-officer-service"
import { getPriorityColor, getStatusColor, extractComplaintId, validateComplaintId } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { PhilippineTime } from "@/lib/philippine-time"

export function PNPDashboardView() {
  const [selectedCase, setSelectedCase] = useState<any>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false)
  
  // Real database state
  const [officerProfile, setOfficerProfile] = useState<PNPOfficerProfile | null>(null)
  const [officerCases, setOfficerCases] = useState<OfficerCase[]>([])
  const [officerStats, setOfficerStats] = useState<PNPOfficerStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [evidenceCounts, setEvidenceCounts] = useState<Record<string, number>>({})
  // const [recentEvidence, setRecentEvidence] = useState<any[]>([]) // Removed - RPC not available
  // RPC-dependent state removed
  // const [weeklyActivity, setWeeklyActivity] = useState<any[]>([])
  // const [performanceMetrics, setPerformanceMetrics] = useState<any[]>([])
  // const [upcomingTasks, setUpcomingTasks] = useState<any[]>([])
  // const [notificationSummary, setNotificationSummary] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch evidence count for a complaint
  const fetchEvidenceCount = async (complaintId: string): Promise<number> => {
    try {
      const { count, error } = await supabase
        .from('evidence_files')
        .select('*', { count: 'exact', head: true })
        .eq('complaint_id', complaintId)
      
      if (error) {
        console.error('❌ Error fetching evidence count:', error)
        return 0
      }
      
      return count || 0
    } catch (error) {
      console.error('❌ Error fetching evidence count:', error)
      return 0
    }
  }

  // Fetch real officer data
  const fetchOfficerData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      console.log('🔄 Fetching officer dashboard data...')
      
      // Fetch officer profile
      const profile = await PNPOfficerService.getCurrentOfficerProfile()
      if (!profile) {
        throw new Error('No officer profile found. Please ensure you are logged in as a PNP officer.')
      }
      
      setOfficerProfile(profile)
      console.log('✅ Officer profile loaded:', profile.full_name)
      
      // Fetch officer cases
      const cases = await PNPOfficerService.getOfficerCases(profile.id)
      setOfficerCases(cases)
      console.log('✅ Officer cases loaded:', cases.length)
      
      // Fetch evidence counts for all cases
      const counts: Record<string, number> = {}
      for (const case_ of cases) {
        const count = await fetchEvidenceCount(case_.complaint.id)
        counts[case_.complaint.id] = count
      }
      setEvidenceCounts(counts)
      console.log('📎 Evidence counts fetched:', counts)
      
      // Fetch officer statistics
      const stats = await PNPOfficerService.getOfficerStats(profile.id)
      setOfficerStats(stats)
      console.log('✅ Officer stats loaded')
      
      // Fetch recent activity
      const activity = await PNPOfficerService.getRecentActivity(profile.id)
      setRecentActivity(activity)
      console.log('✅ Recent activity loaded:', activity.length)
      
      // Skip recent evidence loading (RPC function not available)
      console.log('📊 Skipping recent evidence - RPC function not available')
      // setRecentEvidence([]) // Removed
      
      // Skip other RPC-dependent features (functions not available)
      console.log('📊 Skipping RPC-dependent features - functions not available')
      // All RPC-dependent setters removed
      
    } catch (error) {
      console.error('❌ Error fetching officer data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load officer data')
    } finally {
      setIsLoading(false)
    }
  }

  // Load data on component mount
  useEffect(() => {
    fetchOfficerData()
  }, [])

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

  const handleQuickAction = async (action: string) => {
    switch(action) {
      case 'view-tasks':
        // Navigate to tasks view or show tasks modal
        console.log('Tasks feature not available (RPC function missing)')
        break
      case 'view-notifications':
        // Navigate to notifications
        console.log('Notifications feature not available (RPC function missing)')
        break
      case 'weekly-report':
        // Generate weekly activity report
        console.log('Weekly activity feature not available (RPC function missing)')
        break
      default:
        console.log(`Action ${action} triggered`)
    }
  }

  const handleStatusUpdate = async (newStatus: string, updateData: any) => {
    try {
      console.log('🔄 PNP Dashboard: Updating case status:', { newStatus, updateData })
      console.log('🔍 PNP Dashboard: Full selectedCase object:', selectedCase)
      console.log('🔍 PNP Dashboard: selectedCase keys:', selectedCase ? Object.keys(selectedCase) : 'selectedCase is null')
      
      if (!selectedCase) {
        console.error('❌ PNP Dashboard: selectedCase is null or undefined')
        throw new Error('No case selected for status update. Please select a case first.')
      }
      
      // Use the robust complaint ID extraction utility
      const complaintId = extractComplaintId(selectedCase)
      
      // Validate the extracted complaint ID
      const validComplaintId = validateComplaintId(complaintId, 'status update')
      
      console.log('✅ PNP Dashboard: Using complaint ID:', validComplaintId)
      
      // Update case status in database
      await PNPOfficerService.updateCaseStatus(
        validComplaintId, 
        newStatus, 
        updateData.notes || updateData
      )
      
      console.log('✅ PNP Dashboard: Case status updated successfully')
      
      // Refresh officer data to show updated information
      await fetchOfficerData()
      
      setStatusModalOpen(false)
    } catch (error) {
      console.error('❌ PNP Dashboard: Error updating case status:', error)
      console.error('❌ PNP Dashboard: Error details:', JSON.stringify(error, null, 2))
      
      // Re-throw the error so the StatusUpdateModal can handle it properly
      throw error
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lawbot-blue-600 mx-auto"></div>
          <p className="mt-4 text-lawbot-slate-600 dark:text-lawbot-slate-400">Loading officer dashboard...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-8 animate-fade-in">
        <Alert className="border-lawbot-red-200 bg-lawbot-red-50 dark:border-lawbot-red-800 dark:bg-lawbot-red-900/20">
          <AlertCircle className="h-4 w-4 text-lawbot-red-600" />
          <AlertDescription className="text-lawbot-red-700 dark:text-lawbot-red-300">
            {error}
          </AlertDescription>
        </Alert>
        <div className="text-center">
          <Button onClick={fetchOfficerData} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  // Show no data state
  if (!officerProfile) {
    return (
      <div className="space-y-8 animate-fade-in">
        <Alert className="border-lawbot-amber-200 bg-lawbot-amber-50 dark:border-lawbot-amber-800 dark:bg-lawbot-amber-900/20">
          <AlertTriangle className="h-4 w-4 text-lawbot-amber-600" />
          <AlertDescription className="text-lawbot-amber-700 dark:text-lawbot-amber-300">
            No officer profile found. Please contact your administrator to set up your profile.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Enhanced Officer Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 animate-fade-in-up">
        <Card className="stats-card bg-gradient-to-br from-lawbot-blue-50 to-white dark:from-lawbot-blue-900/10 dark:to-lawbot-slate-800 border-lawbot-blue-200 dark:border-lawbot-blue-800">
          <CardContent className="p-4 sm:p-6">
            <div className="text-center space-y-3">
              <div className="mx-auto w-fit p-2.5 bg-gradient-to-r from-lawbot-blue-500 to-lawbot-blue-600 rounded-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400 mb-2">My Cases</p>
                <p className="text-2xl xl:text-3xl font-bold text-lawbot-blue-600 dark:text-lawbot-blue-400 mb-1">{officerCases.length}</p>
                <p className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400">📋 Total cases</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card bg-gradient-to-br from-lawbot-amber-50 to-white dark:from-lawbot-amber-900/10 dark:to-lawbot-slate-800 border-lawbot-amber-200 dark:border-lawbot-amber-800">
          <CardContent className="p-4 sm:p-6">
            <div className="text-center space-y-3">
              <div className="mx-auto w-fit p-2.5 bg-gradient-to-r from-lawbot-amber-500 to-lawbot-amber-600 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400 mb-2">Active</p>
                <p className="text-2xl xl:text-3xl font-bold text-lawbot-amber-600 dark:text-lawbot-amber-400 mb-1">{officerStats?.active_cases || 0}</p>
                <p className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400">⚡ Active investigations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card bg-gradient-to-br from-lawbot-emerald-50 to-white dark:from-lawbot-emerald-900/10 dark:to-lawbot-slate-800 border-lawbot-emerald-200 dark:border-lawbot-emerald-800">
          <CardContent className="p-4 sm:p-6">
            <div className="text-center space-y-3">
              <div className="mx-auto w-fit p-2.5 bg-gradient-to-r from-lawbot-emerald-500 to-lawbot-emerald-600 rounded-lg">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400 mb-2">Resolved</p>
                <p className="text-2xl xl:text-3xl font-bold text-lawbot-emerald-600 dark:text-lawbot-emerald-400 mb-1">{officerStats?.resolved_cases || 0}</p>
                <p className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400">✅ Total resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card bg-gradient-to-br from-lawbot-purple-50 to-white dark:from-lawbot-purple-900/10 dark:to-lawbot-slate-800 border-lawbot-purple-200 dark:border-lawbot-purple-800">
          <CardContent className="p-4 sm:p-6">
            <div className="text-center space-y-3">
              <div className="mx-auto w-fit p-2.5 bg-gradient-to-r from-lawbot-purple-500 to-lawbot-purple-600 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400 mb-2">Success Rate</p>
                <p className="text-2xl xl:text-3xl font-bold text-lawbot-purple-600 dark:text-lawbot-purple-400 mb-1">{officerStats?.success_rate || 0}%</p>
                <p className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400">📈 Performance rate</p>
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
            {officerCases.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-lawbot-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300">No Active Cases</h3>
                <p className="text-sm text-lawbot-slate-500 dark:text-lawbot-slate-400 mt-2">
                  You currently have no active cases assigned to you.
                </p>
              </div>
            ) : (
              <>
                {officerCases.slice(0, 5).map((case_, index) => {
                // Handle real database structure
                const caseData = case_.complaint
                const caseId = caseData.complaint_number
                const title = caseData.title
                const priority = caseData.priority
                const status = caseData.status
                const date = PhilippineTime.formatDatabaseTime(caseData.created_at)
                const riskScore = caseData.risk_score || 50
                const evidenceCount = evidenceCounts[caseData.id] || 0
              
                return (
                <Card key={caseId} className="card-modern hover:shadow-lg transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${(index + 4) * 100}ms` }}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row items-start justify-between space-y-4 lg:space-y-0 lg:space-x-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <h3 className="font-bold text-base sm:text-lg text-lawbot-blue-600 dark:text-lawbot-blue-400 truncate">{caseId}</h3>
                          <Badge className={`${getPriorityColor(priority)} text-xs font-medium flex-shrink-0`}>
                            {priority === 'high' ? '🔴' : priority === 'medium' ? '🟡' : '🟢'} {priority}
                          </Badge>
                          <Badge className={`${getStatusColor(status)} text-xs font-medium flex-shrink-0`}>
                            {status === 'Pending' ? '📋' : 
                             status === 'Under Investigation' ? '🔍' :
                             status === 'Resolved' ? '✅' :
                             status === 'Dismissed' ? '❌' : '❓'} 
                            {status}
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-lawbot-slate-900 dark:text-white mb-3 text-sm sm:text-lg line-clamp-2">{title}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
                          <div className="flex items-center text-lawbot-slate-600 dark:text-lawbot-slate-400">
                            <Calendar className="h-4 w-4 mr-2 text-lawbot-blue-500 flex-shrink-0" />
                            <span className="truncate">📅 {date}</span>
                          </div>
                          <div className="flex items-center text-lawbot-slate-600 dark:text-lawbot-slate-400">
                            <FileText className="h-4 w-4 mr-2 text-lawbot-emerald-500 flex-shrink-0" />
                            <span className="truncate">📎 {evidenceCount} evidence files</span>
                          </div>
                          <div className="flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-2 text-lawbot-amber-500 flex-shrink-0" />
                            <span className={`font-bold truncate ${
                              riskScore >= 80 ? 'text-lawbot-red-500' : 
                              riskScore >= 50 ? 'text-lawbot-amber-500' : 
                              'text-lawbot-emerald-500'
                            }`}>
                              ⚠️ Risk: {riskScore}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full lg:w-auto">
                        <Button size="sm" variant="outline" className="btn-modern border-lawbot-blue-300 text-lawbot-blue-600 hover:bg-lawbot-blue-50 flex-1 sm:flex-none" onClick={() => handleViewDetails(caseData)}>
                          <Eye className="h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline">View Details</span>
                          <span className="sm:hidden">View</span>
                        </Button>
                        <Button size="sm" className="btn-gradient flex-1 sm:flex-none" onClick={() => handleUpdateStatus(caseData)}>
                          <Activity className="h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Update Status</span>
                          <span className="sm:hidden">Update</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                )
              })}
              </>
            )}
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
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-4">
              <div className="p-3 sm:p-4 bg-gradient-to-r from-white to-lawbot-indigo-50/30 dark:from-lawbot-slate-800 dark:to-lawbot-indigo-900/10 border border-lawbot-indigo-200 dark:border-lawbot-indigo-800 rounded-lg">
                <h4 className="font-bold text-sm sm:text-base lg:text-lg text-lawbot-indigo-600 dark:text-lawbot-indigo-400 mb-2 leading-tight">
                  {officerProfile?.unit?.unit_name || 'No Unit Assigned'}
                </h4>
                <p className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400 mb-3">🏷️ {officerProfile?.unit?.unit_code || 'N/A'}</p>
                <p className="text-xs sm:text-sm text-lawbot-slate-700 dark:text-lawbot-slate-300 leading-relaxed line-clamp-3">{officerProfile?.unit?.description || 'No unit description available'}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="p-2 sm:p-3 bg-lawbot-slate-50 dark:bg-lawbot-slate-800 rounded-lg text-center">
                  <div className="text-lg sm:text-xl font-bold text-lawbot-indigo-600 dark:text-lawbot-indigo-400">{officerProfile?.unit?.current_officers || 0}</div>
                  <div className="text-xs text-lawbot-slate-600 dark:text-lawbot-slate-400">👥 Officers</div>
                </div>
                <div className="p-2 sm:p-3 bg-lawbot-slate-50 dark:bg-lawbot-slate-800 rounded-lg text-center">
                  <div className="text-lg sm:text-xl font-bold text-lawbot-emerald-600 dark:text-lawbot-emerald-400">{officerProfile?.unit?.success_rate || 0}%</div>
                  <div className="text-xs text-lawbot-slate-600 dark:text-lawbot-slate-400">🎯 Success</div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h5 className="font-semibold mb-3 text-sm sm:text-base text-lawbot-slate-800 dark:text-lawbot-slate-200 flex items-center">
                  <Target className="h-4 w-4 mr-2 text-lawbot-purple-500 flex-shrink-0" />
                  <span className="truncate">🎯 Crime Types I Handle</span>
                </h5>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {officerProfile?.unit?.crime_types?.slice(0, 5).map((crimeType, index) => (
                    <div key={index} className="flex items-center p-2 bg-gradient-to-r from-white to-lawbot-purple-50/30 dark:from-lawbot-slate-800 dark:to-lawbot-purple-900/10 border border-lawbot-purple-200 dark:border-lawbot-purple-800 rounded-md">
                      <div className="w-2 h-2 bg-lawbot-purple-500 rounded-full mr-2 flex-shrink-0"></div>
                      <span className="text-xs font-medium text-lawbot-slate-700 dark:text-lawbot-slate-300 truncate" title={crimeType}>{crimeType}</span>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
                .filter((c) => c.complaint?.priority === "high" || c.complaint?.priority === "urgent")
                .slice(0, 3)
                .map((case_, index) => (
                  <div key={case_.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-white dark:bg-lawbot-slate-800 border border-lawbot-red-200 dark:border-lawbot-red-800 rounded-xl hover:shadow-md transition-all duration-200 animate-fade-in-up space-y-2 sm:space-y-0" style={{ animationDelay: `${(index + 10) * 100}ms` }}>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-lawbot-blue-600 dark:text-lawbot-blue-400 truncate">{case_.complaint?.complaint_number || case_.id}</p>
                      <p className="text-xs text-lawbot-slate-600 dark:text-lawbot-slate-400 truncate">{case_.complaint?.title || 'Untitled Case'}</p>
                      <p className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400 mt-1">
                        🎯 Risk: {case_.complaint?.ai_risk_score || case_.complaint?.risk_score || 0}
                      </p>
                    </div>
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start w-full sm:w-auto space-x-2 sm:space-x-0 sm:space-y-1">
                      <Badge className="bg-gradient-to-r from-lawbot-red-50 to-lawbot-red-100 text-lawbot-red-700 border border-lawbot-red-200 dark:from-lawbot-red-900/20 dark:to-lawbot-red-800/20 dark:text-lawbot-red-300 dark:border-lawbot-red-800 text-xs font-bold flex-shrink-0">
                        🚨 {case_.complaint?.priority === 'urgent' ? 'Urgent' : 'High'}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-xs p-1 h-auto text-lawbot-blue-600 hover:text-lawbot-blue-700 flex-shrink-0"
                        onClick={() => handleViewDetails(case_.complaint)}
                      >
                        View →
                      </Button>
                    </div>
                  </div>
                ))}
              {officerCases.filter((c) => c.complaint?.priority === "high" || c.complaint?.priority === "urgent").length === 0 && (
                <div className="text-center py-4">
                  <AlertTriangle className="h-8 w-8 text-lawbot-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-lawbot-slate-500 dark:text-lawbot-slate-400">
                    No high priority cases
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Evidence section removed - RPC function not available */}

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
              {false ? (
                [].map((metric, index) => {
                  const getTrendIcon = (direction: string) => {
                    if (direction === 'up') return '📈'
                    if (direction === 'down') return '📉'
                    return '➡️'
                  }
                  
                  const getTrendColor = (direction: string, metricName: string) => {
                    // For resolution time, down is good
                    if (metricName.includes('Resolution Time')) {
                      if (direction === 'down') return 'text-lawbot-emerald-600'
                      if (direction === 'up') return 'text-lawbot-red-600'
                    }
                    // For other metrics, up is good
                    if (direction === 'up') return 'text-lawbot-emerald-600'
                    if (direction === 'down') return 'text-lawbot-red-600'
                    return 'text-lawbot-slate-600'
                  }
                  
                  return (
                    <div key={index} className="flex justify-between items-center p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-purple-200 dark:border-lawbot-purple-800">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-lawbot-slate-700 dark:text-lawbot-slate-300">
                          {metric.metric_name === 'Cases Resolved' ? '✅' : 
                           metric.metric_name === 'New Cases' ? '📋' : 
                           metric.metric_name === 'Avg Resolution Time' ? '⏱️' : '📊'} 
                          {metric.metric_name}
                        </span>
                        <span className={`text-xs ${getTrendColor(metric.trend_direction, metric.metric_name)}`}>
                          {getTrendIcon(metric.trend_direction)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-lawbot-blue-600 dark:text-lawbot-blue-400">
                          {metric.current_value}
                          {metric.metric_name === 'Avg Resolution Time' ? ' days' : ''}
                        </span>
                        {metric.percentage_change !== 0 && (
                          <p className={`text-xs ${getTrendColor(metric.trend_direction, metric.metric_name)}`}>
                            {metric.percentage_change > 0 ? '+' : ''}{metric.percentage_change}%
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })
              ) : (
                // Fallback to basic stats if no performance metrics
                <>
                  <div className="flex justify-between items-center p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-purple-200 dark:border-lawbot-purple-800">
                    <span className="text-sm font-medium text-lawbot-slate-700 dark:text-lawbot-slate-300">📊 My Cases</span>
                    <span className="font-bold text-lawbot-blue-600 dark:text-lawbot-blue-400">{officerCases.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-purple-200 dark:border-lawbot-purple-800">
                    <span className="text-sm font-medium text-lawbot-slate-700 dark:text-lawbot-slate-300">✅ Resolved</span>
                    <span className="font-bold text-lawbot-emerald-600 dark:text-lawbot-emerald-400">{officerStats?.resolved_cases || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-purple-200 dark:border-lawbot-purple-800">
                    <span className="text-sm font-medium text-lawbot-slate-700 dark:text-lawbot-slate-300">🎯 Success Rate</span>
                    <span className="font-bold text-lawbot-blue-600 dark:text-lawbot-blue-400">{officerStats?.success_rate || 0}%</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Tasks section removed - RPC function not available */}

      {/* Notification Summary section removed - RPC function not available */}

      {/* Modals */}
      <CaseDetailModal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} caseData={selectedCase} />
      <StatusUpdateModal 
        isOpen={statusModalOpen} 
        onClose={() => setStatusModalOpen(false)} 
        caseData={selectedCase}
        onStatusUpdate={handleStatusUpdate}
      />
      <EvidenceViewerModal
        isOpen={evidenceModalOpen}
        onClose={() => setEvidenceModalOpen(false)}
        mode="single-case"
        caseData={selectedCase}
      />
    </div>
  )
}
