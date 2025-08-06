"use client"

import { useState, useEffect } from "react"
import { Calendar, FileText, AlertTriangle, Eye, Edit, Search, Filter, Shield, Activity, Clock, CheckCircle, Download, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CaseDetailModal } from "@/components/modals/case-detail-modal"
import { StatusUpdateModal } from "@/components/modals/status-update-modal"
import { EvidenceViewerModal } from "@/components/modals/evidence-viewer-modal"
import PNPOfficerService, { OfficerCase } from "@/lib/pnp-officer-service"
import { getPriorityColor, getStatusColor } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase"


export function MyCasesView() {
  // Get auth context
  const { user } = useAuth()
  
  // Real database state
  const [officerCases, setOfficerCases] = useState<OfficerCase[]>([])
  const [evidenceCounts, setEvidenceCounts] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  
  // Modal state
  const [selectedCase, setSelectedCase] = useState<any>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false)

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

  // Fetch real officer cases
  const fetchOfficerCases = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Set the current user ID in the service
      if (user) {
        PNPOfficerService.setCurrentUserId(user.uid)
      }
      
      console.log('🔄 Fetching officer cases for My Cases view...')
      const cases = await PNPOfficerService.getOfficerCases()
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
    } catch (error) {
      console.error('❌ Error fetching officer cases:', error)
      setError(error instanceof Error ? error.message : 'Failed to load cases')
    } finally {
      setIsLoading(false)
    }
  }

  // Load cases on component mount or when user changes
  useEffect(() => {
    if (user) {
      fetchOfficerCases()
    }
  }, [user])

  // Filter cases based on search and filter criteria
  const filteredCases = officerCases.filter((case_) => {
    const caseData = case_.complaint
    const matchesSearch =
      caseData.complaint_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (caseData.title && caseData.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      caseData.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "pending" && caseData.status === "Pending") ||
      (statusFilter === "investigation" && caseData.status === "Under Investigation") ||
      (statusFilter === "info" && caseData.status === "Requires More Information") ||
      (statusFilter === "resolved" && caseData.status === "Resolved")
    
    const matchesPriority = priorityFilter === "all" || caseData.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

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

  const handleStatusUpdate = async (newStatus: string, updateData: any) => {
    try {
      console.log('🔄 Updating case status:', { newStatus, updateData })
      
      if (selectedCase) {
        // Update case status in database
        await PNPOfficerService.updateCaseStatus(
          selectedCase.complaint?.id || selectedCase.complaint_id, 
          newStatus, 
          updateData.notes
        )
        
        console.log('✅ Case status updated successfully')
        
        // Refresh officer cases to show updated information
        await fetchOfficerCases()
      }
      
      setStatusModalOpen(false)
    } catch (error) {
      console.error('❌ Error updating case status:', error)
      // TODO: Show error toast to user
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lawbot-blue-600 mx-auto"></div>
          <p className="mt-4 text-lawbot-slate-600 dark:text-lawbot-slate-400">Loading your cases...</p>
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
          <Button onClick={fetchOfficerCases} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-lawbot-blue-600 to-lawbot-emerald-600 bg-clip-text text-transparent">
            My Cases
          </h2>
          <p className="text-lawbot-slate-600 dark:text-lawbot-slate-400 text-lg mt-2">
            Cases assigned to you for investigation and resolution
          </p>
        </div>
        <Card className="stats-card bg-gradient-to-br from-lawbot-blue-50 to-white dark:from-lawbot-blue-900/10 dark:to-lawbot-slate-800 border-lawbot-blue-200 dark:border-lawbot-blue-800">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-lawbot-blue-600 dark:text-lawbot-blue-400">{officerCases.length}</div>
            <div className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400 font-medium">📊 Total Cases</div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Search and Filters */}
      <Card className="card-modern bg-gradient-to-r from-lawbot-blue-50/50 to-white dark:from-lawbot-blue-900/10 dark:to-lawbot-slate-800 border-lawbot-blue-200 dark:border-lawbot-blue-800 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-lawbot-blue-500 rounded-lg">
              <Search className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-lawbot-slate-900 dark:text-white">Search & Filter Cases</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lawbot-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search by case ID or title..."
                  className="pl-10 border-lawbot-slate-300 dark:border-lawbot-slate-600 focus:border-lawbot-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="border-lawbot-slate-300 dark:border-lawbot-slate-600 focus:border-lawbot-blue-500">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">📋 Pending</SelectItem>
                <SelectItem value="investigation">🔍 Under Investigation</SelectItem>
                <SelectItem value="info">❓ Requires More Information</SelectItem>
                <SelectItem value="resolved">✅ Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="border-lawbot-slate-300 dark:border-lawbot-slate-600 focus:border-lawbot-blue-500">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">🔴 High Priority</SelectItem>
                <SelectItem value="medium">🟡 Medium Priority</SelectItem>
                <SelectItem value="low">🟢 Low Priority</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="btn-modern border-lawbot-blue-300 text-lawbot-blue-600 hover:bg-lawbot-blue-50">
              <Filter className="h-4 w-4 mr-2" />
              Advanced
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Show empty state if no cases */}
      {officerCases.length === 0 ? (
        <Card className="card-modern text-center p-12 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <div className="flex flex-col items-center justify-center">
            <FileText className="h-24 w-24 text-lawbot-slate-300 dark:text-lawbot-slate-600 mb-6" />
            <h3 className="text-2xl font-bold text-lawbot-slate-900 dark:text-white mb-4">
              No Cases Assigned
            </h3>
            <p className="text-lawbot-slate-600 dark:text-lawbot-slate-400 text-lg mb-6 max-w-md">
              You don't have any cases assigned to you yet. Cases will appear here once they are assigned by administrators.
            </p>
          </div>
        </Card>
      ) : (
        <Tabs defaultValue="active" className="space-y-6 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <TabsList className="bg-lawbot-slate-100 dark:bg-lawbot-slate-800 p-1 rounded-xl grid grid-cols-3">
            <TabsTrigger value="active" className="data-[state=active]:bg-white dark:data-[state=active]:bg-lawbot-slate-700 data-[state=active]:text-lawbot-blue-600 font-medium">
              📁 Active Cases
            </TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-white dark:data-[state=active]:bg-lawbot-slate-700 data-[state=active]:text-lawbot-amber-600 font-medium">
              ⏳ Pending Action
            </TabsTrigger>
            <TabsTrigger value="resolved" className="data-[state=active]:bg-white dark:data-[state=active]:bg-lawbot-slate-700 data-[state=active]:text-lawbot-emerald-600 font-medium">
              ✅ Resolved
            </TabsTrigger>
          </TabsList>

        <TabsContent value="active">
          <div className="space-y-4">
            {filteredCases
              .filter((case_) => case_.complaint.status !== "Resolved" && case_.complaint.status !== "Dismissed")
              .map((case_) => {
                // Extract real case data
                const caseData = case_.complaint
                const caseId = caseData.complaint_number
                const title = caseData.title || `${caseData.crime_type} Case`
                const priority = caseData.priority
                const status = caseData.status
                const date = new Date(caseData.created_at).toLocaleDateString()
                const riskScore = caseData.risk_score || 50
                const assignmentType = case_.assignment_type
                const description = caseData.description
                const unit = caseData.assigned_unit || 'No Unit Assigned'
                // Get evidence count from fetched data
                const evidenceCount = evidenceCounts[caseData.id] || 0
                
                return (
                  <Card
                    key={case_.id}
                    className="card-modern hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in-up"
                    style={{ animationDelay: `${filteredCases.indexOf(case_) * 50}ms` }}
                  >
                    <CardContent className="p-8">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-4">
                            <h3 className="text-xl font-bold text-lawbot-blue-600 dark:text-lawbot-blue-400">{caseId}</h3>
                            <Badge className={`${getPriorityColor(priority)} text-xs font-medium`}>
                              {priority === 'high' ? '🔴' : priority === 'medium' ? '🟡' : '🟢'} {priority}
                            </Badge>
                            <Badge className={`${getStatusColor(status)} text-xs font-medium`}>
                              {status === 'Pending' ? '📋' : 
                               status === 'Under Investigation' ? '🔍' :
                               status === 'Requires More Information' ? '❓' :
                               status === 'Resolved' ? '✅' :
                               status === 'Dismissed' ? '❌' : '❓'} 
                              {status}
                            </Badge>
                            <Badge className="bg-lawbot-purple-100 text-lawbot-purple-800 dark:bg-lawbot-purple-900/30 dark:text-lawbot-purple-300 text-xs font-medium">
                              {assignmentType === 'primary' ? '👤 Primary' :
                               assignmentType === 'secondary' ? '👥 Secondary' :
                               assignmentType === 'consultant' ? '💼 Consultant' : '🔍 Reviewer'}
                            </Badge>
                          </div>
                          <h4 className="font-bold text-lawbot-slate-900 dark:text-white mb-4 text-xl">{title}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div className="flex items-center text-lawbot-slate-600 dark:text-lawbot-slate-400 p-2 bg-lawbot-slate-50 dark:bg-lawbot-slate-800 rounded-lg">
                              <Calendar className="h-4 w-4 mr-2 text-lawbot-blue-500" />
                              <span className="text-sm font-medium">📅 {date}</span>
                            </div>
                            <div className="flex items-center text-lawbot-slate-600 dark:text-lawbot-slate-400 p-2 bg-lawbot-slate-50 dark:bg-lawbot-slate-800 rounded-lg">
                              <FileText className="h-4 w-4 mr-2 text-lawbot-emerald-500" />
                              <span className="text-sm font-medium">📎 {evidenceCount} files</span>
                            </div>
                            <div className="flex items-center p-2 bg-lawbot-slate-50 dark:bg-lawbot-slate-800 rounded-lg">
                              <AlertTriangle className="h-4 w-4 mr-2 text-lawbot-amber-500" />
                              <span className={`text-sm font-bold ${
                                riskScore >= 80 ? 'text-lawbot-red-500' : 
                                riskScore >= 50 ? 'text-lawbot-amber-500' : 
                                'text-lawbot-emerald-500'
                              }`}>
                                ⚠️ {riskScore}
                              </span>
                            </div>
                            <div className="flex items-center text-lawbot-slate-600 dark:text-lawbot-slate-400 p-2 bg-lawbot-slate-50 dark:bg-lawbot-slate-800 rounded-lg">
                              <Shield className="h-4 w-4 mr-2 text-lawbot-purple-500" />
                              <span className="text-sm font-medium truncate">🏢 {unit.split(' ')[0]}...</span>
                            </div>
                          </div>
                          <div className="p-4 bg-gradient-to-r from-lawbot-blue-50 to-lawbot-emerald-50 dark:from-lawbot-blue-900/20 dark:to-lawbot-emerald-900/20 rounded-xl border border-lawbot-blue-200 dark:border-lawbot-blue-800">
                            <h5 className="font-semibold mb-2 text-lawbot-slate-900 dark:text-white flex items-center">
                              <Activity className="h-4 w-4 mr-2 text-lawbot-blue-500" />
                              Case Description:
                            </h5>
                            <p className="text-sm text-lawbot-slate-700 dark:text-lawbot-slate-300 leading-relaxed">
                              {description.length > 200 
                                ? `${description.substring(0, 200)}...`
                                : description}
                              {priority === "high" && " 🚨 High priority case requiring immediate attention."}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-3 ml-6">
                          <Button size="sm" className="btn-gradient" onClick={() => handleViewDetails(caseData)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                          <Button size="sm" variant="outline" className="btn-modern border-lawbot-emerald-300 text-lawbot-emerald-600 hover:bg-lawbot-emerald-50" onClick={() => handleUpdateStatus(caseData)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Update Status
                          </Button>
                          <Button size="sm" variant="outline" className="btn-modern border-lawbot-purple-300 text-lawbot-purple-600 hover:bg-lawbot-purple-50" onClick={() => handleViewEvidence(caseData)}>
                            <FileText className="h-4 w-4 mr-2" />
                            Evidence
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        </TabsContent>

        <TabsContent value="pending">
          <div className="space-y-4">
            {filteredCases
              .filter((case_) => case_.complaint.status === "Pending" || case_.complaint.status === "Requires More Information")
              .map((case_) => {
                // Extract real case data
                const caseData = case_.complaint
                const caseId = caseData.complaint_number
                const title = caseData.title || `${caseData.crime_type} Case`
                const priority = caseData.priority
                const status = caseData.status
                
                return (
                  <Card key={case_.id} className="card-modern bg-gradient-to-r from-lawbot-amber-50 to-white dark:from-lawbot-amber-900/10 dark:to-lawbot-slate-800 border-lawbot-amber-200 dark:border-lawbot-amber-800 hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-8">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-4">
                            <h3 className="text-xl font-bold text-lawbot-blue-600 dark:text-lawbot-blue-400">{caseId}</h3>
                            <Badge className={`${getPriorityColor(priority)} text-xs font-medium`}>
                              {priority === 'high' ? '🔴' : priority === 'medium' ? '🟡' : '🟢'} {priority}
                            </Badge>
                            <Badge className={`${getStatusColor(status)} text-xs font-medium`}>
                              {status === 'Pending' ? '📋' : '❓'} {status}
                            </Badge>
                          </div>
                          <h4 className="font-bold text-lawbot-slate-900 dark:text-white mb-4 text-xl">{title}</h4>
                          <div className="bg-gradient-to-r from-lawbot-amber-100 to-lawbot-orange-100 dark:from-lawbot-amber-900/30 dark:to-lawbot-orange-900/30 p-4 rounded-xl border border-lawbot-amber-200 dark:border-lawbot-amber-800">
                            <div className="flex items-center mb-2">
                              <Clock className="h-4 w-4 mr-2 text-lawbot-amber-600" />
                              <span className="text-sm font-semibold text-lawbot-amber-800 dark:text-lawbot-amber-200">Action Required</span>
                            </div>
                            <p className="text-sm text-lawbot-amber-800 dark:text-lawbot-amber-200 leading-relaxed">
                              {status === "Pending"
                                ? "⏳ This case is pending initial review and assignment. Take immediate action to begin investigation."
                                : "❓ Additional information has been requested from the complainant. Follow up on missing details."}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-3 ml-6">
                          <Button
                            size="sm"
                            className="btn-gradient bg-gradient-to-r from-lawbot-amber-600 to-lawbot-amber-700 hover:from-lawbot-amber-700 hover:to-lawbot-amber-800"
                            onClick={() => handleUpdateStatus(caseData)}
                          >
                            <Activity className="h-4 w-4 mr-2" />
                            Take Action
                          </Button>
                          <Button size="sm" variant="outline" className="btn-modern border-lawbot-amber-300 text-lawbot-amber-600 hover:bg-lawbot-amber-50" onClick={() => handleViewDetails(caseData)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        </TabsContent>

        <TabsContent value="resolved">
          <div className="space-y-4">
            {filteredCases
              .filter((case_) => case_.complaint.status === "Resolved" || case_.complaint.status === "Dismissed")
              .map((case_) => {
                // Extract real case data
                const caseData = case_.complaint
                const caseId = caseData.complaint_number
                const title = caseData.title || `${caseData.crime_type} Case`
                const priority = caseData.priority
                const status = caseData.status
                const date = new Date(caseData.updated_at).toLocaleDateString()
                
                return (
                  <Card key={case_.id} className="card-modern bg-gradient-to-r from-lawbot-emerald-50 to-white dark:from-lawbot-emerald-900/10 dark:to-lawbot-slate-800 border-lawbot-emerald-200 dark:border-lawbot-emerald-800 hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-8">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-4">
                            <h3 className="text-xl font-bold text-lawbot-blue-600 dark:text-lawbot-blue-400">{caseId}</h3>
                            <Badge className={`${getPriorityColor(priority)} text-xs font-medium`}>
                              {priority === 'high' ? '🔴' : priority === 'medium' ? '🟡' : '🟢'} {priority}
                            </Badge>
                            <Badge className={`${getStatusColor(status)} text-xs font-medium`}>
                              {status === 'Resolved' ? '✅' : '❌'} {status}
                            </Badge>
                          </div>
                          <h4 className="font-bold text-lawbot-slate-900 dark:text-white mb-4 text-xl">{title}</h4>
                          <div className="bg-gradient-to-r from-lawbot-emerald-100 to-lawbot-green-100 dark:from-lawbot-emerald-900/30 dark:to-lawbot-green-900/30 p-4 rounded-xl border border-lawbot-emerald-200 dark:border-lawbot-emerald-800">
                            <div className="flex items-center mb-2">
                              <CheckCircle className="h-4 w-4 mr-2 text-lawbot-emerald-600" />
                              <span className="text-sm font-semibold text-lawbot-emerald-800 dark:text-lawbot-emerald-200">Case Completed</span>
                            </div>
                            <p className="text-sm text-lawbot-emerald-800 dark:text-lawbot-emerald-200 leading-relaxed">
                              ✅ Case successfully {status.toLowerCase()} on {date}. Investigation completed with
                              sufficient evidence for prosecution. All documentation finalized.
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-3 ml-6">
                          <Button size="sm" variant="outline" className="btn-modern border-lawbot-emerald-300 text-lawbot-emerald-600 hover:bg-lawbot-emerald-50" onClick={() => handleViewDetails(caseData)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Report
                          </Button>
                          <Button size="sm" variant="outline" className="btn-modern border-lawbot-blue-300 text-lawbot-blue-600 hover:bg-lawbot-blue-50">
                            <Download className="h-4 w-4 mr-2" />
                            Download Files
                          </Button>
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
        caseData={selectedCase ? {
          id: selectedCase.id,
          complaint_id: selectedCase.id,
          title: selectedCase.title || `${selectedCase.crime_type} Case`
        } : null}
      />
    </div>
  )
}
