"use client"

import { useState } from "react"
import { Search, Filter, Calendar, MapPin, User, FileText } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { CaseDetailModal } from "@/components/modals/case-detail-modal"
import { mockCases } from "@/lib/mock-data"
import { getPriorityColor, getStatusColor } from "@/lib/utils"

export function CaseSearchView() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [selectedCase, setSelectedCase] = useState<any>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)

  const handleViewCase = (caseData: any) => {
    setSelectedCase(caseData)
    setDetailModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Case Search</h2>
        <p className="text-gray-600 dark:text-slate-400">Search and filter cases across the system</p>
      </div>

      {/* Search Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Search Cases</CardTitle>
          <CardDescription>Use filters to find specific cases or patterns</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic Search */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by case ID, title, complainant, or keywords..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button variant="outline" onClick={() => setShowAdvanced(!showAdvanced)}>
              <Filter className="h-4 w-4 mr-2" />
              Advanced
            </Button>
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Any status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="investigation">Under Investigation</SelectItem>
                    <SelectItem value="info">Requires More Info</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="dismissed">Dismissed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Any priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="low">Low Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Crime Type</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Any crime type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="fraud">Financial Fraud</SelectItem>
                    <SelectItem value="harassment">Harassment</SelectItem>
                    <SelectItem value="phishing">Phishing</SelectItem>
                    <SelectItem value="identity">Identity Theft</SelectItem>
                    <SelectItem value="malware">Malware</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Assigned Unit</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Any unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Units</SelectItem>
                    <SelectItem value="economic">Economic Offenses Wing</SelectItem>
                    <SelectItem value="cyber">Cyber Crime Investigation Cell</SelectItem>
                    <SelectItem value="security">Cyber Security Division</SelectItem>
                    <SelectItem value="technical">Cyber Crime Technical Unit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <DatePickerWithRange />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Risk Score</label>
                <div className="flex gap-2">
                  <Input placeholder="Min" type="number" />
                  <Input placeholder="Max" type="number" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input placeholder="City, Region" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Officer</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Any officer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Officers</SelectItem>
                    <SelectItem value="martinez">Officer Martinez</SelectItem>
                    <SelectItem value="chen">Officer Chen</SelectItem>
                    <SelectItem value="johnson">Officer Johnson</SelectItem>
                    <SelectItem value="rodriguez">Officer Rodriguez</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Search Results</CardTitle>
              <CardDescription>Found {mockCases.length} cases matching your criteria</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Select defaultValue="date">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Sort by Date</SelectItem>
                  <SelectItem value="priority">Sort by Priority</SelectItem>
                  <SelectItem value="status">Sort by Status</SelectItem>
                  <SelectItem value="risk">Sort by Risk Score</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockCases.map((case_) => (
              <Card key={case_.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold">{case_.id}</h3>
                        <Badge className={getPriorityColor(case_.priority)}>{case_.priority}</Badge>
                        <Badge className={getStatusColor(case_.status)}>{case_.status}</Badge>
                      </div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">{case_.title}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-slate-400">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>{case_.date}</span>
                        </div>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          <span>{case_.officer}</span>
                        </div>
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2" />
                          <span>{case_.evidence} files</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>Manila, NCR</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="text-sm text-gray-600 dark:text-slate-400">Unit: {case_.unit}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <div className="text-right mr-4">
                        <div
                          className={`text-lg font-bold ${
                            case_.riskScore >= 80
                              ? "text-red-600"
                              : case_.riskScore >= 50
                                ? "text-amber-600"
                                : "text-green-600"
                          }`}
                        >
                          {case_.riskScore}
                        </div>
                        <div className="text-xs text-gray-500">Risk Score</div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleViewCase(case_)}>
                        View Case
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600 dark:text-slate-400">Showing 1-10 of {mockCases.length} results</div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                1
              </Button>
              <Button variant="outline" size="sm">
                2
              </Button>
              <Button variant="outline" size="sm">
                3
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      <CaseDetailModal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} caseData={selectedCase} />
    </div>
  )
}
