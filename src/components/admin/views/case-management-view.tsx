"use client"

import { useState } from "react"
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CaseDetailModal } from "@/components/modals/case-detail-modal"
import { StatusUpdateModal } from "@/components/modals/status-update-modal"
import { EvidenceViewerModal } from "@/components/modals/evidence-viewer-modal"
import { mockCases } from "@/lib/mock-data"
import { getPriorityColor, getStatusColor } from "@/lib/utils"

export function CaseManagementView() {
  const [selectedCase, setSelectedCase] = useState<any>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false)

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
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Case Management</h2>
          <p className="text-gray-600 dark:text-slate-400">Manage and monitor all cybercrime cases</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Assign Case
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle>Search & Filter Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input placeholder="Search by case ID, title, or officer..." className="pl-10" />
              </div>
            </div>
            <Select>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cases</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="investigation">Under Investigation</SelectItem>
                <SelectItem value="info">Requires More Info</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
            <Select>
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
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cases Table */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle>All Cases</CardTitle>
          <CardDescription>Complete list of cybercrime cases in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Case ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Officer</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Risk Score</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Evidence</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCases.map((case_) => (
                <TableRow key={case_.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <TableCell className="font-medium">{case_.id}</TableCell>
                  <TableCell className="max-w-xs truncate">{case_.title}</TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(case_.priority)}>{case_.priority}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(case_.status)}>{case_.status}</Badge>
                  </TableCell>
                  <TableCell>{case_.officer}</TableCell>
                  <TableCell className="max-w-xs truncate">{case_.unit}</TableCell>
                  <TableCell>
                    <span
                      className={`font-medium ${case_.riskScore >= 80 ? "text-red-500" : case_.riskScore >= 50 ? "text-amber-500" : "text-emerald-500"}`}
                    >
                      {case_.riskScore}
                    </span>
                  </TableCell>
                  <TableCell>{case_.date}</TableCell>
                  <TableCell>{case_.evidence} files</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleViewDetails(case_)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateStatus(case_)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Update Status
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewEvidence(case_)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Evidence
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Plus className="mr-2 h-4 w-4" />
                          Reassign Officer
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Filter className="mr-2 h-4 w-4" />
                          Update Priority
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
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
        </CardContent>
      </Card>

      {/* Case Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle>Case Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Pending</span>
                <span className="text-sm font-medium">156</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Under Investigation</span>
                <span className="text-sm font-medium">892</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Requires More Info</span>
                <span className="text-sm font-medium">67</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Resolved</span>
                <span className="text-sm font-medium">1,023</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Dismissed</span>
                <span className="text-sm font-medium">109</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle>Priority Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">High Priority</span>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium">89</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Medium Priority</span>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  <span className="text-sm font-medium">234</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Low Priority</span>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-sm font-medium">456</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm">
                <span className="font-medium">CYB-2025-001</span> status updated to{" "}
                <span className="text-blue-600">Under Investigation</span>
              </div>
              <div className="text-sm">
                <span className="font-medium">CYB-2025-002</span> assigned to{" "}
                <span className="text-blue-600">Officer Chen</span>
              </div>
              <div className="text-sm">
                <span className="font-medium">CYB-2025-003</span> priority changed to{" "}
                <span className="text-red-600">High</span>
              </div>
              <div className="text-sm">
                <span className="font-medium">CYB-2025-004</span> evidence uploaded by{" "}
                <span className="text-blue-600">Officer Rodriguez</span>
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
