"use client"

import { useState, useEffect } from "react"
import NotificationService from "@/lib/notification-service"
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2, Activity, AlertTriangle, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { CaseDetailModal } from "@/components/modals/case-detail-modal"
// StatusUpdateModal removed for view-only mode
import { EvidenceViewerModal } from "@/components/modals/evidence-viewer-modal"
import ComplaintService from "@/lib/complaint-service"

// Define ComplaintData interface since it's not exported from the service
interface ComplaintData {
  id: string
  complaint_number?: string
  title?: string
  description?: string
  crime_type?: string
  priority: string
  status: string
  assigned_officer?: string
  assigned_unit?: string
  risk_score?: number
  created_at: string
  ai_risk_score?: number
  evidenceCount?: number
}
import { getPriorityColor, getStatusColor } from "@/lib/utils"

// Helper function to map status names to colors
function getStatusColorForName(name: string): string {
  switch (name?.toLowerCase()) {
    case 'pending':
      return 'bg-amber-500'
    case 'under investigation':
      return 'bg-blue-500'
    case 'requires more information':
    case 'requires more info':
      return 'bg-orange-500'
    case 'resolved':
      return 'bg-emerald-500'
    case 'dismissed':
      return 'bg-red-500'
    default:
      return 'bg-slate-500'
  }
}
import { PhilippineTime } from "@/lib/philippine-time"
import { EvidenceService } from "@/lib/evidence-service"

