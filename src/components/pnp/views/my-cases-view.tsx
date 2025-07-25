"use client"

import { useState } from "react"
import { Calendar, FileText, AlertTriangle, Eye, Edit, Search, Filter } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CaseDetailModal } from "@/components/modals/case-detail-modal"
import { StatusUpdateModal } from "@/components/modals/status-update-modal"
import { EvidenceViewerModal } from "@/components/modals/evidence-viewer-modal"
import { mockCases } from "@/lib/mock-data"
import { getPriorityColor, getStatusColor } from "@/lib/utils"

export function MyCasesView() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [selectedCase, setSelectedCase] = useState<any>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false)

  const officerCases = mockCases.filter((c) => c.officer === "Officer Smith" || c.officer === "Officer Martinez")

  const filteredCases = officerCases.filter((case_) => {
    const matchesSearch =
      case_.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || case_.status.toLowerCase().includes(statusFilter.toLowerCase())
    const matchesPriority = priorityFilter === "all" || case_.priority === priorityFilter

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">My Cases</h2>
          <p className="text-gray-600 dark:text-slate-400">Cases assigned to you for investigation</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{officerCases.length}</div>
          <div className="text-sm text-gray-600 dark:text-slate-400">Total Cases</div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle>Search & Filter Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by case ID or title..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="investigation">Under Investigation</SelectItem>
                <SelectItem value="info">Requires More Info</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Advanced
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">Active Cases</TabsTrigger>
          <TabsTrigger value="pending">Pending Action</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <div className="space-y-4">
            {filteredCases
              .filter((c) => c.status !== "Resolved" && c.status !== "Dismissed")
              .map((case_) => (
                <Card
                  key={case_.id}
                  className="hover:shadow-lg transition-shadow border-slate-200 dark:border-slate-700"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-3">
                          <h3 className="text-lg font-semibold">{case_.id}</h3>
                          <Badge className={getPriorityColor(case_.priority)}>{case_.priority}</Badge>
                          <Badge className={getStatusColor(case_.status)}>{case_.status}</Badge>
                        </div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3 text-lg">{case_.title}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-slate-400">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>Submitted: {case_.date}</span>
                          </div>
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2" />
                            <span>{case_.evidence} evidence files</span>
                          </div>
                          <div className="flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            <span>Risk Score: {case_.riskScore}</span>
                          </div>
                          <div className="flex items-center">
                            <span>Unit: {case_.unit}</span>
                          </div>
                        </div>
                        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <h5 className="font-medium mb-2">Case Summary:</h5>
                          <p className="text-sm text-gray-600 dark:text-slate-400">
                            Investigation ongoing for {case_.title.toLowerCase()}. Evidence collected and being
                            analyzed.
                            {case_.priority === "high" && " High priority case requiring immediate attention."}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2 ml-6">
                        <Button size="sm" onClick={() => handleViewDetails(case_)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(case_)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Update Status
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleViewEvidence(case_)}>
                          <FileText className="h-4 w-4 mr-2" />
                          Evidence
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="pending">
          <div className="space-y-4">
            {filteredCases
              .filter((c) => c.status === "Pending" || c.status === "Requires More Info")
              .map((case_) => (
                <Card key={case_.id} className="border-amber-200 dark:border-amber-800">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-3">
                          <h3 className="text-lg font-semibold">{case_.id}</h3>
                          <Badge className={getPriorityColor(case_.priority)}>{case_.priority}</Badge>
                          <Badge className={getStatusColor(case_.status)}>{case_.status}</Badge>
                        </div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">{case_.title}</h4>
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                          <p className="text-sm text-amber-800 dark:text-amber-200">
                            {case_.status === "Pending"
                              ? "This case is pending initial review and assignment."
                              : "Additional information has been requested from the complainant."}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2 ml-6">
                        <Button
                          size="sm"
                          className="bg-amber-600 hover:bg-amber-700"
                          onClick={() => handleUpdateStatus(case_)}
                        >
                          Take Action
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleViewDetails(case_)}>
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="resolved">
          <div className="space-y-4">
            {filteredCases
              .filter((c) => c.status === "Resolved" || c.status === "Dismissed")
              .map((case_) => (
                <Card key={case_.id} className="border-emerald-200 dark:border-emerald-800">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-3">
                          <h3 className="text-lg font-semibold">{case_.id}</h3>
                          <Badge className={getPriorityColor(case_.priority)}>{case_.priority}</Badge>
                          <Badge className={getStatusColor(case_.status)}>{case_.status}</Badge>
                        </div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">{case_.title}</h4>
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg">
                          <p className="text-sm text-emerald-800 dark:text-emerald-200">
                            Case successfully {case_.status.toLowerCase()} on {case_.date}. Investigation completed with
                            sufficient evidence for prosecution.
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2 ml-6">
                        <Button size="sm" variant="outline" onClick={() => handleViewDetails(case_)}>
                          View Report
                        </Button>
                        <Button size="sm" variant="outline">
                          Download Files
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>

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
