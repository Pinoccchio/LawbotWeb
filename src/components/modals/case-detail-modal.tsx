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
  Upload,
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
  Shield,
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
import ComplaintService from "@/lib/complaint-service"
import { supabase } from "@/lib/supabase"
import { EvidenceViewerModal } from "@/components/modals/evidence-viewer-modal"
import { StatusUpdateModal } from "@/components/modals/status-update-modal"
import { EditComplaintModal } from "@/components/modals/edit-complaint-modal"
import { CaseAnalyticsModal } from "@/components/modals/case-analytics-modal"
import { toast } from "@/components/ui/use-toast"
import { PhilippineTime } from "@/lib/philippine-time"

interface CaseDetailModalProps {
  isOpen: boolean
  onClose: () => void
  caseData: any
  initialTab?: string
  onStatusUpdate?: (newStatus: string, remarks: string) => Promise<void>
  isAdmin?: boolean // Added to identify if admin view
}

export function CaseDetailModal({ isOpen, onClose, caseData, initialTab = "overview", onStatusUpdate, isAdmin = false }: CaseDetailModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [statusHistory, setStatusHistory] = useState<any[]>([])
  const [updateHistory, setUpdateHistory] = useState<any[]>([])
  const [evidenceFiles, setEvidenceFiles] = useState<any[]>([])
  const [complaintDetails, setComplaintDetails] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [selectedEvidence, setSelectedEvidence] = useState<any>(null)
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [analyticsModalOpen, setAnalyticsModalOpen] = useState(false)
  const [aiSummary, setAiSummary] = useState<string>('')
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false)
  const [aiActionItems, setAiActionItems] = useState<{high: string[], medium: string[], low: string[]}>({
    high: [], medium: [], low: []
  })
  const [activeTab, setActiveTab] = useState(initialTab)
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
  const [aiPredictiveAnalysis, setAiPredictiveAnalysis] = useState<{
    confidence: number
    riskLevel: string
    predictedOutcome: string
    estimatedTime: string
    recommendations: string[]
    keyIndicators: Array<{label: string, value: number, color: string}>
    dataSourcesUsed: string[]
  }>({
    confidence: 75,
    riskLevel: 'Medium',
    predictedOutcome: 'Under Analysis',
    estimatedTime: '3-7 days',
    recommendations: [
      'Contact complainant for additional information',
      'Collect and preserve digital evidence',
      'Coordinate with specialized unit',
      'Document all investigative steps',
      'Monitor for related cases'
    ],
    keyIndicators: [
      { label: "Risk Score", value: 50, color: "red" },
      { label: "Evidence Strength", value: 0, color: "blue" },
      { label: "Case Completeness", value: 50, color: "green" }
    ],
    dataSourcesUsed: ['Basic case information']
  })
  const [predictiveAnalysisLoading, setPredictiveAnalysisLoading] = useState(false)

  // Generate initial key details from case data
  const generateInitialKeyDetails = (complaint: any, evidenceCount: number = 0) => {
    const details = {
      financialImpact: '💰 Financial impact to be assessed',
      victimProfile: '👥 Single victim case',
      evidenceAssessment: '📎 Evidence package pending review',
      riskFactors: '🚨 Risk assessment in progress',
      complexity: '⚖️ Complexity analysis required'
    }
    
    // Financial Impact
    if (complaint.estimated_loss && complaint.estimated_loss > 0) {
      const amount = complaint.estimated_loss.toLocaleString('en-PH')
      details.financialImpact = `💰 Loss: ₱${amount}`
    }
    
    // Victim Profile
    const profileParts = []
    if (complaint.incident_location) {
      profileParts.push(complaint.incident_location)
    }
    if (complaint.platform_website) {
      profileParts.push(`${complaint.platform_website} user`)
    }
    if (complaint.suspect_name) {
      profileParts.push('suspect identified')
    }
    if (profileParts.length > 0) {
      details.victimProfile = `👥 ${profileParts.join(', ')}`
    }
    
    // Evidence Assessment
    if (evidenceCount > 0) {
      details.evidenceAssessment = `📎 ${evidenceCount} evidence files available`
    } else if (complaint.platform_website || complaint.technical_info) {
      details.evidenceAssessment = '📎 Digital evidence available'
    }
    
    // Risk Factors
    if (complaint.priority === 'high') {
      details.riskFactors = '🚨 High priority case'
    } else if (complaint.priority === 'medium') {
      details.riskFactors = '🚨 Medium priority case'
    } else {
      details.riskFactors = '🚨 Standard priority case'
    }
    
    // Complexity
    const complexityIndicators = 0 +
      (complaint.technical_info ? 1 : 0) +
      (complaint.system_details ? 1 : 0) +
      (complaint.vulnerability_details ? 1 : 0) +
      (complaint.suspect_details ? 1 : 0) +
      (complaint.impact_assessment ? 1 : 0)
    
    if (complexityIndicators >= 3) {
      details.complexity = '⚖️ Complex investigation required'
    } else if (complexityIndicators > 0) {
      details.complexity = '⚖️ Moderate complexity case'
    } else {
      details.complexity = '⚖️ Standard investigation'
    }
    
    return details
  }

  // Reset all case-specific state to default values
  const resetCaseState = () => {
    // Reset case data
    setStatusHistory([])
    setUpdateHistory([])
    setEvidenceFiles([])
    setComplaintDetails(null)
    setUserProfile(null)
    setSelectedEvidence(null)
    setEvidenceModalOpen(false)
    setStatusModalOpen(false)
    setEditModalOpen(false)
    
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
    setAiPredictiveAnalysis({
      confidence: 75,
      riskLevel: 'Medium',
      predictedOutcome: 'Under Analysis',
      estimatedTime: '3-7 days',
      recommendations: [
        'Contact complainant for additional information',
        'Collect and preserve digital evidence',
        'Coordinate with specialized unit',
        'Document all investigative steps',
        'Monitor for related cases'
      ],
      keyIndicators: [
        { label: "Risk Score", value: 50, color: "red" },
        { label: "Evidence Strength", value: 0, color: "blue" },
        { label: "Case Completeness", value: 50, color: "green" }
      ],
      dataSourcesUsed: ['Basic case information']
    })
    setPredictiveAnalysisLoading(false)
  }

  useEffect(() => {
    if (isOpen && caseData) {
      // Reset all state before fetching new case details
      resetCaseState()
      
      // Set the active tab to the initial tab
      setActiveTab(initialTab)
      
      // Immediately set initial key details based on available data
      const complaint = caseData.complaint || caseData
      const initialDetails = generateInitialKeyDetails(complaint, 0)
      setAiKeyDetails(initialDetails)
      
      fetchCaseDetails()
    }
  }, [isOpen, caseData, initialTab])

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
      
      // Fetch complaint update history only for cases that require more information
      const currentComplaint = complaintDetails || complaint
      if (currentComplaint?.status === "Requires More Information" || currentComplaint?.status === "Requires More Info") {
        console.log('🔍 [CaseDetailModal] Case requires more info - fetching update history for complaint ID:', complaintId)
        console.log('🔍 [CaseDetailModal] Full complaint object:', complaint)
        const updateHistoryData = await ComplaintService.getComplaintUpdateHistory(complaintId)
        console.log('✅ [CaseDetailModal] Update history result:', updateHistoryData?.length || 0, 'records')
        setUpdateHistory(updateHistoryData)
      } else {
        console.log('🔍 [CaseDetailModal] Case status is', currentComplaint?.status, '- skipping update history fetch')
        setUpdateHistory([])
      }
      
      // Fetch evidence files
      const files = await PNPOfficerService.getEvidenceFiles(complaintId)
      setEvidenceFiles(files)
      
      // Set initial key details based on actual data
      const initialDetails = generateInitialKeyDetails(complaintDetails || complaint, files.length)
      setAiKeyDetails(initialDetails)
      
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
    setPredictiveAnalysisLoading(true)
    
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
      
      // Run all AI generations in parallel for better performance
      const [summary, actions, keyDetails, predictiveAnalysis] = await Promise.allSettled([
        AIService.generateCaseSummary(caseDataForAI),
        AIService.generateActionItems(caseDataForAI),
        AIService.generateKeyDetails(caseDataForAI),
        AIService.generatePredictiveAnalysis(caseDataForAI)
      ])
      
      // Set results from successful promises
      if (summary.status === 'fulfilled') {
        setAiSummary(summary.value)
      }
      
      if (actions.status === 'fulfilled') {
        setAiActionItems(actions.value)
      }
      
      if (keyDetails.status === 'fulfilled') {
        setAiKeyDetails(keyDetails.value)
      }
      
      if (predictiveAnalysis.status === 'fulfilled') {
        setAiPredictiveAnalysis(predictiveAnalysis.value)
      } else {
        console.error('Error generating predictive analysis:', predictiveAnalysis.reason)
      }
      
    } catch (error) {
      console.error('Error generating AI summary:', error)
      setAiSummary('AI summary generation failed. Please review case details manually.')
    } finally {
      setAiSummaryLoading(false)
      setPredictiveAnalysisLoading(false)
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

  // Use dynamic AI predictive analysis (no longer hardcoded)

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
      type: 'status-change',
      status: history.status
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
      toast({
        title: "📞 Contact Information Unavailable",
        description: "No contact information is available for this complainant.",
        variant: "destructive"
      })
    }
  }

  // Handle generate report with professional PDF output
  const handleGenerateReport = async () => {
    try {
      const complaint = complaintDetails || caseData.complaint || caseData
      const complaintNumber = complaint.complaint_number || 'Unknown'
      
      console.log('🔄 Generating professional PDF case report for:', complaintNumber)
      
      // Generate and download PDF report
      await generatePDFCaseReport(complaint)
      
      console.log('✅ PDF case report generated successfully')
    } catch (error) {
      console.error('❌ Error generating PDF case report:', error)
      toast({
        title: "❌ Report Generation Failed",
        description: "Failed to generate case report. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Generate professional PDF case report
  const generatePDFCaseReport = async (complaint: any) => {
    try {
      // Get current officer info
      const currentOfficer = await PNPOfficerService.getCurrentOfficerProfile()
      const reportDate = PhilippineTime.formatDate(new Date())

      // Create HTML content for PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>PNP Cybercrime Investigation Report</title>
          <style>
            body {
              font-family: 'Times New Roman', serif;
              line-height: 1.6;
              margin: 0;
              padding: 20mm;
              color: #333;
              background: white;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #0066cc;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .pnp-logo {
              font-size: 24px;
              font-weight: bold;
              color: #0066cc;
              margin-bottom: 10px;
            }
            .report-title {
              font-size: 20px;
              font-weight: bold;
              color: #333;
              margin-bottom: 5px;
            }
            .confidential {
              color: #d32f2f;
              font-weight: bold;
              font-size: 14px;
              margin-top: 10px;
            }
            .section {
              margin-bottom: 25px;
              break-inside: avoid;
            }
            .section-title {
              font-size: 16px;
              font-weight: bold;
              color: #0066cc;
              border-bottom: 2px solid #0066cc;
              padding-bottom: 5px;
              margin-bottom: 15px;
              text-transform: uppercase;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-bottom: 15px;
            }
            .info-item {
              background: #f8f9fa;
              padding: 10px;
              border-left: 4px solid #0066cc;
            }
            .info-label {
              font-weight: bold;
              color: #555;
              font-size: 12px;
              text-transform: uppercase;
            }
            .info-value {
              color: #333;
              margin-top: 2px;
            }
            .description-box {
              background: #f8f9fa;
              border: 1px solid #dee2e6;
              padding: 15px;
              border-radius: 4px;
              margin: 10px 0;
            }
            .evidence-item {
              background: #f0f9ff;
              border: 1px solid #b3d9ff;
              padding: 10px;
              margin: 8px 0;
              border-radius: 4px;
            }
            .status-item {
              background: #f0f9f0;
              border: 1px solid #b3d9b3;
              padding: 10px;
              margin: 8px 0;
              border-radius: 4px;
            }
            .ai-analysis {
              background: #fff3e0;
              border: 1px solid #ffcc80;
              padding: 15px;
              border-radius: 4px;
              margin: 10px 0;
            }
            .priority-high { color: #d32f2f; font-weight: bold; }
            .priority-medium { color: #f57c00; font-weight: bold; }
            .priority-low { color: #388e3c; font-weight: bold; }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #0066cc;
              font-size: 12px;
              color: #666;
            }
            .signature-section {
              margin-top: 30px;
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 50px;
            }
            .signature-box {
              text-align: center;
              border-top: 1px solid #333;
              padding-top: 5px;
              margin-top: 50px;
            }
            @media print {
              body { margin: 0; padding: 15mm; }
              .section { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="pnp-logo">🇵🇭 PHILIPPINE NATIONAL POLICE</div>
            <div class="report-title">CYBERCRIME INVESTIGATION REPORT</div>
            <div class="confidential">⚠️ CONFIDENTIAL - FOR OFFICIAL USE ONLY</div>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Report Generated</div>
              <div class="info-value">${reportDate}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Case Number</div>
              <div class="info-value">${complaint.complaint_number || 'N/A'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Investigating Officer</div>
              <div class="info-value">${currentOfficer?.full_name || 'Unknown'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Unit</div>
              <div class="info-value">${currentOfficer?.unit?.unit_name || 'Unknown'}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">📋 Case Overview</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Crime Type</div>
                <div class="info-value">${complaint.crime_type || 'Not specified'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Status</div>
                <div class="info-value">${complaint.status || 'Unknown'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Priority</div>
                <div class="info-value ${complaint.priority === 'high' ? 'priority-high' : complaint.priority === 'medium' ? 'priority-medium' : 'priority-low'}">${(complaint.priority || 'Medium').toUpperCase()}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Risk Score</div>
                <div class="info-value">${complaint.ai_risk_score || complaint.risk_score || 'N/A'}/100</div>
              </div>
              <div class="info-item">
                <div class="info-label">Incident Date</div>
                <div class="info-value">${complaint.incident_date_time ? PhilippineTime.formatDate(new Date(complaint.incident_date_time)) : 'Not specified'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Location</div>
                <div class="info-value">${complaint.incident_location || 'Not specified'}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">👤 Complainant Information</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Full Name</div>
                <div class="info-value">${complaint.full_name || 'Not provided'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Email</div>
                <div class="info-value">${complaint.email || 'Not provided'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Phone Number</div>
                <div class="info-value">${complaint.phone_number || 'Not provided'}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">📄 Incident Description</div>
            <div class="description-box">
              ${complaint.description || 'No description provided.'}
            </div>
          </div>

          ${complaint.estimated_loss && complaint.estimated_loss > 0 ? `
            <div class="section">
              <div class="section-title">💰 Financial Impact</div>
              <div class="info-item">
                <div class="info-label">Estimated Loss</div>
                <div class="info-value">₱${complaint.estimated_loss.toLocaleString('en-PH')}</div>
              </div>
            </div>
          ` : ''}

          ${complaint.platform_website || complaint.account_reference ? `
            <div class="section">
              <div class="section-title">🌐 Platform Information</div>
              <div class="info-grid">
                ${complaint.platform_website ? `
                  <div class="info-item">
                    <div class="info-label">Platform/Website</div>
                    <div class="info-value">${complaint.platform_website}</div>
                  </div>
                ` : ''}
                ${complaint.account_reference ? `
                  <div class="info-item">
                    <div class="info-label">Account Reference</div>
                    <div class="info-value">${complaint.account_reference}</div>
                  </div>
                ` : ''}
              </div>
            </div>
          ` : ''}

          ${complaint.suspect_name || complaint.suspect_contact || complaint.suspect_details ? `
            <div class="section">
              <div class="section-title">🎯 Suspect Information</div>
              <div class="info-grid">
                ${complaint.suspect_name ? `
                  <div class="info-item">
                    <div class="info-label">Suspect Name</div>
                    <div class="info-value">${complaint.suspect_name}</div>
                  </div>
                ` : ''}
                ${complaint.suspect_relationship ? `
                  <div class="info-item">
                    <div class="info-label">Relationship to Victim</div>
                    <div class="info-value">${complaint.suspect_relationship}</div>
                  </div>
                ` : ''}
                ${complaint.suspect_contact ? `
                  <div class="info-item">
                    <div class="info-label">Suspect Contact</div>
                    <div class="info-value">${complaint.suspect_contact}</div>
                  </div>
                ` : ''}
              </div>
              ${complaint.suspect_details ? `
                <div class="description-box">
                  <strong>Additional Details:</strong><br>
                  ${complaint.suspect_details}
                </div>
              ` : ''}
            </div>
          ` : ''}

          ${evidenceFiles.length > 0 ? `
            <div class="section">
              <div class="section-title">📎 Evidence Files (${evidenceFiles.length})</div>
              ${evidenceFiles.map((file, index) => `
                <div class="evidence-item">
                  <strong>Evidence ${index + 1}:</strong> ${file.file_name}<br>
                  <small>Type: ${file.file_type} | Size: ${(file.file_size / 1024).toFixed(1)} KB | Uploaded: ${PhilippineTime.formatDate(new Date(file.created_at))}</small>
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${statusHistory.length > 0 ? `
            <div class="section">
              <div class="section-title">📈 Status History</div>
              ${statusHistory.map(status => `
                <div class="status-item">
                  <strong>${PhilippineTime.formatDate(new Date(status.timestamp))}</strong> - ${status.status}<br>
                  <small>Updated by: ${status.updated_by}</small>
                  ${status.remarks ? `<br><em>${status.remarks}</em>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${aiSummary ? `
            <div class="section">
              <div class="section-title">🤖 AI Analysis Summary</div>
              <div class="ai-analysis">
                ${aiSummary}
              </div>
            </div>
          ` : ''}

          ${aiActionItems.high.length > 0 || aiActionItems.medium.length > 0 || aiActionItems.low.length > 0 ? `
            <div class="section">
              <div class="section-title">💡 AI Recommendations</div>
              ${aiActionItems.high.length > 0 ? `
                <div><strong class="priority-high">🔴 HIGH PRIORITY ACTIONS:</strong></div>
                <ul>
                  ${aiActionItems.high.map(action => `<li>${action}</li>`).join('')}
                </ul>
              ` : ''}
              ${aiActionItems.medium.length > 0 ? `
                <div><strong class="priority-medium">🟡 MEDIUM PRIORITY ACTIONS:</strong></div>
                <ul>
                  ${aiActionItems.medium.map(action => `<li>${action}</li>`).join('')}
                </ul>
              ` : ''}
              ${aiActionItems.low.length > 0 ? `
                <div><strong class="priority-low">🟢 LOW PRIORITY ACTIONS:</strong></div>
                <ul>
                  ${aiActionItems.low.map(action => `<li>${action}</li>`).join('')}
                </ul>
              ` : ''}
            </div>
          ` : ''}

          <div class="signature-section">
            <div>
              <div class="signature-box">
                <strong>Investigating Officer</strong><br>
                ${currentOfficer?.full_name || 'Unknown'}<br>
                Badge #${currentOfficer?.badge_number || 'N/A'}
              </div>
            </div>
            <div>
              <div class="signature-box">
                <strong>Date</strong><br>
                ${reportDate}
              </div>
            </div>
          </div>

          <div class="footer">
            <div style="text-align: center; margin-bottom: 10px;">
              <strong>⚠️ CONFIDENTIALITY NOTICE</strong>
            </div>
            <p style="text-align: justify; margin: 0;">
              This report contains sensitive information related to an ongoing cybercrime investigation. 
              Distribution is restricted to authorized personnel only. Unauthorized disclosure is prohibited 
              under the Data Privacy Act of 2012 and other relevant Philippine laws.
            </p>
            <div style="text-align: center; margin-top: 15px;">
              <strong>© Philippine National Police - Cybercrime Investigation Division</strong>
            </div>
          </div>
        </body>
        </html>
      `

      // Create PDF using browser print functionality
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(htmlContent)
        printWindow.document.close()
        
        // Wait for content to load then trigger print with error handling
        printWindow.addEventListener('load', () => {
          setTimeout(() => {
            try {
              // Check if window is still available before printing
              if (printWindow && !printWindow.closed) {
                printWindow.print()
                // Close after printing
                printWindow.addEventListener('afterprint', () => {
                  if (printWindow && !printWindow.closed) {
                    printWindow.close()
                  }
                })
                // Fallback close after 10 seconds
                setTimeout(() => {
                  if (printWindow && !printWindow.closed) {
                    printWindow.close()
                  }
                }, 10000)
              }
            } catch (error) {
              console.error('Print error:', error)
              if (printWindow && !printWindow.closed) {
                printWindow.close()
              }
            }
          }, 500)
        })
      }

      // Show success toast notification
      toast({
        title: "📄 Report Generated Successfully!",
        description: `Professional case report for ${complaint.complaint_number || 'N/A'} is ready for download/printing.`,
        variant: "default"
      })

    } catch (error) {
      console.error('❌ Error generating PDF case report:', error)
      throw error
    }
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
        toast({
          title: "❌ Download Link Failed",
          description: "Failed to generate download link. Please try again.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('❌ Error downloading evidence:', error)
      toast({
        title: "❌ Download Error",
        description: "Error downloading evidence file. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Handle view analytics - Open modern analytics modal
  const handleViewAnalytics = () => {
    console.log('🔄 Opening case analytics modal')
    setAnalyticsModalOpen(true)
  }

  // Calculate investigation progress percentage
  const calculateInvestigationProgress = (complaint: any) => {
    let progress = 0
    
    // Base progress from status
    switch (complaint.status) {
      case 'Pending': progress += 10; break
      case 'Under Investigation': progress += 40; break
      case 'Requires More Information': progress += 60; break
      case 'Resolved': progress += 100; break
      case 'Dismissed': progress += 100; break
      default: progress += 5
    }
    
    // Additional progress from evidence
    if (evidenceFiles.length > 0) progress += 20
    if (evidenceFiles.length >= 3) progress += 10
    
    // Additional progress from AI analysis
    if (aiSummary) progress += 10
    
    // Additional progress from suspect information
    if (complaint.suspect_name || complaint.suspect_contact) progress += 10
    
    return Math.min(progress, 100)
  }

  // Generate key metrics for analytics
  const generateKeyMetrics = (complaint: any) => {
    const metrics = []
    
    // Response time metric
    const responseTime = statusHistory.length > 0 ? 'Within 24 hours' : 'Pending initial response'
    metrics.push(`Response Time: ${responseTime}`)
    
    // Evidence collection metric
    metrics.push(`Evidence Collection: ${evidenceFiles.length > 0 ? 'Active' : 'Pending'}`)
    
    // Investigation complexity
    const complexity = (complaint.technical_info || complaint.system_details) ? 'High Complexity' : 
                       (complaint.suspect_details || complaint.platform_website) ? 'Medium Complexity' : 'Standard'
    metrics.push(`Case Complexity: ${complexity}`)
    
    // AI enhancement
    metrics.push(`AI Analysis: ${aiSummary ? 'Complete' : 'In Progress'}`)
    
    // Case priority alignment
    const priorityStatus = complaint.priority === 'high' && statusHistory.length > 0 ? 'Expedited Processing' : 'Standard Processing'
    metrics.push(`Processing Status: ${priorityStatus}`)
    
    return metrics
  }


  // Handle export case data as professional PDF document
  const handleExportCaseData = async () => {
    try {
      const complaint = complaintDetails || caseData.complaint || caseData
      const complaintNumber = complaint.complaint_number || 'Unknown'
      
      console.log('🔄 Exporting case data as professional PDF for:', complaintNumber)
      
      // Generate and download PDF data export
      await generatePDFCaseDataExport(complaint)
      
      console.log('✅ PDF case data export generated successfully')
    } catch (error) {
      console.error('❌ Error exporting case data as PDF:', error)
      toast({
        title: "❌ Data Export Failed",
        description: "Failed to export case data. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Generate professional PDF case data export
  const generatePDFCaseDataExport = async (complaint: any) => {
    try {
      // Get current officer info
      const currentOfficer = await PNPOfficerService.getCurrentOfficerProfile()
      const exportDate = PhilippineTime.formatDate(new Date())

      // Create HTML content for PDF data export
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>PNP Case Data Export</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              line-height: 1.5;
              margin: 0;
              padding: 20mm;
              color: #333;
              background: white;
              font-size: 12px;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #0066cc;
              padding-bottom: 15px;
              margin-bottom: 25px;
            }
            .pnp-logo {
              font-size: 20px;
              font-weight: bold;
              color: #0066cc;
              margin-bottom: 8px;
            }
            .export-title {
              font-size: 18px;
              font-weight: bold;
              color: #333;
              margin-bottom: 5px;
            }
            .data-section {
              margin-bottom: 20px;
              break-inside: avoid;
              page-break-inside: avoid;
            }
            .section-title {
              font-size: 14px;
              font-weight: bold;
              color: #0066cc;
              background: #f0f8ff;
              padding: 8px 12px;
              border-left: 4px solid #0066cc;
              margin-bottom: 10px;
              text-transform: uppercase;
            }
            .data-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 15px;
              font-size: 11px;
            }
            .data-table th {
              background: #f8f9fa;
              border: 1px solid #dee2e6;
              padding: 8px;
              text-align: left;
              font-weight: bold;
              color: #495057;
              width: 30%;
            }
            .data-table td {
              border: 1px solid #dee2e6;
              padding: 8px;
              vertical-align: top;
              word-wrap: break-word;
            }
            .json-data {
              background: #f8f9fa;
              border: 1px solid #dee2e6;
              padding: 10px;
              font-family: 'Courier New', monospace;
              font-size: 10px;
              white-space: pre-wrap;
              max-height: 200px;
              overflow: hidden;
            }
            .metadata {
              background: #e7f3ff;
              border: 1px solid #b3d9ff;
              padding: 10px;
              margin-top: 20px;
              font-size: 10px;
            }
            .priority-high { color: #d32f2f; font-weight: bold; }
            .priority-medium { color: #f57c00; font-weight: bold; }
            .priority-low { color: #388e3c; font-weight: bold; }
            .evidence-list {
              background: #f0f9ff;
              border: 1px solid #b3d9ff;
              padding: 10px;
              margin: 5px 0;
            }
            .status-list {
              background: #f0f9f0;
              border: 1px solid #b3d9b3;
              padding: 10px;
              margin: 5px 0;
            }
            .ai-data {
              background: #fff8e1;
              border: 1px solid #ffcc80;
              padding: 10px;
              margin: 5px 0;
            }
            @media print {
              body { margin: 0; padding: 15mm; }
              .data-section { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="pnp-logo">🇵🇭 PHILIPPINE NATIONAL POLICE</div>
            <div class="export-title">CASE DATA EXPORT</div>
            <div style="color: #666; font-size: 12px; margin-top: 5px;">Comprehensive Database Export</div>
          </div>

          <div class="data-section">
            <div class="section-title">📋 Export Information</div>
            <table class="data-table">
              <tr><th>Export Date</th><td>${exportDate}</td></tr>
              <tr><th>Case Number</th><td>${complaint.complaint_number || 'N/A'}</td></tr>
              <tr><th>Exported By</th><td>${currentOfficer?.full_name || 'Unknown'} (${currentOfficer?.badge_number || 'N/A'})</td></tr>
              <tr><th>Export Version</th><td>1.0</td></tr>
            </table>
          </div>

          <div class="data-section">
            <div class="section-title">📊 Case Information</div>
            <table class="data-table">
              <tr><th>Case ID</th><td>${complaint.id || 'N/A'}</td></tr>
              <tr><th>Complaint Number</th><td>${complaint.complaint_number || 'N/A'}</td></tr>
              <tr><th>Crime Type</th><td>${complaint.crime_type || 'Not specified'}</td></tr>
              <tr><th>Title</th><td>${complaint.title || complaint.crime_type || 'Untitled'}</td></tr>
              <tr><th>Status</th><td>${complaint.status || 'Unknown'}</td></tr>
              <tr><th>Priority</th><td class="${complaint.priority === 'high' ? 'priority-high' : complaint.priority === 'medium' ? 'priority-medium' : 'priority-low'}">${(complaint.priority || 'Medium').toUpperCase()}</td></tr>
              <tr><th>Risk Score</th><td>${complaint.ai_risk_score || complaint.risk_score || 'N/A'}/100</td></tr>
              <tr><th>Created</th><td>${PhilippineTime.formatDate(new Date(complaint.created_at))}</td></tr>
              <tr><th>Last Updated</th><td>${complaint.updated_at ? PhilippineTime.formatDate(new Date(complaint.updated_at)) : 'N/A'}</td></tr>
              <tr><th>Incident Date</th><td>${complaint.incident_date_time ? PhilippineTime.formatDate(new Date(complaint.incident_date_time)) : 'Not specified'}</td></tr>
              <tr><th>Location</th><td>${complaint.incident_location || 'Not specified'}</td></tr>
              <tr><th>Assigned Unit</th><td>${complaint.assigned_unit || 'Not assigned'}</td></tr>
              <tr><th>Assigned Officer</th><td>${complaint.assigned_officer || 'Not assigned'}</td></tr>
            </table>
          </div>

          <div class="data-section">
            <div class="section-title">👤 Complainant Information</div>
            <table class="data-table">
              <tr><th>Full Name</th><td>${complaint.full_name || 'Not provided'}</td></tr>
              <tr><th>Email</th><td>${complaint.email || 'Not provided'}</td></tr>
              <tr><th>Phone</th><td>${complaint.phone_number || 'Not provided'}</td></tr>
              <tr><th>User ID</th><td>${complaint.user_id || 'N/A'}</td></tr>
            </table>
          </div>

          <div class="data-section">
            <div class="section-title">📄 Incident Details</div>
            <table class="data-table">
              <tr><th>Description</th><td style="max-width: 400px;">${complaint.description || 'No description provided'}</td></tr>
              ${complaint.estimated_loss && complaint.estimated_loss > 0 ? `
                <tr><th>Estimated Loss</th><td>₱${complaint.estimated_loss.toLocaleString('en-PH')}</td></tr>
              ` : ''}
              ${complaint.platform_website ? `<tr><th>Platform/Website</th><td>${complaint.platform_website}</td></tr>` : ''}
              ${complaint.account_reference ? `<tr><th>Account Reference</th><td>${complaint.account_reference}</td></tr>` : ''}
            </table>
          </div>

          ${complaint.suspect_name || complaint.suspect_contact || complaint.suspect_details ? `
            <div class="data-section">
              <div class="section-title">🎯 Suspect Information</div>
              <table class="data-table">
                ${complaint.suspect_name ? `<tr><th>Suspect Name</th><td>${complaint.suspect_name}</td></tr>` : ''}
                ${complaint.suspect_relationship ? `<tr><th>Relationship</th><td>${complaint.suspect_relationship}</td></tr>` : ''}
                ${complaint.suspect_contact ? `<tr><th>Contact</th><td>${complaint.suspect_contact}</td></tr>` : ''}
                ${complaint.suspect_details ? `<tr><th>Details</th><td style="max-width: 400px;">${complaint.suspect_details}</td></tr>` : ''}
              </table>
            </div>
          ` : ''}

          ${complaint.technical_info || complaint.system_details || complaint.vulnerability_details ? `
            <div class="data-section">
              <div class="section-title">⚙️ Technical Information</div>
              <table class="data-table">
                ${complaint.system_details ? `<tr><th>System Details</th><td>${complaint.system_details}</td></tr>` : ''}
                ${complaint.technical_info ? `<tr><th>Technical Info</th><td>${complaint.technical_info}</td></tr>` : ''}
                ${complaint.vulnerability_details ? `<tr><th>Vulnerabilities</th><td>${complaint.vulnerability_details}</td></tr>` : ''}
                ${complaint.attack_vector ? `<tr><th>Attack Vector</th><td>${complaint.attack_vector}</td></tr>` : ''}
                ${complaint.security_level ? `<tr><th>Security Level</th><td>${complaint.security_level}</td></tr>` : ''}
                ${complaint.target_info ? `<tr><th>Target Info</th><td>${complaint.target_info}</td></tr>` : ''}
                ${complaint.content_description ? `<tr><th>Content</th><td>${complaint.content_description}</td></tr>` : ''}
                ${complaint.impact_assessment ? `<tr><th>Impact</th><td>${complaint.impact_assessment}</td></tr>` : ''}
              </table>
            </div>
          ` : ''}

          ${evidenceFiles.length > 0 ? `
            <div class="data-section">
              <div class="section-title">📎 Evidence Files (${evidenceFiles.length})</div>
              ${evidenceFiles.map((file, index) => `
                <div class="evidence-list">
                  <strong>Evidence ${index + 1}:</strong> ${file.file_name}<br>
                  <small>
                    ID: ${file.id} | Type: ${file.file_type} | Size: ${(file.file_size / 1024).toFixed(1)} KB | 
                    Uploaded: ${PhilippineTime.formatDate(new Date(file.created_at))} |
                    Path: ${file.file_path || 'N/A'}
                  </small>
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${statusHistory.length > 0 ? `
            <div class="data-section">
              <div class="section-title">📈 Status History (${statusHistory.length})</div>
              ${statusHistory.map((status, index) => `
                <div class="status-list">
                  <strong>${index + 1}. ${PhilippineTime.formatDate(new Date(status.timestamp))}</strong> - ${status.status}<br>
                  <small>
                    Updated by: ${status.updated_by} | User ID: ${status.updated_by_user_id || 'N/A'}
                    ${status.remarks ? ` | Remarks: ${status.remarks}` : ''}
                  </small>
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${aiSummary || aiActionItems.high.length > 0 || aiActionItems.medium.length > 0 || aiActionItems.low.length > 0 ? `
            <div class="data-section">
              <div class="section-title">🤖 AI Analysis Data</div>
              ${aiSummary ? `
                <div class="ai-data">
                  <strong>AI Summary:</strong><br>
                  ${aiSummary}
                </div>
              ` : ''}
              ${aiActionItems.high.length > 0 || aiActionItems.medium.length > 0 || aiActionItems.low.length > 0 ? `
                <div class="ai-data">
                  <strong>AI Action Items:</strong><br>
                  ${aiActionItems.high.length > 0 ? `<span class="priority-high">High: ${aiActionItems.high.join(', ')}</span><br>` : ''}
                  ${aiActionItems.medium.length > 0 ? `<span class="priority-medium">Medium: ${aiActionItems.medium.join(', ')}</span><br>` : ''}
                  ${aiActionItems.low.length > 0 ? `<span class="priority-low">Low: ${aiActionItems.low.join(', ')}</span><br>` : ''}
                </div>
              ` : ''}
            </div>
          ` : ''}

          <div class="data-section">
            <div class="section-title">📊 Raw Database Fields</div>
            <div class="json-data">${JSON.stringify({
              caseInformation: {
                id: complaint.id,
                user_id: complaint.user_id,
                complaint_number: complaint.complaint_number,
                crime_type: complaint.crime_type,
                title: complaint.title,
                description: complaint.description,
                status: complaint.status,
                priority: complaint.priority,
                risk_score: complaint.risk_score,
                ai_priority: complaint.ai_priority,
                ai_risk_score: complaint.ai_risk_score,
                ai_confidence_score: complaint.ai_confidence_score,
                risk_factors: complaint.risk_factors,
                urgency_indicators: complaint.urgency_indicators,
                ai_reasoning: complaint.ai_reasoning,
                last_ai_assessment: complaint.last_ai_assessment,
                assigned_unit: complaint.assigned_unit,
                assigned_officer_id: complaint.assigned_officer_id,
                remarks: complaint.remarks,
                created_at: complaint.created_at,
                updated_at: complaint.updated_at
              },
              complainantData: {
                full_name: complaint.full_name,
                email: complaint.email,
                phone_number: complaint.phone_number
              },
              incidentData: {
                incident_date_time: complaint.incident_date_time,
                incident_location: complaint.incident_location,
                estimated_loss: complaint.estimated_loss
              },
              dynamicFields: {
                platform_website: complaint.platform_website,
                account_reference: complaint.account_reference,
                suspect_name: complaint.suspect_name,
                suspect_relationship: complaint.suspect_relationship,
                suspect_contact: complaint.suspect_contact,
                suspect_details: complaint.suspect_details,
                system_details: complaint.system_details,
                technical_info: complaint.technical_info,
                vulnerability_details: complaint.vulnerability_details,
                attack_vector: complaint.attack_vector,
                security_level: complaint.security_level,
                target_info: complaint.target_info,
                content_description: complaint.content_description,
                impact_assessment: complaint.impact_assessment
              }
            }, null, 2)}</div>
          </div>

          <div class="metadata">
            <strong>Export Metadata:</strong><br>
            Exported on: ${exportDate}<br>
            Exported by: ${currentOfficer?.full_name || 'System'} (Badge #${currentOfficer?.badge_number || 'N/A'})<br>
            Export Type: Comprehensive Case Data Export<br>
            Total Evidence Files: ${evidenceFiles.length}<br>
            Total Status Changes: ${statusHistory.length}<br>
            Data Completeness: ${(() => {
              let fields = 0
              let filled = 0
              const checkField = (field: any) => {
                fields++
                if (field && field !== '' && field !== null && field !== undefined) filled++
              }
              
              checkField(complaint.description)
              checkField(complaint.incident_location)
              checkField(complaint.estimated_loss)
              checkField(complaint.platform_website)
              checkField(complaint.suspect_name)
              checkField(complaint.technical_info)
              
              return Math.round((filled / fields) * 100)
            })()}%<br>
            <br>
            <strong>⚠️ CONFIDENTIAL:</strong> This export contains sensitive case information. 
            Unauthorized distribution is prohibited under Philippine law.
          </div>
        </body>
        </html>
      `

      // Create PDF using browser print functionality
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(htmlContent)
        printWindow.document.close()
        
        // Wait for content to load then trigger print with error handling
        printWindow.addEventListener('load', () => {
          setTimeout(() => {
            try {
              // Check if window is still available before printing
              if (printWindow && !printWindow.closed) {
                printWindow.print()
                // Close after printing
                printWindow.addEventListener('afterprint', () => {
                  if (printWindow && !printWindow.closed) {
                    printWindow.close()
                  }
                })
                // Fallback close after 10 seconds
                setTimeout(() => {
                  if (printWindow && !printWindow.closed) {
                    printWindow.close()
                  }
                }, 10000)
              }
            } catch (error) {
              console.error('Print error:', error)
              if (printWindow && !printWindow.closed) {
                printWindow.close()
              }
            }
          }, 500)
        })
      }

      // Show success toast notification
      toast({
        title: "💾 Data Export Generated Successfully!",
        description: `Professional case data export for ${complaint.complaint_number || 'N/A'} is ready for download/printing.`,
        variant: "default"
      })

    } catch (error) {
      console.error('❌ Error generating PDF case data export:', error)
      throw error
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-4' : 'grid-cols-5'} bg-lawbot-slate-100 dark:bg-lawbot-slate-800 m-4 p-1 rounded-xl`}>
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
              {!isAdmin && (
                <TabsTrigger value="actions" className="data-[state=active]:bg-white dark:data-[state=active]:bg-lawbot-slate-700 data-[state=active]:text-lawbot-red-600 font-medium">
                  ⚡ Actions
                </TabsTrigger>
              )}
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
                          <p className="font-bold text-lawbot-slate-900 dark:text-white">{PhilippineTime.formatDate(new Date(complaint.created_at))}</p>
                        </div>
                        <div className="p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-slate-200 dark:border-lawbot-slate-700">
                          <label className="text-sm font-semibold text-lawbot-slate-600 dark:text-lawbot-slate-400 block mb-1">📍 Location</label>
                          <p className="font-bold text-lawbot-slate-900 dark:text-white">{complaint.incident_location || 'Not specified'}</p>
                        </div>
                        <div className="p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-slate-200 dark:border-lawbot-slate-700">
                          <label className="text-sm font-semibold text-lawbot-slate-600 dark:text-lawbot-slate-400 block mb-1">👮 Assigned Officer</label>
                          <p className="font-bold text-lawbot-slate-900 dark:text-white">{complaint.assigned_officer || 'Unassigned'}</p>
                        </div>
                        {complaint.platform_website && (
                          <div className="p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-slate-200 dark:border-lawbot-slate-700 col-span-2">
                            <label className="text-sm font-semibold text-lawbot-slate-600 dark:text-lawbot-slate-400 block mb-1">📱 Platform Involved</label>
                            <p className="font-bold text-lawbot-slate-900 dark:text-white">{complaint.platform_website}</p>
                          </div>
                        )}
                      </div>
                      <Separator className="bg-lawbot-slate-200 dark:bg-lawbot-slate-700" />
                      <div className="p-4 bg-gradient-to-r from-lawbot-blue-50 to-lawbot-emerald-50 dark:from-lawbot-blue-900/20 dark:to-lawbot-emerald-900/20 rounded-xl border border-lawbot-blue-200 dark:border-lawbot-blue-800">
                        <label className="text-sm font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300 block mb-2">📝 Description</label>
                        <p className="text-lawbot-slate-800 dark:text-lawbot-slate-200 leading-relaxed">
                          {complaint.description || 'No description provided'}
                        </p>
                      </div>

                      {/* Complaint Update Information */}
                      {complaint.status === "Requires More Information" && complaint.last_citizen_update && (
                        <>
                          <Separator className="bg-lawbot-slate-200 dark:bg-lawbot-slate-700" />
                          <div className="p-4 bg-gradient-to-r from-lawbot-emerald-50 to-lawbot-blue-50 dark:from-lawbot-emerald-900/20 dark:to-lawbot-blue-900/20 rounded-xl border border-lawbot-emerald-200 dark:border-lawbot-emerald-800">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-lawbot-emerald-500 rounded-full animate-pulse"></div>
                                <label className="text-sm font-bold text-lawbot-emerald-700 dark:text-lawbot-emerald-300">📢 Case Updated by Citizen</label>
                              </div>
                              <Badge className="bg-lawbot-amber-100 text-lawbot-amber-800 dark:bg-lawbot-amber-900/30 dark:text-lawbot-amber-300 border-lawbot-amber-200 dark:border-lawbot-amber-700">
                                <span className="text-xs font-bold">NEEDS REVIEW</span>
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <div className="text-sm">
                                <span className="font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">Updates:</span>
                                <span className="ml-2 font-bold text-lawbot-slate-900 dark:text-white">
                                  {complaint.total_updates ? `${complaint.total_updates} update${complaint.total_updates > 1 ? 's' : ''}` : '1 update'}
                                </span>
                              </div>
                              <div className="text-sm">
                                <span className="font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">Last Update:</span>
                                <span className="ml-2 font-bold text-lawbot-slate-900 dark:text-white">
                                  {(() => {
                                    const lastUpdate = new Date(complaint.last_citizen_update)
                                    const now = new Date()
                                    const difference = now.getTime() - lastUpdate.getTime()
                                    const days = Math.floor(difference / (1000 * 60 * 60 * 24))
                                    const hours = Math.floor(difference / (1000 * 60 * 60))
                                    const minutes = Math.floor(difference / (1000 * 60))
                                    
                                    if (days > 0) return `${days}d ago`
                                    else if (hours > 0) return `${hours}h ago` 
                                    else if (minutes > 0) return `${minutes}m ago`
                                    else return 'Just now'
                                  })()}
                                </span>
                              </div>
                            </div>
                            
                            {/* Fields Updated Display */}
                            {updateHistory.length > 0 && (
                              <div className="mb-3">
                                <p className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400 mb-2">
                                  📝 Fields Updated:
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {[...new Set(updateHistory.flatMap(update => update.fields_updated || []))].map((field) => (
                                    <Badge key={field} variant="outline" className="text-xs bg-lawbot-emerald-50 text-lawbot-emerald-700 border-lawbot-emerald-200 dark:bg-lawbot-emerald-900/20 dark:text-lawbot-emerald-300 dark:border-lawbot-emerald-800">
                                      {field.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {complaint.update_request_message && (
                              <div className="pt-3 border-t border-lawbot-emerald-200 dark:border-lawbot-emerald-700">
                                <p className="text-sm text-lawbot-slate-700 dark:text-lawbot-slate-300">
                                  <span className="font-medium">Your Request:</span> "{complaint.update_request_message}"
                                </p>
                              </div>
                            )}
                          </div>
                        </>
                      )}

                      {/* Review & Update Status Section */}
                      {complaint.status === "Requires More Information" && complaint.last_citizen_update && (
                        <>
                        </>
                      )}

                      {/* Detailed Update History */}
                      {complaint.status === "Requires More Information" && updateHistory.length > 0 && (
                        <>
                          <Separator className="bg-lawbot-slate-200 dark:bg-lawbot-slate-700" />
                          <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-5 w-5 text-lawbot-blue-500" />
                              <h4 className="font-bold text-lg text-lawbot-slate-900 dark:text-white">📋 Update History</h4>
                              <Badge className="bg-lawbot-blue-100 text-lawbot-blue-800 dark:bg-lawbot-blue-900/30 dark:text-lawbot-blue-300">
                                {updateHistory.length} {updateHistory.length === 1 ? 'Update' : 'Updates'}
                              </Badge>
                            </div>
                            
                            <div className="space-y-3 max-h-80 overflow-y-auto">
                              {updateHistory.map((update, index) => (
                                <div key={update.id || index} className="p-4 bg-gradient-to-r from-lawbot-slate-50 to-lawbot-blue-50 dark:from-lawbot-slate-800 dark:to-lawbot-blue-900/20 rounded-xl border border-lawbot-slate-200 dark:border-lawbot-slate-700">
                                  {/* Update Header */}
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-2">
                                      <div className="w-2 h-2 bg-lawbot-blue-500 rounded-full"></div>
                                      <span className="text-sm font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300">
                                        {update.update_type === 'citizen_update' ? '👤 Citizen Update' : 
                                         update.update_type === 'officer_update' ? '👮 Officer Update' : 
                                         '🤖 System Update'}
                                      </span>
                                    </div>
                                    <div className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400">
                                      {PhilippineTime.formatDatabaseTime(update.created_at)}
                                    </div>
                                  </div>

                                  {/* Updater Info */}
                                  <div className="mb-3">
                                    <p className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400">
                                      <span className="font-medium">Updated by:</span> {update.updater_name || 'System'}
                                    </p>
                                    {update.update_reason && (
                                      <p className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400 mt-1">
                                        <span className="font-medium">Reason:</span> {update.update_reason}
                                      </p>
                                    )}
                                  </div>

                                  {/* Fields Updated */}
                                  {update.fields_updated && update.fields_updated.length > 0 && (
                                    <div className="mb-3">
                                      <p className="text-sm font-medium text-lawbot-slate-700 dark:text-lawbot-slate-300 mb-2">
                                        📝 Fields Updated ({update.fields_updated.length}):
                                      </p>
                                      <div className="flex flex-wrap gap-1">
                                        {update.fields_updated.map((field: string) => (
                                          <Badge key={field} variant="outline" className="text-xs bg-lawbot-emerald-50 text-lawbot-emerald-700 border-lawbot-emerald-200 dark:bg-lawbot-emerald-900/20 dark:text-lawbot-emerald-300 dark:border-lawbot-emerald-800">
                                            {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Field Changes */}
                                  {update.new_values && Object.keys(update.new_values).length > 0 && (
                                    <div className="space-y-2">
                                      <p className="text-sm font-medium text-lawbot-slate-700 dark:text-lawbot-slate-300">
                                        🔄 Changes Made:
                                      </p>
                                      <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {Object.entries(update.new_values).map(([field, newValue]) => {
                                          const oldValue = update.old_values?.[field];
                                          const displayField = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                          
                                          return (
                                            <div key={field} className="p-2 bg-white dark:bg-lawbot-slate-900 rounded-lg border border-lawbot-slate-200 dark:border-lawbot-slate-600">
                                              <p className="text-xs font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400 mb-1">
                                                {displayField}:
                                              </p>
                                              {oldValue && (
                                                <p className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-500 line-through mb-1">
                                                  <span className="bg-lawbot-red-50 dark:bg-lawbot-red-900/20 px-1 rounded">
                                                    {String(oldValue).length > 100 ? String(oldValue).substring(0, 100) + '...' : String(oldValue)}
                                                  </span>
                                                </p>
                                              )}
                                              <p className="text-xs text-lawbot-slate-700 dark:text-lawbot-slate-300">
                                                <span className="bg-lawbot-emerald-50 dark:bg-lawbot-emerald-900/20 px-1 rounded font-medium">
                                                  {String(newValue).length > 100 ? String(newValue).substring(0, 100) + '...' : String(newValue)}
                                                </span>
                                              </p>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}

                                  {/* Update Notes */}
                                  {update.update_notes && (
                                    <div className="mt-3 pt-3 border-t border-lawbot-slate-200 dark:border-lawbot-slate-600">
                                      <p className="text-xs text-lawbot-slate-600 dark:text-lawbot-slate-400">
                                        <span className="font-medium">Notes:</span> {update.update_notes}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
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
                    </CardContent>
                  </Card>
                </div>

                {/* Crime Details Section */}
                <Card className="card-modern bg-gradient-to-br from-lawbot-amber-50/30 to-white dark:from-lawbot-amber-900/10 dark:to-lawbot-slate-800 border-lawbot-amber-200 dark:border-lawbot-amber-800">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-lawbot-amber-500 rounded-lg">
                        <Shield className="h-5 w-5 text-white" />
                      </div>
                      <CardTitle className="text-xl text-lawbot-slate-900 dark:text-white">🔍 Crime Details</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {(() => {
                      // Crime type to category mapping
                      const crimeTypeToCategory = {
                        // 📱 Communication & Social Media Crimes
                        'phishing': 'Communication & Social Media Crimes',
                        'socialEngineering': 'Communication & Social Media Crimes',
                        'spamMessages': 'Communication & Social Media Crimes',
                        'fakeSocialMediaProfiles': 'Communication & Social Media Crimes',
                        'onlineImpersonation': 'Communication & Social Media Crimes',
                        'businessEmailCompromise': 'Communication & Social Media Crimes',
                        'smsFraud': 'Communication & Social Media Crimes',
                        
                        // 💰 Financial & Economic Crimes
                        'onlineBankingFraud': 'Financial & Economic Crimes',
                        'creditCardFraud': 'Financial & Economic Crimes',
                        'investmentScams': 'Financial & Economic Crimes',
                        'cryptocurrencyFraud': 'Financial & Economic Crimes',
                        'onlineShoppingScams': 'Financial & Economic Crimes',
                        'paymentGatewayFraud': 'Financial & Economic Crimes',
                        'insuranceFraud': 'Financial & Economic Crimes',
                        'taxFraud': 'Financial & Economic Crimes',
                        'moneyLaundering': 'Financial & Economic Crimes',
                        
                        // 🔒 Data & Privacy Crimes
                        'identityTheft': 'Data & Privacy Crimes',
                        'dataBreach': 'Data & Privacy Crimes',
                        'unauthorizedSystemAccess': 'Data & Privacy Crimes',
                        'corporateEspionage': 'Data & Privacy Crimes',
                        'governmentDataTheft': 'Data & Privacy Crimes',
                        'medicalRecordsTheft': 'Data & Privacy Crimes',
                        'personalInformationTheft': 'Data & Privacy Crimes',
                        'accountTakeover': 'Data & Privacy Crimes',
                        
                        // 💻 Malware & System Attacks
                        'ransomware': 'Malware & System Attacks',
                        'virusAttacks': 'Malware & System Attacks',
                        'trojanHorses': 'Malware & System Attacks',
                        'spyware': 'Malware & System Attacks',
                        'adware': 'Malware & System Attacks',
                        'worms': 'Malware & System Attacks',
                        'keyloggers': 'Malware & System Attacks',
                        'rootkits': 'Malware & System Attacks',
                        'cryptojacking': 'Malware & System Attacks',
                        'botnetAttacks': 'Malware & System Attacks',
                        
                        // 👥 Harassment & Exploitation
                        'cyberstalking': 'Harassment & Exploitation',
                        'onlineHarassment': 'Harassment & Exploitation',
                        'cyberbullying': 'Harassment & Exploitation',
                        'revengePorn': 'Harassment & Exploitation',
                        'sextortion': 'Harassment & Exploitation',
                        'onlinePredatoryBehavior': 'Harassment & Exploitation',
                        'doxxing': 'Harassment & Exploitation',
                        'hateSpeech': 'Harassment & Exploitation',
                        
                        // 🚫 Content-Related Crimes
                        'childSexualAbuseMaterial': 'Content-Related Crimes',
                        'illegalContentDistribution': 'Content-Related Crimes',
                        'copyrightInfringement': 'Content-Related Crimes',
                        'softwarePiracy': 'Content-Related Crimes',
                        'illegalOnlineGambling': 'Content-Related Crimes',
                        'onlineDrugTrafficking': 'Content-Related Crimes',
                        'illegalWeaponsSales': 'Content-Related Crimes',
                        'humanTrafficking': 'Content-Related Crimes',
                        
                        // ⚡ System Disruption & Sabotage
                        'denialOfServiceAttacks': 'System Disruption & Sabotage',
                        'websiteDefacement': 'System Disruption & Sabotage',
                        'systemSabotage': 'System Disruption & Sabotage',
                        'networkIntrusion': 'System Disruption & Sabotage',
                        'sqlInjection': 'System Disruption & Sabotage',
                        'crossSiteScripting': 'System Disruption & Sabotage',
                        'manInTheMiddleAttacks': 'System Disruption & Sabotage',
                        
                        // 🏛️ Government & Terrorism
                        'cyberterrorism': 'Government & Terrorism',
                        'cyberWarfare': 'Government & Terrorism',
                        'governmentSystemHacking': 'Government & Terrorism',
                        'electionInterference': 'Government & Terrorism',
                        'criticalInfrastructureAttacks': 'Government & Terrorism',
                        'propagandaDistribution': 'Government & Terrorism',
                        'stateSponsoredAttacks': 'Government & Terrorism',
                        
                        // 🔍 Technical Exploitation
                        'zeroDayExploits': 'Technical Exploitation',
                        'vulnerabilityExploitation': 'Technical Exploitation',
                        'backdoorCreation': 'Technical Exploitation',
                        'privilegeEscalation': 'Technical Exploitation',
                        'codeInjection': 'Technical Exploitation',
                        'bufferOverflowAttacks': 'Technical Exploitation',
                        
                        // 🎯 Targeted Attacks
                        'advancedPersistentThreats': 'Targeted Attacks',
                        'spearPhishing': 'Targeted Attacks',
                        'ceoFraud': 'Targeted Attacks',
                        'supplyChainAttacks': 'Targeted Attacks',
                        'insiderThreats': 'Targeted Attacks'
                      };

                      // Category-specific field mappings (exactly as analyzed from Flutter)
                      const categoryFields = {
                        'Communication & Social Media Crimes': [
                          'incident_location', 'platform_website', 'account_reference', 
                          'estimated_loss', 'suspect_name', 'suspect_relationship', 
                          'suspect_contact', 'suspect_details'
                        ],
                        'Financial & Economic Crimes': [
                          'incident_location', 'platform_website', 'account_reference', 
                          'estimated_loss', 'suspect_name', 'suspect_contact'
                        ],
                        'Data & Privacy Crimes': [
                          'incident_location', 'account_reference', 'technical_info', 
                          'vulnerability_details', 'security_level', 'impact_assessment'
                        ],
                        'Malware & System Attacks': [
                          'system_details', 'technical_info', 'attack_vector'
                        ],
                        'Harassment & Exploitation': [
                          'incident_location', 'platform_website', 'suspect_name', 
                          'suspect_relationship', 'suspect_contact', 'suspect_details', 
                          'content_description'
                        ],
                        'Content-Related Crimes': [
                          'incident_location', 'platform_website', 'estimated_loss', 
                          'suspect_name', 'suspect_contact', 'content_description'
                        ],
                        'System Disruption & Sabotage': [
                          'system_details', 'technical_info', 'vulnerability_details', 
                          'attack_vector', 'impact_assessment'
                        ],
                        'Government & Terrorism': [
                          'incident_location', 'security_level', 'target_info', 
                          'impact_assessment'
                        ],
                        'Technical Exploitation': [
                          'system_details', 'technical_info', 'vulnerability_details', 
                          'target_info', 'attack_vector', 'impact_assessment'
                        ],
                        'Targeted Attacks': [
                          'target_info', 'attack_vector', 'impact_assessment'
                        ]
                      };

                      // All available field configurations with full type safety
                      const allFieldConfigs = {
                        'incident_location': { label: '📍 Incident Location', group: 'location', hint: 'Where did this incident occur?' },
                        'platform_website': { label: '📱 Platform/Website', group: 'platform', hint: 'Facebook, Instagram, GCash, etc.' },
                        'account_reference': { label: '🔢 Account/Reference', group: 'financial', hint: 'Transaction ID, account number, reference code' },
                        'estimated_loss': { label: '💰 Financial Loss', group: 'financial', format: 'currency', hint: 'Amount in Philippine Pesos (₱)' },
                        'suspect_name': { label: '🎭 Suspect Name/Alias', group: 'suspect', hint: 'Real name, nickname, or username' },
                        'suspect_relationship': { label: '👥 Suspect Relationship', group: 'suspect', hint: 'How do you know the suspect?' },
                        'suspect_contact': { label: '📞 Suspect Contact', group: 'suspect', hint: 'Phone, email, social media handle' },
                        'suspect_details': { label: '📝 Suspect Details', group: 'suspect', hint: 'Physical description, location, other details' },
                        'system_details': { label: '💻 System/Device Details', group: 'technical', hint: 'Operating system, device type, software affected' },
                        'technical_info': { label: '⚙️ Technical Information', group: 'technical', hint: 'Error messages, file names, network details' },
                        'vulnerability_details': { label: '🔓 Vulnerability Details', group: 'technical', hint: 'How the system was compromised' },
                        'attack_vector': { label: '🎯 Attack Method/Vector', group: 'technical', hint: 'How the attack was executed' },
                        'security_level': { label: '🔒 Security Classification', group: 'security', hint: 'Public, Confidential, Restricted, etc.' },
                        'target_info': { label: '🎯 Target Information', group: 'security', hint: 'Who or what was targeted' },
                        'content_description': { label: '📄 Content Description', group: 'content', hint: 'Description of illegal content (no explicit details)' },
                        'impact_assessment': { label: '📊 Impact Assessment', group: 'impact', hint: 'How has this affected you or your organization?' }
                      } as const;

                      // Determine crime category and get relevant fields
                      const crimeType = complaint.crime_type || '';
                      const category = crimeTypeToCategory[crimeType as keyof typeof crimeTypeToCategory] || '';
                      const relevantFields = categoryFields[category as keyof typeof categoryFields] || [];
                      
                      // DEBUG: Log the complaint data to see what we actually have
                      console.log('🔍 DEBUG - Complaint object:', complaint);
                      console.log('🔍 DEBUG - Crime type:', crimeType);
                      console.log('🔍 DEBUG - Category:', category);
                      console.log('🔍 DEBUG - Relevant fields:', relevantFields);
                      console.log('🔍 DEBUG - Field values:');
                      relevantFields.forEach((fieldKey: string) => {
                        console.log(`  ${fieldKey}:`, complaint[fieldKey]);
                      });
                      
                      // Filter and collect only category-relevant populated fields
                      const categorySpecificFields: Array<{key: string; label: string; group: string; value: string; hint?: string}> = [];
                      
                      relevantFields.forEach((fieldKey: string) => {
                        const fieldConfig = allFieldConfigs[fieldKey as keyof typeof allFieldConfigs];
                        if (!fieldConfig) return;
                        
                        let value = complaint[fieldKey];
                        
                        // Skip if field is not populated
                        if (!value || value === '' || value === null || value === undefined) {
                          return;
                        }
                        
                        // Format values based on type
                        if ('format' in fieldConfig && fieldConfig.format === 'currency' && typeof value === 'number' && value > 0) {
                          value = `₱${value.toLocaleString('en-PH')}`;
                        }
                        
                        // Special formatting for certain fields
                        if (fieldKey === 'security_level' && typeof value === 'string') {
                          value = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
                        }
                        
                        if (fieldKey === 'suspect_relationship' && typeof value === 'string') {
                          value = value.replace(/_/g, ' ').split(' ').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                          ).join(' ');
                        }
                        
                        categorySpecificFields.push({
                          key: fieldKey,
                          label: fieldConfig.label,
                          group: fieldConfig.group,
                          value: value.toString(),
                          hint: 'hint' in fieldConfig ? (fieldConfig as any).hint : undefined
                        });
                      });

                      // Group fields by category for organized display
                      const groupedFields = categorySpecificFields.reduce((groups: Record<string, any[]>, field) => {
                        const group = field.group;
                        if (!groups[group]) {
                          groups[group] = [];
                        }
                        groups[group].push(field);
                        return groups;
                      }, {});

                      // Define group display order and titles
                      const groupOrder = [
                        { key: 'location', title: '📍 Location Information' },
                        { key: 'platform', title: '📱 Platform Details' },
                        { key: 'financial', title: '💰 Financial Information' },
                        { key: 'suspect', title: '🎭 Suspect Information' },
                        { key: 'technical', title: '💻 Technical Details' },
                        { key: 'security', title: '🔒 Security Information' },
                        { key: 'content', title: '📄 Content Details' },
                        { key: 'impact', title: '📊 Impact Assessment' }
                      ];

                      return { categorySpecificFields, groupedFields, groupOrder, category };
                    })().categorySpecificFields.length > 0 ? (
                      <>
                        {/* Display crime category info */}
                        <div className="mb-4 p-3 bg-lawbot-amber-50 dark:bg-lawbot-amber-900/20 rounded-lg border border-lawbot-amber-200 dark:border-lawbot-amber-800">
                          <p className="text-sm font-medium text-lawbot-amber-800 dark:text-lawbot-amber-200">
                            🏷️ <strong>Crime Category:</strong> {(() => {
                              const { category } = (() => {
                                const crimeTypeToCategory = {
                                  'phishing': 'Communication & Social Media Crimes',
                                  'socialEngineering': 'Communication & Social Media Crimes',
                                  'spamMessages': 'Communication & Social Media Crimes',
                                  'fakeSocialMediaProfiles': 'Communication & Social Media Crimes',
                                  'onlineImpersonation': 'Communication & Social Media Crimes',
                                  'businessEmailCompromise': 'Communication & Social Media Crimes',
                                  'smsFraud': 'Communication & Social Media Crimes',
                                  'onlineBankingFraud': 'Financial & Economic Crimes',
                                  'creditCardFraud': 'Financial & Economic Crimes',
                                  'investmentScams': 'Financial & Economic Crimes',
                                  'cryptocurrencyFraud': 'Financial & Economic Crimes',
                                  'onlineShoppingScams': 'Financial & Economic Crimes',
                                  'paymentGatewayFraud': 'Financial & Economic Crimes',
                                  'insuranceFraud': 'Financial & Economic Crimes',
                                  'taxFraud': 'Financial & Economic Crimes',
                                  'moneyLaundering': 'Financial & Economic Crimes',
                                  'identityTheft': 'Data & Privacy Crimes',
                                  'dataBreach': 'Data & Privacy Crimes',
                                  'unauthorizedSystemAccess': 'Data & Privacy Crimes',
                                  'corporateEspionage': 'Data & Privacy Crimes',
                                  'governmentDataTheft': 'Data & Privacy Crimes',
                                  'medicalRecordsTheft': 'Data & Privacy Crimes',
                                  'personalInformationTheft': 'Data & Privacy Crimes',
                                  'accountTakeover': 'Data & Privacy Crimes',
                                  'ransomware': 'Malware & System Attacks',
                                  'virusAttacks': 'Malware & System Attacks',
                                  'trojanHorses': 'Malware & System Attacks',
                                  'spyware': 'Malware & System Attacks',
                                  'adware': 'Malware & System Attacks',
                                  'worms': 'Malware & System Attacks',
                                  'keyloggers': 'Malware & System Attacks',
                                  'rootkits': 'Malware & System Attacks',
                                  'cryptojacking': 'Malware & System Attacks',
                                  'botnetAttacks': 'Malware & System Attacks',
                                  'cyberstalking': 'Harassment & Exploitation',
                                  'onlineHarassment': 'Harassment & Exploitation',
                                  'cyberbullying': 'Harassment & Exploitation',
                                  'revengePorn': 'Harassment & Exploitation',
                                  'sextortion': 'Harassment & Exploitation',
                                  'onlinePredatoryBehavior': 'Harassment & Exploitation',
                                  'doxxing': 'Harassment & Exploitation',
                                  'hateSpeech': 'Harassment & Exploitation',
                                  'childSexualAbuseMaterial': 'Content-Related Crimes',
                                  'illegalContentDistribution': 'Content-Related Crimes',
                                  'copyrightInfringement': 'Content-Related Crimes',
                                  'softwarePiracy': 'Content-Related Crimes',
                                  'illegalOnlineGambling': 'Content-Related Crimes',
                                  'onlineDrugTrafficking': 'Content-Related Crimes',
                                  'illegalWeaponsSales': 'Content-Related Crimes',
                                  'humanTrafficking': 'Content-Related Crimes',
                                  'denialOfServiceAttacks': 'System Disruption & Sabotage',
                                  'websiteDefacement': 'System Disruption & Sabotage',
                                  'systemSabotage': 'System Disruption & Sabotage',
                                  'networkIntrusion': 'System Disruption & Sabotage',
                                  'sqlInjection': 'System Disruption & Sabotage',
                                  'crossSiteScripting': 'System Disruption & Sabotage',
                                  'manInTheMiddleAttacks': 'System Disruption & Sabotage',
                                  'cyberterrorism': 'Government & Terrorism',
                                  'cyberWarfare': 'Government & Terrorism',
                                  'governmentSystemHacking': 'Government & Terrorism',
                                  'electionInterference': 'Government & Terrorism',
                                  'criticalInfrastructureAttacks': 'Government & Terrorism',
                                  'propagandaDistribution': 'Government & Terrorism',
                                  'stateSponsoredAttacks': 'Government & Terrorism',
                                  'zeroDayExploits': 'Technical Exploitation',
                                  'vulnerabilityExploitation': 'Technical Exploitation',
                                  'backdoorCreation': 'Technical Exploitation',
                                  'privilegeEscalation': 'Technical Exploitation',
                                  'codeInjection': 'Technical Exploitation',
                                  'bufferOverflowAttacks': 'Technical Exploitation',
                                  'advancedPersistentThreats': 'Targeted Attacks',
                                  'spearPhishing': 'Targeted Attacks',
                                  'ceoFraud': 'Targeted Attacks',
                                  'supplyChainAttacks': 'Targeted Attacks',
                                  'insiderThreats': 'Targeted Attacks'
                                };
                                const crimeType = complaint.crime_type || '';
                                const category = crimeTypeToCategory[crimeType as keyof typeof crimeTypeToCategory];
                                return { category };
                              })();
                              return category || 'Unknown Category';
                            })()}
                          </p>
                        </div>
                        
                        {/* Display category-specific fields */}
                        {(() => {
                          const { groupedFields, groupOrder } = (() => {
                            // Re-execute for display
                            const crimeTypeToCategory = {
                              'phishing': 'Communication & Social Media Crimes',
                              'socialEngineering': 'Communication & Social Media Crimes',
                              'spamMessages': 'Communication & Social Media Crimes',
                              'fakeSocialMediaProfiles': 'Communication & Social Media Crimes',
                              'onlineImpersonation': 'Communication & Social Media Crimes',
                              'businessEmailCompromise': 'Communication & Social Media Crimes',
                              'smsFraud': 'Communication & Social Media Crimes',
                              'onlineBankingFraud': 'Financial & Economic Crimes',
                              'creditCardFraud': 'Financial & Economic Crimes',
                              'investmentScams': 'Financial & Economic Crimes',
                              'cryptocurrencyFraud': 'Financial & Economic Crimes',
                              'onlineShoppingScams': 'Financial & Economic Crimes',
                              'paymentGatewayFraud': 'Financial & Economic Crimes',
                              'insuranceFraud': 'Financial & Economic Crimes',
                              'taxFraud': 'Financial & Economic Crimes',
                              'moneyLaundering': 'Financial & Economic Crimes',
                              'identityTheft': 'Data & Privacy Crimes',
                              'dataBreach': 'Data & Privacy Crimes',
                              'unauthorizedSystemAccess': 'Data & Privacy Crimes',
                              'corporateEspionage': 'Data & Privacy Crimes',
                              'governmentDataTheft': 'Data & Privacy Crimes',
                              'medicalRecordsTheft': 'Data & Privacy Crimes',
                              'personalInformationTheft': 'Data & Privacy Crimes',
                              'accountTakeover': 'Data & Privacy Crimes',
                              'ransomware': 'Malware & System Attacks',
                              'virusAttacks': 'Malware & System Attacks',
                              'trojanHorses': 'Malware & System Attacks',
                              'spyware': 'Malware & System Attacks',
                              'adware': 'Malware & System Attacks',
                              'worms': 'Malware & System Attacks',
                              'keyloggers': 'Malware & System Attacks',
                              'rootkits': 'Malware & System Attacks',
                              'cryptojacking': 'Malware & System Attacks',
                              'botnetAttacks': 'Malware & System Attacks',
                              'cyberstalking': 'Harassment & Exploitation',
                              'onlineHarassment': 'Harassment & Exploitation',
                              'cyberbullying': 'Harassment & Exploitation',
                              'revengePorn': 'Harassment & Exploitation',
                              'sextortion': 'Harassment & Exploitation',
                              'onlinePredatoryBehavior': 'Harassment & Exploitation',
                              'doxxing': 'Harassment & Exploitation',
                              'hateSpeech': 'Harassment & Exploitation',
                              'childSexualAbuseMaterial': 'Content-Related Crimes',
                              'illegalContentDistribution': 'Content-Related Crimes',
                              'copyrightInfringement': 'Content-Related Crimes',
                              'softwarePiracy': 'Content-Related Crimes',
                              'illegalOnlineGambling': 'Content-Related Crimes',
                              'onlineDrugTrafficking': 'Content-Related Crimes',
                              'illegalWeaponsSales': 'Content-Related Crimes',
                              'humanTrafficking': 'Content-Related Crimes',
                              'denialOfServiceAttacks': 'System Disruption & Sabotage',
                              'websiteDefacement': 'System Disruption & Sabotage',
                              'systemSabotage': 'System Disruption & Sabotage',
                              'networkIntrusion': 'System Disruption & Sabotage',
                              'sqlInjection': 'System Disruption & Sabotage',
                              'crossSiteScripting': 'System Disruption & Sabotage',
                              'manInTheMiddleAttacks': 'System Disruption & Sabotage',
                              'cyberterrorism': 'Government & Terrorism',
                              'cyberWarfare': 'Government & Terrorism',
                              'governmentSystemHacking': 'Government & Terrorism',
                              'electionInterference': 'Government & Terrorism',
                              'criticalInfrastructureAttacks': 'Government & Terrorism',
                              'propagandaDistribution': 'Government & Terrorism',
                              'stateSponsoredAttacks': 'Government & Terrorism',
                              'zeroDayExploits': 'Technical Exploitation',
                              'vulnerabilityExploitation': 'Technical Exploitation',
                              'backdoorCreation': 'Technical Exploitation',
                              'privilegeEscalation': 'Technical Exploitation',
                              'codeInjection': 'Technical Exploitation',
                              'bufferOverflowAttacks': 'Technical Exploitation',
                              'advancedPersistentThreats': 'Targeted Attacks',
                              'spearPhishing': 'Targeted Attacks',
                              'ceoFraud': 'Targeted Attacks',
                              'supplyChainAttacks': 'Targeted Attacks',
                              'insiderThreats': 'Targeted Attacks'
                            };

                            const categoryFields = {
                              'Communication & Social Media Crimes': [
                                'incident_location', 'platform_website', 'account_reference', 
                                'estimated_loss', 'suspect_name', 'suspect_relationship', 
                                'suspect_contact', 'suspect_details'
                              ],
                              'Financial & Economic Crimes': [
                                'incident_location', 'platform_website', 'account_reference', 
                                'estimated_loss', 'suspect_name', 'suspect_contact'
                              ],
                              'Data & Privacy Crimes': [
                                'incident_location', 'account_reference', 'technical_info', 
                                'vulnerability_details', 'security_level', 'impact_assessment'
                              ],
                              'Malware & System Attacks': [
                                'system_details', 'technical_info', 'attack_vector'
                              ],
                              'Harassment & Exploitation': [
                                'incident_location', 'platform_website', 'suspect_name', 
                                'suspect_relationship', 'suspect_contact', 'suspect_details', 
                                'content_description'
                              ],
                              'Content-Related Crimes': [
                                'incident_location', 'platform_website', 'estimated_loss', 
                                'suspect_name', 'suspect_contact', 'content_description'
                              ],
                              'System Disruption & Sabotage': [
                                'system_details', 'technical_info', 'vulnerability_details', 
                                'attack_vector', 'impact_assessment'
                              ],
                              'Government & Terrorism': [
                                'incident_location', 'security_level', 'target_info', 
                                'impact_assessment'
                              ],
                              'Technical Exploitation': [
                                'system_details', 'technical_info', 'vulnerability_details', 
                                'target_info', 'attack_vector', 'impact_assessment'
                              ],
                              'Targeted Attacks': [
                                'target_info', 'attack_vector', 'impact_assessment'
                              ]
                            };

                            const allFieldConfigs = {
                              'incident_location': { label: '📍 Incident Location', group: 'location' },
                              'platform_website': { label: '📱 Platform/Website', group: 'platform' },
                              'account_reference': { label: '🔢 Account/Reference', group: 'financial' },
                              'estimated_loss': { label: '💰 Financial Loss', group: 'financial', format: 'currency' },
                              'suspect_name': { label: '🎭 Suspect Name', group: 'suspect' },
                              'suspect_relationship': { label: '👥 Suspect Relationship', group: 'suspect' },
                              'suspect_contact': { label: '📞 Suspect Contact', group: 'suspect' },
                              'suspect_details': { label: '📝 Suspect Details', group: 'suspect' },
                              'system_details': { label: '💻 System Details', group: 'technical' },
                              'technical_info': { label: '⚙️ Technical Information', group: 'technical' },
                              'vulnerability_details': { label: '🔓 Vulnerability Details', group: 'technical' },
                              'attack_vector': { label: '🎯 Attack Method/Vector', group: 'technical' },
                              'security_level': { label: '🔒 Security Level', group: 'security' },
                              'target_info': { label: '🎯 Target Information', group: 'security' },
                              'content_description': { label: '📄 Content Description', group: 'content' },
                              'impact_assessment': { label: '📊 Impact Assessment', group: 'impact' }
                            };

                            const crimeType = complaint.crime_type || '';
                            const category = crimeTypeToCategory[crimeType as keyof typeof crimeTypeToCategory] || '';
                            const relevantFields = categoryFields[category as keyof typeof categoryFields] || [];
                            
                            const categorySpecificFields: Array<{key: string; label: string; group: string; value: string; hint?: string}> = [];
                            relevantFields.forEach((fieldKey: string) => {
                              const fieldConfig = allFieldConfigs[fieldKey as keyof typeof allFieldConfigs];
                              if (!fieldConfig) return;
                              
                              let value = complaint[fieldKey];
                              
                              if (!value || value === '' || value === null || value === undefined) {
                                return;
                              }
                              
                              // Format values based on type
                              if ('format' in fieldConfig && fieldConfig.format === 'currency' && typeof value === 'number' && value > 0) {
                                value = `₱${value.toLocaleString('en-PH')}`;
                              }
                              
                              // Special formatting for certain fields
                              if (fieldKey === 'security_level' && typeof value === 'string') {
                                value = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
                              }
                              
                              if (fieldKey === 'suspect_relationship' && typeof value === 'string') {
                                value = value.replace(/_/g, ' ').split(' ').map(word => 
                                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                                ).join(' ');
                              }
                              
                              categorySpecificFields.push({
                                key: fieldKey,
                                label: fieldConfig.label,
                                group: fieldConfig.group,
                                value: value.toString(),
                                hint: 'hint' in fieldConfig ? (fieldConfig as any).hint : undefined
                              });
                            });

                            const groupedFields = categorySpecificFields.reduce((groups: Record<string, any[]>, field) => {
                              const group = field.group;
                              if (!groups[group]) {
                                groups[group] = [];
                              }
                              groups[group].push(field);
                              return groups;
                            }, {});

                            const groupOrder = [
                              { key: 'location', title: '📍 Location Information' },
                              { key: 'platform', title: '📱 Platform Details' },
                              { key: 'financial', title: '💰 Financial Information' },
                              { key: 'suspect', title: '🎭 Suspect Information' },
                              { key: 'technical', title: '💻 Technical Details' },
                              { key: 'security', title: '🔒 Security Information' },
                              { key: 'content', title: '📄 Content Details' },
                              { key: 'impact', title: '📊 Impact Assessment' }
                            ];

                            return { groupedFields, groupOrder };
                          })();
                          
                          return groupOrder.map(group => {
                            const fields = groupedFields[group.key];
                            if (!fields || fields.length === 0) return null;
                            
                            return (
                              <div key={group.key} className="space-y-3">
                                <div className="flex items-center space-x-2 mb-3">
                                  <div className="h-px bg-lawbot-amber-300 dark:bg-lawbot-amber-700 flex-1"></div>
                                  <h4 className="text-sm font-bold text-lawbot-amber-700 dark:text-lawbot-amber-300 px-3 py-1 bg-lawbot-amber-100 dark:bg-lawbot-amber-900/30 rounded-full">
                                    {group.title}
                                  </h4>
                                  <div className="h-px bg-lawbot-amber-300 dark:bg-lawbot-amber-700 flex-1"></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {fields.map((field: {key: string; label: string; value: string; hint?: string}, index: number) => (
                                    <div key={index} className="p-4 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-slate-200 dark:border-lawbot-slate-700 hover:border-lawbot-blue-300 dark:hover:border-lawbot-blue-700 transition-colors">
                                      <label className="text-sm font-semibold text-lawbot-slate-600 dark:text-lawbot-slate-400 block mb-1">
                                        {field.label}
                                      </label>
                                      {field.hint && (
                                        <p className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-500 mb-2 italic">
                                          {field.hint}
                                        </p>
                                      )}
                                      <p className="text-lawbot-slate-900 dark:text-white font-medium break-words">
                                        {field.value}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          }).filter(Boolean);
                        })()}
                      </>
                    ) : (
                      <div className="p-4 bg-lawbot-slate-50 dark:bg-lawbot-slate-700/50 rounded-lg border border-lawbot-slate-200 dark:border-lawbot-slate-600 text-center">
                        <p className="text-lawbot-slate-600 dark:text-lawbot-slate-400">
                          No additional crime details provided for this {(() => {
                            const crimeTypeToCategory = {
                              'phishing': 'Communication & Social Media Crimes',
                              'socialEngineering': 'Communication & Social Media Crimes',
                              'onlineBankingFraud': 'Financial & Economic Crimes',
                              'identityTheft': 'Data & Privacy Crimes',
                              'ransomware': 'Malware & System Attacks',
                              'cyberstalking': 'Harassment & Exploitation',
                              'childSexualAbuseMaterial': 'Content-Related Crimes',
                              'denialOfServiceAttacks': 'System Disruption & Sabotage',
                              'cyberterrorism': 'Government & Terrorism',
                              'zeroDayExploits': 'Technical Exploitation',
                              'advancedPersistentThreats': 'Targeted Attacks'
                            };
                            const category = crimeTypeToCategory[complaint.crime_type as keyof typeof crimeTypeToCategory] || 'cybercrime';
                            return category.toLowerCase();
                          })()} case.
                        </p>
                      </div>
                    )}
                </CardContent>
                </Card>

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
                            🎯 Confidence: {aiPredictiveAnalysis.confidence}%
                          </Badge>
                        </CardTitle>
                        <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400 mt-1">
                          Advanced AI analysis for optimal case resolution strategy
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    {predictiveAnalysisLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-lawbot-blue-600 mr-3" />
                        <span className="text-lg text-lawbot-blue-600 dark:text-lawbot-blue-400">Generating predictive analysis...</span>
                      </div>
                    ) : (
                      <>
                    <div className="grid md:grid-cols-3 gap-6">
                      {aiPredictiveAnalysis.keyIndicators.map((indicator, index) => (
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
                              🚨 {aiPredictiveAnalysis.riskLevel}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg">
                            <span className="font-medium text-lawbot-slate-700 dark:text-lawbot-slate-300">Predicted Outcome:</span>
                            <span className="font-bold text-lawbot-emerald-600 dark:text-lawbot-emerald-400">✅ {aiPredictiveAnalysis.predictedOutcome}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg">
                            <span className="font-medium text-lawbot-slate-700 dark:text-lawbot-slate-300">Estimated Resolution:</span>
                            <span className="font-bold text-lawbot-blue-600 dark:text-lawbot-blue-400">⏱️ {aiPredictiveAnalysis.estimatedTime}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-5 bg-gradient-to-r from-lawbot-emerald-50 to-lawbot-emerald-100/50 dark:from-lawbot-emerald-900/20 dark:to-lawbot-emerald-800/10 rounded-xl border border-lawbot-emerald-200 dark:border-lawbot-emerald-800">
                        <h4 className="font-semibold mb-4 flex items-center space-x-2 text-lawbot-emerald-700 dark:text-lawbot-emerald-300">
                          <div className="p-1 bg-lawbot-emerald-500 rounded-full">
                            <Zap className="h-3 w-3 text-white" />
                          </div>
                          <span>⚡ AI Recommendations</span>
                        </h4>
                        <ul className="space-y-3">
                          {aiPredictiveAnalysis.recommendations.map((rec: string, index: number) => (
                            <li key={index} className="flex items-start space-x-3 p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-emerald-200 dark:border-lawbot-emerald-800">
                              <CheckCircle className="h-4 w-4 text-lawbot-emerald-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm font-medium text-lawbot-slate-700 dark:text-lawbot-slate-300">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <Separator className="bg-lawbot-slate-200 dark:bg-lawbot-slate-700" />

                    <div className="p-5 bg-gradient-to-r from-lawbot-purple-50 to-lawbot-purple-100/50 dark:from-lawbot-purple-900/20 dark:to-lawbot-purple-800/10 rounded-xl border border-lawbot-purple-200 dark:border-lawbot-purple-800">
                      <h4 className="font-semibold mb-4 flex items-center space-x-2 text-lawbot-purple-700 dark:text-lawbot-purple-300">
                        <div className="p-1 bg-lawbot-purple-500 rounded-full">
                          <FileText className="h-3 w-3 text-white" />
                        </div>
                        <span>📊 Analysis Data Sources</span>
                      </h4>
                      <div className="space-y-2">
                        <p className="text-sm text-lawbot-purple-700 dark:text-lawbot-purple-300 font-medium mb-3">
                          This predictive analysis is based on:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {aiPredictiveAnalysis.dataSourcesUsed.map((source, index) => (
                            <div key={index} className="flex items-center space-x-2 p-2 bg-white dark:bg-lawbot-slate-800 rounded-lg">
                              <CheckCircle className="h-3 w-3 text-lawbot-purple-500 flex-shrink-0" />
                              <span className="text-xs font-medium text-lawbot-slate-700 dark:text-lawbot-slate-300">{source}</span>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-lawbot-purple-600 dark:text-lawbot-purple-400 mt-3 italic">
                          * Analysis accuracy improves with more complete data. Fields analyzed include all populated dynamic fields specific to {complaint.crime_type}.
                        </p>
                      </div>
                    </div>
                    </>
                    )}
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
                              event.type === "status-change" && "status" in event
                                ? event.status === "Resolved"
                                  ? "bg-gradient-to-r from-lawbot-emerald-100 to-lawbot-emerald-200 text-lawbot-emerald-600 dark:from-lawbot-emerald-900 dark:to-lawbot-emerald-800 dark:text-lawbot-emerald-400"
                                  : event.status === "Dismissed"
                                    ? "bg-gradient-to-r from-lawbot-slate-100 to-lawbot-slate-200 text-lawbot-slate-600 dark:from-lawbot-slate-700 dark:to-lawbot-slate-800 dark:text-lawbot-slate-400"
                                    : event.status === "Under Investigation"
                                      ? "bg-gradient-to-r from-lawbot-blue-100 to-lawbot-blue-200 text-lawbot-blue-600 dark:from-lawbot-blue-900 dark:to-lawbot-blue-800 dark:text-lawbot-blue-400"
                                      : event.status === "Requires More Information" || event.status === "Requires More Info"
                                        ? "bg-gradient-to-r from-lawbot-purple-100 to-lawbot-purple-200 text-lawbot-purple-600 dark:from-lawbot-purple-900 dark:to-lawbot-purple-800 dark:text-lawbot-purple-400"
                                        : "bg-gradient-to-r from-lawbot-amber-100 to-lawbot-amber-200 text-lawbot-amber-600 dark:from-lawbot-amber-900 dark:to-lawbot-amber-800 dark:text-lawbot-amber-400"
                                : event.type === "report"
                                  ? "bg-gradient-to-r from-lawbot-blue-100 to-lawbot-blue-200 text-lawbot-blue-600 dark:from-lawbot-blue-900 dark:to-lawbot-blue-800 dark:text-lawbot-blue-400"
                                  : event.type === "ai"
                                    ? "bg-gradient-to-r from-lawbot-purple-100 to-lawbot-purple-200 text-lawbot-purple-600 dark:from-lawbot-purple-900 dark:to-lawbot-purple-800 dark:text-lawbot-purple-400"
                                    : event.type === "assignment"
                                      ? "bg-gradient-to-r from-lawbot-emerald-100 to-lawbot-emerald-200 text-lawbot-emerald-600 dark:from-lawbot-emerald-900 dark:to-lawbot-emerald-800 dark:text-lawbot-emerald-400"
                                      : "bg-gradient-to-r from-lawbot-slate-100 to-lawbot-slate-200 text-lawbot-slate-600 dark:from-lawbot-slate-700 dark:to-lawbot-slate-800 dark:text-lawbot-slate-400"
                            }`}
                          >
                            <div className="h-3 w-3 rounded-full bg-current"></div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              {event.type === "status-change" && "status" in event && (
                                <span>
                                  {event.status === "Resolved" ? "✅" :
                                   event.status === "Dismissed" ? "❌" :
                                   event.status === "Under Investigation" ? "🔍" :
                                   event.status === "Requires More Information" || event.status === "Requires More Info" ? "❓" :
                                   "📋"}
                                </span>
                              )}
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
                              <p className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400 font-medium">{PhilippineTime.formatDateTime(new Date(event.date))}</p>
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

              {!isAdmin && (
                <TabsContent value="actions" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="card-modern bg-gradient-to-br from-lawbot-emerald-50/30 to-white dark:from-lawbot-emerald-900/10 dark:to-lawbot-slate-800 border-lawbot-emerald-200 dark:border-lawbot-emerald-800">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-lawbot-emerald-500 rounded-lg">
                          <Zap className="h-5 w-5 text-white" />
                        </div>
                        <CardTitle className="text-xl text-lawbot-slate-900 dark:text-white">⚡ Case Management</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button className="w-full justify-start btn-modern border-lawbot-emerald-300 text-lawbot-emerald-600 hover:bg-lawbot-emerald-50 dark:border-lawbot-emerald-600 dark:text-lawbot-emerald-400 dark:hover:bg-lawbot-emerald-900/20" variant="outline" onClick={() => setStatusModalOpen(true)}>
                        <div className="p-1 bg-lawbot-emerald-500 rounded-full mr-3">
                          <FileText className="h-3 w-3 text-white" />
                        </div>
                        📝 Update Case Status
                      </Button>
                      {complaint.status === "Requires More Information" && (
                        <Button className="w-full justify-start btn-modern border-lawbot-orange-300 text-lawbot-orange-600 hover:bg-lawbot-orange-50 dark:border-lawbot-orange-600 dark:text-lawbot-orange-400 dark:hover:bg-lawbot-orange-900/20" variant="outline" onClick={() => setEditModalOpen(true)}>
                          <div className="p-1 bg-lawbot-orange-500 rounded-full mr-3">
                            <FileText className="h-3 w-3 text-white" />
                          </div>
                          ✏️ Edit Information
                        </Button>
                      )}
                      <Button className="w-full justify-start btn-modern border-lawbot-purple-300 text-lawbot-purple-600 hover:bg-lawbot-purple-50 dark:border-lawbot-purple-600 dark:text-lawbot-purple-400 dark:hover:bg-lawbot-purple-900/20" variant="outline" onClick={handleExportCaseData}>
                        <div className="p-1 bg-lawbot-purple-500 rounded-full mr-3">
                          <Download className="h-3 w-3 text-white" />
                        </div>
                        💾 Export Case Data
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="card-modern bg-gradient-to-br from-lawbot-blue-50/30 to-white dark:from-lawbot-blue-900/10 dark:to-lawbot-slate-800 border-lawbot-blue-200 dark:border-lawbot-blue-800">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-lawbot-blue-500 rounded-lg">
                          <TrendingUp className="h-5 w-5 text-white" />
                        </div>
                        <CardTitle className="text-xl text-lawbot-slate-900 dark:text-white">📊 Analysis & Reporting</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button className="w-full justify-start btn-modern border-lawbot-emerald-300 text-lawbot-emerald-600 hover:bg-lawbot-emerald-50 dark:border-lawbot-emerald-600 dark:text-lawbot-emerald-400 dark:hover:bg-lawbot-emerald-900/20" variant="outline" onClick={handleGenerateReport}>
                        <div className="p-1 bg-lawbot-emerald-500 rounded-full mr-3">
                          <FileText className="h-3 w-3 text-white" />
                        </div>
                        📄 Generate Case Report
                      </Button>
                      <Button className="w-full justify-start btn-modern border-lawbot-blue-300 text-lawbot-blue-600 hover:bg-lawbot-blue-50 dark:border-lawbot-blue-600 dark:text-lawbot-blue-400 dark:hover:bg-lawbot-blue-900/20" variant="outline" onClick={handleViewAnalytics}>
                        <div className="p-1 bg-lawbot-blue-500 rounded-full mr-3">
                          <TrendingUp className="h-3 w-3 text-white" />
                        </div>
                        📈 View Case Analytics
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              )}
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
        mode="single-case"
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
        onStatusUpdate={(newStatus: string, remarks: string) => {
          // Handle the status update callback
          console.log('Status updated:', newStatus, remarks)
          fetchCaseDetails()
        }}
      />
      
      {/* Edit Complaint Modal */}
      <EditComplaintModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false)
        }}
        caseData={{ complaintDetails: complaint }}
        onUpdate={() => {
          // Refresh case details after edit
          fetchCaseDetails()
        }}
      />

      {/* Case Analytics Modal */}
      <CaseAnalyticsModal
        isOpen={analyticsModalOpen}
        onClose={() => setAnalyticsModalOpen(false)}
        caseData={complaint}
        statusHistory={statusHistory}
        evidenceFiles={evidenceFiles}
        aiSummary={aiSummary}
        aiActionItems={aiActionItems}
        aiKeyDetails={aiKeyDetails}
        aiPredictiveAnalysis={aiPredictiveAnalysis}
      />
    </div>
  )
}