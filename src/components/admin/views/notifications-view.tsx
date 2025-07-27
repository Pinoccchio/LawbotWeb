"use client"

import { Bell, AlertTriangle, CheckCircle, Info, X, Eye, Trash2, Shield } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function NotificationsView() {
  const notifications = [
    {
      id: 1,
      type: "high-priority",
      title: "High Priority Case Assigned",
      message: "Case CYB-2025-001 (Online Banking Fraud) has been assigned high priority due to financial impact >$50K",
      time: "2 minutes ago",
      read: false,
      icon: <AlertTriangle className="h-4 w-4" />,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-900/20",
    },
    {
      id: 2,
      type: "case-resolved",
      title: "Case Successfully Resolved",
      message: "Case CYB-2025-003 (Phishing Campaign) has been resolved by Officer Johnson with successful prosecution",
      time: "15 minutes ago",
      read: false,
      icon: <CheckCircle className="h-4 w-4" />,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      id: 3,
      type: "system-alert",
      title: "AI Classification Accuracy Drop",
      message: "Gemini AI classification accuracy has dropped to 94.2%. Consider reviewing model parameters.",
      time: "1 hour ago",
      read: true,
      icon: <Info className="h-4 w-4" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      id: 4,
      type: "officer-overload",
      title: "Officer Workload Alert",
      message: "Officer Martinez has 15+ active cases. Consider redistributing workload or providing assistance.",
      time: "2 hours ago",
      read: true,
      icon: <AlertTriangle className="h-4 w-4" />,
      color: "text-amber-600",
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
    },
    {
      id: 5,
      type: "evidence-uploaded",
      title: "New Evidence Uploaded",
      message: "Additional evidence has been uploaded for Case CYB-2025-002 by the complainant via mobile app",
      time: "3 hours ago",
      read: true,
      icon: <Info className="h-4 w-4" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
  ]

  const systemAlerts = [
    {
      id: 1,
      type: "security",
      title: "Multiple Failed Login Attempts",
      message: "5 failed login attempts detected from IP 192.168.1.100 in the last 10 minutes",
      severity: "high",
      time: "5 minutes ago",
    },
    {
      id: 2,
      type: "performance",
      title: "Database Query Performance",
      message: "Average database query response time has increased to 2.3 seconds",
      severity: "medium",
      time: "30 minutes ago",
    },
    {
      id: 3,
      type: "storage",
      title: "Storage Capacity Warning",
      message: "Evidence storage is at 85% capacity. Consider archiving old cases or expanding storage",
      severity: "medium",
      time: "1 hour ago",
    },
    {
      id: 4,
      type: "backup",
      title: "Backup Completed Successfully",
      message: "Daily system backup completed successfully. 1.2GB of data backed up to secure storage",
      severity: "low",
      time: "6 hours ago",
    },
  ]

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "medium":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h2>
          <p className="text-gray-600 dark:text-slate-400">System alerts and case notifications</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">Mark All Read</Button>
          <Button variant="outline">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Notification Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Notifications pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">3</div>
            <p className="text-xs text-muted-foreground">Urgent alerts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Alerts</CardTitle>
            <Info className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">7</div>
            <p className="text-xs text-muted-foreground">System notifications</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">45</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Notifications</TabsTrigger>
          <TabsTrigger value="case">Case Alerts</TabsTrigger>
          <TabsTrigger value="system">System Alerts</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Notifications</CardTitle>
              <CardDescription>Complete list of system and case notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start space-x-4 p-4 rounded-lg border ${
                      !notification.read ? notification.bgColor : "bg-gray-50 dark:bg-slate-800"
                    }`}
                  >
                    <div className={`${notification.color} mt-1`}>{notification.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`font-medium ${!notification.read ? "font-semibold" : ""}`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center space-x-2">
                          {!notification.read && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
                          <span className="text-xs text-gray-500">{notification.time}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-slate-400">{notification.message}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="case">
          <Card>
            <CardHeader>
              <CardTitle>Case Notifications</CardTitle>
              <CardDescription>Notifications related to case management and investigations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications
                  .filter((n) => ["high-priority", "case-resolved", "evidence-uploaded"].includes(n.type))
                  .map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start space-x-4 p-4 rounded-lg border ${
                        !notification.read ? notification.bgColor : "bg-gray-50 dark:bg-slate-800"
                      }`}
                    >
                      <div className={`${notification.color} mt-1`}>{notification.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`font-medium ${!notification.read ? "font-semibold" : ""}`}>
                            {notification.title}
                          </h4>
                          <span className="text-xs text-gray-500">{notification.time}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-slate-400">{notification.message}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>System performance and operational notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-start space-x-4 p-4 rounded-lg border">
                    <div className="mt-1">
                      <Info className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium">{alert.title}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                          <span className="text-xs text-gray-500">{alert.time}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-slate-400">{alert.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Alerts</CardTitle>
              <CardDescription>Security-related notifications and threats</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemAlerts
                  .filter((alert) => alert.type === "security")
                  .map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-start space-x-4 p-4 rounded-lg border bg-red-50 dark:bg-red-900/20"
                    >
                      <div className="mt-1">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-red-800 dark:text-red-200">{alert.title}</h4>
                          <div className="flex items-center space-x-2">
                            <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              {alert.severity}
                            </Badge>
                            <span className="text-xs text-gray-500">{alert.time}</span>
                          </div>
                        </div>
                        <p className="text-sm text-red-700 dark:text-red-300">{alert.message}</p>
                        <div className="mt-2 flex space-x-2">
                          <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                            Investigate
                          </Button>
                          <Button size="sm" variant="outline">
                            Block IP
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                <div className="text-center py-8 text-gray-500 dark:text-slate-400">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No additional security alerts at this time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
