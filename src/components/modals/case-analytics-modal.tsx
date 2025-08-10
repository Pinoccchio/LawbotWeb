"use client"

import React, { useState, useEffect } from "react"
import { X, BarChart3, Target, ArrowUpRight, PieChart, TrendingUp, Activity, Clock, DollarSign, Shield, Brain, FileText, AlertTriangle, CheckCircle, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

interface CaseAnalyticsModalProps {
  isOpen: boolean
  onClose: () => void
  caseData: any
  statusHistory: any[]
  evidenceFiles: any[]
  aiSummary: string
  aiActionItems: any
  aiKeyDetails: any
  aiPredictiveAnalysis: any
}

export function CaseAnalyticsModal({ 
  isOpen, 
  onClose, 
  caseData, 
  statusHistory, 
  evidenceFiles, 
  aiSummary, 
  aiActionItems, 
  aiKeyDetails,
  aiPredictiveAnalysis 
}: CaseAnalyticsModalProps) {
  const [activeTab, setActiveTab] = useState("overview")
  
  const complaint = caseData.complaint || caseData
  
  
  // Calculate analytics metrics
  const caseAge = Math.ceil((new Date().getTime() - new Date(complaint.created_at).getTime()) / (1000 * 3600 * 24))
  const investigationProgress = calculateInvestigationProgress()
  const complexityScore = calculateComplexityScore()
  const riskLevel = complaint.ai_risk_score || complaint.risk_score || 50
  // Calculate actual response time from database data
  const responseTime = (() => {
    if (statusHistory.length === 0) return "Pending"
    
    const caseCreated = new Date(complaint.created_at)
    const firstStatusChange = statusHistory
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())[0]
    
    if (!firstStatusChange) return "No updates"
    
    const firstUpdate = new Date(firstStatusChange.timestamp)
    const hoursDiff = Math.abs(firstUpdate.getTime() - caseCreated.getTime()) / (1000 * 60 * 60)
    
    if (hoursDiff < 1) return "< 1 hour"
    if (hoursDiff < 24) return `${Math.floor(hoursDiff)} hours`
    if (hoursDiff < 168) return `${Math.floor(hoursDiff / 24)} days`
    return `${Math.floor(hoursDiff / 168)} weeks`
  })()
  
  function calculateInvestigationProgress(): number {
    let progress = 0
    
    // Base progress from status
    switch (complaint.status) {
      case 'Pending': progress += 15; break
      case 'Under Investigation': progress += 45; break
      case 'Requires More Information': progress += 65; break
      case 'Resolved': progress += 100; break
      case 'Dismissed': progress += 100; break
      default: progress += 10
    }
    
    // Additional progress factors
    if (evidenceFiles.length > 0) progress += Math.min(evidenceFiles.length * 5, 20)
    if (aiSummary) progress += 10
    if (complaint.suspect_name || complaint.suspect_contact) progress += 15
    if (statusHistory.length > 1) progress += 10
    
    return Math.min(progress, 100)
  }

  function calculateComplexityScore(): number {
    let complexity = 20 // Base complexity
    
    if (complaint.technical_info) complexity += 20
    if (complaint.system_details) complexity += 15
    if (complaint.vulnerability_details) complexity += 20
    if (complaint.suspect_details) complexity += 10
    if (complaint.estimated_loss && complaint.estimated_loss > 100000) complexity += 15
    if (evidenceFiles.length > 3) complexity += 10
    if (complaint.platform_website) complexity += 5
    
    return Math.min(complexity, 100)
  }

  const getProgressColor = (value: number): string => {
    if (value >= 80) return "bg-lawbot-emerald-500"
    if (value >= 60) return "bg-lawbot-blue-500" 
    if (value >= 40) return "bg-lawbot-amber-500"
    return "bg-lawbot-red-500"
  }

  const getRiskColor = (value: number): string => {
    if (value >= 80) return "bg-lawbot-red-500"
    if (value >= 60) return "bg-lawbot-amber-500"
    if (value >= 40) return "bg-lawbot-blue-500"
    return "bg-lawbot-emerald-500"
  }

  // Dynamic tab calculation functions
  const shouldShowFinancialTab = (): boolean => {
    // Show if it's a financial crime category
    const financialCategories = [
      'Financial & Economic Crimes',
      'Communication & Social Media Crimes' // Often includes scams
    ]
    
    const crimeCategory = getCrimeCategory(complaint.crime_type)
    if (financialCategories.includes(crimeCategory)) return true
    
    // Show if there's financial loss or financial-related fields
    if (complaint.estimated_loss && complaint.estimated_loss > 0) return true
    if (complaint.account_reference) return true
    if (complaint.platform_website && isPaymentPlatform(complaint.platform_website)) return true
    
    return false
  }

  const shouldShowTechnicalTab = (): boolean => {
    const technicalCategories = [
      'Malware & System Attacks',
      'Technical Exploitation', 
      'System Disruption & Sabotage',
      'Data & Privacy Crimes'
    ]
    
    const crimeCategory = getCrimeCategory(complaint.crime_type)
    if (technicalCategories.includes(crimeCategory)) return true
    
    // Show if technical fields are populated
    if (complaint.system_details) return true
    if (complaint.technical_info) return true
    if (complaint.vulnerability_details) return true
    if (complaint.attack_vector) return true
    
    return false
  }

  const shouldShowSocialTab = (): boolean => {
    const socialCategories = [
      'Harassment & Exploitation',
      'Communication & Social Media Crimes',
      'Content-Related Crimes'
    ]
    
    const crimeCategory = getCrimeCategory(complaint.crime_type)
    if (socialCategories.includes(crimeCategory)) return true
    
    // Show if social/personal fields are populated
    if (complaint.suspect_name) return true
    if (complaint.suspect_relationship) return true
    if (complaint.suspect_contact) return true
    if (complaint.suspect_details) return true
    
    return false
  }

  const shouldShowSecurityTab = (): boolean => {
    const securityCategories = [
      'Government & Terrorism',
      'Data & Privacy Crimes'
    ]
    
    const crimeCategory = getCrimeCategory(complaint.crime_type)
    if (securityCategories.includes(crimeCategory)) return true
    
    // Show if security fields are populated
    if (complaint.security_level) return true
    if (complaint.target_info) return true
    
    return false
  }

  const shouldShowContentTab = (): boolean => {
    const contentCategories = [
      'Content-Related Crimes'
    ]
    
    const crimeCategory = getCrimeCategory(complaint.crime_type)
    if (contentCategories.includes(crimeCategory)) return true
    
    // Show if content fields are populated
    if (complaint.content_description) return true
    
    return false
  }

  // Helper functions
  const getCrimeCategory = (crimeType: string): string => {
    // Map crime types to categories based on Flutter model
    const categoryMap: { [key: string]: string } = {
      // Communication & Social Media Crimes
      'Phishing': 'Communication & Social Media Crimes',
      'Social Engineering': 'Communication & Social Media Crimes',
      'Spam Messages': 'Communication & Social Media Crimes',
      'Fake Social Media Profiles': 'Communication & Social Media Crimes',
      'Online Impersonation': 'Communication & Social Media Crimes',
      'Business Email Compromise': 'Communication & Social Media Crimes',
      'SMS Fraud': 'Communication & Social Media Crimes',
      
      // Financial & Economic Crimes
      'Online Banking Fraud': 'Financial & Economic Crimes',
      'Credit Card Fraud': 'Financial & Economic Crimes',
      'Investment Scams': 'Financial & Economic Crimes',
      'Cryptocurrency Fraud': 'Financial & Economic Crimes',
      'Online Shopping Scams': 'Financial & Economic Crimes',
      'Payment Gateway Fraud': 'Financial & Economic Crimes',
      'Insurance Fraud': 'Financial & Economic Crimes',
      'Tax Fraud': 'Financial & Economic Crimes',
      'Money Laundering': 'Financial & Economic Crimes',
      
      // Data & Privacy Crimes
      'Identity Theft': 'Data & Privacy Crimes',
      'Data Breach': 'Data & Privacy Crimes',
      'Unauthorized System Access': 'Data & Privacy Crimes',
      'Corporate Espionage': 'Data & Privacy Crimes',
      'Government Data Theft': 'Data & Privacy Crimes',
      'Medical Records Theft': 'Data & Privacy Crimes',
      'Personal Information Theft': 'Data & Privacy Crimes',
      'Account Takeover': 'Data & Privacy Crimes',
      
      // Malware & System Attacks
      'Ransomware': 'Malware & System Attacks',
      'Virus Attacks': 'Malware & System Attacks',
      'Trojan Horses': 'Malware & System Attacks',
      'Spyware': 'Malware & System Attacks',
      'Adware': 'Malware & System Attacks',
      'Worms': 'Malware & System Attacks',
      'Keyloggers': 'Malware & System Attacks',
      'Rootkits': 'Malware & System Attacks',
      'Cryptojacking': 'Malware & System Attacks',
      'Botnet Attacks': 'Malware & System Attacks',
      
      // Harassment & Exploitation
      'Cyberstalking': 'Harassment & Exploitation',
      'Online Harassment': 'Harassment & Exploitation',
      'Cyberbullying': 'Harassment & Exploitation',
      'Revenge Porn': 'Harassment & Exploitation',
      'Sextortion': 'Harassment & Exploitation',
      'Online Predatory Behavior': 'Harassment & Exploitation',
      'Doxxing': 'Harassment & Exploitation',
      'Hate Speech': 'Harassment & Exploitation',
      
      // Content-Related Crimes
      'Child Sexual Abuse Material': 'Content-Related Crimes',
      'Illegal Content Distribution': 'Content-Related Crimes',
      'Copyright Infringement': 'Content-Related Crimes',
      'Software Piracy': 'Content-Related Crimes',
      'Illegal Online Gambling': 'Content-Related Crimes',
      'Online Drug Trafficking': 'Content-Related Crimes',
      'Illegal Weapons Sales': 'Content-Related Crimes',
      'Human Trafficking': 'Content-Related Crimes',
      
      // System Disruption & Sabotage
      'Denial of Service Attacks': 'System Disruption & Sabotage',
      'Website Defacement': 'System Disruption & Sabotage',
      'System Sabotage': 'System Disruption & Sabotage',
      'Network Intrusion': 'System Disruption & Sabotage',
      'SQL Injection': 'System Disruption & Sabotage',
      'Cross-Site Scripting': 'System Disruption & Sabotage',
      'Man-in-the-Middle Attacks': 'System Disruption & Sabotage',
      
      // Government & Terrorism
      'Cyberterrorism': 'Government & Terrorism',
      'Cyber Warfare': 'Government & Terrorism',
      'Government System Hacking': 'Government & Terrorism',
      'Election Interference': 'Government & Terrorism',
      'Critical Infrastructure Attacks': 'Government & Terrorism',
      'Propaganda Distribution': 'Government & Terrorism',
      'State-Sponsored Attacks': 'Government & Terrorism',
      
      // Technical Exploitation
      'Zero-Day Exploits': 'Technical Exploitation',
      'Vulnerability Exploitation': 'Technical Exploitation',
      'Backdoor Creation': 'Technical Exploitation',
      'Privilege Escalation': 'Technical Exploitation',
      'Code Injection': 'Technical Exploitation',
      'Buffer Overflow Attacks': 'Technical Exploitation',
      
      // Targeted Attacks
      'Advanced Persistent Threats': 'Targeted Attacks',
      'Spear Phishing': 'Targeted Attacks',
      'CEO Fraud': 'Targeted Attacks',
      'Supply Chain Attacks': 'Targeted Attacks',
      'Insider Threats': 'Targeted Attacks'
    }
    
    return categoryMap[crimeType] || 'General Cybercrime'
  }

  const isPaymentPlatform = (platform: string): boolean => {
    const paymentKeywords = ['gcash', 'paymaya', 'paypal', 'bank', 'visa', 'mastercard', 'crypto', 'bitcoin', 'payment']
    return paymentKeywords.some(keyword => platform.toLowerCase().includes(keyword))
  }

  const getGridClass = (tabCount: number): string => {
    switch (tabCount) {
      case 1: return 'grid-cols-1'
      case 2: return 'grid-cols-2'
      case 3: return 'grid-cols-3'
      case 4: return 'grid-cols-4'
      case 5: return 'grid-cols-5'
      case 6: return 'grid-cols-6'
      case 7: return 'grid-cols-7'
      case 8: return 'grid-cols-8'
      default: return 'grid-cols-4'
    }
  }

  // Calculate which tabs should be shown
  const relevantTabs = [
    { id: 'overview', label: '📋 Overview', color: 'text-lawbot-blue-600' },
    { id: 'investigation', label: '🔍 Investigation', color: 'text-lawbot-emerald-600' }
  ]

  // Add conditional tabs based on crime type and data
  if (shouldShowFinancialTab()) {
    relevantTabs.push({ id: 'financial', label: '💰 Financial', color: 'text-lawbot-amber-600' })
  }
  
  if (shouldShowTechnicalTab()) {
    relevantTabs.push({ id: 'technical', label: '🔧 Technical', color: 'text-lawbot-purple-600' })
  }
  
  if (shouldShowSocialTab()) {
    relevantTabs.push({ id: 'social', label: '👥 Social', color: 'text-lawbot-pink-600' })
  }
  
  if (shouldShowSecurityTab()) {
    relevantTabs.push({ id: 'security', label: '🔒 Security', color: 'text-lawbot-red-600' })
  }
  
  if (shouldShowContentTab()) {
    relevantTabs.push({ id: 'content', label: '🚫 Content', color: 'text-lawbot-orange-600' })
  }

  // Always add performance tab last
  relevantTabs.push({ id: 'performance', label: '🎯 Performance', color: 'text-lawbot-indigo-600' })

  // Set default active tab to first relevant tab
  useEffect(() => {
    if (isOpen && relevantTabs.length > 0 && !relevantTabs.find(tab => tab.id === activeTab)) {
      setActiveTab(relevantTabs[0].id)
    }
  }, [isOpen, relevantTabs, activeTab])

  const keyMetrics = [
    {
      title: "Investigation Progress",
      value: investigationProgress,
      suffix: "%",
      icon: Target,
      color: getProgressColor(investigationProgress),
      description: "Overall case completion"
    },
    {
      title: "Risk Assessment", 
      value: riskLevel,
      suffix: "/100",
      icon: AlertTriangle,
      color: getRiskColor(riskLevel),
      description: "AI-calculated risk level"
    },
    {
      title: "Case Complexity",
      value: complexityScore,
      suffix: "/100", 
      icon: Brain,
      color: complexityScore >= 70 ? "bg-lawbot-red-500" : complexityScore >= 40 ? "bg-lawbot-amber-500" : "bg-lawbot-emerald-500",
      description: "Investigation complexity score"
    },
    {
      title: "Evidence Strength",
      value: Math.min(evidenceFiles.length * 20, 100),
      suffix: "%",
      icon: Shield,
      color: getProgressColor(Math.min(evidenceFiles.length * 20, 100)),
      description: "Evidence collection status"
    }
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-7xl max-h-[95vh] overflow-hidden bg-white dark:bg-lawbot-slate-800 shadow-2xl card-modern animate-scale-in">
        <CardHeader className="relative border-b bg-gradient-to-r from-lawbot-blue-50 to-lawbot-emerald-50 dark:from-lawbot-blue-900/20 dark:to-lawbot-emerald-900/20 border-lawbot-blue-200 dark:border-lawbot-blue-800">
          <Button variant="ghost" size="sm" onClick={onClose} className="absolute right-4 top-4 h-8 w-8 p-0 hover:bg-lawbot-red-50 dark:hover:bg-lawbot-red-900/20 hover:text-lawbot-red-600">
            <X className="h-4 w-4" />
          </Button>
          <div className="animate-fade-in-up">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-lawbot-blue-600 to-lawbot-emerald-600 bg-clip-text text-transparent flex items-center">
              <BarChart3 className="mr-3 h-8 w-8 text-lawbot-blue-600" />
              📊 Case Analytics Dashboard
            </CardTitle>
            <CardDescription className="text-lg mt-2 text-lawbot-slate-600 dark:text-lawbot-slate-400 font-medium">
              Comprehensive analysis for Case #{complaint.complaint_number || complaint.id}
            </CardDescription>
          </div>
        </CardHeader>

        <div className="overflow-y-auto max-h-[calc(95vh-120px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className={`grid w-full ${getGridClass(relevantTabs.length)} bg-lawbot-slate-100 dark:bg-lawbot-slate-800 m-4 p-1 rounded-xl`}>
              {relevantTabs.map((tab) => (
                <TabsTrigger 
                  key={tab.id}
                  value={tab.id} 
                  className={`data-[state=active]:bg-white dark:data-[state=active]:bg-lawbot-slate-700 data-[state=active]:${tab.color} font-medium`}
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="p-6">
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {keyMetrics.map((metric, index) => (
                    <Card key={index} className="card-modern bg-gradient-to-br from-white to-lawbot-slate-50/30 dark:from-lawbot-slate-800 dark:to-lawbot-slate-900/30 border-lawbot-slate-200 dark:border-lawbot-slate-700 hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-3 rounded-lg ${metric.color} bg-opacity-10`}>
                            <metric.icon className={`h-6 w-6 ${metric.color.replace('bg-', 'text-')}`} />
                          </div>
                          <ArrowUpRight className="h-4 w-4 text-lawbot-slate-400" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-2xl font-bold text-lawbot-slate-900 dark:text-white">
                            {metric.value}{metric.suffix}
                          </p>
                          <p className="font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300 text-sm">
                            {metric.title}
                          </p>
                          <p className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400">
                            {metric.description}
                          </p>
                          <Progress value={metric.suffix.includes('%') ? metric.value : (metric.value / 100) * 100} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Case Summary Cards */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="card-modern bg-gradient-to-br from-lawbot-blue-50/30 to-white dark:from-lawbot-blue-900/10 dark:to-lawbot-slate-800 border-lawbot-blue-200 dark:border-lawbot-blue-800">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-lawbot-blue-500 rounded-lg">
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        <CardTitle className="text-xl text-lawbot-slate-900 dark:text-white">📋 Case Overview</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-lawbot-slate-500 dark:text-lawbot-slate-400">Case Age</p>
                          <p className="font-bold text-lawbot-slate-900 dark:text-white">{caseAge} days</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-lawbot-slate-500 dark:text-lawbot-slate-400">Status Changes</p>
                          <p className="font-bold text-lawbot-slate-900 dark:text-white">{statusHistory.length}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-lawbot-slate-500 dark:text-lawbot-slate-400">Evidence Files</p>
                          <p className="font-bold text-lawbot-slate-900 dark:text-white">{evidenceFiles.length}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-lawbot-slate-500 dark:text-lawbot-slate-400">Response Time</p>
                          <p className="font-bold text-lawbot-slate-900 dark:text-white">{responseTime}</p>
                        </div>
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-lawbot-slate-500 dark:text-lawbot-slate-400">Current Status</p>
                        <Badge className={`${complaint.status === 'Resolved' ? 'bg-lawbot-emerald-500' : complaint.status === 'Under Investigation' ? 'bg-lawbot-blue-500' : 'bg-lawbot-amber-500'} text-white px-3 py-1`}>
                          {complaint.status || 'Pending'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="card-modern bg-gradient-to-br from-lawbot-emerald-50/30 to-white dark:from-lawbot-emerald-900/10 dark:to-lawbot-slate-800 border-lawbot-emerald-200 dark:border-lawbot-emerald-800">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-lawbot-emerald-500 rounded-lg">
                          <Brain className="h-5 w-5 text-white" />
                        </div>
                        <CardTitle className="text-xl text-lawbot-slate-900 dark:text-white">🧠 AI Insights</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {aiSummary ? (
                        <div className="p-4 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-emerald-200 dark:border-lawbot-emerald-800">
                          <p className="text-sm text-lawbot-slate-700 dark:text-lawbot-slate-300 leading-relaxed">
                            {aiSummary.length > 200 ? aiSummary.substring(0, 200) + '...' : aiSummary}
                          </p>
                        </div>
                      ) : (
                        <div className="p-4 bg-lawbot-slate-50 dark:bg-lawbot-slate-700 rounded-lg border-2 border-dashed border-lawbot-slate-300 dark:border-lawbot-slate-600 text-center">
                          <Brain className="h-8 w-8 mx-auto mb-2 text-lawbot-slate-400" />
                          <p className="text-sm text-lawbot-slate-500 dark:text-lawbot-slate-400">AI analysis in progress...</p>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          Risk: {riskLevel >= 70 ? 'High' : riskLevel >= 40 ? 'Medium' : 'Low'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Complexity: {complexityScore >= 70 ? 'High' : complexityScore >= 40 ? 'Medium' : 'Low'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Progress: {investigationProgress}%
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Investigation Tab */}
              <TabsContent value="investigation" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="card-modern">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Activity className="mr-2 h-5 w-5" />
                        📈 Investigation Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {statusHistory.length > 0 ? (
                        <div className="space-y-3">
                          {statusHistory.slice(0, 5).map((status, index) => (
                            <div key={index} className="flex items-start space-x-3 p-3 bg-lawbot-slate-50 dark:bg-lawbot-slate-700 rounded-lg">
                              <div className="flex-shrink-0 w-8 h-8 bg-lawbot-blue-500 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-4 w-4 text-white" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-lawbot-slate-900 dark:text-white">{status.status}</p>
                                <p className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400">
                                  {new Date(status.timestamp).toLocaleDateString('en-PH', {
                                    year: 'numeric', month: 'short', day: 'numeric'
                                  })}
                                </p>
                                {status.remarks && (
                                  <p className="text-xs text-lawbot-slate-600 dark:text-lawbot-slate-400 mt-1">
                                    {status.remarks}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <Clock className="h-12 w-12 mx-auto text-lawbot-slate-400 mb-2" />
                          <p className="text-lawbot-slate-500 dark:text-lawbot-slate-400">No status updates yet</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="card-modern">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <PieChart className="mr-2 h-5 w-5" />
                        📊 Evidence Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Total Files</span>
                          <Badge>{evidenceFiles.length}</Badge>
                        </div>
                        
                        {evidenceFiles.length > 0 ? (
                          <>
                            {/* File type breakdown */}
                            {(() => {
                              const fileTypes = evidenceFiles.reduce((acc, file) => {
                                const type = file.file_type || 'Unknown'
                                acc[type] = (acc[type] || 0) + 1
                                return acc
                              }, {})
                              
                              return Object.entries(fileTypes).map(([type, count]) => (
                                <div key={type} className="flex justify-between items-center">
                                  <span className="text-xs text-lawbot-slate-600 dark:text-lawbot-slate-400">
                                    {type.toUpperCase()}
                                  </span>
                                  <div className="flex items-center space-x-2">
                                    <div className="w-16 bg-lawbot-slate-200 dark:bg-lawbot-slate-700 rounded-full h-2">
                                      <div 
                                        className="bg-lawbot-blue-500 h-2 rounded-full" 
                                        style={{ width: `${((count as number) / evidenceFiles.length) * 100}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-xs font-medium w-6 text-right">{count}</span>
                                  </div>
                                </div>
                              ))
                            })()}
                            
                            <Separator />
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-lawbot-slate-500 dark:text-lawbot-slate-400">Evidence Strength</p>
                              <Progress value={Math.min(evidenceFiles.length * 20, 100)} className="h-3" />
                              <p className="text-xs text-lawbot-slate-600 dark:text-lawbot-slate-400">
                                {Math.min(evidenceFiles.length * 20, 100)}% collection target
                              </p>
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-4">
                            <FileText className="h-8 w-8 mx-auto text-lawbot-slate-400 mb-2" />
                            <p className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400">No evidence files uploaded</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Financial Tab */}
              <TabsContent value="financial" className="space-y-6">
                <Card className="card-modern bg-gradient-to-br from-lawbot-amber-50/30 to-white dark:from-lawbot-amber-900/10 dark:to-lawbot-slate-800 border-lawbot-amber-200 dark:border-lawbot-amber-800">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-lawbot-amber-500 rounded-lg">
                        <DollarSign className="h-5 w-5 text-white" />
                      </div>
                      <CardTitle className="text-xl text-lawbot-slate-900 dark:text-white">💰 Financial Impact Analysis</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {complaint.estimated_loss && complaint.estimated_loss > 0 ? (
                      <>
                        <div className="text-center p-6 bg-white dark:bg-lawbot-slate-800 rounded-xl border border-lawbot-amber-200 dark:border-lawbot-amber-800">
                          <p className="text-4xl font-bold text-lawbot-amber-600 mb-2">
                            ₱{complaint.estimated_loss.toLocaleString()}
                          </p>
                          <p className="text-lawbot-slate-600 dark:text-lawbot-slate-400 font-medium">Estimated Financial Loss</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="text-center p-4 bg-lawbot-slate-50 dark:bg-lawbot-slate-700 rounded-lg">
                            <p className="text-lg font-bold text-lawbot-slate-900 dark:text-white">
                              {complaint.estimated_loss > 100000 ? 'High Value' : complaint.estimated_loss > 10000 ? 'Medium Value' : 'Standard'}
                            </p>
                            <p className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400">Case Category</p>
                          </div>
                          
                          <div className="text-center p-4 bg-lawbot-slate-50 dark:bg-lawbot-slate-700 rounded-lg">
                            <p className="text-lg font-bold text-lawbot-slate-900 dark:text-white">
                              {complaint.status === 'Resolved' ? 'High' : complaint.status === 'Under Investigation' ? 'Medium' : 'Unknown'}
                            </p>
                            <p className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400">Recovery Probability</p>
                          </div>

                          <div className="text-center p-4 bg-lawbot-slate-50 dark:bg-lawbot-slate-700 rounded-lg">
                            <p className="text-lg font-bold text-lawbot-slate-900 dark:text-white">
                              {complaint.estimated_loss > 100000 ? 'Criminal' : 'Civil'}
                            </p>
                            <p className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400">Legal Category</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <DollarSign className="h-16 w-16 mx-auto text-lawbot-slate-400 mb-4" />
                        <p className="text-xl font-semibold text-lawbot-slate-600 dark:text-lawbot-slate-400 mb-2">
                          No Financial Loss Reported
                        </p>
                        <p className="text-lawbot-slate-500 dark:text-lawbot-slate-500 max-w-md mx-auto">
                          This case does not involve direct financial loss or the amount has not been specified by the complainant.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Technical Tab - Dynamic */}
              {shouldShowTechnicalTab() && (
                <TabsContent value="technical" className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="card-modern bg-gradient-to-br from-lawbot-purple-50/30 to-white dark:from-lawbot-purple-900/10 dark:to-lawbot-slate-800 border-lawbot-purple-200 dark:border-lawbot-purple-800">
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-lawbot-purple-500 rounded-lg">
                            <Activity className="h-5 w-5 text-white" />
                          </div>
                          <CardTitle className="text-xl text-lawbot-slate-900 dark:text-white">🔧 Technical Analysis</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {complaint.system_details && (
                          <div className="p-4 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-purple-200 dark:border-lawbot-purple-800">
                            <p className="text-xs font-medium text-lawbot-slate-500 dark:text-lawbot-slate-400 mb-2">System Details</p>
                            <p className="text-sm text-lawbot-slate-700 dark:text-lawbot-slate-300">{complaint.system_details}</p>
                          </div>
                        )}
                        {complaint.technical_info && (
                          <div className="p-4 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-purple-200 dark:border-lawbot-purple-800">
                            <p className="text-xs font-medium text-lawbot-slate-500 dark:text-lawbot-slate-400 mb-2">Technical Information</p>
                            <p className="text-sm text-lawbot-slate-700 dark:text-lawbot-slate-300">{complaint.technical_info}</p>
                          </div>
                        )}
                        {complaint.vulnerability_details && (
                          <div className="p-4 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-purple-200 dark:border-lawbot-purple-800">
                            <p className="text-xs font-medium text-lawbot-slate-500 dark:text-lawbot-slate-400 mb-2">Vulnerability Details</p>
                            <p className="text-sm text-lawbot-slate-700 dark:text-lawbot-slate-300">{complaint.vulnerability_details}</p>
                          </div>
                        )}
                        {complaint.attack_vector && (
                          <div className="p-4 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-purple-200 dark:border-lawbot-purple-800">
                            <p className="text-xs font-medium text-lawbot-slate-500 dark:text-lawbot-slate-400 mb-2">Attack Vector</p>
                            <p className="text-sm text-lawbot-slate-700 dark:text-lawbot-slate-300">{complaint.attack_vector}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="card-modern">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Shield className="mr-2 h-5 w-5" />
                          🛡️ Security Assessment
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-lawbot-slate-50 dark:bg-lawbot-slate-700 rounded-lg">
                          <span className="font-medium">Technical Complexity</span>
                          <Badge className={`${complexityScore >= 70 ? 'bg-lawbot-red-500' : complexityScore >= 40 ? 'bg-lawbot-amber-500' : 'bg-lawbot-emerald-500'} text-white`}>
                            {complexityScore >= 70 ? 'High' : complexityScore >= 40 ? 'Medium' : 'Low'}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-lawbot-slate-50 dark:bg-lawbot-slate-700 rounded-lg">
                          <span className="font-medium">System Impact</span>
                          <Badge className={`${riskLevel >= 70 ? 'bg-lawbot-red-500' : riskLevel >= 40 ? 'bg-lawbot-amber-500' : 'bg-lawbot-emerald-500'} text-white`}>
                            {riskLevel >= 70 ? 'Critical' : riskLevel >= 40 ? 'Moderate' : 'Low'}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-lawbot-slate-50 dark:bg-lawbot-slate-700 rounded-lg">
                          <span className="font-medium">Investigation Priority</span>
                          <Badge className={`${complaint.priority === 'high' ? 'bg-lawbot-red-500' : complaint.priority === 'medium' ? 'bg-lawbot-amber-500' : 'bg-lawbot-emerald-500'} text-white`}>
                            {(complaint.priority || 'medium').toUpperCase()}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              )}

              {/* Social/Personal Tab - Dynamic */}
              {shouldShowSocialTab() && (
                <TabsContent value="social" className="space-y-6">
                  <Card className="card-modern bg-gradient-to-br from-lawbot-pink-50/30 to-white dark:from-lawbot-pink-900/10 dark:to-lawbot-slate-800 border-lawbot-pink-200 dark:border-lawbot-pink-800">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-lawbot-pink-500 rounded-lg">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <CardTitle className="text-xl text-lawbot-slate-900 dark:text-white">👥 Social & Personal Details</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          {complaint.suspect_name && (
                            <div className="p-4 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-pink-200 dark:border-lawbot-pink-800">
                              <p className="text-xs font-medium text-lawbot-slate-500 dark:text-lawbot-slate-400 mb-2">Suspect Name/Alias</p>
                              <p className="text-sm font-semibold text-lawbot-slate-900 dark:text-white">{complaint.suspect_name}</p>
                            </div>
                          )}
                          {complaint.suspect_relationship && (
                            <div className="p-4 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-pink-200 dark:border-lawbot-pink-800">
                              <p className="text-xs font-medium text-lawbot-slate-500 dark:text-lawbot-slate-400 mb-2">Relationship to Suspect</p>
                              <p className="text-sm text-lawbot-slate-700 dark:text-lawbot-slate-300">{complaint.suspect_relationship}</p>
                            </div>
                          )}
                          {complaint.suspect_contact && (
                            <div className="p-4 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-pink-200 dark:border-lawbot-pink-800">
                              <p className="text-xs font-medium text-lawbot-slate-500 dark:text-lawbot-slate-400 mb-2">Suspect Contact Information</p>
                              <p className="text-sm text-lawbot-slate-700 dark:text-lawbot-slate-300">{complaint.suspect_contact}</p>
                            </div>
                          )}
                        </div>
                        <div className="space-y-4">
                          {complaint.suspect_details && (
                            <div className="p-4 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-pink-200 dark:border-lawbot-pink-800">
                              <p className="text-xs font-medium text-lawbot-slate-500 dark:text-lawbot-slate-400 mb-2">Additional Suspect Details</p>
                              <p className="text-sm text-lawbot-slate-700 dark:text-lawbot-slate-300">{complaint.suspect_details}</p>
                            </div>
                          )}
                          <div className="p-4 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-pink-200 dark:border-lawbot-pink-800">
                            <p className="text-xs font-medium text-lawbot-slate-500 dark:text-lawbot-slate-400 mb-2">Investigation Status</p>
                            <div className="flex items-center space-x-2">
                              <Badge className={`${complaint.status === 'Resolved' ? 'bg-lawbot-emerald-500' : complaint.status === 'Under Investigation' ? 'bg-lawbot-blue-500' : 'bg-lawbot-amber-500'} text-white`}>
                                {complaint.status || 'Pending'}
                              </Badge>
                              <span className="text-xs text-lawbot-slate-500">{statusHistory.length} status updates</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {/* Security Tab - Dynamic */}
              {shouldShowSecurityTab() && (
                <TabsContent value="security" className="space-y-6">
                  <Card className="card-modern bg-gradient-to-br from-lawbot-red-50/30 to-white dark:from-lawbot-red-900/10 dark:to-lawbot-slate-800 border-lawbot-red-200 dark:border-lawbot-red-800">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-lawbot-red-500 rounded-lg">
                          <Shield className="h-5 w-5 text-white" />
                        </div>
                        <CardTitle className="text-xl text-lawbot-slate-900 dark:text-white">🔒 Security & Government Analysis</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {complaint.security_level && (
                        <div className="p-4 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-red-200 dark:border-lawbot-red-800">
                          <p className="text-xs font-medium text-lawbot-slate-500 dark:text-lawbot-slate-400 mb-2">Security Classification</p>
                          <Badge className="bg-lawbot-red-500 text-white">{complaint.security_level}</Badge>
                        </div>
                      )}
                      {complaint.target_info && (
                        <div className="p-4 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-red-200 dark:border-lawbot-red-800">
                          <p className="text-xs font-medium text-lawbot-slate-500 dark:text-lawbot-slate-400 mb-2">Target Information</p>
                          <p className="text-sm text-lawbot-slate-700 dark:text-lawbot-slate-300">{complaint.target_info}</p>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-lawbot-slate-50 dark:bg-lawbot-slate-700 rounded-lg">
                          <p className="text-lg font-bold text-lawbot-slate-900 dark:text-white">
                            {riskLevel >= 80 ? 'Critical' : riskLevel >= 60 ? 'High' : 'Medium'}
                          </p>
                          <p className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400">National Security Risk</p>
                        </div>
                        <div className="text-center p-4 bg-lawbot-slate-50 dark:bg-lawbot-slate-700 rounded-lg">
                          <p className="text-lg font-bold text-lawbot-slate-900 dark:text-white">
                            {complaint.priority === 'high' ? 'Urgent' : complaint.priority === 'medium' ? 'Standard' : 'Routine'}
                          </p>
                          <p className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400">Response Priority</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {/* Content Tab - Dynamic */}
              {shouldShowContentTab() && (
                <TabsContent value="content" className="space-y-6">
                  <Card className="card-modern bg-gradient-to-br from-lawbot-orange-50/30 to-white dark:from-lawbot-orange-900/10 dark:to-lawbot-slate-800 border-lawbot-orange-200 dark:border-lawbot-orange-800">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-lawbot-orange-500 rounded-lg">
                          <AlertTriangle className="h-5 w-5 text-white" />
                        </div>
                        <CardTitle className="text-xl text-lawbot-slate-900 dark:text-white">🚫 Content Analysis</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {complaint.content_description && (
                        <div className="p-4 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-orange-200 dark:border-lawbot-orange-800">
                          <p className="text-xs font-medium text-lawbot-slate-500 dark:text-lawbot-slate-400 mb-2">Content Description</p>
                          <p className="text-sm text-lawbot-slate-700 dark:text-lawbot-slate-300">{complaint.content_description}</p>
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-lawbot-slate-50 dark:bg-lawbot-slate-700 rounded-lg">
                          <p className="text-lg font-bold text-lawbot-slate-900 dark:text-white">{evidenceFiles.length}</p>
                          <p className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400">Evidence Files</p>
                        </div>
                        <div className="text-center p-4 bg-lawbot-slate-50 dark:bg-lawbot-slate-700 rounded-lg">
                          <p className="text-lg font-bold text-lawbot-slate-900 dark:text-white">
                            {riskLevel >= 70 ? 'High' : riskLevel >= 40 ? 'Medium' : 'Low'}
                          </p>
                          <p className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400">Content Severity</p>
                        </div>
                        <div className="text-center p-4 bg-lawbot-slate-50 dark:bg-lawbot-slate-700 rounded-lg">
                          <p className="text-lg font-bold text-lawbot-slate-900 dark:text-white">
                            {complaint.status === 'Under Investigation' ? 'Active' : complaint.status || 'Pending'}
                          </p>
                          <p className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400">Investigation Status</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {/* Performance Tab */}
              <TabsContent value="performance" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="card-modern">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <TrendingUp className="mr-2 h-5 w-5" />
                        📊 Performance Indicators
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Investigation Progress</span>
                            <span className="text-sm text-lawbot-slate-500">{investigationProgress}%</span>
                          </div>
                          <Progress value={investigationProgress} className="h-3" />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Evidence Collection</span>
                            <span className="text-sm text-lawbot-slate-500">{Math.min(evidenceFiles.length * 20, 100)}%</span>
                          </div>
                          <Progress value={Math.min(evidenceFiles.length * 20, 100)} className="h-3" />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">AI Analysis</span>
                            <span className="text-sm text-lawbot-slate-500">{aiSummary ? '100' : '0'}%</span>
                          </div>
                          <Progress value={aiSummary ? 100 : 0} className="h-3" />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Documentation</span>
                            <span className="text-sm text-lawbot-slate-500">{statusHistory.length > 0 ? '85' : '10'}%</span>
                          </div>
                          <Progress value={statusHistory.length > 0 ? 85 : 10} className="h-3" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="card-modern">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Target className="mr-2 h-5 w-5" />
                        🎯 Key Performance Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-lawbot-slate-50 dark:bg-lawbot-slate-700 rounded-lg">
                          <span className="font-medium">Response Time</span>
                          <Badge className={`${statusHistory.length > 0 ? 'bg-lawbot-emerald-500' : 'bg-lawbot-amber-500'} text-white`}>
                            {responseTime}
                          </Badge>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-lawbot-slate-50 dark:bg-lawbot-slate-700 rounded-lg">
                          <span className="font-medium">Case Priority</span>
                          <Badge className={`${complaint.priority === 'high' ? 'bg-lawbot-red-500' : complaint.priority === 'medium' ? 'bg-lawbot-amber-500' : 'bg-lawbot-emerald-500'} text-white`}>
                            {(complaint.priority || 'medium').toUpperCase()}
                          </Badge>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-lawbot-slate-50 dark:bg-lawbot-slate-700 rounded-lg">
                          <span className="font-medium">Processing Status</span>
                          <Badge className="bg-lawbot-blue-500 text-white">
                            {(() => {
                              // Determine processing status based on actual case data
                              if (complaint.status === 'Resolved' || complaint.status === 'Dismissed') return 'Completed'
                              if (complaint.priority === 'high') return 'Expedited'
                              if (statusHistory.length > 2) return 'Active'
                              if (statusHistory.length > 0) return 'Processing'
                              return 'Queued'
                            })()}
                          </Badge>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-lawbot-slate-50 dark:bg-lawbot-slate-700 rounded-lg">
                          <span className="font-medium">Completion Estimate</span>
                          <Badge variant="outline">
                            {(() => {
                              // Calculate estimate based on actual case data and progress
                              if (complaint.status === 'Resolved' || complaint.status === 'Dismissed') {
                                return 'Completed'
                              }
                              
                              // Base estimate on investigation progress and case complexity
                              const daysRemaining = Math.max(1, Math.ceil((100 - investigationProgress) / 10))
                              const complexityMultiplier = complexityScore > 70 ? 1.5 : complexityScore > 40 ? 1.2 : 1
                              const priorityMultiplier = complaint.priority === 'high' ? 0.7 : complaint.priority === 'low' ? 1.3 : 1
                              
                              const estimatedDays = Math.ceil(daysRemaining * complexityMultiplier * priorityMultiplier)
                              
                              if (estimatedDays <= 3) return `${estimatedDays} days`
                              if (estimatedDays <= 14) return `${estimatedDays} days`
                              if (estimatedDays <= 30) return `${Math.ceil(estimatedDays / 7)} weeks`
                              return 'Under review'
                            })()}
                          </Badge>
                        </div>
                      </div>
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