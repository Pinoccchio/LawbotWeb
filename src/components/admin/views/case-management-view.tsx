"use client"

import { useState, useEffect } from "react"
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
import { StatusUpdateModal } from "@/components/modals/status-update-modal"
import { EvidenceViewerModal } from "@/components/modals/evidence-viewer-modal"
import ComplaintService, { ComplaintData } from "@/lib/complaint-service"
import { getPriorityColor, getStatusColor } from "@/lib/utils"

export function CaseManagementView() {
  const [selectedCase, setSelectedCase] = useState<ComplaintData | null>(null)
  const [cases, setCases] = useState<ComplaintData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalComplaints: 0,
    activeCases: 0,
    resolvedCases: 0,
    highPriority: 0,
    avgRiskScore: 0,
    recentCases: 0
  })
  const [statusDistribution, setStatusDistribution] = useState<Array<{label: string, value: number, color: string}>>([])
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false)

  // Fetch data on component mount
  useEffect(() => {
    fetchComplaintsData()
  }, [])

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

      setCases(complaintsResult.data)
      setStats(statsResult)
      setStatusDistribution(statusDistResult)
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

  const handleUpdateStatus = (caseData: ComplaintData) => {
    setSelectedCase(caseData)
    setStatusModalOpen(true)
  }

  const handleViewEvidence = (caseData: ComplaintData) => {
    setSelectedCase(caseData)
    setEvidenceModalOpen(true)
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
            Advanced Filters
          </Button>
          <Button className="btn-gradient">
            <Plus className="h-4 w-4 mr-2" />
            Assign Case
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
                />
              </div>
            </div>
            <Select>
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
            <Select>
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
            <div className="flex space-x-2">
              <Button variant="outline" className="btn-modern flex-1">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
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
                {stats.activeCases}
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
                Export
              </Button>
              <Button variant="outline" size="sm" className="btn-modern">
                Bulk Actions
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
                  <TableHead className="font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300">Actions</TableHead>
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
                ) : cases.map((case_, index) => (
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
                      {new Date(case_.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <span className="font-medium text-lawbot-blue-600 dark:text-lawbot-blue-400">
                          {case_.evidence_files?.length || 0}
                        </span>
                        <span className="text-xs text-lawbot-slate-500">files</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="btn-icon h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-48">
                          <DropdownMenuItem onClick={() => handleViewDetails(case_)} className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4 text-lawbot-blue-500" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(case_)} className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4 text-lawbot-emerald-500" />
                            Update Status
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewEvidence(case_)} className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4 text-lawbot-purple-500" />
                            View Evidence
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <Plus className="mr-2 h-4 w-4 text-lawbot-amber-500" />
                            Reassign Officer
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <Filter className="mr-2 h-4 w-4 text-lawbot-blue-500" />
                            Update Priority
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer text-lawbot-red-600 focus:text-lawbot-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Archive Case
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
                <div key={item.label} className="flex justify-between items-center animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <span className="text-sm font-medium text-lawbot-slate-700 dark:text-lawbot-slate-300">
                    {item.label}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-bold ${
                      item.color === 'amber' ? 'text-lawbot-amber-600' :
                      item.color === 'blue' ? 'text-lawbot-blue-600' :
                      item.color === 'orange' ? 'text-orange-600' :
                      item.color === 'emerald' ? 'text-lawbot-emerald-600' :
                      'text-lawbot-slate-600'
                    }`}>
                      {item.value}
                    </span>
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
              {[
                { case: "CYB-2025-001", action: "status updated to", value: "Under Investigation", color: "blue", icon: "🔍" },
                { case: "CYB-2025-002", action: "assigned to", value: "Officer Chen", color: "emerald", icon: "👮" },
                { case: "CYB-2025-003", action: "priority changed to", value: "High", color: "red", icon: "⚠️" },
                { case: "CYB-2025-004", action: "evidence uploaded by", value: "Officer Rodriguez", color: "purple", icon: "📎" },
                { case: "CYB-2025-005", action: "investigation completed", value: "Resolved", color: "emerald", icon: "✅" }
              ].map((activity, index) => (
                <div key={activity.case} className="text-sm animate-fade-in-up" style={{ animationDelay: `${(index + 6) * 100}ms` }}>
                  <div className="flex items-start space-x-2">
                    <span className="text-xs mt-0.5">{activity.icon}</span>
                    <div className="flex-1">
                      <span className="font-semibold text-lawbot-blue-600 dark:text-lawbot-blue-400">
                        {activity.case}
                      </span>
                      <span className="text-lawbot-slate-600 dark:text-lawbot-slate-400 mx-1">
                        {activity.action}
                      </span>
                      <span className={`font-medium ${
                        activity.color === 'blue' ? 'text-lawbot-blue-600' :
                        activity.color === 'emerald' ? 'text-lawbot-emerald-600' :
                        activity.color === 'red' ? 'text-lawbot-red-600' :
                        'text-lawbot-purple-600'
                      }`}>
                        {activity.value}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <CaseDetailModal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} caseData={selectedCase} />
      <StatusUpdateModal 
        isOpen={statusModalOpen} 
        onClose={() => setStatusModalOpen(false)} 
        caseData={selectedCase}
        onStatusUpdate={async (newStatus: string, updateData: any) => {
          console.log('🔄 Admin status update:', newStatus, updateData)
          // For admin view, we can add specific admin logic here if needed
          setStatusModalOpen(false)
        }}
      />
      <EvidenceViewerModal
        isOpen={evidenceModalOpen}
        onClose={() => setEvidenceModalOpen(false)}
        caseData={selectedCase}
      />
    </div>
  )
}
