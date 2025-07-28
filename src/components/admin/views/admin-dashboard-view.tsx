"use client"

import { FileText, AlertTriangle, Users, CheckCircle, MoreHorizontal, TrendingUp, Clock, Shield, Activity, Eye, ArrowUpRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { mockCases } from "@/lib/mock-data"
import { getPriorityColor, getStatusColor } from "@/lib/utils"

export function AdminDashboardView() {
  const stats = [
    {
      title: "Total Cases",
      value: "1,247",
      change: "+12%",
      trend: "up",
      icon: FileText,
      color: "blue",
      description: "from last month"
    },
    {
      title: "High Priority",
      value: "89",
      change: "24 urgent",
      trend: "urgent",
      icon: AlertTriangle,
      color: "red",
      description: "requires immediate attention"
    },
    {
      title: "Active Officers",
      value: "45",
      change: "8 online",
      trend: "stable",
      icon: Users,
      color: "emerald",
      description: "across 10 specialized units"
    },
    {
      title: "Resolution Rate",
      value: "78%",
      change: "+5%",
      trend: "up",
      icon: CheckCircle,
      color: "green",
      description: "this month"
    }
  ]

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

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className={`stats-card animate-fade-in-up`} style={{ animationDelay: `${index * 100}ms` }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg bg-gradient-to-r ${
                  stat.color === 'red' ? 'from-lawbot-red-50 to-lawbot-red-100' :
                  stat.color === 'blue' ? 'from-lawbot-blue-50 to-lawbot-blue-100' :
                  stat.color === 'emerald' ? 'from-lawbot-emerald-50 to-lawbot-emerald-100' :
                  'from-lawbot-slate-50 to-lawbot-slate-100'
                }`}>
                  <Icon className={`h-5 w-5 ${getIconColor(stat.color)}`} />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className={`text-3xl font-bold ${getValueColor(stat.color)}`}>
                  {stat.value}
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${getChangeColor(stat.trend)}`}>
                    {stat.change}
                  </span>
                  <span className="text-xs text-lawbot-slate-500">
                    {stat.description}
                  </span>
                </div>
                {stat.title === "Resolution Rate" && (
                  <Progress value={78} className="h-2 mt-2" />
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Enhanced Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
              <Button variant="outline" size="sm" className="btn-icon">
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockCases.slice(0, 5).map((case_, index) => (
                <div 
                  key={case_.id} 
                  className="group flex items-center justify-between p-4 border border-lawbot-slate-200 dark:border-lawbot-slate-700 rounded-xl hover:shadow-md transition-all duration-300 hover:border-lawbot-blue-300 dark:hover:border-lawbot-blue-600 animate-fade-in-up"
                  style={{ animationDelay: `${(index + 4) * 100}ms` }}
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-3">
                      <span className="font-semibold text-sm text-lawbot-blue-600 dark:text-lawbot-blue-400">
                        {case_.id}
                      </span>
                      <Badge className={`${getPriorityColor(case_.priority)} text-xs`}>
                        {case_.priority}
                      </Badge>
                      <div className={`w-2 h-2 rounded-full ${
                        case_.riskScore >= 80 ? 'bg-lawbot-red-500' :
                        case_.riskScore >= 50 ? 'bg-lawbot-amber-500' : 'bg-lawbot-emerald-500'
                      }`} />
                    </div>
                    <p className="text-sm font-medium text-lawbot-slate-900 dark:text-white line-clamp-1">
                      {case_.title}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-lawbot-slate-600 dark:text-lawbot-slate-400">
                        Officer: {case_.officer}
                      </p>
                      <p className="text-xs text-lawbot-slate-500">
                        Risk: {case_.riskScore}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={`${getStatusColor(case_.status)} text-xs`}>
                      {case_.status}
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
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-lawbot-slate-200 dark:border-lawbot-slate-700">
              <Button variant="outline" className="w-full btn-modern">
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
              <Button variant="outline" size="sm" className="btn-icon">
                <TrendingUp className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-3">
                <div className="mx-auto w-12 h-12 bg-lawbot-slate-100 dark:bg-lawbot-slate-800 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-lawbot-slate-500" />
                </div>
                <p className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400">
                  Officer performance data will be displayed here
                </p>
                <p className="text-xs text-lawbot-slate-500">
                  Data is now managed through the User Management system
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-lawbot-slate-200 dark:border-lawbot-slate-700">
              <Button variant="outline" className="w-full btn-modern">
                View All Officers
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Priority Distribution */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* High Priority */}
        <Card className="priority-high-indicator border-lawbot-red-200 dark:border-lawbot-red-800 bg-gradient-to-br from-lawbot-red-50 to-lawbot-red-100 dark:from-lawbot-red-900/20 dark:to-lawbot-red-800/20 animate-scale-in">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-lawbot-red-500 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-lawbot-red-800 dark:text-lawbot-red-200 font-bold">
                  High Priority
                </CardTitle>
              </div>
              <div className="w-3 h-3 bg-lawbot-red-500 rounded-full animate-pulse-glow"></div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-lawbot-red-600 dark:text-lawbot-red-400">
                89
              </span>
              <span className="text-sm text-lawbot-red-700 dark:text-lawbot-red-300 font-medium">
                Cases
              </span>
            </div>
            <Progress value={89} max={1000} className="h-2 bg-lawbot-red-200 dark:bg-lawbot-red-800" />
            <div className="space-y-1">
              <p className="text-sm text-lawbot-red-700 dark:text-lawbot-red-300 font-medium">
                🔴 Risk Score: 80-100
              </p>
              <p className="text-xs text-lawbot-red-600 dark:text-lawbot-red-400">
                ⏰ Response: 2 hours
              </p>
              <p className="text-xs text-lawbot-red-600 dark:text-lawbot-red-400">
                24 require immediate action
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Medium Priority */}
        <Card className="priority-medium-indicator border-lawbot-amber-200 dark:border-lawbot-amber-800 bg-gradient-to-br from-lawbot-amber-50 to-lawbot-amber-100 dark:from-lawbot-amber-900/20 dark:to-lawbot-amber-800/20 animate-scale-in" style={{ animationDelay: '100ms' }}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-lawbot-amber-500 rounded-lg">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-lawbot-amber-800 dark:text-lawbot-amber-200 font-bold">
                  Medium Priority
                </CardTitle>
              </div>
              <div className="w-3 h-3 bg-lawbot-amber-500 rounded-full"></div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-lawbot-amber-600 dark:text-lawbot-amber-400">
                234
              </span>
              <span className="text-sm text-lawbot-amber-700 dark:text-lawbot-amber-300 font-medium">
                Cases
              </span>
            </div>
            <Progress value={234} max={1000} className="h-2 bg-lawbot-amber-200 dark:bg-lawbot-amber-800" />
            <div className="space-y-1">
              <p className="text-sm text-lawbot-amber-700 dark:text-lawbot-amber-300 font-medium">
                🟡 Risk Score: 50-79
              </p>
              <p className="text-xs text-lawbot-amber-600 dark:text-lawbot-amber-400">
                ⏰ Response: 24 hours
              </p>
              <p className="text-xs text-lawbot-amber-600 dark:text-lawbot-amber-400">
                Standard investigation timeline
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Low Priority */}
        <Card className="priority-low-indicator border-lawbot-emerald-200 dark:border-lawbot-emerald-800 bg-gradient-to-br from-lawbot-emerald-50 to-lawbot-emerald-100 dark:from-lawbot-emerald-900/20 dark:to-lawbot-emerald-800/20 animate-scale-in" style={{ animationDelay: '200ms' }}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-lawbot-emerald-500 rounded-lg">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-lawbot-emerald-800 dark:text-lawbot-emerald-200 font-bold">
                  Low Priority
                </CardTitle>
              </div>
              <div className="w-3 h-3 bg-lawbot-emerald-500 rounded-full"></div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-lawbot-emerald-600 dark:text-lawbot-emerald-400">
                456
              </span>
              <span className="text-sm text-lawbot-emerald-700 dark:text-lawbot-emerald-300 font-medium">
                Cases
              </span>
            </div>
            <Progress value={456} max={1000} className="h-2 bg-lawbot-emerald-200 dark:bg-lawbot-emerald-800" />
            <div className="space-y-1">
              <p className="text-sm text-lawbot-emerald-700 dark:text-lawbot-emerald-300 font-medium">
                🟢 Risk Score: 1-49
              </p>
              <p className="text-xs text-lawbot-emerald-600 dark:text-lawbot-emerald-400">
                ⏰ Response: 72 hours
              </p>
              <p className="text-xs text-lawbot-emerald-600 dark:text-lawbot-emerald-400">
                Routine processing timeline
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Section */}
      <Card className="card-modern animate-fade-in-up bg-gradient-to-r from-lawbot-purple-50 to-lawbot-blue-50 dark:from-lawbot-purple-900/20 dark:to-lawbot-blue-900/20 border-lawbot-purple-200 dark:border-lawbot-purple-800">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-lawbot-purple-500 to-lawbot-blue-500 rounded-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-lawbot-slate-900 dark:text-white">
                🤖 AI Insights
              </CardTitle>
              <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400">
                Real-time analysis and predictions
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-purple-200 dark:border-lawbot-purple-700">
              <div className="text-2xl font-bold text-lawbot-purple-600 dark:text-lawbot-purple-400 mb-1">
                92%
              </div>
              <p className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400">
                Auto-routing Accuracy
              </p>
            </div>
            <div className="text-center p-4 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-purple-200 dark:border-lawbot-purple-700">
              <div className="text-2xl font-bold text-lawbot-blue-600 dark:text-lawbot-blue-400 mb-1">
                2.4h
              </div>
              <p className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400">
                Avg Response Time
              </p>
            </div>
            <div className="text-center p-4 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-purple-200 dark:border-lawbot-purple-700">
              <div className="text-2xl font-bold text-lawbot-emerald-600 dark:text-lawbot-emerald-400 mb-1">
                156
              </div>
              <p className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400">
                Cases Processed Today
              </p>
            </div>
            <div className="text-center p-4 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-purple-200 dark:border-lawbot-purple-700">
              <div className="text-2xl font-bold text-lawbot-amber-600 dark:text-lawbot-amber-400 mb-1">
                🔥 Hot
              </div>
              <p className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400">
                Trending Crime Type
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
