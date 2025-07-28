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
        return "bg-gradient-to-r from-lawbot-red-500 to-lawbot-red-600 text-white border-0"
      case "medium":
        return "bg-gradient-to-r from-lawbot-amber-500 to-lawbot-amber-600 text-white border-0"
      case "low":
        return "bg-gradient-to-r from-lawbot-emerald-500 to-lawbot-emerald-600 text-white border-0"
      default:
        return "bg-gradient-to-r from-lawbot-slate-500 to-lawbot-slate-600 text-white border-0"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-gradient-to-r from-lawbot-amber-500 to-lawbot-amber-600 text-white border-0"
      case "under investigation":
        return "bg-gradient-to-r from-lawbot-blue-500 to-lawbot-blue-600 text-white border-0"
      case "requires more info":
        return "bg-gradient-to-r from-lawbot-purple-500 to-lawbot-purple-600 text-white border-0"
      case "resolved":
        return "bg-gradient-to-r from-lawbot-emerald-500 to-lawbot-emerald-600 text-white border-0"
      case "dismissed":
        return "bg-gradient-to-r from-lawbot-slate-500 to-lawbot-slate-600 text-white border-0"
      default:
        return "bg-gradient-to-r from-lawbot-slate-500 to-lawbot-slate-600 text-white border-0"
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden bg-white dark:bg-lawbot-slate-800 shadow-2xl card-modern animate-scale-in">
        <CardHeader className="relative border-b bg-gradient-to-r from-lawbot-blue-50 to-lawbot-emerald-50 dark:from-lawbot-blue-900/20 dark:to-lawbot-emerald-900/20 border-lawbot-blue-200 dark:border-lawbot-blue-800">
          <Button variant="ghost" size="sm" onClick={onClose} className="absolute right-4 top-4 h-8 w-8 p-0 hover:bg-lawbot-red-50 dark:hover:bg-lawbot-red-900/20 hover:text-lawbot-red-600">
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-start justify-between pr-12">
            <div className="animate-fade-in-up">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-lawbot-blue-600 to-lawbot-emerald-600 bg-clip-text text-transparent">
                📁 Case #{caseData.id}
              </CardTitle>
              <CardDescription className="text-lg mt-2 text-lawbot-slate-600 dark:text-lawbot-slate-400 font-medium">
                {caseData.title}
              </CardDescription>
            </div>
            <div className="flex flex-col items-end space-y-3 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <Badge className={`${getPriorityColor(caseData.priority)} text-sm font-semibold px-3 py-1 shadow-sm`}>
                {caseData.priority === 'high' ? '🔴' : caseData.priority === 'medium' ? '🟡' : '🟢'} {caseData.priority} Priority
              </Badge>
              <Badge className={`${getStatusColor(caseData.status)} text-sm font-semibold px-3 py-1 shadow-sm`}>
                {caseData.status === 'Pending' ? '📋' : 
                 caseData.status === 'Under Investigation' ? '🔍' :
                 caseData.status === 'Resolved' ? '✅' :
                 caseData.status === 'Dismissed' ? '❌' : '❓'} 
                {caseData.status}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-lawbot-slate-100 dark:bg-lawbot-slate-800 m-4 p-1 rounded-xl">
              <TabsTrigger value="overview" className="data-[state=active]:bg-white dark:data-[state=active]:bg-lawbot-slate-700 data-[state=active]:text-lawbot-blue-600 font-medium">
                📋 Overview
              </TabsTrigger>
              <TabsTrigger value="ai-analysis" className="data-[state=active]:bg-white dark:data-[state=active]:bg-lawbot-slate-700 data-[state=active]:text-lawbot-purple-600 font-medium">
                🧠 Predictive Analysis
              </TabsTrigger>
              <TabsTrigger value="evidence" className="data-[state=active]:bg-white dark:data-[state=active]:bg-lawbot-slate-700 data-[state=active]:text-lawbot-emerald-600 font-medium">
                📎 Evidence
              </TabsTrigger>
              <TabsTrigger value="timeline" className="data-[state=active]:bg-white dark:data-[state=active]:bg-lawbot-slate-700 data-[state=active]:text-lawbot-amber-600 font-medium">
                🕐 Timeline
              </TabsTrigger>
              <TabsTrigger value="actions" className="data-[state=active]:bg-white dark:data-[state=active]:bg-lawbot-slate-700 data-[state=active]:text-lawbot-red-600 font-medium">
                ⚡ Actions
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="overview" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Enhanced Case Information */}
                  <Card className="card-modern bg-gradient-to-br from-lawbot-blue-50/30 to-white dark:from-lawbot-blue-900/10 dark:to-lawbot-slate-800 border-lawbot-blue-200 dark:border-lawbot-blue-800">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-lawbot-blue-500 rounded-lg">
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        <CardTitle className="text-xl text-lawbot-slate-900 dark:text-white">📋 Case Information</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-slate-200 dark:border-lawbot-slate-700">
                          <label className="text-sm font-semibold text-lawbot-slate-600 dark:text-lawbot-slate-400 block mb-1">🏷️ Case Type</label>
                          <p className="font-bold text-lawbot-slate-900 dark:text-white">{caseData.type || 'Online Banking Fraud'}</p>
                        </div>
                        <div className="p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-slate-200 dark:border-lawbot-slate-700">
                          <label className="text-sm font-semibold text-lawbot-slate-600 dark:text-lawbot-slate-400 block mb-1">📅 Reported Date</label>
                          <p className="font-bold text-lawbot-slate-900 dark:text-white">{caseData.date}</p>
                        </div>
                        <div className="p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-slate-200 dark:border-lawbot-slate-700">
                          <label className="text-sm font-semibold text-lawbot-slate-600 dark:text-lawbot-slate-400 block mb-1">📍 Location</label>
                          <p className="font-bold text-lawbot-slate-900 dark:text-white">{caseData.location || 'Manila, NCR'}</p>
                        </div>
                        <div className="p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-slate-200 dark:border-lawbot-slate-700">
                          <label className="text-sm font-semibold text-lawbot-slate-600 dark:text-lawbot-slate-400 block mb-1">👮 Assigned Officer</label>
                          <p className="font-bold text-lawbot-slate-900 dark:text-white">{caseData.officer}</p>
                        </div>
                      </div>
                      <Separator className="bg-lawbot-slate-200 dark:bg-lawbot-slate-700" />
                      <div className="p-4 bg-gradient-to-r from-lawbot-blue-50 to-lawbot-emerald-50 dark:from-lawbot-blue-900/20 dark:to-lawbot-emerald-900/20 rounded-xl border border-lawbot-blue-200 dark:border-lawbot-blue-800">
                        <label className="text-sm font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300 block mb-2">📝 Description</label>
                        <p className="text-lawbot-slate-800 dark:text-lawbot-slate-200 leading-relaxed">
                          {caseData.description || 'Unauthorized access to online banking account resulting in fraudulent transactions totaling ₱50,000'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Enhanced Complainant Information */}
                  <Card className="card-modern bg-gradient-to-br from-lawbot-emerald-50/30 to-white dark:from-lawbot-emerald-900/10 dark:to-lawbot-slate-800 border-lawbot-emerald-200 dark:border-lawbot-emerald-800">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-lawbot-emerald-500 rounded-lg">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <CardTitle className="text-xl text-lawbot-slate-900 dark:text-white">👤 Complainant Information</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="flex items-center space-x-4 p-4 bg-white dark:bg-lawbot-slate-800 rounded-xl border border-lawbot-emerald-200 dark:border-lawbot-emerald-800">
                        <Avatar className="h-14 w-14 ring-4 ring-lawbot-emerald-100 dark:ring-lawbot-emerald-800">
                          <AvatarImage src="/placeholder.svg?height=56&width=56" />
                          <AvatarFallback className="bg-gradient-to-br from-lawbot-emerald-500 to-lawbot-emerald-600 text-white font-bold text-lg">JD</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-lg text-lawbot-slate-900 dark:text-white">Juan Dela Cruz</p>
                          <Badge className="bg-gradient-to-r from-lawbot-emerald-50 to-lawbot-emerald-100 text-lawbot-emerald-700 border border-lawbot-emerald-200 dark:from-lawbot-emerald-900/20 dark:to-lawbot-emerald-800/20 dark:text-lawbot-emerald-300 dark:border-lawbot-emerald-800 mt-1">
                            🏅 Primary Complainant
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-slate-200 dark:border-lawbot-slate-700">
                          <div className="p-2 bg-lawbot-blue-500 rounded-lg">
                            <Phone className="h-4 w-4 text-white" />
                          </div>
                          <span className="font-medium text-lawbot-slate-900 dark:text-white">+63 917 123 4567</span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-slate-200 dark:border-lawbot-slate-700">
                          <div className="p-2 bg-lawbot-purple-500 rounded-lg">
                            <Mail className="h-4 w-4 text-white" />
                          </div>
                          <span className="font-medium text-lawbot-slate-900 dark:text-white">juan.delacruz@email.com</span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-slate-200 dark:border-lawbot-slate-700">
                          <div className="p-2 bg-lawbot-amber-500 rounded-lg">
                            <MapPin className="h-4 w-4 text-white" />
                          </div>
                          <span className="font-medium text-lawbot-slate-900 dark:text-white">Quezon City, Metro Manila</span>
                        </div>
                      </div>
                      <Separator className="bg-lawbot-slate-200 dark:bg-lawbot-slate-700" />
                      <div className="p-4 bg-gradient-to-r from-lawbot-emerald-50 to-lawbot-green-50 dark:from-lawbot-emerald-900/20 dark:to-lawbot-green-900/20 rounded-xl border border-lawbot-emerald-200 dark:border-lawbot-emerald-800">
                        <label className="text-sm font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300 block mb-2 flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-lawbot-emerald-500" />
                          📝 Additional Notes
                        </label>
                        <p className="text-sm text-lawbot-slate-800 dark:text-lawbot-slate-200 leading-relaxed">
                          Victim is cooperative and has provided all requested documentation. Available for follow-up
                          interviews.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Enhanced AI Summarizer Section */}
                <Card className="card-modern bg-gradient-to-br from-lawbot-purple-50/30 to-white dark:from-lawbot-purple-900/10 dark:to-lawbot-slate-800 border-lawbot-purple-200 dark:border-lawbot-purple-800">
                  <CardHeader className="bg-gradient-to-r from-lawbot-purple-50 to-lawbot-violet-50 dark:from-lawbot-purple-900/20 dark:to-lawbot-violet-900/20 border-b border-lawbot-purple-200 dark:border-lawbot-purple-800">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-lawbot-purple-500 rounded-lg">
                        <Brain className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-lawbot-slate-900 dark:text-white flex items-center space-x-3">
                          🧠 AI Case Summary
                          <Badge className="bg-gradient-to-r from-lawbot-purple-50 to-lawbot-purple-100 text-lawbot-purple-700 border border-lawbot-purple-200 dark:from-lawbot-purple-900/20 dark:to-lawbot-purple-800/20 dark:text-lawbot-purple-300 dark:border-lawbot-purple-800">
                            ✨ Auto-Generated
                          </Badge>
                        </CardTitle>
                        <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400 mt-1">
                          AI-powered analysis and insights for enhanced investigation
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-4 text-lawbot-purple-700 dark:text-lawbot-purple-300 flex items-center">
                          <Target className="h-4 w-4 mr-2" />
                          🎯 Key Details
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-start space-x-3 p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-purple-200 dark:border-lawbot-purple-800">
                            <div className="w-2 h-2 bg-lawbot-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm font-medium text-lawbot-slate-700 dark:text-lawbot-slate-300">💰 Financial loss estimated at ₱{caseData.estimatedLoss || '50,000'}</span>
                          </div>
                          <div className="flex items-start space-x-3 p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-purple-200 dark:border-lawbot-purple-800">
                            <div className="w-2 h-2 bg-lawbot-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm font-medium text-lawbot-slate-700 dark:text-lawbot-slate-300">🏷️ Crime type: {caseData.crimeType || caseData.title}</span>
                          </div>
                          <div className="flex items-start space-x-3 p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-purple-200 dark:border-lawbot-purple-800">
                            <div className="w-2 h-2 bg-lawbot-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm font-medium text-lawbot-slate-700 dark:text-lawbot-slate-300">👥 Multiple victims potentially affected</span>
                          </div>
                          <div className="flex items-start space-x-3 p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-purple-200 dark:border-lawbot-purple-800">
                            <div className="w-2 h-2 bg-lawbot-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm font-medium text-lawbot-slate-700 dark:text-lawbot-slate-300">📎 Evidence includes digital communications and transaction records</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-4 text-lawbot-purple-700 dark:text-lawbot-purple-300 flex items-center">
                          <Brain className="h-4 w-4 mr-2" />
                          📋 Executive Summary
                        </h4>
                        <div className="bg-gradient-to-r from-lawbot-purple-50 to-lawbot-violet-50 dark:from-lawbot-purple-900/20 dark:to-lawbot-violet-900/20 p-5 rounded-xl border border-lawbot-purple-200 dark:border-lawbot-purple-800">
                          <p className="text-sm text-lawbot-purple-800 dark:text-lawbot-purple-200 leading-relaxed">
                            This case involves a sophisticated {caseData.crimeType?.toLowerCase() || 'cybercrime'} operation targeting victims through 
                            digital channels. The perpetrator(s) used social engineering tactics to gain trust before executing the fraudulent scheme. 
                            Initial evidence suggests this may be part of a larger organized campaign with multiple victims across the region.
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-lawbot-slate-200 dark:bg-lawbot-slate-700" />

                    <div>
                      <h4 className="font-semibold mb-5 text-lawbot-purple-700 dark:text-lawbot-purple-300 flex items-center">
                        <Zap className="h-4 w-4 mr-2" />
                        ⚡ Immediate Action Items
                      </h4>
                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-lawbot-red-50 to-lawbot-red-100/50 dark:from-lawbot-red-900/20 dark:to-lawbot-red-800/10 p-5 rounded-xl border border-lawbot-red-200 dark:border-lawbot-red-800 hover:shadow-lg transition-all duration-300">
                          <div className="flex items-center space-x-2 mb-3">
                            <div className="p-1 bg-lawbot-red-500 rounded-full">
                              <AlertTriangle className="h-3 w-3 text-white" />
                            </div>
                            <h5 className="font-bold text-lawbot-red-800 dark:text-lawbot-red-200 text-sm">🔴 High Priority</h5>
                          </div>
                          <ul className="text-xs text-lawbot-red-700 dark:text-lawbot-red-300 space-y-2 font-medium">
                            <li className="flex items-start space-x-2">
                              <CheckCircle className="h-3 w-3 text-lawbot-red-500 mt-0.5 flex-shrink-0" />
                              <span>Contact victim within 24 hours</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <CheckCircle className="h-3 w-3 text-lawbot-red-500 mt-0.5 flex-shrink-0" />
                              <span>Preserve digital evidence</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <CheckCircle className="h-3 w-3 text-lawbot-red-500 mt-0.5 flex-shrink-0" />
                              <span>Check for similar cases</span>
                            </li>
                          </ul>
                        </div>
                        <div className="bg-gradient-to-br from-lawbot-amber-50 to-lawbot-amber-100/50 dark:from-lawbot-amber-900/20 dark:to-lawbot-amber-800/10 p-5 rounded-xl border border-lawbot-amber-200 dark:border-lawbot-amber-800 hover:shadow-lg transition-all duration-300">
                          <div className="flex items-center space-x-2 mb-3">
                            <div className="p-1 bg-lawbot-amber-500 rounded-full">
                              <Clock className="h-3 w-3 text-white" />
                            </div>
                            <h5 className="font-bold text-lawbot-amber-800 dark:text-lawbot-amber-200 text-sm">🟡 Medium Priority</h5>
                          </div>
                          <ul className="text-xs text-lawbot-amber-700 dark:text-lawbot-amber-300 space-y-2 font-medium">
                            <li className="flex items-start space-x-2">
                              <CheckCircle className="h-3 w-3 text-lawbot-amber-500 mt-0.5 flex-shrink-0" />
                              <span>Analyze transaction patterns</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <CheckCircle className="h-3 w-3 text-lawbot-amber-500 mt-0.5 flex-shrink-0" />
                              <span>Coordinate with bank security</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <CheckCircle className="h-3 w-3 text-lawbot-amber-500 mt-0.5 flex-shrink-0" />
                              <span>Interview witnesses</span>
                            </li>
                          </ul>
                        </div>
                        <div className="bg-gradient-to-br from-lawbot-blue-50 to-lawbot-blue-100/50 dark:from-lawbot-blue-900/20 dark:to-lawbot-blue-800/10 p-5 rounded-xl border border-lawbot-blue-200 dark:border-lawbot-blue-800 hover:shadow-lg transition-all duration-300">
                          <div className="flex items-center space-x-2 mb-3">
                            <div className="p-1 bg-lawbot-blue-500 rounded-full">
                              <TrendingUp className="h-3 w-3 text-white" />
                            </div>
                            <h5 className="font-bold text-lawbot-blue-800 dark:text-lawbot-blue-200 text-sm">🔍 Investigation</h5>
                          </div>
                          <ul className="text-xs text-lawbot-blue-700 dark:text-lawbot-blue-300 space-y-2 font-medium">
                            <li className="flex items-start space-x-2">
                              <CheckCircle className="h-3 w-3 text-lawbot-blue-500 mt-0.5 flex-shrink-0" />
                              <span>Technical analysis of devices</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <CheckCircle className="h-3 w-3 text-lawbot-blue-500 mt-0.5 flex-shrink-0" />
                              <span>Cross-reference databases</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <CheckCircle className="h-3 w-3 text-lawbot-blue-500 mt-0.5 flex-shrink-0" />
                              <span>Prepare legal documentation</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ai-analysis" className="space-y-6">
                <Card className="card-modern bg-gradient-to-br from-lawbot-blue-50/30 to-white dark:from-lawbot-blue-900/10 dark:to-lawbot-slate-800 border-lawbot-blue-200 dark:border-lawbot-blue-800">
                  <CardHeader className="bg-gradient-to-r from-lawbot-blue-50 to-lawbot-indigo-50 dark:from-lawbot-blue-900/20 dark:to-lawbot-indigo-900/20 border-b border-lawbot-blue-200 dark:border-lawbot-blue-800">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-lawbot-blue-500 rounded-lg">
                        <Brain className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-lawbot-slate-900 dark:text-white flex items-center space-x-3">
                          🧠 Predictive Analysis Report
                          <Badge className="bg-gradient-to-r from-lawbot-blue-50 to-lawbot-blue-100 text-lawbot-blue-700 border border-lawbot-blue-200 dark:from-lawbot-blue-900/20 dark:to-lawbot-blue-800/20 dark:text-lawbot-blue-300 dark:border-lawbot-blue-800">
                            🎯 Confidence: {aiAnalysis.confidence}%
                          </Badge>
                        </CardTitle>
                        <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400 mt-1">
                          Advanced AI analysis for optimal case resolution strategy
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      {aiAnalysis.keyIndicators.map((indicator, index) => (
                        <div key={index} className="text-center p-5 bg-white dark:bg-lawbot-slate-800 rounded-xl border border-lawbot-slate-200 dark:border-lawbot-slate-700 hover:shadow-lg transition-all duration-300">
                          <div className="mb-4">
                            <div
                              className={`text-3xl font-bold mb-2 ${
                                indicator.color === "red"
                                  ? "text-lawbot-red-600 dark:text-lawbot-red-400"
                                  : indicator.color === "blue"
                                    ? "text-lawbot-blue-600 dark:text-lawbot-blue-400"
                                    : "text-lawbot-emerald-600 dark:text-lawbot-emerald-400"
                              }`}
                            >
                              {indicator.color === "red" ? "🚨" : indicator.color === "blue" ? "📊" : "✅"} {indicator.value}%
                            </div>
                            <div className="text-sm font-semibold text-lawbot-slate-600 dark:text-lawbot-slate-400">{indicator.label}</div>
                          </div>
                          <Progress
                            value={indicator.value}
                            className={`h-3 rounded-full ${
                              indicator.color === "red"
                                ? "[&>div]:bg-gradient-to-r [&>div]:from-lawbot-red-500 [&>div]:to-lawbot-red-600"
                                : indicator.color === "blue"
                                  ? "[&>div]:bg-gradient-to-r [&>div]:from-lawbot-blue-500 [&>div]:to-lawbot-blue-600"
                                  : "[&>div]:bg-gradient-to-r [&>div]:from-lawbot-emerald-500 [&>div]:to-lawbot-emerald-600"
                            } bg-lawbot-slate-200 dark:bg-lawbot-slate-700`}
                          />
                        </div>
                      ))}
                    </div>

                    <Separator className="bg-lawbot-slate-200 dark:bg-lawbot-slate-700" />

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="p-5 bg-gradient-to-r from-lawbot-red-50 to-lawbot-red-100/50 dark:from-lawbot-red-900/20 dark:to-lawbot-red-800/10 rounded-xl border border-lawbot-red-200 dark:border-lawbot-red-800">
                        <h4 className="font-semibold mb-4 flex items-center space-x-2 text-lawbot-red-700 dark:text-lawbot-red-300">
                          <div className="p-1 bg-lawbot-red-500 rounded-full">
                            <Target className="h-3 w-3 text-white" />
                          </div>
                          <span>🎯 Risk Assessment</span>
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg">
                            <span className="font-medium text-lawbot-slate-700 dark:text-lawbot-slate-300">Risk Level:</span>
                            <Badge className="bg-gradient-to-r from-lawbot-red-50 to-lawbot-red-100 text-lawbot-red-700 border border-lawbot-red-200 dark:from-lawbot-red-900/20 dark:to-lawbot-red-800/20 dark:text-lawbot-red-300 dark:border-lawbot-red-800">
                              🚨 {aiAnalysis.riskLevel}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg">
                            <span className="font-medium text-lawbot-slate-700 dark:text-lawbot-slate-300">Predicted Outcome:</span>
                            <span className="font-bold text-lawbot-emerald-600 dark:text-lawbot-emerald-400">✅ {aiAnalysis.predictedOutcome}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg">
                            <span className="font-medium text-lawbot-slate-700 dark:text-lawbot-slate-300">Estimated Resolution:</span>
                            <span className="font-bold text-lawbot-blue-600 dark:text-lawbot-blue-400">⏱️ {aiAnalysis.estimatedTime}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-5 bg-gradient-to-r from-lawbot-emerald-50 to-lawbot-emerald-100/50 dark:from-lawbot-emerald-900/20 dark:to-lawbot-emerald-800/10 rounded-xl border border-lawbot-emerald-200 dark:border-lawbot-emerald-800">
                        <h4 className="font-semibold mb-4 flex items-center space-x-2 text-lawbot-emerald-700 dark:text-lawbot-emerald-300">
                          <div className="p-1 bg-lawbot-emerald-500 rounded-full">
                            <Zap className="h-3 w-3 text-white" />
                          </div>
                          <span>⚡ System Recommendations</span>
                        </h4>
                        <ul className="space-y-3">
                          {aiAnalysis.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start space-x-3 p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-emerald-200 dark:border-lawbot-emerald-800">
                              <CheckCircle className="h-4 w-4 text-lawbot-emerald-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm font-medium text-lawbot-slate-700 dark:text-lawbot-slate-300">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="evidence" className="space-y-6">
                <Card className="card-modern bg-gradient-to-br from-lawbot-emerald-50/30 to-white dark:from-lawbot-emerald-900/10 dark:to-lawbot-slate-800 border-lawbot-emerald-200 dark:border-lawbot-emerald-800">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-lawbot-emerald-500 rounded-lg">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-lawbot-slate-900 dark:text-white flex items-center space-x-3">
                          📎 Evidence Files
                          <Badge className="bg-gradient-to-r from-lawbot-emerald-50 to-lawbot-emerald-100 text-lawbot-emerald-700 border border-lawbot-emerald-200 dark:from-lawbot-emerald-900/20 dark:to-lawbot-emerald-800/20 dark:text-lawbot-emerald-300 dark:border-lawbot-emerald-800">
                            📁 {evidenceFiles.length} files
                          </Badge>
                        </CardTitle>
                        <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400 mt-1">
                          Digital evidence collected for case investigation
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {evidenceFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-5 bg-white dark:bg-lawbot-slate-800 border border-lawbot-emerald-200 dark:border-lawbot-emerald-800 rounded-xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="p-3 bg-gradient-to-r from-lawbot-blue-100 to-lawbot-blue-200 dark:from-lawbot-blue-900 dark:to-lawbot-blue-800 rounded-lg">
                              {file.type === 'image' && <Eye className="h-5 w-5 text-lawbot-blue-600 dark:text-lawbot-blue-400" />}
                              {file.type === 'document' && <FileText className="h-5 w-5 text-lawbot-blue-600 dark:text-lawbot-blue-400" />}
                              {file.type === 'audio' && <FileText className="h-5 w-5 text-lawbot-blue-600 dark:text-lawbot-blue-400" />}
                              {file.type === 'text' && <FileText className="h-5 w-5 text-lawbot-blue-600 dark:text-lawbot-blue-400" />}
                            </div>
                            <div>
                              <p className="font-bold text-lawbot-slate-900 dark:text-white flex items-center space-x-2">
                                {file.type === 'image' && '🖼️'}
                                {file.type === 'document' && '📄'}
                                {file.type === 'audio' && '🎧'}
                                {file.type === 'text' && '📝'}
                                <span>{file.name}</span>
                              </p>
                              <div className="flex items-center space-x-3 mt-1">
                                <Badge className="bg-lawbot-slate-100 text-lawbot-slate-700 dark:bg-lawbot-slate-700 dark:text-lawbot-slate-300 text-xs">
                                  {file.type.toUpperCase()}
                                </Badge>
                                <span className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400 font-medium">💾 {file.size}</span>
                                <span className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-500">🔐 Hash: {file.hash}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-3">
                            <Button size="sm" className="btn-gradient">
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                            <Button size="sm" variant="outline" className="btn-modern border-lawbot-emerald-300 text-lawbot-emerald-600 hover:bg-lawbot-emerald-50">
                              <Download className="h-4 w-4 mr-2" />
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
                <Card className="card-modern bg-gradient-to-br from-lawbot-amber-50/30 to-white dark:from-lawbot-amber-900/10 dark:to-lawbot-slate-800 border-lawbot-amber-200 dark:border-lawbot-amber-800">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-lawbot-amber-500 rounded-lg">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-lawbot-slate-900 dark:text-white">🕐 Case Timeline</CardTitle>
                        <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400 mt-1">
                          Chronological sequence of case events and actions
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-5">
                      {timeline.map((event, index) => (
                        <div key={index} className="flex items-start space-x-4 p-4 bg-white dark:bg-lawbot-slate-800 rounded-xl border border-lawbot-amber-200 dark:border-lawbot-amber-800 hover:shadow-lg transition-all duration-300">
                          <div
                            className={`p-3 rounded-full shadow-sm ${
                              event.type === "report"
                                ? "bg-gradient-to-r from-lawbot-blue-100 to-lawbot-blue-200 text-lawbot-blue-600 dark:from-lawbot-blue-900 dark:to-lawbot-blue-800 dark:text-lawbot-blue-400"
                                : event.type === "ai"
                                  ? "bg-gradient-to-r from-lawbot-purple-100 to-lawbot-purple-200 text-lawbot-purple-600 dark:from-lawbot-purple-900 dark:to-lawbot-purple-800 dark:text-lawbot-purple-400"
                                  : event.type === "assignment"
                                    ? "bg-gradient-to-r from-lawbot-emerald-100 to-lawbot-emerald-200 text-lawbot-emerald-600 dark:from-lawbot-emerald-900 dark:to-lawbot-emerald-800 dark:text-lawbot-emerald-400"
                                    : event.type === "contact"
                                      ? "bg-gradient-to-r from-lawbot-amber-100 to-lawbot-amber-200 text-lawbot-amber-600 dark:from-lawbot-amber-900 dark:to-lawbot-amber-800 dark:text-lawbot-amber-400"
                                      : event.type === "evidence"
                                        ? "bg-gradient-to-r from-lawbot-red-100 to-lawbot-red-200 text-lawbot-red-600 dark:from-lawbot-red-900 dark:to-lawbot-red-800 dark:text-lawbot-red-400"
                                        : "bg-gradient-to-r from-lawbot-slate-100 to-lawbot-slate-200 text-lawbot-slate-600 dark:from-lawbot-slate-700 dark:to-lawbot-slate-800 dark:text-lawbot-slate-400"
                            }`}
                          >
                            <div className="h-3 w-3 rounded-full bg-current"></div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              {event.type === "report" && <span>📝</span>}
                              {event.type === "ai" && <span>🧠</span>}
                              {event.type === "assignment" && <span>👮</span>}
                              {event.type === "contact" && <span>📞</span>}
                              {event.type === "evidence" && <span>📎</span>}
                              {event.type === "analysis" && <span>🔍</span>}
                              <p className="font-bold text-lawbot-slate-900 dark:text-white">{event.event}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-3 w-3 text-lawbot-slate-500" />
                              <p className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400 font-medium">{event.date}</p>
                            </div>
                          </div>
                          {index < timeline.length - 1 && (
                            <div className="absolute left-8 mt-16 w-px h-6 bg-lawbot-slate-200 dark:bg-lawbot-slate-700"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="actions" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="card-modern bg-gradient-to-br from-lawbot-red-50/30 to-white dark:from-lawbot-red-900/10 dark:to-lawbot-slate-800 border-lawbot-red-200 dark:border-lawbot-red-800">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-lawbot-red-500 rounded-lg">
                          <Zap className="h-5 w-5 text-white" />
                        </div>
                        <CardTitle className="text-xl text-lawbot-slate-900 dark:text-white">⚡ Quick Actions</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button className="w-full justify-start btn-modern border-lawbot-blue-300 text-lawbot-blue-600 hover:bg-lawbot-blue-50 dark:border-lawbot-blue-600 dark:text-lawbot-blue-400 dark:hover:bg-lawbot-blue-900/20" variant="outline">
                        <div className="p-1 bg-lawbot-blue-500 rounded-full mr-3">
                          <Phone className="h-3 w-3 text-white" />
                        </div>
                        📞 Contact Complainant
                      </Button>
                      <Button className="w-full justify-start btn-modern border-lawbot-emerald-300 text-lawbot-emerald-600 hover:bg-lawbot-emerald-50 dark:border-lawbot-emerald-600 dark:text-lawbot-emerald-400 dark:hover:bg-lawbot-emerald-900/20" variant="outline">
                        <div className="p-1 bg-lawbot-emerald-500 rounded-full mr-3">
                          <FileText className="h-3 w-3 text-white" />
                        </div>
                        📝 Update Case Status
                      </Button>
                      <Button className="w-full justify-start btn-modern border-lawbot-purple-300 text-lawbot-purple-600 hover:bg-lawbot-purple-50 dark:border-lawbot-purple-600 dark:text-lawbot-purple-400 dark:hover:bg-lawbot-purple-900/20" variant="outline">
                        <div className="p-1 bg-lawbot-purple-500 rounded-full mr-3">
                          <User className="h-3 w-3 text-white" />
                        </div>
                        👥 Assign to Specialist
                      </Button>
                      <Button className="w-full justify-start btn-modern border-lawbot-amber-300 text-lawbot-amber-600 hover:bg-lawbot-amber-50 dark:border-lawbot-amber-600 dark:text-lawbot-amber-400 dark:hover:bg-lawbot-amber-900/20" variant="outline">
                        <div className="p-1 bg-lawbot-amber-500 rounded-full mr-3">
                          <AlertTriangle className="h-3 w-3 text-white" />
                        </div>
                        🚨 Escalate Case
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="card-modern bg-gradient-to-br from-lawbot-blue-50/30 to-white dark:from-lawbot-blue-900/10 dark:to-lawbot-slate-800 border-lawbot-blue-200 dark:border-lawbot-blue-800">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-lawbot-blue-500 rounded-lg">
                          <TrendingUp className="h-5 w-5 text-white" />
                        </div>
                        <CardTitle className="text-xl text-lawbot-slate-900 dark:text-white">📊 Case Management</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button className="w-full justify-start btn-modern border-lawbot-emerald-300 text-lawbot-emerald-600 hover:bg-lawbot-emerald-50 dark:border-lawbot-emerald-600 dark:text-lawbot-emerald-400 dark:hover:bg-lawbot-emerald-900/20" variant="outline">
                        <div className="p-1 bg-lawbot-emerald-500 rounded-full mr-3">
                          <Download className="h-3 w-3 text-white" />
                        </div>
                        📄 Generate Report
                      </Button>
                      <Button className="w-full justify-start btn-modern border-lawbot-purple-300 text-lawbot-purple-600 hover:bg-lawbot-purple-50 dark:border-lawbot-purple-600 dark:text-lawbot-purple-400 dark:hover:bg-lawbot-purple-900/20" variant="outline">
                        <div className="p-1 bg-lawbot-purple-500 rounded-full mr-3">
                          <Calendar className="h-3 w-3 text-white" />
                        </div>
                        📅 Schedule Follow-up
                      </Button>
                      <Button className="w-full justify-start btn-modern border-lawbot-blue-300 text-lawbot-blue-600 hover:bg-lawbot-blue-50 dark:border-lawbot-blue-600 dark:text-lawbot-blue-400 dark:hover:bg-lawbot-blue-900/20" variant="outline">
                        <div className="p-1 bg-lawbot-blue-500 rounded-full mr-3">
                          <TrendingUp className="h-3 w-3 text-white" />
                        </div>
                        📈 View Analytics
                      </Button>
                      <Button className="w-full justify-start bg-gradient-to-r from-lawbot-red-500 to-lawbot-red-600 hover:from-lawbot-red-600 hover:to-lawbot-red-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="p-1 bg-white/20 rounded-full mr-3">
                          <XCircle className="h-3 w-3 text-white" />
                        </div>
                        ❌ Close Case
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
