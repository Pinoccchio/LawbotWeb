"use client"

import { Bell, AlertTriangle, CheckCircle, Info, X, Eye, Trash2, Shield, Activity, Settings, Clock } from "lucide-react"
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
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-lawbot-emerald-600 to-lawbot-blue-600 bg-clip-text text-transparent">
            Notifications
          </h2>
          <p className="text-lawbot-slate-600 dark:text-lawbot-slate-400 text-lg mt-2">
            System alerts, case notifications, and security monitoring
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="btn-modern">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline" className="btn-modern">
            ✓ Mark All Read
          </Button>
          <Button variant="outline" className="btn-modern text-lawbot-red-600 border-lawbot-red-300 hover:bg-lawbot-red-50">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Enhanced Notification Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <Card className="stats-card bg-gradient-to-br from-lawbot-blue-50 to-white dark:from-lawbot-blue-900/10 dark:to-lawbot-slate-800 border-lawbot-blue-200 dark:border-lawbot-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">Unread</p>
                <p className="text-3xl font-bold text-lawbot-blue-600 dark:text-lawbot-blue-400">12</p>
                <p className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400 mt-1">📨 Notifications pending</p>
              </div>
              <div className="p-3 bg-lawbot-blue-500 rounded-lg">
                <Bell className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card bg-gradient-to-br from-lawbot-red-50 to-white dark:from-lawbot-red-900/10 dark:to-lawbot-slate-800 border-lawbot-red-200 dark:border-lawbot-red-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">High Priority</p>
                <p className="text-3xl font-bold text-lawbot-red-600 dark:text-lawbot-red-400">3</p>
                <p className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400 mt-1">🚨 Urgent alerts</p>
              </div>
              <div className="p-3 bg-lawbot-red-500 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card bg-gradient-to-br from-lawbot-purple-50 to-white dark:from-lawbot-purple-900/10 dark:to-lawbot-slate-800 border-lawbot-purple-200 dark:border-lawbot-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">System Alerts</p>
                <p className="text-3xl font-bold text-lawbot-purple-600 dark:text-lawbot-purple-400">7</p>
                <p className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400 mt-1">🔧 System notifications</p>
              </div>
              <div className="p-3 bg-lawbot-purple-500 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card bg-gradient-to-br from-lawbot-emerald-50 to-white dark:from-lawbot-emerald-900/10 dark:to-lawbot-slate-800 border-lawbot-emerald-200 dark:border-lawbot-emerald-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">Resolved</p>
                <p className="text-3xl font-bold text-lawbot-emerald-600 dark:text-lawbot-emerald-400">45</p>
                <p className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400 mt-1">✅ This week</p>
              </div>
              <div className="p-3 bg-lawbot-emerald-500 rounded-lg">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-6 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <TabsList className="bg-lawbot-slate-100 dark:bg-lawbot-slate-800 p-1 rounded-xl grid grid-cols-4">
          <TabsTrigger value="all" className="data-[state=active]:bg-white dark:data-[state=active]:bg-lawbot-slate-700 data-[state=active]:text-lawbot-blue-600 font-medium">
            📬 All Notifications
          </TabsTrigger>
          <TabsTrigger value="case" className="data-[state=active]:bg-white dark:data-[state=active]:bg-lawbot-slate-700 data-[state=active]:text-lawbot-emerald-600 font-medium">
            📁 Case Alerts
          </TabsTrigger>
          <TabsTrigger value="system" className="data-[state=active]:bg-white dark:data-[state=active]:bg-lawbot-slate-700 data-[state=active]:text-lawbot-purple-600 font-medium">
            🔧 System Alerts
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-white dark:data-[state=active]:bg-lawbot-slate-700 data-[state=active]:text-lawbot-red-600 font-medium">
            🔒 Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card className="card-modern">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-lawbot-blue-500 rounded-lg">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lawbot-slate-900 dark:text-white">All Notifications</CardTitle>
                  <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400">Complete list of system and case notifications</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.map((notification, index) => (
                  <div
                    key={notification.id}
                    className={`flex items-start space-x-4 p-6 rounded-xl border transition-all duration-200 hover:shadow-md animate-fade-in-up ${
                      !notification.read 
                        ? `${notification.bgColor} border-current shadow-sm` 
                        : "bg-lawbot-slate-50 dark:bg-lawbot-slate-800 border-lawbot-slate-200 dark:border-lawbot-slate-700"
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className={`${notification.color} mt-1 p-2 rounded-lg ${
                      !notification.read ? 'bg-white/80 dark:bg-black/20' : 'bg-lawbot-slate-200 dark:bg-lawbot-slate-700'
                    }`}>
                      {notification.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`font-semibold text-lawbot-slate-900 dark:text-white ${
                          !notification.read ? "" : "text-lawbot-slate-600 dark:text-lawbot-slate-400"
                        }`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center space-x-2">
                          {!notification.read && <div className="w-3 h-3 bg-lawbot-blue-500 rounded-full animate-pulse"></div>}
                          <div className="flex items-center text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400">
                            <Clock className="h-3 w-3 mr-1" />
                            {notification.time}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400 leading-relaxed">
                        {notification.message}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" className="btn-icon hover:bg-lawbot-blue-50 dark:hover:bg-lawbot-blue-900/20">
                        <Eye className="h-4 w-4 text-lawbot-blue-500" />
                      </Button>
                      <Button variant="ghost" size="sm" className="btn-icon hover:bg-lawbot-red-50 dark:hover:bg-lawbot-red-900/20">
                        <X className="h-4 w-4 text-lawbot-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="case">
          <Card className="card-modern">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-lawbot-emerald-500 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lawbot-slate-900 dark:text-white">Case Notifications</CardTitle>
                  <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400">Notifications related to case management and investigations</CardDescription>
                </div>
              </div>
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
          <Card className="card-modern">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-lawbot-purple-500 rounded-lg">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lawbot-slate-900 dark:text-white">System Alerts</CardTitle>
                  <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400">System performance and operational notifications</CardDescription>
                </div>
              </div>
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
          <Card className="card-modern">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-lawbot-red-500 rounded-lg">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lawbot-slate-900 dark:text-white">Security Alerts</CardTitle>
                  <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400">Security-related notifications and threats</CardDescription>
                </div>
              </div>
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
