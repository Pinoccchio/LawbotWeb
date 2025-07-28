"use client"

import { useState } from "react"
import { Search, Filter, Calendar, MapPin, User, FileText, Target, Activity, Shield, Database, SortAsc } from "lucide-react"
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
    <div className="space-y-8 animate-fade-in">
      <div className="animate-fade-in-up">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-lawbot-purple-600 to-lawbot-blue-600 bg-clip-text text-transparent">
          Case Search
        </h2>
        <p className="text-lawbot-slate-600 dark:text-lawbot-slate-400 text-lg mt-2">
          Advanced search and filtering across all cybercrime cases
        </p>
      </div>

      {/* Enhanced Search Interface */}
      <Card className="card-modern bg-gradient-to-r from-lawbot-purple-50/50 to-white dark:from-lawbot-purple-900/10 dark:to-lawbot-slate-800 border-lawbot-purple-200 dark:border-lawbot-purple-800 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-lawbot-purple-500 rounded-lg">
              <Search className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lawbot-slate-900 dark:text-white">Advanced Case Search</CardTitle>
              <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400">Use powerful filters to find specific cases or patterns</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enhanced Basic Search */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lawbot-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search by case ID, title, complainant, or keywords..."
                  className="pl-10 border-lawbot-slate-300 dark:border-lawbot-slate-600 focus:border-lawbot-purple-500 focus:ring-lawbot-purple-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Button className="btn-gradient">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button variant="outline" className="btn-modern border-lawbot-purple-300 text-lawbot-purple-600 hover:bg-lawbot-purple-50" onClick={() => setShowAdvanced(!showAdvanced)}>
              <Filter className="h-4 w-4 mr-2" />
              {showAdvanced ? 'Hide' : 'Show'} Advanced
            </Button>
          </div>

          {/* Enhanced Advanced Filters */}
          {showAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-gradient-to-r from-lawbot-slate-50 to-lawbot-blue-50 dark:from-lawbot-slate-800 dark:to-lawbot-blue-900/20 rounded-xl border border-lawbot-slate-200 dark:border-lawbot-slate-700 animate-fade-in-up">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300 flex items-center">
                  <Activity className="h-4 w-4 mr-2 text-lawbot-blue-500" />
                  Status
                </label>
                <Select>
                  <SelectTrigger className="border-lawbot-slate-300 dark:border-lawbot-slate-600 focus:border-lawbot-blue-500">
                    <SelectValue placeholder="Any status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">📋 Pending</SelectItem>
                    <SelectItem value="investigation">🔍 Under Investigation</SelectItem>
                    <SelectItem value="info">❓ Requires More Info</SelectItem>
                    <SelectItem value="resolved">✅ Resolved</SelectItem>
                    <SelectItem value="dismissed">❌ Dismissed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300 flex items-center">
                  <Target className="h-4 w-4 mr-2 text-lawbot-red-500" />
                  Priority
                </label>
                <Select>
                  <SelectTrigger className="border-lawbot-slate-300 dark:border-lawbot-slate-600 focus:border-lawbot-blue-500">
                    <SelectValue placeholder="Any priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="high">🔴 High Priority</SelectItem>
                    <SelectItem value="medium">🟡 Medium Priority</SelectItem>
                    <SelectItem value="low">🟢 Low Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300 flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-lawbot-emerald-500" />
                  Crime Type
                </label>
                <Select>
                  <SelectTrigger className="border-lawbot-slate-300 dark:border-lawbot-slate-600 focus:border-lawbot-blue-500">
                    <SelectValue placeholder="Any crime type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="fraud">💰 Financial Fraud</SelectItem>
                    <SelectItem value="harassment">😡 Harassment</SelectItem>
                    <SelectItem value="phishing">🎣 Phishing</SelectItem>
                    <SelectItem value="identity">🎭 Identity Theft</SelectItem>
                    <SelectItem value="malware">🦠 Malware</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300 flex items-center">
                  <Database className="h-4 w-4 mr-2 text-lawbot-purple-500" />
                  Assigned Unit
                </label>
                <Select>
                  <SelectTrigger className="border-lawbot-slate-300 dark:border-lawbot-slate-600 focus:border-lawbot-blue-500">
                    <SelectValue placeholder="Any unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Units</SelectItem>
                    <SelectItem value="economic">🏦 Economic Offenses Wing</SelectItem>
                    <SelectItem value="cyber">🔍 Cyber Crime Investigation Cell</SelectItem>
                    <SelectItem value="security">🔒 Cyber Security Division</SelectItem>
                    <SelectItem value="technical">🔧 Cyber Crime Technical Unit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-lawbot-amber-500" />
                  Date Range
                </label>
                <DatePickerWithRange />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300 flex items-center">
                  <Target className="h-4 w-4 mr-2 text-lawbot-orange-500" />
                  Risk Score
                </label>
                <div className="flex gap-2">
                  <Input placeholder="Min" type="number" className="border-lawbot-slate-300 dark:border-lawbot-slate-600 focus:border-lawbot-blue-500" />
                  <Input placeholder="Max" type="number" className="border-lawbot-slate-300 dark:border-lawbot-slate-600 focus:border-lawbot-blue-500" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300 flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-lawbot-green-500" />
                  Location
                </label>
                <Input placeholder="City, Region" className="border-lawbot-slate-300 dark:border-lawbot-slate-600 focus:border-lawbot-blue-500" />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300 flex items-center">
                  <User className="h-4 w-4 mr-2 text-lawbot-indigo-500" />
                  Officer
                </label>
                <Select>
                  <SelectTrigger className="border-lawbot-slate-300 dark:border-lawbot-slate-600 focus:border-lawbot-blue-500">
                    <SelectValue placeholder="Any officer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Officers</SelectItem>
                    <SelectItem value="martinez">👮 Officer Martinez</SelectItem>
                    <SelectItem value="chen">👮 Officer Chen</SelectItem>
                    <SelectItem value="johnson">👮 Officer Johnson</SelectItem>
                    <SelectItem value="rodriguez">👮 Officer Rodriguez</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Search Results */}
      <Card className="card-modern animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-lawbot-emerald-500 rounded-lg">
                <Database className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lawbot-slate-900 dark:text-white">Search Results</CardTitle>
                <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400">Found {mockCases.length} cases matching your criteria</CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Select defaultValue="date">
                <SelectTrigger className="w-48 border-lawbot-slate-300 dark:border-lawbot-slate-600 focus:border-lawbot-emerald-500">
                  <SortAsc className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">📅 Sort by Date</SelectItem>
                  <SelectItem value="priority">🎥 Sort by Priority</SelectItem>
                  <SelectItem value="status">📊 Sort by Status</SelectItem>
                  <SelectItem value="risk">⚠️ Sort by Risk Score</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockCases.map((case_, index) => (
              <Card key={case_.id} className="card-modern hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
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
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                        <div className="flex items-center text-lawbot-slate-600 dark:text-lawbot-slate-400 p-2 bg-lawbot-slate-50 dark:bg-lawbot-slate-800 rounded-lg">
                          <Calendar className="h-4 w-4 mr-2 text-lawbot-blue-500" />
                          <span className="text-sm font-medium">📅 {case_.date}</span>
                        </div>
                        <div className="flex items-center text-lawbot-slate-600 dark:text-lawbot-slate-400 p-2 bg-lawbot-slate-50 dark:bg-lawbot-slate-800 rounded-lg">
                          <User className="h-4 w-4 mr-2 text-lawbot-emerald-500" />
                          <span className="text-sm font-medium">👮 {case_.officer}</span>
                        </div>
                        <div className="flex items-center text-lawbot-slate-600 dark:text-lawbot-slate-400 p-2 bg-lawbot-slate-50 dark:bg-lawbot-slate-800 rounded-lg">
                          <FileText className="h-4 w-4 mr-2 text-lawbot-purple-500" />
                          <span className="text-sm font-medium">📎 {case_.evidence} files</span>
                        </div>
                        <div className="flex items-center text-lawbot-slate-600 dark:text-lawbot-slate-400 p-2 bg-lawbot-slate-50 dark:bg-lawbot-slate-800 rounded-lg">
                          <MapPin className="h-4 w-4 mr-2 text-lawbot-green-500" />
                          <span className="text-sm font-medium">📍 Manila, NCR</span>
                        </div>
                      </div>
                      <div className="p-3 bg-lawbot-slate-50 dark:bg-lawbot-slate-800 rounded-lg">
                        <span className="text-sm font-medium text-lawbot-slate-700 dark:text-lawbot-slate-300">🏢 Unit: {case_.unit}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 ml-6">
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${
                          case_.riskScore >= 80 ? "text-lawbot-red-500" : 
                          case_.riskScore >= 50 ? "text-lawbot-amber-500" : 
                          "text-lawbot-emerald-500"
                        }`}>
                          {case_.riskScore >= 80 ? '🚨' : case_.riskScore >= 50 ? '⚠️' : '✅'} {case_.riskScore}
                        </div>
                        <div className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400 font-medium">Risk Score</div>
                      </div>
                      <Button size="sm" className="btn-gradient" onClick={() => handleViewCase(case_)}>
                        <Search className="h-4 w-4 mr-2" />
                        View Case
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Enhanced Pagination */}
          <div className="flex items-center justify-between mt-8 p-4 bg-lawbot-slate-50 dark:bg-lawbot-slate-800 rounded-xl">
            <div className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400 font-medium">
              📊 Showing 1-10 of {mockCases.length} results
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled className="btn-modern">
                Previous
              </Button>
              <Button variant="outline" size="sm" className="btn-modern bg-lawbot-blue-500 text-white border-lawbot-blue-500">
                1
              </Button>
              <Button variant="outline" size="sm" className="btn-modern">
                2
              </Button>
              <Button variant="outline" size="sm" className="btn-modern">
                3
              </Button>
              <Button variant="outline" size="sm" className="btn-modern">
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
