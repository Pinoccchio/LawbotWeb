"use client"

import { useState, useEffect } from "react"
import { FileText, AlertTriangle, Users, CheckCircle, MoreHorizontal, TrendingUp, Clock, Shield, Activity, Eye, ArrowUpRight, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { getPriorityColor, getStatusColor } from "@/lib/utils"
import AdminService, { DashboardStats, CaseDistributionData, TimelineData, OfficerPerformanceData } from "@/lib/admin-service"
import ComplaintService from "@/lib/complaint-service"
import { PhilippineTime } from "@/lib/philippine-time"

export function AdminDashboardView() {
  // State for dashboard data
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [caseDistribution, setCaseDistribution] = useState<CaseDistributionData | null>(null)
  const [timelineData, setTimelineData] = useState<TimelineData[] | null>(null)
  const [officerPerformance, setOfficerPerformance] = useState<OfficerPerformanceData[] | null>(null)
  const [recentCases, setRecentCases] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  // Load dashboard data on component mount
  useEffect(() => {
    loadDashboardData()
  }, [])

  // Function to load all dashboard data
  const loadDashboardData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Load dashboard stats
      const stats = await AdminService.getDashboardStats()
      setDashboardStats(stats)

      // Load case distribution data
      const distribution = await AdminService.getCaseDistribution()
      setCaseDistribution(distribution)

      // Load timeline data
      const timeline = await AdminService.getCaseTimeline(30)
      setTimelineData(timeline)

      // Load officer performance data
      const performance = await AdminService.getOfficerPerformanceData()
      setOfficerPerformance(performance)

      // Load recent cases
      const { data: cases } = await ComplaintService.getAllComplaints({ 
        limit: 5,
        offset: 0
      })
      setRecentCases(cases || [])

    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getIconColor = (color: string) => {
    switch (color) {
      case "red": return "text-lawbot-red-500"
      case "blue": return "text-lawbot-blue-500"
      case "emerald": return "text-lawbot-emerald-500"
      case "green": return "text-lawbot-emerald-500"
      default: return "text-lawbot-slate-500"
    }
  }

  const getValueColor = (color: string) => {
    switch (color) {
      case "red": return "text-lawbot-red-600"
      case "blue": return "text-lawbot-blue-600"
      case "emerald": return "text-lawbot-emerald-600"
      case "green": return "text-lawbot-emerald-600"
      default: return "text-lawbot-slate-600"
    }
  }

  const getChangeColor = (trend: string) => {
    switch (trend) {
      case "up": return "text-lawbot-emerald-600"
      case "urgent": return "text-lawbot-red-600"
      case "stable": return "text-lawbot-blue-600"
      default: return "text-lawbot-slate-600"
    }
  }

  // Generate stats cards data from real data
  const generateStatsCards = () => {
    if (!dashboardStats) return []

    return [
      {
        title: "Total Cases",
        value: dashboardStats.totalCases.toLocaleString(),
        change: `+${Math.round((dashboardStats.totalCases / (dashboardStats.totalCases - dashboardStats.pendingCases) - 1) * 100)}%`,
        trend: "up",
        icon: FileText,
        color: "blue",
        description: "active cases"
      },
      {
        title: "High Priority",
        value: dashboardStats.highPriorityCases.toLocaleString(),
        change: `${Math.round((dashboardStats.highPriorityCases / dashboardStats.totalCases) * 100)}%`,
        trend: "urgent",
        icon: AlertTriangle,
        color: "red",
        description: "of total cases"
      },
      {
        title: "Active Officers",
        value: dashboardStats.activeOfficers.toLocaleString(),
        change: `${dashboardStats.activeOfficers}/${dashboardStats.totalOfficers}`,
        trend: "stable",
        icon: Users,
        color: "emerald",
        description: "officers available"
      },
      {
        title: "Resolution Rate",
        value: `${dashboardStats.resolutionRate}%`,
        change: "+5%",
        trend: "up",
        icon: CheckCircle,
        color: "green",
        description: "resolved successfully"
      }
    ]
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Dashboard Header with Refresh Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-lawbot-emerald-600 to-lawbot-blue-600 bg-clip-text text-transparent leading-tight pb-2">
            Admin Dashboard
          </h2>
          <p className="text-lawbot-slate-600 dark:text-lawbot-slate-400 text-base sm:text-lg mt-2">
            Real-time system overview and performance metrics
          </p>
        </div>
        <Button 
          variant="outline"
          onClick={loadDashboardData}
          disabled={isLoading}
          className="btn-modern"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {error && (
        <Card className="border-lawbot-red-300 dark:border-lawbot-red-800 bg-lawbot-red-50 dark:bg-lawbot-red-900/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3 text-lawbot-red-600 dark:text-lawbot-red-300">
              <AlertTriangle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {isLoading ? (
          // Skeleton loaders for stats
          Array(4).fill(0).map((_, index) => (
            <Card key={index} className="stats-card animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div className="h-5 w-24 bg-lawbot-slate-200 dark:bg-lawbot-slate-700 rounded"></div>
                <div className="h-9 w-9 bg-lawbot-slate-200 dark:bg-lawbot-slate-700 rounded-lg"></div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="h-8 w-20 bg-lawbot-slate-200 dark:bg-lawbot-slate-700 rounded"></div>
                <div className="flex items-center justify-between">
                  <div className="h-4 w-16 bg-lawbot-slate-200 dark:bg-lawbot-slate-700 rounded"></div>
                  <div className="h-4 w-24 bg-lawbot-slate-200 dark:bg-lawbot-slate-700 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : dashboardStats ? (
          // Real data stats cards
          generateStatsCards().map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title} className={`stats-card animate-fade-in-up`} style={{ animationDelay: `${index * 100}ms` }}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header: Title + Icon */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">
                          {stat.title}
                        </p>
                        <p className={`text-3xl font-bold ${getValueColor(stat.color)}`}>
                          {stat.value}
                        </p>
                      </div>
                      <div className={`p-3 rounded-xl ${
                        stat.color === 'red' ? 'bg-gradient-to-br from-lawbot-red-500 to-lawbot-red-600' :
                        stat.color === 'blue' ? 'bg-gradient-to-br from-lawbot-blue-500 to-lawbot-blue-600' :
                        stat.color === 'emerald' ? 'bg-gradient-to-br from-lawbot-emerald-500 to-lawbot-emerald-600' :
                        stat.color === 'green' ? 'bg-gradient-to-br from-lawbot-green-500 to-lawbot-green-600' :
                        'bg-gradient-to-br from-lawbot-slate-500 to-lawbot-slate-600'
                      } shadow-lg`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    
                    {/* Footer: Change + Description */}
                    <div className="flex items-center justify-between pt-2 border-t border-lawbot-slate-100 dark:border-lawbot-slate-700">
                      <span className={`text-sm font-semibold ${getChangeColor(stat.trend)}`}>
                        {stat.change}
                      </span>
                      <span className="text-sm text-lawbot-slate-500 dark:text-lawbot-slate-400">
                        {stat.description}
                      </span>
                    </div>
                    
                    {/* Progress Bar for Resolution Rate */}
                    {stat.title === "Resolution Rate" && (
                      <div className="pt-2">
                        <Progress value={dashboardStats.resolutionRate} className="h-2" />
                      </div>
                    )}
                    
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : null}
      </div>

      {/* Enhanced Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Recent Cases */}
        <Card className="card-modern animate-slide-in-left">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-lawbot-slate-900 dark:text-white">
                  Recent Cases
                </CardTitle>
                <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400">
                  Latest cybercrime reports requiring attention
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="btn-icon"
                onClick={() => loadDashboardData()}
                disabled={isLoading}
              >
                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                // Skeleton loaders for cases
                Array(5).fill(0).map((_, index) => (
                  <div key={index} className="p-4 border border-lawbot-slate-200 dark:border-lawbot-slate-700 rounded-xl animate-pulse">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="h-4 w-16 bg-lawbot-slate-200 dark:bg-lawbot-slate-700 rounded"></div>
                      <div className="h-4 w-12 bg-lawbot-slate-200 dark:bg-lawbot-slate-700 rounded"></div>
                    </div>
                    <div className="h-5 w-3/4 bg-lawbot-slate-200 dark:bg-lawbot-slate-700 rounded mb-3"></div>
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-24 bg-lawbot-slate-200 dark:bg-lawbot-slate-700 rounded"></div>
                      <div className="h-4 w-20 bg-lawbot-slate-200 dark:bg-lawbot-slate-700 rounded"></div>
                    </div>
                  </div>
                ))
              ) : recentCases.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-lawbot-slate-400" />
                  <p className="text-lawbot-slate-600 dark:text-lawbot-slate-400">No recent cases found</p>
                </div>
              ) : (
                recentCases.map((caseData, index) => (
                  <div 
                    key={caseData.id} 
                    className="group flex items-center justify-between p-4 border border-lawbot-slate-200 dark:border-lawbot-slate-700 rounded-xl hover:shadow-md transition-all duration-300 hover:border-lawbot-blue-300 dark:hover:border-lawbot-blue-600 animate-fade-in-up"
                    style={{ animationDelay: `${(index + 4) * 100}ms` }}
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-3">
                        <span className="font-semibold text-sm text-lawbot-blue-600 dark:text-lawbot-blue-400">
                          {caseData.complaint_number || `CYB-${caseData.id.substring(0, 8)}`}
                        </span>
                        <Badge className={`${getPriorityColor(caseData.priority)} text-xs`}>
                          {caseData.priority}
                        </Badge>
                        <div className={`w-2 h-2 rounded-full ${
                          caseData.ai_risk_score >= 80 ? 'bg-lawbot-red-500' :
                          caseData.ai_risk_score >= 50 ? 'bg-lawbot-amber-500' : 'bg-lawbot-emerald-500'
                        }`} />
                      </div>
                      <p className="text-sm font-medium text-lawbot-slate-900 dark:text-white line-clamp-1">
                        {caseData.title || caseData.crime_type}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-lawbot-slate-600 dark:text-lawbot-slate-400">
                          Submitted: {PhilippineTime.formatDatabaseDateShort(caseData.created_at)}
                        </p>
                        <p className="text-xs text-lawbot-slate-500">
                          Risk: {caseData.ai_risk_score || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={`${getStatusColor(caseData.status)} text-xs`}>
                        {caseData.status}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="opacity-0 group-hover:opacity-100 transition-opacity btn-icon"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem className="flex items-center">
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center">
                            <Users className="mr-2 h-4 w-4" />
                            Reassign Officer
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center">
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Update Priority
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-lawbot-slate-200 dark:border-lawbot-slate-700">
              <Button variant="outline" className="w-full btn-modern" onClick={() => {
                // We'll use the admin view change callback to switch to the cases view
                // This is handled by the admin dashboard component
                if (window && window.dispatchEvent) {
                  window.dispatchEvent(new CustomEvent('admin-view-change', { detail: 'cases' }))
                }
              }}>
                View All Cases
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Officer Performance */}
        <Card className="card-modern animate-slide-in-right">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-lawbot-slate-900 dark:text-white">
                  Officer Performance
                </CardTitle>
                <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400">
                  Top performing officers this month
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="btn-icon"
                onClick={() => loadDashboardData()}
                disabled={isLoading}
              >
                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              // Skeleton loader for officer performance
              <div className="space-y-4">
                {Array(3).fill(0).map((_, index) => (
                  <div key={index} className="p-3 border border-lawbot-slate-200 dark:border-lawbot-slate-700 rounded-xl animate-pulse">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="h-10 w-10 bg-lawbot-slate-200 dark:bg-lawbot-slate-700 rounded-full"></div>
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-lawbot-slate-200 dark:bg-lawbot-slate-700 rounded"></div>
                        <div className="h-3 w-24 bg-lawbot-slate-200 dark:bg-lawbot-slate-700 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : officerPerformance && officerPerformance.length > 0 ? (
              // Real officer performance data
              <div className="space-y-3">
                {officerPerformance.slice(0, 3).map((officer, index) => (
                  <div 
                    key={officer.officerId} 
                    className="flex items-center justify-between p-3 border border-lawbot-slate-200 dark:border-lawbot-slate-700 rounded-xl hover:shadow-md transition-all duration-300 animate-fade-in-up"
                    style={{ animationDelay: `${(index + 4) * 100}ms` }}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10 border-2 border-lawbot-blue-200">
                        <AvatarFallback className="bg-lawbot-blue-100 text-lawbot-blue-700 font-semibold">
                          {officer.officerName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-lawbot-slate-900 dark:text-white">
                          {officer.officerName}
                        </p>
                        <div className="flex items-center text-xs">
                          <span className="text-lawbot-slate-500">Success Rate:</span>
                          <span className={`ml-1 font-semibold ${
                            officer.successRate >= 80 ? 'text-lawbot-emerald-600 dark:text-lawbot-emerald-400' :
                            officer.successRate >= 60 ? 'text-lawbot-blue-600 dark:text-lawbot-blue-400' :
                            'text-lawbot-amber-600 dark:text-lawbot-amber-400'
                          }`}>
                            {officer.successRate}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-3">
                        <div className="text-center">
                          <p className="text-lg font-bold text-lawbot-blue-600 dark:text-lawbot-blue-400">
                            {officer.assignedCases}
                          </p>
                          <p className="text-xs text-lawbot-slate-500">Assigned</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-lawbot-emerald-600 dark:text-lawbot-emerald-400">
                            {officer.resolvedCases}
                          </p>
                          <p className="text-xs text-lawbot-slate-500">Resolved</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // No officer data available
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-3">
                  <div className="mx-auto w-12 h-12 bg-lawbot-slate-100 dark:bg-lawbot-slate-800 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-lawbot-slate-500" />
                  </div>
                  <p className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400">
                    Officer performance data will be displayed here
                  </p>
                  <p className="text-xs text-lawbot-slate-500">
                    No officer data available at this time
                  </p>
                </div>
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-lawbot-slate-200 dark:border-lawbot-slate-700">
              <Button variant="outline" className="w-full btn-modern" onClick={() => {
                // We'll use the admin view change callback to switch to the users view
                if (window && window.dispatchEvent) {
                  window.dispatchEvent(new CustomEvent('admin-view-change', { detail: 'users' }))
                }
              }}>
                View All Officers
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Priority Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* High Priority */}
        <Card className="card-modern animate-scale-in">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              {/* Icon */}
              <div className="p-3 bg-lawbot-red-500 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <p className="text-sm font-medium text-lawbot-slate-500 dark:text-lawbot-slate-400">
                  High Priority
                </p>
                <div className="flex items-baseline space-x-2">
                  <p className="text-3xl font-bold text-lawbot-slate-900 dark:text-white">
                    {isLoading ? (
                      <span className="animate-pulse bg-lawbot-slate-200 dark:bg-lawbot-slate-700 rounded text-transparent">00</span>
                    ) : dashboardStats ? (
                      dashboardStats.highPriorityCases
                    ) : '0'}
                  </p>
                  <span className="text-sm text-lawbot-slate-500 dark:text-lawbot-slate-400">
                    cases
                  </span>
                </div>
              </div>
            </div>
            
            {/* Footer: Change + Description */}
            <div className="flex items-center justify-between pt-4 border-t border-lawbot-slate-100 dark:border-lawbot-slate-700">
              <span className="text-sm font-semibold text-lawbot-red-600 dark:text-lawbot-red-400">
                Risk 80-100
              </span>
              <span className="text-sm text-lawbot-slate-500 dark:text-lawbot-slate-400">
                2hr response
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Medium Priority */}
        <Card className="card-modern animate-scale-in" style={{ animationDelay: '100ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              {/* Icon */}
              <div className="p-3 bg-lawbot-amber-500 rounded-xl">
                <Clock className="h-6 w-6 text-white" />
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <p className="text-sm font-medium text-lawbot-slate-500 dark:text-lawbot-slate-400">
                  Medium Priority
                </p>
                <div className="flex items-baseline space-x-2">
                  <p className="text-3xl font-bold text-lawbot-slate-900 dark:text-white">
                    {isLoading ? (
                      <span className="animate-pulse bg-lawbot-slate-200 dark:bg-lawbot-slate-700 rounded text-transparent">00</span>
                    ) : dashboardStats ? (
                      dashboardStats.mediumPriorityCases
                    ) : '0'}
                  </p>
                  <span className="text-sm text-lawbot-slate-500 dark:text-lawbot-slate-400">
                    cases
                  </span>
                </div>
              </div>
            </div>
            
            {/* Footer: Change + Description */}
            <div className="flex items-center justify-between pt-4 border-t border-lawbot-slate-100 dark:border-lawbot-slate-700">
              <span className="text-sm font-semibold text-lawbot-amber-600 dark:text-lawbot-amber-400">
                Risk 50-79
              </span>
              <span className="text-sm text-lawbot-slate-500 dark:text-lawbot-slate-400">
                24hr response
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Low Priority */}
        <Card className="card-modern animate-scale-in" style={{ animationDelay: '200ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              {/* Icon */}
              <div className="p-3 bg-lawbot-emerald-500 rounded-xl">
                <Shield className="h-6 w-6 text-white" />
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <p className="text-sm font-medium text-lawbot-slate-500 dark:text-lawbot-slate-400">
                  Low Priority
                </p>
                <div className="flex items-baseline space-x-2">
                  <p className="text-3xl font-bold text-lawbot-slate-900 dark:text-white">
                    {isLoading ? (
                      <span className="animate-pulse bg-lawbot-slate-200 dark:bg-lawbot-slate-700 rounded text-transparent">00</span>
                    ) : dashboardStats ? (
                      dashboardStats.lowPriorityCases
                    ) : '0'}
                  </p>
                  <span className="text-sm text-lawbot-slate-500 dark:text-lawbot-slate-400">
                    cases
                  </span>
                </div>
              </div>
            </div>
            
            {/* Footer: Change + Description */}
            <div className="flex items-center justify-between pt-4 border-t border-lawbot-slate-100 dark:border-lawbot-slate-700">
              <span className="text-sm font-semibold text-lawbot-emerald-600 dark:text-lawbot-emerald-400">
                Risk 1-49
              </span>
              <span className="text-sm text-lawbot-slate-500 dark:text-lawbot-slate-400">
                72hr response
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}