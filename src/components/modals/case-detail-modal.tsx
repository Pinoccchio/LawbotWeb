"use client"
import {
  X,
  Calendar,
  User,
  MapPin,
  Phone,
  Mail,
  FileText,
  Download,
  Eye,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap,
  Brain,
  Target,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface CaseDetailModalProps {
  isOpen: boolean
  onClose: () => void
  caseData: any
}

export function CaseDetailModal({ isOpen, onClose, caseData }: CaseDetailModalProps) {
  if (!isOpen || !caseData) return null

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-gradient-to-r from-red-500 to-red-600 text-white"
      case "medium":
        return "bg-gradient-to-r from-orange-500 to-amber-500 text-white"
      case "low":
        return "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-gradient-to-r from-yellow-500 to-amber-500 text-white"
      case "investigating":
        return "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
      case "evidence review":
        return "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
      case "resolved":
        return "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
      case "closed":
        return "bg-gradient-to-r from-gray-500 to-gray-600 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const aiAnalysis = {
    confidence: 92,
    riskLevel: "High",
    predictedOutcome: "Successful Resolution",
    estimatedTime: "3-5 days",
    recommendations: [
      "Immediate contact with victim required",
      "Preserve digital evidence from social media platforms",
      "Coordinate with cybercrime unit for technical analysis",
      "Document all communication attempts",
    ],
    keyIndicators: [
      { label: "Urgency Score", value: 85, color: "red" },
      { label: "Evidence Quality", value: 78, color: "blue" },
      { label: "Resolution Probability", value: 92, color: "green" },
    ],
  }

  const timeline = [
    { date: "2025-01-25 09:15", event: "Case reported by victim", type: "report" },
    { date: "2025-01-25 09:30", event: "Predictive analysis completed - High priority assigned", type: "ai" },
    { date: "2025-01-25 10:00", event: "Assigned to Officer Maria Santos", type: "assignment" },
    { date: "2025-01-25 14:30", event: "Initial contact with victim established", type: "contact" },
    { date: "2025-01-25 16:45", event: "Evidence collection initiated", type: "evidence" },
    { date: "2025-01-26 08:00", event: "Technical analysis in progress", type: "analysis" },
  ]

  const evidenceFiles = [
    { name: "screenshot_scam_message.png", type: "image", size: "2.4 MB", hash: "a1b2c3d4e5f6" },
    { name: "bank_transaction_log.pdf", type: "document", size: "1.2 MB", hash: "f6e5d4c3b2a1" },
    { name: "phone_call_recording.mp3", type: "audio", size: "5.8 MB", hash: "1a2b3c4d5e6f" },
    { name: "email_headers.txt", type: "text", size: "0.3 MB", hash: "6f5e4d3c2b1a" },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden bg-white dark:bg-slate-800 shadow-2xl">
        <CardHeader className="relative border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <Button variant="ghost" size="sm" onClick={onClose} className="absolute right-4 top-4 h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-start justify-between pr-12">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Case #{caseData.id}</CardTitle>
              <CardDescription className="text-lg mt-1">{caseData.title}</CardDescription>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <Badge className={getPriorityColor(caseData.priority)}>{caseData.priority} Priority</Badge>
              <Badge className={getStatusColor(caseData.status)}>{caseData.status}</Badge>
            </div>
          </div>
        </CardHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-gray-100 dark:bg-slate-700 m-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="ai-analysis">Predictive Analysis</TabsTrigger>
              <TabsTrigger value="evidence">Evidence</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="overview" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Case Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <FileText className="h-5 w-5" />
                        <span>Case Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Case Type</label>
                          <p className="font-medium">{caseData.type}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Reported Date</label>
                          <p className="font-medium">{caseData.date}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Location</label>
                          <p className="font-medium">{caseData.location}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Assigned Officer
                          </label>
                          <p className="font-medium">{caseData.officer}</p>
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Description</label>
                        <p className="mt-1 text-gray-700 dark:text-gray-300">{caseData.description}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Complainant Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <User className="h-5 w-5" />
                        <span>Complainant Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src="/placeholder.svg?height=40&width=40" />
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">Juan Dela Cruz</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Primary Complainant</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>+63 917 123 4567</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>juan.delacruz@email.com</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>Quezon City, Metro Manila</span>
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Additional Notes</label>
                        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                          Victim is cooperative and has provided all requested documentation. Available for follow-up
                          interviews.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* AI Summarizer Section */}
                <Card className="border-purple-200 dark:border-purple-800">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20">
                    <CardTitle className="flex items-center space-x-2">
                      <Brain className="h-5 w-5 text-purple-600" />
                      <span>AI Case Summary</span>
                      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        Auto-Generated
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3 text-purple-700 dark:text-purple-300">Key Details</h4>
                        <div className="space-y-2">
                          <div className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                            <span className="text-sm">Financial loss estimated at ${caseData.estimatedLoss || '25,000'}</span>
                          </div>
                          <div className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                            <span className="text-sm">Crime type: {caseData.crimeType || caseData.title}</span>
                          </div>
                          <div className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                            <span className="text-sm">Multiple victims potentially affected</span>
                          </div>
                          <div className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                            <span className="text-sm">Evidence includes digital communications and transaction records</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-3 text-purple-700 dark:text-purple-300">Executive Summary</h4>
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                          <p className="text-sm text-purple-800 dark:text-purple-200 leading-relaxed">
                            This case involves a sophisticated {caseData.crimeType?.toLowerCase() || 'cybercrime'} operation targeting victims through 
                            digital channels. The perpetrator(s) used social engineering tactics to gain trust before executing the fraudulent scheme. 
                            Initial evidence suggests this may be part of a larger organized campaign with multiple victims across the region.
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-semibold mb-3 text-purple-700 dark:text-purple-300">Immediate Action Items</h4>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                          <h5 className="font-medium text-red-800 dark:text-red-200 text-sm mb-2">High Priority</h5>
                          <ul className="text-xs text-red-700 dark:text-red-300 space-y-1">
                            <li>• Contact victim within 24 hours</li>
                            <li>• Preserve digital evidence</li>
                            <li>• Check for similar cases</li>
                          </ul>
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                          <h5 className="font-medium text-amber-800 dark:text-amber-200 text-sm mb-2">Medium Priority</h5>
                          <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
                            <li>• Analyze transaction patterns</li>
                            <li>• Coordinate with bank security</li>
                            <li>• Interview witnesses</li>
                          </ul>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                          <h5 className="font-medium text-blue-800 dark:text-blue-200 text-sm mb-2">Investigation</h5>
                          <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                            <li>• Technical analysis of devices</li>
                            <li>• Cross-reference databases</li>
                            <li>• Prepare legal documentation</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ai-analysis" className="space-y-6">
                <Card className="border-blue-200 dark:border-blue-800">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <CardTitle className="flex items-center space-x-2">
                      <Brain className="h-5 w-5 text-blue-600" />
                      <span>Predictive Analysis Report</span>
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Confidence: {aiAnalysis.confidence}%
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      {aiAnalysis.keyIndicators.map((indicator, index) => (
                        <div key={index} className="text-center">
                          <div className="mb-2">
                            <div
                              className={`text-2xl font-bold ${
                                indicator.color === "red"
                                  ? "text-red-600"
                                  : indicator.color === "blue"
                                    ? "text-blue-600"
                                    : "text-green-600"
                              }`}
                            >
                              {indicator.value}%
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{indicator.label}</div>
                          </div>
                          <Progress
                            value={indicator.value}
                            className={`h-2 ${
                              indicator.color === "red"
                                ? "[&>div]:bg-red-500"
                                : indicator.color === "blue"
                                  ? "[&>div]:bg-blue-500"
                                  : "[&>div]:bg-green-500"
                            }`}
                          />
                        </div>
                      ))}
                    </div>

                    <Separator />

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center space-x-2">
                          <Target className="h-4 w-4" />
                          <span>Risk Assessment</span>
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Risk Level:</span>
                            <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              {aiAnalysis.riskLevel}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Predicted Outcome:</span>
                            <span className="font-medium text-green-600">{aiAnalysis.predictedOutcome}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Estimated Resolution:</span>
                            <span className="font-medium">{aiAnalysis.estimatedTime}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3 flex items-center space-x-2">
                          <Zap className="h-4 w-4" />
                          <span>System Recommendations</span>
                        </h4>
                        <ul className="space-y-2">
                          {aiAnalysis.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="evidence" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      <span>Evidence Files</span>
                      <Badge variant="outline">{evidenceFiles.length} files</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {evidenceFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded">
                              <FileText className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">{file.name}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {file.type} • {file.size} • Hash: {file.hash}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="timeline" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="h-5 w-5" />
                      <span>Case Timeline</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {timeline.map((event, index) => (
                        <div key={index} className="flex items-start space-x-4">
                          <div
                            className={`p-2 rounded-full ${
                              event.type === "report"
                                ? "bg-blue-100 text-blue-600"
                                : event.type === "ai"
                                  ? "bg-purple-100 text-purple-600"
                                  : event.type === "assignment"
                                    ? "bg-green-100 text-green-600"
                                    : event.type === "contact"
                                      ? "bg-orange-100 text-orange-600"
                                      : event.type === "evidence"
                                        ? "bg-red-100 text-red-600"
                                        : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            <div className="h-2 w-2 rounded-full bg-current"></div>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{event.event}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{event.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="actions" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button className="w-full justify-start" variant="outline">
                        <Phone className="mr-2 h-4 w-4" />
                        Contact Complainant
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <FileText className="mr-2 h-4 w-4" />
                        Update Case Status
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <User className="mr-2 h-4 w-4" />
                        Assign to Specialist
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Escalate Case
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Case Management</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button className="w-full justify-start" variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Generate Report
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <Calendar className="mr-2 h-4 w-4" />
                        Schedule Follow-up
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        View Analytics
                      </Button>
                      <Button className="w-full justify-start" variant="destructive">
                        <XCircle className="mr-2 h-4 w-4" />
                        Close Case
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </Card>
    </div>
  )
}