export function CaseManagementView() {
  const [selectedCase, setSelectedCase] = useState<ComplaintData | null>(null)
  const [cases, setCases] = useState<ComplaintData[]>([])
  const [filteredCases, setFilteredCases] = useState<ComplaintData[]>([])
  const [evidenceCounts, setEvidenceCounts] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [stats, setStats] = useState({
    totalComplaints: 0,
    activeCases: 0,
    resolvedCases: 0,
    highPriority: 0,
    avgRiskScore: 0,
    recentCases: 0,
    pending: 0,
    investigating: 0,
    moreInfo: 0,
    dismissed: 0,
    mediumPriority: 0,
    lowPriority: 0,
    resolutionRate: 0
  })
  const [statusDistribution, setStatusDistribution] = useState<Array<{label: string, value: number, color: string, name?: string, percentage?: number}>>([]) 
  const [recentNotifications, setRecentNotifications] = useState<any[]>([])
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false)

  // Fetch data on component mount
  useEffect(() => {
    fetchComplaintsData()
    fetchRecentNotifications()
  }, [])

  // Apply filters when search term or filters change
  useEffect(() => {
    if (!cases.length) return
    
    console.log('🔍 Applying filters:', { searchTerm, statusFilter, priorityFilter })
    
    const filtered = cases.filter(complaint => {
      // Search term filter
      const matchesSearch = searchTerm === '' || 
        (complaint.complaint_number?.toLowerCase().includes(searchTerm.toLowerCase()) || 
         complaint.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
         complaint.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         complaint.assigned_officer?.toLowerCase().includes(searchTerm.toLowerCase()))
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'pending' && complaint.status === 'Pending') ||
        (statusFilter === 'investigation' && complaint.status === 'Under Investigation') ||
        (statusFilter === 'info' && complaint.status === 'Requires More Information') ||
        (statusFilter === 'resolved' && complaint.status === 'Resolved') ||
        (statusFilter === 'dismissed' && complaint.status === 'Dismissed')
      
      // Priority filter
      const matchesPriority = priorityFilter === 'all' || 
        (complaint.priority?.toLowerCase() === priorityFilter.toLowerCase())
      
      return matchesSearch && matchesStatus && matchesPriority
    })
    
    setFilteredCases(filtered)
  }, [cases, searchTerm, statusFilter, priorityFilter])

  const fetchComplaintsData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Fetch complaints and stats in parallel
      const [complaintsResult, statsResult, statusDistResult] = await Promise.all([
        ComplaintService.getAllComplaints({ limit: 100 }),
        ComplaintService.getComplaintStats(),
        ComplaintService.getStatusDistribution()
      ])

      if (complaintsResult.error) {
        throw new Error(complaintsResult.error.message)
      }

      const complaints = complaintsResult.data
      setCases(complaints)
      setFilteredCases(complaints)
      // Map from API stats to our component stats
      setStats({
        totalComplaints: statsResult.total || 0,
        activeCases: statsResult.investigating || 0,
        resolvedCases: statsResult.resolved || 0,
        highPriority: statsResult.highPriority || 0,
        avgRiskScore: statsResult.avgRiskScore || 0,
        recentCases: complaints.length,
        pending: statsResult.pending || 0,
        investigating: statsResult.investigating || 0,
        moreInfo: statsResult.moreInfo || 0,
        dismissed: statsResult.dismissed || 0,
        mediumPriority: statsResult.mediumPriority || 0,
        lowPriority: statsResult.lowPriority || 0,
        resolutionRate: statsResult.resolutionRate || 0
      })
      // Map API status distribution to our component format
      const formattedStatusDist = statusDistResult.map(item => ({
        label: item.name,
        value: item.value,
        color: getStatusColorForName(item.name),
        name: item.name,
        percentage: item.percentage
      }))
      setStatusDistribution(formattedStatusDist)
      
      // Fetch evidence counts for each complaint
      const evidenceCountsObj: Record<string, number> = {}
      
      // Process in batches to avoid overwhelming the API
      await Promise.all(
        complaints.map(async (complaint) => {
          const complaintId = complaint.id
          try {
            const count = await EvidenceService.getEvidenceCount(complaintId)
            evidenceCountsObj[complaintId] = count
          } catch (err) {
            console.error(`Error fetching evidence count for case ${complaintId}:`, err)
            evidenceCountsObj[complaintId] = 0
          }
        })
      )
      
      setEvidenceCounts(evidenceCountsObj)
      console.log('✅ Evidence counts loaded:', Object.keys(evidenceCountsObj).length)
      
    } catch (err: any) {
      console.error('Error fetching complaints data:', err)
      setError(err.message || 'Failed to load complaint data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewDetails = (caseData: ComplaintData) => {
    setSelectedCase(caseData)
    setDetailModalOpen(true)
  }

  const handleViewEvidence = async (caseData: ComplaintData) => {
    // Set the case data to allow the modal to fetch evidence files
    const caseId = caseData.id
    
    // Set the evidence count so the modal knows what to expect
    const evidenceCount = evidenceCounts[caseId] || await EvidenceService.getEvidenceCount(caseId)
    
    // Log the evidence count to debug
    console.log('🧮 Evidence count for case', caseId, ':', evidenceCount)
    
    // Create an enhanced case data object with the evidence count
    const enhancedCaseData = {
      ...caseData,
      evidenceCount, // Add this property to help the modal
      title: caseData.title || caseData.description?.substring(0, 50) || 'Case Details'
    }
    
    setSelectedCase(enhancedCaseData)
    setEvidenceModalOpen(true)
  }
  
  // Fetch recent notifications for the activity feed
  const fetchRecentNotifications = async () => {
    setNotificationsLoading(true)
    try {
      // Get real notifications from the Supabase database
      // This uses the actual database connection through NotificationService
      const recentActivity = await NotificationService.getRecentNotifications(10)
      
      console.log('🔔 Fetched recent notifications from database:', recentActivity.length)
      setRecentNotifications(recentActivity)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setNotificationsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-lawbot-blue-600 to-lawbot-purple-600 bg-clip-text text-transparent">
            Case Management
          </h2>
          <p className="text-lawbot-slate-600 dark:text-lawbot-slate-400 text-lg mt-2">
            Manage and monitor all cybercrime cases across specialized units
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="btn-modern">
            <Filter className="h-4 w-4 mr-2" />
            Filter Cases
          </Button>
        </div>
      </div>

      {/* Enhanced Filters */}
      <Card className="card-modern animate-fade-in-up border-lawbot-blue-200 dark:border-lawbot-blue-800 bg-gradient-to-r from-lawbot-blue-50/50 to-white dark:from-lawbot-blue-900/10 dark:to-lawbot-slate-800">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-lawbot-blue-500 rounded-lg">
              <Search className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-lawbot-slate-900 dark:text-white">
              Search & Filter Cases
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lawbot-slate-400 h-4 w-4" />
                <Input 
                  placeholder="Search by case ID, title, or officer..." 
                  className="pl-10 border-lawbot-slate-300 dark:border-lawbot-slate-600 focus:border-lawbot-blue-500 focus:ring-lawbot-blue-500" 
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
                <SelectItem value="all">All Cases</SelectItem>
                <SelectItem value="pending">📋 Pending</SelectItem>
                <SelectItem value="investigation">🔍 Under Investigation</SelectItem>
                <SelectItem value="info">❓ Requires More Info</SelectItem>
                <SelectItem value="resolved">✅ Resolved</SelectItem>
                <SelectItem value="dismissed">❌ Dismissed</SelectItem>
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
            <Button 
              variant="outline" 
              className="btn-modern h-12 w-full" 
              onClick={() => {
                // Reset filters
                setSearchTerm('')
                setStatusFilter('all')
                setPriorityFilter('all')
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
          
          {/* Quick Stats */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-slate-200 dark:border-lawbot-slate-700">
              <div className="text-xl font-bold text-lawbot-blue-600 dark:text-lawbot-blue-400">
                {stats.totalComplaints}
              </div>
              <p className="text-xs text-lawbot-slate-600 dark:text-lawbot-slate-400">Total Cases</p>
            </div>
            <div className="text-center p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-slate-200 dark:border-lawbot-slate-700">
              <div className="text-xl font-bold text-lawbot-red-600 dark:text-lawbot-red-400">
                {stats.highPriority}
              </div>
              <p className="text-xs text-lawbot-slate-600 dark:text-lawbot-slate-400">High Priority</p>
            </div>
            <div className="text-center p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-slate-200 dark:border-lawbot-slate-700">
              <div className="text-xl font-bold text-lawbot-emerald-600 dark:text-lawbot-emerald-400">
                {stats.investigating}
              </div>
              <p className="text-xs text-lawbot-slate-600 dark:text-lawbot-slate-400">In Progress</p>
            </div>
            <div className="text-center p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-slate-200 dark:border-lawbot-slate-700">
              <div className="text-xl font-bold text-lawbot-amber-600 dark:text-lawbot-amber-400">
                {stats.avgRiskScore}
              </div>
              <p className="text-xs text-lawbot-slate-600 dark:text-lawbot-slate-400">Avg Risk Score</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Cases Table */}
      <Card className="card-modern animate-slide-in-left">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-lawbot-slate-900 dark:text-white">
                All Cases
              </CardTitle>
              <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400">
                Complete list of cybercrime cases in the system
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="btn-modern">
                Export Report
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="table-modern">
              <TableHeader>
                <TableRow className="border-lawbot-slate-200 dark:border-lawbot-slate-700">
                  <TableHead className="font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300">Case ID</TableHead>
                  <TableHead className="font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300">Title</TableHead>
                  <TableHead className="font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300">Priority</TableHead>
                  <TableHead className="font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300">Status</TableHead>
                  <TableHead className="font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300">Officer</TableHead>
                  <TableHead className="font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300">Unit</TableHead>
                  <TableHead className="font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300">Risk Score</TableHead>
                  <TableHead className="font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300">Date</TableHead>
                  <TableHead className="font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300">Evidence</TableHead>
                  <TableHead className="font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300">View</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-lawbot-blue-500"></div>
                        <span className="text-lawbot-slate-600 dark:text-lawbot-slate-400">Loading cases...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <div className="text-lawbot-red-600 dark:text-lawbot-red-400">
                        Error loading cases: {error}
                      </div>
                      <Button 
                        onClick={fetchComplaintsData} 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                      >
                        Retry
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : cases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <div className="text-lawbot-slate-600 dark:text-lawbot-slate-400">
                        No cases found
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredCases.map((case_, index) => (
                  <TableRow 
                    key={case_.id} 
                    className="hover:bg-lawbot-slate-50 dark:hover:bg-lawbot-slate-800/50 transition-colors duration-200 animate-fade-in-up border-lawbot-slate-100 dark:border-lawbot-slate-800"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TableCell className="font-semibold text-lawbot-blue-600 dark:text-lawbot-blue-400">
                      {case_.complaint_number || case_.id}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate font-medium text-lawbot-slate-900 dark:text-white">
                        {case_.title || case_.description?.substring(0, 50) + '...'}
                      </div>
                      <div className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400">
                        {case_.crime_type}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getPriorityColor(case_.priority)} text-xs font-medium`}>
                        {case_.priority === 'high' ? '🔴' : case_.priority === 'medium' ? '🟡' : '🟢'} {case_.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(case_.status)} text-xs font-medium`}>
                        {case_.status === 'Pending' ? '📋' : 
                         case_.status === 'Under Investigation' ? '🔍' :
                         case_.status === 'Resolved' ? '✅' :
                         case_.status === 'Dismissed' ? '❌' : '❓'} 
                        {case_.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-lawbot-slate-900 dark:text-white">
                        {case_.assigned_officer || 'Unassigned'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400 max-w-xs truncate">
                        {case_.assigned_unit || 'Unassigned'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`font-bold text-sm ${
                            (case_.risk_score || 0) >= 80 ? "text-lawbot-red-500" : 
                            (case_.risk_score || 0) >= 50 ? "text-lawbot-amber-500" : 
                            "text-lawbot-emerald-500"
                          }`}
                        >
                          {case_.risk_score || 0}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${
                          (case_.risk_score || 0) >= 80 ? "bg-lawbot-red-500" : 
                          (case_.risk_score || 0) >= 50 ? "bg-lawbot-amber-500" : 
                          "bg-lawbot-emerald-500"
                        }`} />
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400">
                      {PhilippineTime.formatTableTime(case_.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <span className="font-medium text-lawbot-blue-600 dark:text-lawbot-blue-400">
                          {evidenceCounts[case_.id] || 0}
                        </span>
                        <span className="text-xs text-lawbot-slate-500">files</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="btn-icon h-8 w-8 hover:bg-lawbot-blue-50 dark:hover:bg-lawbot-blue-900/20"
                          onClick={() => handleViewDetails(case_)}
                          title="View Case Details"
                        >
                          <Eye className="h-4 w-4 text-lawbot-blue-500" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="btn-icon h-8 w-8 hover:bg-lawbot-purple-50 dark:hover:bg-lawbot-purple-900/20"
                          onClick={() => handleViewEvidence(case_)}
                          title="View Evidence Files"
                        >
                          <Eye className="h-4 w-4 text-lawbot-purple-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Case Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Case Distribution */}
        <Card className="card-modern animate-slide-in-left bg-gradient-to-br from-lawbot-blue-50 to-white dark:from-lawbot-blue-900/10 dark:to-lawbot-slate-800 border-lawbot-blue-200 dark:border-lawbot-blue-800">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-lawbot-blue-500 rounded-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-lawbot-slate-900 dark:text-white">Case Distribution</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statusDistribution.map((item, index) => (
                <div key={`status-${item.label || index}`} className="flex justify-between items-center animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <span className="text-sm font-medium text-lawbot-slate-700 dark:text-lawbot-slate-300">
                    {item.label}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-bold ${
                      item.color === 'bg-amber-500' ? 'text-lawbot-amber-600' :
                      item.color === 'bg-blue-500' ? 'text-lawbot-blue-600' :
                      item.color === 'bg-orange-500' ? 'text-orange-600' :
                      item.color === 'bg-emerald-500' ? 'text-lawbot-emerald-600' :
                      item.color === 'bg-red-500' ? 'text-lawbot-red-600' :
                      'text-lawbot-slate-600'
                    }`}>
                      {item.value}
                    </span>
                    {item.percentage !== undefined && (
                      <span className="text-xs text-lawbot-slate-500">({item.percentage}%)</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Priority Breakdown */}
        <Card className="card-modern animate-scale-in bg-gradient-to-br from-lawbot-purple-50 to-white dark:from-lawbot-purple-900/10 dark:to-lawbot-slate-800 border-lawbot-purple-200 dark:border-lawbot-purple-800" style={{ animationDelay: '100ms' }}>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-lawbot-purple-500 to-lawbot-pink-500 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-lawbot-slate-900 dark:text-white">Priority Breakdown</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: "High Priority", value: cases.filter(c => c.priority === 'high').length, color: "red", icon: "🔴" },
                { label: "Medium Priority", value: cases.filter(c => c.priority === 'medium').length, color: "amber", icon: "🟡" },
                { label: "Low Priority", value: cases.filter(c => c.priority === 'low').length, color: "emerald", icon: "🟢" }
              ].map((item, index) => {
                const percentage = cases.length > 0 ? Math.round((item.value / cases.length) * 100) : 0
                return (
                  <div key={item.label} className="space-y-2 animate-fade-in-up" style={{ animationDelay: `${(index + 3) * 100}ms` }}>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-lawbot-slate-700 dark:text-lawbot-slate-300">
                        {item.icon} {item.label}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-bold ${
                          item.color === 'red' ? 'text-lawbot-red-600' :
                          item.color === 'amber' ? 'text-lawbot-amber-600' :
                          'text-lawbot-emerald-600'
                        }`}>
                          {item.value}
                        </span>
                        <span className="text-xs text-lawbot-slate-500">({percentage}%)</span>
                      </div>
                    </div>
                    <Progress 
                      value={percentage} 
                      className={`h-2 ${
                        item.color === 'red' ? 'bg-lawbot-red-100 dark:bg-lawbot-red-900' :
                        item.color === 'amber' ? 'bg-lawbot-amber-100 dark:bg-lawbot-amber-900' :
                        'bg-lawbot-emerald-100 dark:bg-lawbot-emerald-900'
                      }`}
                    />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="card-modern animate-slide-in-right bg-gradient-to-br from-lawbot-emerald-50 to-white dark:from-lawbot-emerald-900/10 dark:to-lawbot-slate-800 border-lawbot-emerald-200 dark:border-lawbot-emerald-800" style={{ animationDelay: '200ms' }}>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-lawbot-emerald-500 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-lawbot-slate-900 dark:text-white">Recent Activity</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notificationsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-lawbot-emerald-500"></div>
                  <span className="ml-2 text-lawbot-slate-600 dark:text-lawbot-slate-400">Loading activity...</span>
                </div>
              ) : recentNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-lawbot-slate-600 dark:text-lawbot-slate-400">No recent activity found</p>
                </div>
              ) : (
                recentNotifications.map((notification, index) => {
                  // Get notification display properties
                  const { icon, color } = NotificationService.getNotificationDisplay(notification)
                  const timeAgo = NotificationService.formatNotificationTime(notification.created_at)
                  
                  return (
                    <div key={notification.id} className="text-sm animate-fade-in-up" style={{ animationDelay: `${(index + 6) * 100}ms` }}>
                      <div className="flex items-start space-x-2">
                        <span className="text-xs mt-0.5">{icon}</span>
                        <div className="flex-1">
                          <span className="font-semibold text-lawbot-blue-600 dark:text-lawbot-blue-400">
                            {notification.complaint?.complaint_number || notification.related_complaint_id || 'System'}
                          </span>
                          <span className="text-lawbot-slate-600 dark:text-lawbot-slate-400 mx-1">
                            {notification.title}
                          </span>
                          <div className="text-xs text-lawbot-slate-500 mt-1">{timeAgo}</div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              
              {/* Show button to load more notifications if there are some */}
              {recentNotifications.length > 0 && (
                <div className="text-center mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs"
                    onClick={fetchRecentNotifications}
                  >
                    Refresh Activity
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <CaseDetailModal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} caseData={selectedCase} isAdmin={true} />
      <EvidenceViewerModal
        isOpen={evidenceModalOpen}
        onClose={() => setEvidenceModalOpen(false)}
        mode="single-case"
        caseData={selectedCase}
      />
    </div>
  )
}
