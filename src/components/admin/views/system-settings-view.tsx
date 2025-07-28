"use client"

import { Shield, Bell, Database, Cpu, Globe, Save, Settings, Zap, Lock, Activity } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

export function SystemSettingsView() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-lawbot-purple-600 to-lawbot-blue-600 bg-clip-text text-transparent">
            System Settings
          </h2>
          <p className="text-lawbot-slate-600 dark:text-lawbot-slate-400 text-lg mt-2">
            Configure system parameters, AI settings, and security protocols
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="btn-modern">
            <Settings className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button className="btn-gradient">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="ai" className="space-y-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <TabsList className="bg-lawbot-slate-100 dark:bg-lawbot-slate-800 p-1 rounded-xl grid grid-cols-4">
          <TabsTrigger value="ai" className="data-[state=active]:bg-white dark:data-[state=active]:bg-lawbot-slate-700 data-[state=active]:text-lawbot-blue-600 font-medium">
            🤖 AI Configuration
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-white dark:data-[state=active]:bg-lawbot-slate-700 data-[state=active]:text-lawbot-purple-600 font-medium">
            🔒 Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-white dark:data-[state=active]:bg-lawbot-slate-700 data-[state=active]:text-lawbot-emerald-600 font-medium">
            🔔 Notifications
          </TabsTrigger>
          <TabsTrigger value="system" className="data-[state=active]:bg-white dark:data-[state=active]:bg-lawbot-slate-700 data-[state=active]:text-lawbot-amber-600 font-medium">
            ⚙️ System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="card-modern bg-gradient-to-br from-lawbot-blue-50 to-white dark:from-lawbot-blue-900/10 dark:to-lawbot-slate-800 border-lawbot-blue-200 dark:border-lawbot-blue-800">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-lawbot-blue-500 rounded-lg">
                    <Cpu className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lawbot-slate-900 dark:text-white">Gemini AI Configuration</CardTitle>
                    <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400">Configure AI-powered case analysis and routing</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="api-key" className="text-lawbot-slate-700 dark:text-lawbot-slate-300 font-medium">🔑 Gemini API Key</Label>
                  <Input id="api-key" type="password" placeholder="Enter your Gemini API key" className="border-lawbot-slate-300 dark:border-lawbot-slate-600 focus:border-lawbot-blue-500" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">AI Model</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select AI model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                      <SelectItem value="gemini-pro-vision">Gemini Pro Vision</SelectItem>
                      <SelectItem value="gemini-ultra">Gemini Ultra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeout">Response Timeout (seconds)</Label>
                  <Input id="timeout" type="number" defaultValue="30" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-summarization">Auto-Summarization</Label>
                  <Switch id="auto-summarization" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-classification">Auto-Classification</Label>
                  <Switch id="auto-classification" defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card className="card-modern bg-gradient-to-br from-lawbot-purple-50 to-white dark:from-lawbot-purple-900/10 dark:to-lawbot-slate-800 border-lawbot-purple-200 dark:border-lawbot-purple-800">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-lawbot-purple-500 rounded-lg">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lawbot-slate-900 dark:text-white">Risk Scoring Parameters</CardTitle>
                    <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400">Configure AI risk assessment thresholds</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>High Priority Threshold</Label>
                  <div className="flex items-center space-x-2">
                    <Input type="number" defaultValue="80" className="w-20" />
                    <span className="text-sm text-gray-500">- 100 (Critical)</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Medium Priority Threshold</Label>
                  <div className="flex items-center space-x-2">
                    <Input type="number" defaultValue="50" className="w-20" />
                    <span className="text-sm text-gray-500">- 79 (Moderate)</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Low Priority Threshold</Label>
                  <div className="flex items-center space-x-2">
                    <Input type="number" defaultValue="1" className="w-20" />
                    <span className="text-sm text-gray-500">- 49 (Standard)</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confidence">Classification Confidence</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select confidence level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High (90%+)</SelectItem>
                      <SelectItem value="medium">Medium (70%+)</SelectItem>
                      <SelectItem value="low">Low (50%+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="card-modern bg-gradient-to-br from-lawbot-emerald-50 to-white dark:from-lawbot-emerald-900/10 dark:to-lawbot-slate-800 border-lawbot-emerald-200 dark:border-lawbot-emerald-800">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-lawbot-emerald-500 rounded-lg">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lawbot-slate-900 dark:text-white">AI Performance Monitoring</CardTitle>
                    <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400">Monitor and optimize AI system performance</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-lawbot-emerald-50 dark:bg-lawbot-emerald-900/20 border border-lawbot-emerald-200 dark:border-lawbot-emerald-800 rounded-xl">
                    <div className="text-3xl font-bold text-lawbot-emerald-600 dark:text-lawbot-emerald-400">✅ 98.5%</div>
                    <div className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400 font-medium">Classification Accuracy</div>
                  </div>
                  <div className="text-center p-4 bg-lawbot-blue-50 dark:bg-lawbot-blue-900/20 border border-lawbot-blue-200 dark:border-lawbot-blue-800 rounded-xl">
                    <div className="text-3xl font-bold text-lawbot-blue-600 dark:text-lawbot-blue-400">⚡ 1.2s</div>
                    <div className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400 font-medium">Avg Response Time</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="performance-alerts">Performance Alerts</Label>
                  <Switch id="performance-alerts" defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alert-threshold">Alert Threshold (%)</Label>
                  <Input id="alert-threshold" type="number" defaultValue="95" />
                </div>
              </CardContent>
            </Card>

            <Card className="card-modern bg-gradient-to-br from-lawbot-amber-50 to-white dark:from-lawbot-amber-900/10 dark:to-lawbot-slate-800 border-lawbot-amber-200 dark:border-lawbot-amber-800">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-lawbot-amber-500 rounded-lg">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lawbot-slate-900 dark:text-white">Predictive Analytics</CardTitle>
                    <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400">Configure forecasting and prediction models</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="timeline-prediction">Timeline Prediction</Label>
                  <Switch id="timeline-prediction" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="success-probability">Success Probability</Label>
                  <Switch id="success-probability" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="resource-estimation">Resource Estimation</Label>
                  <Switch id="resource-estimation" defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prediction-model">Prediction Model</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="linear">Linear Regression</SelectItem>
                      <SelectItem value="neural">Neural Network</SelectItem>
                      <SelectItem value="ensemble">Ensemble Method</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Authentication Settings</span>
                </CardTitle>
                <CardDescription>Configure user authentication and access control</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="mfa">Multi-Factor Authentication</Label>
                  <Switch id="mfa" defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <Input id="session-timeout" type="number" defaultValue="60" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-policy">Password Policy</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select policy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard (8+ chars)</SelectItem>
                      <SelectItem value="strong">Strong (12+ chars, mixed)</SelectItem>
                      <SelectItem value="enterprise">Enterprise (16+ chars, complex)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-attempts">Failed Login Protection</Label>
                  <Switch id="login-attempts" defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Encryption</CardTitle>
                <CardDescription>Configure data protection and encryption settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="data-encryption">Data at Rest Encryption</Label>
                  <Switch id="data-encryption" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="transit-encryption">Data in Transit Encryption</Label>
                  <Switch id="transit-encryption" defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="encryption-level">Encryption Level</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select encryption level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aes128">AES-128</SelectItem>
                      <SelectItem value="aes256">AES-256</SelectItem>
                      <SelectItem value="rsa2048">RSA-2048</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="key-rotation">Key Rotation (days)</Label>
                  <Input id="key-rotation" type="number" defaultValue="90" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Audit & Compliance</CardTitle>
                <CardDescription>Configure audit logging and compliance settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="audit-logging">Comprehensive Audit Logging</Label>
                  <Switch id="audit-logging" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="gdpr-compliance">GDPR Compliance Mode</Label>
                  <Switch id="gdpr-compliance" defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retention-period">Log Retention Period (days)</Label>
                  <Input id="retention-period" type="number" defaultValue="365" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="compliance-standard">Compliance Standard</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select standard" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gdpr">GDPR</SelectItem>
                      <SelectItem value="iso27001">ISO 27001</SelectItem>
                      <SelectItem value="nist">NIST Framework</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Monitoring</CardTitle>
                <CardDescription>Configure security threat detection and monitoring</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="threat-detection">Real-time Threat Detection</Label>
                  <Switch id="threat-detection" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="intrusion-prevention">Intrusion Prevention</Label>
                  <Switch id="intrusion-prevention" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="vulnerability-scanning">Vulnerability Scanning</Label>
                  <Switch id="vulnerability-scanning" defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scan-frequency">Scan Frequency</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notification Settings</span>
                </CardTitle>
                <CardDescription>Configure system-wide notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <Switch id="email-notifications" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="sms-notifications">SMS Notifications</Label>
                  <Switch id="sms-notifications" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <Switch id="push-notifications" defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notification-frequency">Notification Frequency</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="hourly">Hourly Digest</SelectItem>
                      <SelectItem value="daily">Daily Summary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Priority-Based Alerts</CardTitle>
                <CardDescription>Configure alerts based on case priority levels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="font-medium">High Priority</span>
                    </div>
                    <Select defaultValue="immediate">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="5min">5 minutes</SelectItem>
                        <SelectItem value="15min">15 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                      <span className="font-medium">Medium Priority</span>
                    </div>
                    <Select defaultValue="hourly">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="font-medium">Low Priority</span>
                    </div>
                    <Select defaultValue="daily">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notification Templates</CardTitle>
                <CardDescription>Customize notification message templates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="case-assigned">Case Assigned Template</Label>
                  <Textarea
                    id="case-assigned"
                    placeholder="New case {case_id} has been assigned to you..."
                    className="min-h-20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status-update">Status Update Template</Label>
                  <Textarea
                    id="status-update"
                    placeholder="Case {case_id} status updated to {status}..."
                    className="min-h-20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="high-priority">High Priority Alert Template</Label>
                  <Textarea
                    id="high-priority"
                    placeholder="URGENT: High priority case {case_id} requires immediate attention..."
                    className="min-h-20"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Escalation Rules</CardTitle>
                <CardDescription>Configure automatic escalation procedures</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-escalation">Auto-Escalation</Label>
                  <Switch id="auto-escalation" defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="escalation-time">Escalation Time (hours)</Label>
                  <Input id="escalation-time" type="number" defaultValue="24" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="escalation-level">Escalation Level</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select escalation level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                      <SelectItem value="unit-head">Unit Head</SelectItem>
                      <SelectItem value="admin">System Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="weekend-escalation">Weekend Escalation</Label>
                  <Switch id="weekend-escalation" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Database Settings</span>
                </CardTitle>
                <CardDescription>Configure database and storage settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="db-connection">Database Connection String</Label>
                  <Input id="db-connection" type="password" placeholder="postgresql://..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-connections">Max Connections</Label>
                  <Input id="max-connections" type="number" defaultValue="100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backup-frequency">Backup Frequency</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-backup">Automatic Backups</Label>
                  <Switch id="auto-backup" defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Evidence Storage</CardTitle>
                <CardDescription>Configure evidence file storage and limits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="max-files">Max Files per Case</Label>
                  <Input id="max-files" type="number" defaultValue="5" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-size">Max Total Size per Case (MB)</Label>
                  <Input id="max-size" type="number" defaultValue="25" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allowed-types">Allowed File Types</Label>
                  <Input id="allowed-types" defaultValue="jpg,png,pdf,doc,docx,mp4" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storage-location">Storage Location</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select storage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Local Storage</SelectItem>
                      <SelectItem value="s3">Amazon S3</SelectItem>
                      <SelectItem value="azure">Azure Blob</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>API Configuration</span>
                </CardTitle>
                <CardDescription>Configure external API integrations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="firebase-config">Firebase Configuration</Label>
                  <Textarea id="firebase-config" placeholder="Firebase config JSON..." className="min-h-20" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supabase-url">Supabase URL</Label>
                  <Input id="supabase-url" placeholder="https://your-project.supabase.co" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supabase-key">Supabase Anon Key</Label>
                  <Input id="supabase-key" type="password" placeholder="Supabase anonymous key" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rate-limit">API Rate Limit (requests/minute)</Label>
                  <Input id="rate-limit" type="number" defaultValue="1000" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Maintenance</CardTitle>
                <CardDescription>System maintenance and monitoring settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                  <Switch id="maintenance-mode" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maintenance-message">Maintenance Message</Label>
                  <Textarea
                    id="maintenance-message"
                    placeholder="System is under maintenance. Please try again later."
                    className="min-h-20"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="health-monitoring">Health Monitoring</Label>
                  <Switch id="health-monitoring" defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="log-level">Log Level</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select log level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="warn">Warning</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="debug">Debug</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
