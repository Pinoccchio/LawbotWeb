"use client"

import { FileText, Clock, CheckCircle, BarChart3, Calendar, AlertTriangle, Eye } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { mockCases } from "@/lib/mock-data"
import { getPriorityColor, getStatusColor } from "@/lib/utils"

export function PNPDashboardView() {
  const officerCases = mockCases.filter((c) => c.officer === "Officer Smith" || c.officer === "Officer Martinez")

  return (
    <div className="space-y-8">
      {/* Officer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Cases</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Active investigations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">3</div>
            <p className="text-xs text-muted-foreground">Awaiting action</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">8</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">Above average</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Cases */}
      <Card>
        <CardHeader>
          <CardTitle>My Active Cases</CardTitle>
          <CardDescription>Cases currently assigned to you for investigation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {officerCases.slice(0, 5).map((case_) => (
              <Card key={case_.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold">{case_.id}</h3>
                      <Badge className={getPriorityColor(case_.priority)}>{case_.priority}</Badge>
                      <Badge className={getStatusColor(case_.status)}>{case_.status}</Badge>
                    </div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">{case_.title}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-slate-400">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {case_.date}
                      </span>
                      <span className="flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        {case_.evidence} evidence files
                      </span>
                      <span className="flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Risk Score: {case_.riskScore}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button size="sm">Update Status</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Priority Cases</CardTitle>
            <CardDescription>High priority cases requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {officerCases
                .filter((c) => c.priority === "high")
                .slice(0, 3)
                .map((case_) => (
                  <div key={case_.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium text-sm">{case_.id}</p>
                      <p className="text-xs text-gray-500">{case_.title}</p>
                    </div>
                    <Badge className="bg-red-100 text-red-800 text-xs">Urgent</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Evidence</CardTitle>
            <CardDescription>Latest evidence files uploaded</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-3 p-2 border rounded">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Evidence_{i}.pdf</p>
                    <p className="text-xs text-gray-500">CYB-2025-00{i}</p>
                  </div>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Unit Performance</CardTitle>
            <CardDescription>Your unit's performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Cases Resolved</span>
                <span className="font-medium">8/12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Average Resolution Time</span>
                <span className="font-medium">4.2 days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Unit Ranking</span>
                <span className="font-medium text-green-600">#2</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Success Rate</span>
                <span className="font-medium text-green-600">85%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
