"use client"
import { useState, useEffect } from "react"
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
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import PNPOfficerService from "@/lib/pnp-officer-service"
import EvidenceService from "@/lib/evidence-service"
import AIService from "@/lib/ai-service"
import { supabase } from "@/lib/supabase"
import { EvidenceViewerModal } from "@/components/modals/evidence-viewer-modal"
import { StatusUpdateModal } from "@/components/modals/status-update-modal"

interface CaseDetailModalProps {
  isOpen: boolean
  onClose: () => void
  caseData: any
}

export function CaseDetailModal({ isOpen, onClose, caseData }: CaseDetailModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [statusHistory, setStatusHistory] = useState<any[]>([])
  const [evidenceFiles, setEvidenceFiles] = useState<any[]>([])
  const [complaintDetails, setComplaintDetails] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [selectedEvidence, setSelectedEvidence] = useState<any>(null)
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [aiSummary, setAiSummary] = useState<string>('')
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false)
  const [aiActionItems, setAiActionItems] = useState<{high: string[], medium: string[], low: string[]}>({
    high: [], medium: [], low: []
  })
  const [aiKeyDetails, setAiKeyDetails] = useState<{
    financialImpact: string
    victimProfile: string
    evidenceAssessment: string
    riskFactors: string
    complexity: string
  }>({
    financialImpact: '💰 Financial impact to be assessed',
    victimProfile: '👥 Single victim case',
    evidenceAssessment: '📎 Evidence package pending review',
    riskFactors: '🚨 Risk assessment in progress',
    complexity: '⚖️ Complexity analysis required'
  })

  // Reset all case-specific state to default values
  const resetCaseState = () => {
    // Reset case data
    setStatusHistory([])
    setEvidenceFiles([])
    setComplaintDetails(null)
    setUserProfile(null)
    setSelectedEvidence(null)
    setEvidenceModalOpen(false)
    setStatusModalOpen(false)
    
    // Reset AI state
    setAiSummary('')
    setAiSummaryLoading(false)
    setAiActionItems({
      high: [], 
      medium: [], 
      low: []
    })
    setAiKeyDetails({
      financialImpact: '💰 Financial impact to be assessed',
      victimProfile: '👥 Single victim case',
      evidenceAssessment: '📎 Evidence package pending review',
      riskFactors: '🚨 Risk assessment in progress',
      complexity: '⚖️ Complexity analysis required'
    })
  }

  useEffect(() => {
    if (isOpen && caseData) {
      // Reset all state before fetching new case details
      resetCaseState()
      fetchCaseDetails()
    }
  }, [isOpen, caseData])

  // Clean up state when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetCaseState()
    }
  }, [isOpen])

  const fetchCaseDetails = async () => {
    setIsLoading(true)
    try {
      // Get complaint details if we have complaint data
      const complaint = caseData.complaint || caseData
      const complaintId = complaint.complaint_id || complaint.id
      
      // Fetch full complaint details if needed
      if (complaintId && !complaint.description) {
        const { data: fullComplaint } = await supabase
          .from('complaints')
          .select('*')
          .eq('id', complaintId)
          .single()
        
        if (fullComplaint) {
          setComplaintDetails(fullComplaint)
        }
      } else {
        setComplaintDetails(complaint)
      }
      
      // Fetch user profile
      if (complaint.user_id) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', complaint.user_id)
          .single()
        
        if (profile) {
          setUserProfile(profile)
        }
      }
      
      // Fetch status history
      const { data: history } = await supabase
        .from('status_history')
        .select('*')
        .eq('complaint_id', complaintId)
        .order('timestamp', { ascending: false })
        .limit(10)
      
      if (history) {
        setStatusHistory(history)
      }
      
      // Fetch evidence files
      const files = await PNPOfficerService.getEvidenceFiles(complaintId)
      setEvidenceFiles(files)
      
      // Generate AI summary for the case
      generateAISummary(complaintDetails || complaint, files.length)
      
    } catch (error) {
      console.error('Error fetching case details:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Generate AI summary
  const generateAISummary = async (complaint: any, evidenceCount: number) => {
    setAiSummaryLoading(true)
    try {
      // Prepare case data for AI with all dynamic fields
      const caseDataForAI = {
        // Core fields
        complaint_number: complaint.complaint_number,
        crime_type: complaint.crime_type,
        description: complaint.description,
        incident_date_time: complaint.incident_date_time,
        status: complaint.status,
        priority: complaint.priority,
        
        // Location and platform fields
        incident_location: complaint.incident_location,
        platform_website: complaint.platform_website,
        account_reference: complaint.account_reference,
        
        // Financial fields
        estimated_loss: complaint.estimated_loss || complaint.estimated_financial_loss,
        
        // Suspect information
        suspect_name: complaint.suspect_name,
        suspect_relationship: complaint.suspect_relationship,
        suspect_contact: complaint.suspect_contact,
        suspect_details: complaint.suspect_details,
        
        // Technical fields
        system_details: complaint.system_details,
        technical_info: complaint.technical_info,
        vulnerability_details: complaint.vulnerability_details,
        attack_vector: complaint.attack_vector,
        
        // Security and impact fields
        security_level: complaint.security_level,
        target_info: complaint.target_info,
        content_description: complaint.content_description,
        impact_assessment: complaint.impact_assessment,
        
        // Metadata
        risk_score: complaint.risk_score || complaint.ai_risk_score,
        evidence_count: evidenceCount,
        assigned_unit: complaint.assigned_unit,
        assigned_officer: complaint.assigned_officer,
        full_name: complaint.full_name || userProfile?.full_name
      }
      
      // Generate summary
      const summary = await AIService.generateCaseSummary(caseDataForAI)
      setAiSummary(summary)
      
      // Generate action items
      const actions = await AIService.generateActionItems(caseDataForAI)
      setAiActionItems(actions)
      
      // Generate key details
      const keyDetails = await AIService.generateKeyDetails(caseDataForAI)
      setAiKeyDetails(keyDetails)
      
    } catch (error) {
      console.error('Error generating AI summary:', error)
      setAiSummary('AI summary generation failed. Please review case details manually.')
    } finally {
      setAiSummaryLoading(false)
    }
  }

  if (!isOpen || !caseData) return null
  
  // Use complaint data from props or fetched details
  const complaint = complaintDetails || caseData.complaint || caseData

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

  // Use AI data from complaint or generate default
  const aiAnalysis = {
    confidence: complaint.ai_confidence_score || 75,
    riskLevel: complaint.ai_priority || complaint.priority || "Medium",
    predictedOutcome: "Under Analysis",
    estimatedTime: "3-7 days",
    recommendations: complaint.ai_recommendations ? JSON.parse(complaint.ai_recommendations) : [
      "Contact complainant for additional information",
      "Collect and preserve digital evidence",
      "Coordinate with specialized unit",
      "Document all investigative steps",
    ],
    keyIndicators: [
      { label: "Risk Score", value: complaint.ai_risk_score || complaint.risk_score || 50, color: "red" },
      { label: "Evidence Count", value: evidenceFiles.length > 0 ? Math.min(evidenceFiles.length * 20, 100) : 0, color: "blue" },
      { label: "AI Confidence", value: complaint.ai_confidence_score || 75, color: "green" },
    ],
  }

  // Generate timeline from status history and complaint data
  const timeline = [
    {
      date: complaint.created_at,
      event: `Case reported - ${complaint.crime_type}`,
      type: "report"
    },
    ...(complaint.last_ai_assessment ? [{
      date: complaint.last_ai_assessment,
      event: `AI Analysis - ${complaint.ai_priority || complaint.priority} priority assigned`,
      type: "ai"
    }] : []),
    ...(complaint.assigned_officer ? [{
      date: complaint.created_at,
      event: `Assigned to ${complaint.assigned_officer}`,
      type: "assignment"
    }] : []),
    ...statusHistory.map(history => ({
      date: history.timestamp,
      event: `Status changed to ${history.status}${history.remarks ? ` - ${history.remarks}` : ''}`,
      type: history.status === 'Resolved' ? 'evidence' : history.status === 'Under Investigation' ? 'analysis' : 'contact'
    }))
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Helper function to format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }
  
  // Helper to get file type category
  const getFileTypeCategory = (fileType: string) => {
    if (fileType?.startsWith('image/')) return 'image'
    if (fileType?.startsWith('audio/')) return 'audio'
    if (fileType?.startsWith('video/')) return 'video'
    if (fileType?.includes('pdf') || fileType?.includes('document')) return 'document'
    return 'text'
  }

  // Handle view evidence
  const handleViewEvidence = (file: any) => {
    setSelectedEvidence(file)
    setEvidenceModalOpen(true)
  }

  // Handle contact complainant
  const handleContactComplainant = () => {
    if (userProfile?.phone_number || complaint.phone_number) {
      const phoneNumber = userProfile?.phone_number || complaint.phone_number
      window.open(`tel:${phoneNumber}`, '_self')
    } else if (userProfile?.email || complaint.email) {
      const email = userProfile?.email || complaint.email
      window.open(`mailto:${email}?subject=Regarding Case ${complaint.complaint_number}`, '_blank')
    } else {
      alert('No contact information available for this complainant.')
    }
  }

  // Handle generate report
  const handleGenerateReport = () => {
    // For now, just show an alert. In production, this would generate a PDF report
    alert(`Report generation for Case ${complaint.complaint_number} is being prepared. This feature will be available soon.`)
  }

  // Handle download evidence
  const handleDownloadEvidence = async (file: any) => {
    try {
      const downloadUrl = await EvidenceService.downloadEvidence(file.id)
      
      if (downloadUrl) {
        // Use blob download approach to bypass CORS restrictions
        try {
          // Fetch the file as a blob
          const response = await fetch(downloadUrl)
          if (!response.ok) throw new Error('Failed to fetch file')
          
          const blob = await response.blob()
          
          // Create a blob URL
          const blobUrl = URL.createObjectURL(blob)
          
          // Create temporary anchor element to force download
          const link = document.createElement('a')
          link.href = blobUrl
          link.download = file.file_name // Force download with original filename
          document.body.appendChild(link)
          link.click()
          
          // Cleanup
          document.body.removeChild(link)
          URL.revokeObjectURL(blobUrl)
          
          console.log('✅ File downloaded successfully:', file.file_name)
        } catch (fetchError) {
          console.error('❌ Blob download failed, trying direct download:', fetchError)
          
          // Fallback to direct download
          const link = document.createElement('a')
          link.href = downloadUrl
          link.download = file.file_name
          link.target = '_blank'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
      } else {
        alert('Failed to generate download link. Please try again.')
      }
    } catch (error) {
      console.error('❌ Error downloading evidence:', error)
      alert('Error downloading evidence file. Please try again.')
    }
  }

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
                📁 Case #{complaint.complaint_number || complaint.id}
              </CardTitle>
              <CardDescription className="text-lg mt-2 text-lawbot-slate-600 dark:text-lawbot-slate-400 font-medium">
                {complaint.title || complaint.crime_type}
              </CardDescription>
            </div>
            <div className="flex flex-col items-end space-y-3 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <Badge className={`${getPriorityColor(complaint.priority)} text-sm font-semibold px-3 py-1 shadow-sm`}>
                {complaint.priority === 'high' ? '🔴' : complaint.priority === 'medium' ? '🟡' : '🟢'} {complaint.priority} Priority
              </Badge>
              <Badge className={`${getStatusColor(complaint.status)} text-sm font-semibold px-3 py-1 shadow-sm`}>
                {complaint.status === 'Pending' ? '📋' : 
                 complaint.status === 'Under Investigation' ? '🔍' :
                 complaint.status === 'Resolved' ? '✅' :
                 complaint.status === 'Dismissed' ? '❌' : '❓'} 
                {complaint.status}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <Loader2 className="h-8 w-8 animate-spin text-lawbot-blue-600" />
            </div>
          ) : (
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
                          <p className="font-bold text-lawbot-slate-900 dark:text-white">{complaint.crime_type}</p>
                        </div>
                        <div className="p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-slate-200 dark:border-lawbot-slate-700">
                          <label className="text-sm font-semibold text-lawbot-slate-600 dark:text-lawbot-slate-400 block mb-1">📅 Reported Date</label>
                          <p className="font-bold text-lawbot-slate-900 dark:text-white">{new Date(complaint.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-slate-200 dark:border-lawbot-slate-700">
                          <label className="text-sm font-semibold text-lawbot-slate-600 dark:text-lawbot-slate-400 block mb-1">📍 Location</label>
                          <p className="font-bold text-lawbot-slate-900 dark:text-white">{complaint.incident_location || 'Not specified'}</p>
                        </div>
                        <div className="p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-slate-200 dark:border-lawbot-slate-700">
                          <label className="text-sm font-semibold text-lawbot-slate-600 dark:text-lawbot-slate-400 block mb-1">👮 Assigned Officer</label>
                          <p className="font-bold text-lawbot-slate-900 dark:text-white">{complaint.assigned_officer || 'Unassigned'}</p>
                        </div>
                      </div>
                      <Separator className="bg-lawbot-slate-200 dark:bg-lawbot-slate-700" />
                      <div className="p-4 bg-gradient-to-r from-lawbot-blue-50 to-lawbot-emerald-50 dark:from-lawbot-blue-900/20 dark:to-lawbot-emerald-900/20 rounded-xl border border-lawbot-blue-200 dark:border-lawbot-blue-800">
                        <label className="text-sm font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300 block mb-2">📝 Description</label>
                        <p className="text-lawbot-slate-800 dark:text-lawbot-slate-200 leading-relaxed">
                          {complaint.description || 'No description provided'}
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
                          <AvatarFallback className="bg-gradient-to-br from-lawbot-emerald-500 to-lawbot-emerald-600 text-white font-bold text-lg">
                            {userProfile?.full_name ? userProfile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-lg text-lawbot-slate-900 dark:text-white">
                            {userProfile?.full_name || complaint.user_profiles?.full_name || 'Anonymous'}
                          </p>
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
                          <span className="font-medium text-lawbot-slate-900 dark:text-white">
                            {userProfile?.phone_number || complaint.user_profiles?.phone_number || complaint.phone_number || 'Not provided'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-slate-200 dark:border-lawbot-slate-700">
                          <div className="p-2 bg-lawbot-purple-500 rounded-lg">
                            <Mail className="h-4 w-4 text-white" />
                          </div>
                          <span className="font-medium text-lawbot-slate-900 dark:text-white">
                            {userProfile?.email || complaint.user_profiles?.email || complaint.email || 'Not provided'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-slate-200 dark:border-lawbot-slate-700">
                          <div className="p-2 bg-lawbot-amber-500 rounded-lg">
                            <MapPin className="h-4 w-4 text-white" />
                          </div>
                          <span className="font-medium text-lawbot-slate-900 dark:text-white">
                            {userProfile?.address || complaint.incident_location || 'Not specified'}
                          </span>
                        </div>
                      </div>
                      <Separator className="bg-lawbot-slate-200 dark:bg-lawbot-slate-700" />
                      <div className="p-4 bg-gradient-to-r from-lawbot-emerald-50 to-lawbot-green-50 dark:from-lawbot-emerald-900/20 dark:to-lawbot-green-900/20 rounded-xl border border-lawbot-emerald-200 dark:border-lawbot-emerald-800">
                        <label className="text-sm font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300 block mb-2 flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-lawbot-emerald-500" />
                          📝 Additional Notes
                        </label>
                        <p className="text-sm text-lawbot-slate-800 dark:text-lawbot-slate-200 leading-relaxed">
                          {complaint.additional_info || 'Contact information verified. Available for follow-up.'}
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
                        {aiSummaryLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-5 w-5 animate-spin text-lawbot-purple-600 mr-2" />
                            <span className="text-sm text-lawbot-purple-600 dark:text-lawbot-purple-400">Generating AI insights...</span>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex items-start space-x-3 p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-purple-200 dark:border-lawbot-purple-800">
                              <div className="w-2 h-2 bg-lawbot-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-sm font-medium text-lawbot-slate-700 dark:text-lawbot-slate-300">
                                {aiKeyDetails.financialImpact}
                              </span>
                            </div>
                            <div className="flex items-start space-x-3 p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-purple-200 dark:border-lawbot-purple-800">
                              <div className="w-2 h-2 bg-lawbot-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-sm font-medium text-lawbot-slate-700 dark:text-lawbot-slate-300">
                                {aiKeyDetails.victimProfile}
                              </span>
                            </div>
                            <div className="flex items-start space-x-3 p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-purple-200 dark:border-lawbot-purple-800">
                              <div className="w-2 h-2 bg-lawbot-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-sm font-medium text-lawbot-slate-700 dark:text-lawbot-slate-300">
                                {aiKeyDetails.evidenceAssessment}
                              </span>
                            </div>
                            <div className="flex items-start space-x-3 p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-purple-200 dark:border-lawbot-purple-800">
                              <div className="w-2 h-2 bg-lawbot-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-sm font-medium text-lawbot-slate-700 dark:text-lawbot-slate-300">
                                {aiKeyDetails.riskFactors}
                              </span>
                            </div>
                            <div className="flex items-start space-x-3 p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-purple-200 dark:border-lawbot-purple-800">
                              <div className="w-2 h-2 bg-lawbot-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-sm font-medium text-lawbot-slate-700 dark:text-lawbot-slate-300">
                                {aiKeyDetails.complexity}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-4 text-lawbot-purple-700 dark:text-lawbot-purple-300 flex items-center">
                          <Brain className="h-4 w-4 mr-2" />
                          📋 Executive Summary
                        </h4>
                        <div className="bg-gradient-to-r from-lawbot-purple-50 to-lawbot-violet-50 dark:from-lawbot-purple-900/20 dark:to-lawbot-violet-900/20 p-5 rounded-xl border border-lawbot-purple-200 dark:border-lawbot-purple-800">
                          {aiSummaryLoading ? (
                            <div className="flex items-center justify-center py-4">
                              <Loader2 className="h-5 w-5 animate-spin text-lawbot-purple-600 mr-2" />
                              <span className="text-sm text-lawbot-purple-600 dark:text-lawbot-purple-400">Generating AI summary...</span>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <p className="text-sm text-lawbot-purple-800 dark:text-lawbot-purple-200 leading-relaxed whitespace-pre-wrap">
                                {aiSummary || 
                                 `This case involves ${complaint.crime_type} ${complaint.incident_location ? `reported in ${complaint.incident_location}` : ''}. 
                                 ${complaint.description ? complaint.description.substring(0, 200) + '...' : 'Investigation is ongoing to gather more details about the incident.'}`
                                }
                              </p>
                              {aiSummary && (
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="text-xs text-lawbot-purple-600 hover:text-lawbot-purple-700"
                                  onClick={() => generateAISummary(complaint, evidenceFiles.length)}
                                >
                                  <Brain className="h-3 w-3 mr-1" />
                                  Regenerate
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-lawbot-slate-200 dark:bg-lawbot-slate-700" />

                    <div>
                      <h4 className="font-semibold mb-5 text-lawbot-purple-700 dark:text-lawbot-purple-300 flex items-center">
                        <Zap className="h-4 w-4 mr-2" />
                        ⚡ Immediate Action Items
                      </h4>
                      {aiSummaryLoading ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="h-5 w-5 animate-spin text-lawbot-purple-600 mr-2" />
                          <span className="text-sm text-lawbot-purple-600 dark:text-lawbot-purple-400">Generating AI action items...</span>
                        </div>
                      ) : (
                        <div className="grid md:grid-cols-3 gap-6">
                          <div className="bg-gradient-to-br from-lawbot-red-50 to-lawbot-red-100/50 dark:from-lawbot-red-900/20 dark:to-lawbot-red-800/10 p-5 rounded-xl border border-lawbot-red-200 dark:border-lawbot-red-800 hover:shadow-lg transition-all duration-300">
                            <div className="flex items-center space-x-2 mb-3">
                              <div className="p-1 bg-lawbot-red-500 rounded-full">
                                <AlertTriangle className="h-3 w-3 text-white" />
                              </div>
                              <h5 className="font-bold text-lawbot-red-800 dark:text-lawbot-red-200 text-sm">🔴 High Priority</h5>
                            </div>
                            <ul className="text-xs text-lawbot-red-700 dark:text-lawbot-red-300 space-y-2 font-medium">
                              {(aiActionItems.high.length > 0 ? aiActionItems.high : [
                                'Contact victim within 24 hours',
                                'Preserve digital evidence',
                                'Check for similar cases'
                              ]).map((action, idx) => (
                                <li key={idx} className="flex items-start space-x-2">
                                  <CheckCircle className="h-3 w-3 text-lawbot-red-500 mt-0.5 flex-shrink-0" />
                                  <span>{action}</span>
                                </li>
                              ))}
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
                              {(aiActionItems.medium.length > 0 ? aiActionItems.medium : [
                                'Analyze transaction patterns',
                                'Coordinate with bank security',
                                'Interview witnesses'
                              ]).map((action, idx) => (
                                <li key={idx} className="flex items-start space-x-2">
                                  <CheckCircle className="h-3 w-3 text-lawbot-amber-500 mt-0.5 flex-shrink-0" />
                                  <span>{action}</span>
                                </li>
                              ))}
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
                              {(aiActionItems.low.length > 0 ? aiActionItems.low : [
                                'Technical analysis of devices',
                                'Cross-reference databases',
                                'Prepare legal documentation'
                              ]).map((action, idx) => (
                                <li key={idx} className="flex items-start space-x-2">
                                  <CheckCircle className="h-3 w-3 text-lawbot-blue-500 mt-0.5 flex-shrink-0" />
                                  <span>{action}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
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
                      {evidenceFiles.length === 0 ? (
                        <Alert className="border-lawbot-amber-200 bg-lawbot-amber-50 dark:border-lawbot-amber-800 dark:bg-lawbot-amber-900/20">
                          <AlertTriangle className="h-4 w-4 text-lawbot-amber-600" />
                          <AlertDescription className="text-lawbot-amber-700 dark:text-lawbot-amber-300">
                            No evidence files have been uploaded for this case yet.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        evidenceFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-5 bg-white dark:bg-lawbot-slate-800 border border-lawbot-emerald-200 dark:border-lawbot-emerald-800 rounded-xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="p-3 bg-gradient-to-r from-lawbot-blue-100 to-lawbot-blue-200 dark:from-lawbot-blue-900 dark:to-lawbot-blue-800 rounded-lg">
                                {getFileTypeCategory(file.file_type) === 'image' && <Eye className="h-5 w-5 text-lawbot-blue-600 dark:text-lawbot-blue-400" />}
                                {getFileTypeCategory(file.file_type) === 'document' && <FileText className="h-5 w-5 text-lawbot-blue-600 dark:text-lawbot-blue-400" />}
                                {getFileTypeCategory(file.file_type) === 'audio' && <FileText className="h-5 w-5 text-lawbot-blue-600 dark:text-lawbot-blue-400" />}
                                {getFileTypeCategory(file.file_type) === 'text' && <FileText className="h-5 w-5 text-lawbot-blue-600 dark:text-lawbot-blue-400" />}
                              </div>
                              <div>
                                <p className="font-bold text-lawbot-slate-900 dark:text-white flex items-center space-x-2">
                                  {getFileTypeCategory(file.file_type) === 'image' && '🖼️'}
                                  {getFileTypeCategory(file.file_type) === 'document' && '📄'}
                                  {getFileTypeCategory(file.file_type) === 'audio' && '🎧'}
                                  {getFileTypeCategory(file.file_type) === 'text' && '📝'}
                                  <span>{file.file_name}</span>
                                </p>
                                <div className="flex items-center space-x-3 mt-1">
                                  <Badge className="bg-lawbot-slate-100 text-lawbot-slate-700 dark:bg-lawbot-slate-700 dark:text-lawbot-slate-300 text-xs">
                                    {file.file_type.toUpperCase()}
                                  </Badge>
                                  <span className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400 font-medium">💾 {formatFileSize(file.file_size)}</span>
                                  <span className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-500">🔐 ID: {file.id.substring(0, 8)}...</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-3">
                              <Button size="sm" className="btn-gradient" onClick={() => handleViewEvidence(file)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                              <Button size="sm" variant="outline" className="btn-modern border-lawbot-emerald-300 text-lawbot-emerald-600 hover:bg-lawbot-emerald-50" onClick={() => handleDownloadEvidence(file)}>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
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
                              <p className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400 font-medium">{new Date(event.date).toLocaleString()}</p>
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
                      <Button className="w-full justify-start btn-modern border-lawbot-blue-300 text-lawbot-blue-600 hover:bg-lawbot-blue-50 dark:border-lawbot-blue-600 dark:text-lawbot-blue-400 dark:hover:bg-lawbot-blue-900/20" variant="outline" onClick={handleContactComplainant}>
                        <div className="p-1 bg-lawbot-blue-500 rounded-full mr-3">
                          <Phone className="h-3 w-3 text-white" />
                        </div>
                        📞 Contact Complainant
                      </Button>
                      <Button className="w-full justify-start btn-modern border-lawbot-emerald-300 text-lawbot-emerald-600 hover:bg-lawbot-emerald-50 dark:border-lawbot-emerald-600 dark:text-lawbot-emerald-400 dark:hover:bg-lawbot-emerald-900/20" variant="outline" onClick={() => setStatusModalOpen(true)}>
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
                      <Button className="w-full justify-start btn-modern border-lawbot-emerald-300 text-lawbot-emerald-600 hover:bg-lawbot-emerald-50 dark:border-lawbot-emerald-600 dark:text-lawbot-emerald-400 dark:hover:bg-lawbot-emerald-900/20" variant="outline" onClick={handleGenerateReport}>
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
          )}
        </div>
      </Card>
      
      {/* Evidence Viewer Modal */}
      <EvidenceViewerModal
        isOpen={evidenceModalOpen}
        onClose={() => {
          setEvidenceModalOpen(false)
          setSelectedEvidence(null)
        }}
        caseData={{ 
          id: complaint.complaint_number || complaint.id, 
          title: `Evidence: ${selectedEvidence?.file_name || "Unknown"}`,
          evidenceFile: selectedEvidence
        }}
      />
      
      {/* Status Update Modal */}
      <StatusUpdateModal
        isOpen={statusModalOpen}
        onClose={() => {
          setStatusModalOpen(false)
          // Refresh case details after status update
          fetchCaseDetails()
        }}
        caseData={complaint}
      />
    </div>
  )
}