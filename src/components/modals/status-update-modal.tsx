"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, CheckCircle, Clock, AlertTriangle, FileText, Send, Calendar, Edit, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import PNPOfficerService from "@/lib/pnp-officer-service"
import { supabase } from "@/lib/supabase"
import { getTemplatesForStatus, getTemplatesByCategory, getCategoryDisplayName, getCategoryColor, StatusTemplate } from "@/lib/status-templates"

interface StatusUpdateModalProps {
  isOpen: boolean
  onClose: () => void
  caseData: any
  onStatusUpdate: (newStatus: string, updateData: any) => void
}

export function StatusUpdateModal({ isOpen, onClose, caseData, onStatusUpdate }: StatusUpdateModalProps) {
  
  // Enhanced close handler to reset all modal state
  const handleClose = () => {
    // Reset all modal state
    setSubmitSuccess(false)
    setSubmitError(null)
    setIsSubmitting(false)
    setSelectedStatus(caseData?.status || "")
    setUpdateNotes("")
    setNotifyStakeholders(true)
    setUrgencyLevel("normal")
    setFollowUpDate("")
    
    // Call parent close handler
    onClose()
  }
  const [selectedStatus, setSelectedStatus] = useState(caseData?.status || "")
  const [updateNotes, setUpdateNotes] = useState("")
  const [notifyStakeholders, setNotifyStakeholders] = useState(true)
  const [urgencyLevel, setUrgencyLevel] = useState("normal")
  const [followUpDate, setFollowUpDate] = useState("")
  const [currentOfficer, setCurrentOfficer] = useState<{ id: string; name: string; unit: string; badge: string } | null>(null)
  const [isLoadingCurrentOfficer, setIsLoadingCurrentOfficer] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [availableTemplates, setAvailableTemplates] = useState<StatusTemplate[]>([])
  const [templatesByCategory, setTemplatesByCategory] = useState<Record<string, StatusTemplate[]>>({})

  // Fetch current officer profile from database
  useEffect(() => {
    const fetchCurrentOfficer = async () => {
      try {
        setIsLoadingCurrentOfficer(true)
        console.log('🔄 Fetching current officer profile for status update modal...')
        
        const officerProfile = await PNPOfficerService.getCurrentOfficerProfile()
        
        if (officerProfile) {
          setCurrentOfficer({
            id: officerProfile.firebase_uid,
            name: officerProfile.full_name,
            unit: officerProfile.unit?.unit_name || 'No Unit Assigned',
            badge: officerProfile.badge_number
          })
          console.log('✅ Current officer loaded:', officerProfile.full_name)
        } else {
          console.log('⚠️ No current officer profile found')
        }
      } catch (error) {
        console.error('❌ Error fetching current officer:', error)
      } finally {
        setIsLoadingCurrentOfficer(false)
      }
    }
    
    if (isOpen) {
      fetchCurrentOfficer()
    }
  }, [isOpen])

  // Reset state when modal opens with case data
  useEffect(() => {
    if (isOpen && caseData) {
      console.log('🔄 Resetting modal state for case:', caseData.complaint_number || caseData.id)
      console.log('🔄 Current case status:', caseData.status)
      
      setSelectedStatus(caseData.status || "Pending")
      setUpdateNotes("")
      setNotifyStakeholders(true)
      setUrgencyLevel("normal")
      setFollowUpDate("")
      setIsSubmitting(false)
      setSubmitError(null)
      setSubmitSuccess(false)
      
      console.log('✅ Modal state reset complete')
    }
  }, [isOpen, caseData])

  // Update available templates when selected status changes
  useEffect(() => {
    if (selectedStatus && caseData) {
      console.log('🔄 Updating templates for status change:', caseData.status, '→', selectedStatus)
      
      // Get templates appropriate for this status transition
      const templates = getTemplatesForStatus(selectedStatus, caseData.status)
      const categorized = getTemplatesByCategory(templates)
      
      setAvailableTemplates(templates)
      setTemplatesByCategory(categorized)
      
      console.log('✅ Found', templates.length, 'templates for', selectedStatus)
      console.log('📋 Template categories:', Object.keys(categorized))
    }
  }, [selectedStatus, caseData])

  if (!isOpen || !caseData) return null

  // Debug: Log current status selection state
  console.log('🔍 Modal render - selectedStatus:', selectedStatus, 'caseData.status:', caseData.status)

  const statusOptions = [
    {
      value: "Pending",
      label: "Pending",
      icon: Clock,
      color: "bg-yellow-500",
      description: "Case has been received and is being reviewed",
    },
    {
      value: "Under Investigation",
      label: "Under Investigation",
      icon: AlertTriangle,
      color: "bg-blue-500",
      description: "PNP officers are actively investigating the case",
    },
    {
      value: "Requires More Information",
      label: "Requires More Information",
      icon: FileText,
      color: "bg-purple-500",
      description: "Additional information is needed to proceed with investigation",
    },
    {
      value: "Resolved",
      label: "Resolved",
      icon: CheckCircle,
      color: "bg-green-500",
      description: "Case has been successfully resolved",
    },
    { 
      value: "Dismissed", 
      label: "Dismissed", 
      icon: X, 
      color: "bg-gray-500", 
      description: "Case has been dismissed due to insufficient evidence or other factors" 
    },
  ]

  // Use real case data
  const complaintNumber = caseData?.complaint_number || caseData?.id || 'Unknown'
  const caseTitle = caseData?.title || `${caseData?.crime_type || 'Unknown'} Case`

  // Handle template selection with auto-population of related fields
  const handleTemplateSelect = (template: StatusTemplate) => {
    console.log('🔄 Template selected:', template.title)
    
    // Set the template content
    setUpdateNotes(template.content)
    
    // Auto-set recommended urgency level
    setUrgencyLevel(template.urgencyLevel)
    
    // Auto-set follow-up date if recommended
    if (template.recommendedFollowUpDays) {
      const followUpDate = new Date()
      followUpDate.setDate(followUpDate.getDate() + template.recommendedFollowUpDays)
      setFollowUpDate(followUpDate.toISOString().slice(0, 16))
    }
    
    console.log('✅ Template applied with urgency:', template.urgencyLevel)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear any previous errors
    setSubmitError(null)
    setIsSubmitting(true)
    
    try {
      console.log('🔄 Submitting status update...')
      
      // Basic validation
      if (!selectedStatus) {
        throw new Error('Please select a status')
      }
      
      if (!currentOfficer) {
        throw new Error('Officer information not loaded. Please wait and try again.')
      }
      
      // Get current status and complaint ID for tracking officer acknowledgment
      const currentStatus = caseData?.status
      const complaintId = caseData?.complaint_id || caseData?.id
      
      console.log('🔍 Status change analysis:', {
        from: currentStatus,
        to: selectedStatus,
        complaintId: complaintId
      })
      
      // Check if we should clear citizen update indicators
      const isOfficerAcknowledgingUpdates = currentStatus === "Requires More Information" && selectedStatus !== "Requires More Information"
      const isSettingToRequiresMoreInfo = selectedStatus === "Requires More Information" && currentStatus !== "Requires More Information"
      const shouldClearCitizenUpdates = isOfficerAcknowledgingUpdates || isSettingToRequiresMoreInfo
      
      if (isOfficerAcknowledgingUpdates) {
        console.log('🔄 Officer acknowledging citizen updates - will clear update indicators')
      } else if (isSettingToRequiresMoreInfo) {
        console.log('🔄 Officer setting status to Requires More Information - clearing old update indicators to prevent confusion')
      }
      
      // Create update data object
      const updateData = {
        status: selectedStatus,
        notes: updateNotes,
        notifyStakeholders,
        urgencyLevel,
        followUpDate,
        assignedOfficer: currentOfficer.id,
        timestamp: new Date().toISOString(),
        // Additional data for database update if needed
        clearCitizenUpdates: shouldClearCitizenUpdates,
        complaintId: complaintId
      }
      
      console.log('📋 Submitting update data:', updateData)
      
      // Clear citizen update indicators if needed to prevent confusion
      if (shouldClearCitizenUpdates && complaintId) {
        console.log('🔄 Clearing citizen update indicators in database...')
        
        try {
          const { error: clearError } = await supabase
            .from('complaints')
            .update({
              status: selectedStatus,
              last_citizen_update: null,
              total_updates: 0,
              updated_at: new Date().toISOString()
            })
            .eq('id', complaintId)
          
          if (clearError) {
            console.error('❌ Error clearing citizen update indicators:', clearError)
            // Don't throw error here - still proceed with status update
          } else {
            console.log('✅ Citizen update indicators cleared successfully')
          }
        } catch (dbError) {
          console.error('❌ Database error clearing indicators:', dbError)
          // Don't throw error here - still proceed with status update
        }
      }
      
      // Call the parent's status update handler
      await onStatusUpdate(selectedStatus, updateData)
      
      console.log('✅ Status update submitted successfully')
      setSubmitSuccess(true)
      
      // Show success message briefly, then auto-close modal for better UX
      setTimeout(() => {
        handleClose()
      }, 1500) // Close after 1.5 seconds
    } catch (error) {
      console.error('❌ Error submitting status update:', error)
      
      // Extract meaningful error message
      let errorMessage = 'Failed to update status. Please try again.'
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'object' && error !== null) {
        errorMessage = JSON.stringify(error)
      }
      
      setSubmitError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    const statusOption = statusOptions.find((opt) => opt.value === status)
    return statusOption ? statusOption.icon : Clock
  }

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find((opt) => opt.value === status)
    return statusOption ? statusOption.color : "bg-lawbot-slate-500"
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden bg-white dark:bg-lawbot-slate-800 shadow-2xl card-modern animate-scale-in">
        <CardHeader className="relative border-b bg-gradient-to-r from-lawbot-blue-50 to-lawbot-emerald-50 dark:from-lawbot-blue-900/20 dark:to-lawbot-emerald-900/20 border-lawbot-blue-200 dark:border-lawbot-blue-800">
          <Button variant="ghost" size="sm" onClick={handleClose} className="absolute right-4 top-4 h-8 w-8 p-0 hover:bg-lawbot-red-50 dark:hover:bg-lawbot-red-900/20 hover:text-lawbot-red-600">
            <X className="h-4 w-4" />
          </Button>
          <div className="animate-fade-in-up">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-lawbot-blue-600 to-lawbot-emerald-600 bg-clip-text text-transparent">
              📝 Update Case Status
            </CardTitle>
            <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400 mt-1 font-medium">
              Case #{complaintNumber} - {caseTitle}
            </CardDescription>
          </div>
        </CardHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Current Status & Transition Indicator */}
            <div className="bg-gradient-to-r from-lawbot-blue-50 to-lawbot-emerald-50 dark:from-lawbot-blue-900/20 dark:to-lawbot-emerald-900/20 p-6 rounded-xl border border-lawbot-blue-200 dark:border-lawbot-blue-800 animate-fade-in-up">
              <p className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400 font-medium mb-4">📊 Status Transition</p>
              
              <div className="flex items-center justify-between">
                {/* Current Status */}
                <div className="flex flex-col items-center space-y-2">
                  <div className="flex items-center space-x-3">
                    {(() => {
                      const StatusIcon = getStatusIcon(caseData.status)
                      return <StatusIcon className="h-5 w-5 text-lawbot-blue-500" />
                    })()}
                    <span className="font-bold text-lawbot-slate-900 dark:text-white text-lg">{caseData.status}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">Current</Badge>
                </div>

                {/* Arrow Transition */}
                <div className="flex flex-col items-center space-y-1 px-4">
                  <div className="text-2xl">→</div>
                  <div className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400">Updating to</div>
                </div>

                {/* New Status */}
                <div className="flex flex-col items-center space-y-2">
                  <div className="flex items-center space-x-3">
                    {(() => {
                      const StatusIcon = getStatusIcon(selectedStatus)
                      return <StatusIcon className="h-5 w-5 text-lawbot-emerald-500" />
                    })()}
                    <span className="font-bold text-lawbot-emerald-700 dark:text-lawbot-emerald-300 text-lg">{selectedStatus}</span>
                  </div>
                  <Badge className={`${getStatusColor(selectedStatus)} text-white px-3 py-1 text-xs`}>New Status</Badge>
                </div>
              </div>
              
              {/* Template Count Indicator */}
              {availableTemplates.length > 0 && (
                <div className="mt-4 pt-4 border-t border-lawbot-blue-200 dark:border-lawbot-blue-700">
                  <div className="flex items-center justify-center space-x-2 text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400">
                    <FileText className="h-4 w-4" />
                    <span>{availableTemplates.length} professional templates available for this transition</span>
                  </div>
                </div>
              )}
            </div>

            {/* New Status Selection */}
            <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-lawbot-emerald-500 rounded-lg">
                  <Edit className="h-5 w-5 text-white" />
                </div>
                <Label className="text-lg font-bold text-lawbot-slate-900 dark:text-white">🔄 Select New Status</Label>
              </div>
              <RadioGroup value={selectedStatus} onValueChange={(value) => {
                console.log('🔄 Status selection changed from:', selectedStatus, 'to:', value)
                setSelectedStatus(value)
                console.log('✅ Status updated to:', value)
              }}>
                <div className="grid gap-4">
                  {statusOptions.map((status) => (
                    <div
                      key={status.value}
                      className="flex items-center space-x-4 p-4 border-2 border-lawbot-slate-200 dark:border-lawbot-slate-700 rounded-xl hover:bg-lawbot-slate-50 dark:hover:bg-lawbot-slate-800 hover:border-lawbot-blue-300 dark:hover:border-lawbot-blue-600 transition-all duration-300 cursor-pointer card-modern"
                    >
                      <RadioGroupItem value={status.value} id={status.value} className="border-lawbot-blue-300 text-lawbot-blue-600" />
                      <div className="flex items-center space-x-4 flex-1">
                        <div className={`p-3 rounded-xl ${status.color} text-white shadow-lg`}>
                          <status.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <Label htmlFor={status.value} className="font-bold cursor-pointer text-lawbot-slate-900 dark:text-white text-base">
                            {status.label}
                          </Label>
                          <p className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400 leading-relaxed mt-1">{status.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Update Notes */}
            <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-lawbot-purple-500 rounded-lg">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <Label htmlFor="updateNotes" className="text-lg font-bold text-lawbot-slate-900 dark:text-white">
                  📝 Update Notes
                </Label>
              </div>
              <div className="space-y-4">
                {/* Dynamic Template System */}
                <div className="p-4 bg-gradient-to-r from-lawbot-purple-50 to-lawbot-blue-50 dark:from-lawbot-purple-900/20 dark:to-lawbot-blue-900/20 rounded-xl border border-lawbot-purple-200 dark:border-lawbot-purple-800">
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-sm font-semibold text-lawbot-purple-700 dark:text-lawbot-purple-300">
                      ⚡ Status-Specific Templates
                    </Label>
                    <Badge variant="outline" className="text-xs">
                      {availableTemplates.length} templates available
                    </Badge>
                  </div>
                  
                  {availableTemplates.length > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(templatesByCategory).map(([category, templates]) => (
                        <div key={category} className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${getCategoryColor(category)}`}></div>
                            <Label className="text-xs font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">
                              {getCategoryDisplayName(category)}
                            </Label>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {templates.map((template) => (
                              <Button
                                key={template.id}
                                type="button"
                                variant="outline"
                                size="sm"
                                className="btn-modern border-lawbot-purple-300 text-lawbot-purple-600 hover:bg-lawbot-purple-50 dark:hover:bg-lawbot-purple-900/20 font-medium text-left justify-start p-3 h-auto"
                                onClick={() => handleTemplateSelect(template)}
                                title={template.content}
                              >
                                <div className="flex flex-col items-start space-y-1 w-full">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm">{template.icon}</span>
                                    <span className="font-medium text-xs">{template.title}</span>
                                  </div>
                                  <div className="flex items-center space-x-2 text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400">
                                    <Badge variant="secondary" className="text-xs px-2 py-0">
                                      {template.urgencyLevel}
                                    </Badge>
                                    {template.recommendedFollowUpDays && (
                                      <span>{template.recommendedFollowUpDays}d follow-up</span>
                                    )}
                                  </div>
                                </div>
                              </Button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-lawbot-slate-500 dark:text-lawbot-slate-400">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No templates available for this status transition</p>
                      <p className="text-xs mt-1">You can still write custom notes below</p>
                    </div>
                  )}
                </div>
                <Textarea
                  id="updateNotes"
                  placeholder="Enter detailed notes about this status update..."
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                  rows={4}
                  required
                  className="border-lawbot-slate-300 dark:border-lawbot-slate-600 focus:border-lawbot-blue-500 rounded-xl resize-none"
                />
              </div>
            </div>

            {/* Additional Options */}
            <div className="grid md:grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-lawbot-amber-500 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-white" />
                  </div>
                  <Label className="text-base font-bold text-lawbot-slate-900 dark:text-white">⚡ Urgency Level</Label>
                </div>
                <Select value={urgencyLevel} onValueChange={setUrgencyLevel}>
                  <SelectTrigger className="border-lawbot-slate-300 dark:border-lawbot-slate-600 focus:border-lawbot-blue-500 rounded-xl">
                    <SelectValue placeholder="Select urgency level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">🟢 Low - Routine update</SelectItem>
                    <SelectItem value="normal">🟡 Normal - Standard priority</SelectItem>
                    <SelectItem value="high">🟠 High - Requires attention</SelectItem>
                    <SelectItem value="urgent">🔴 Urgent - Immediate action needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-lawbot-blue-500 rounded-lg">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  <Label className="text-base font-bold text-lawbot-slate-900 dark:text-white">
                    👮 Case Assigned To
                  </Label>
                </div>
                <div className="p-4 bg-lawbot-blue-50 dark:bg-lawbot-blue-900/20 border-2 border-lawbot-blue-200 dark:border-lawbot-blue-800 rounded-xl">
                  {isLoadingCurrentOfficer ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-lawbot-blue-600"></div>
                      <span className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400">Loading officer info...</span>
                    </div>
                  ) : currentOfficer ? (
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-lawbot-blue-500 rounded-full flex items-center justify-center">
                        <Shield className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-lawbot-slate-900 dark:text-white">
                          {currentOfficer.name}
                        </div>
                        <div className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400">
                          Badge #{currentOfficer.badge} • {currentOfficer.unit}
                        </div>
                      </div>
                      <Badge className="bg-lawbot-blue-100 text-lawbot-blue-800 dark:bg-lawbot-blue-900/30 dark:text-lawbot-blue-300">
                        You
                      </Badge>
                    </div>
                  ) : (
                    <div className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400">
                      ⚠️ Officer information not available
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Follow-up Date */}
            <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '800ms' }}>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-lawbot-emerald-500 rounded-lg">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                <Label htmlFor="followUpDate" className="text-base font-bold text-lawbot-slate-900 dark:text-white">
                  📅 Follow-up Date (Optional)
                </Label>
              </div>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-lawbot-slate-400 z-10 pointer-events-none" />
                <Input
                  id="followUpDate"
                  type="datetime-local"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  placeholder="Select date and time"
                  className="pl-12 border-lawbot-slate-300 dark:border-lawbot-slate-600 focus:border-lawbot-blue-500 rounded-xl h-12 cursor-pointer"
                  style={{
                    colorScheme: 'light dark'
                  }}
                />
              </div>
            </div>

            {/* Notification Options */}
            <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '1000ms' }}>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-lawbot-purple-500 rounded-lg">
                  <Send className="h-4 w-4 text-white" />
                </div>
                <Label className="text-base font-bold text-lawbot-slate-900 dark:text-white">📢 Notification Settings</Label>
              </div>
              <div className="p-4 bg-gradient-to-r from-lawbot-slate-50 to-lawbot-blue-50 dark:from-lawbot-slate-800 dark:to-lawbot-blue-900/20 rounded-xl border border-lawbot-slate-200 dark:border-lawbot-slate-700">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-white dark:bg-lawbot-slate-700 rounded-lg">
                    <Checkbox
                      id="notifyStakeholders"
                      checked={notifyStakeholders}
                      onCheckedChange={(checked) => setNotifyStakeholders(checked === true)}
                      className="border-lawbot-blue-300 text-lawbot-blue-600"
                    />
                    <Label htmlFor="notifyStakeholders" className="text-sm font-medium text-lawbot-slate-900 dark:text-white">
                      📧 Notify all stakeholders (complainant, supervisors, assigned officers)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white dark:bg-lawbot-slate-700 rounded-lg">
                    <Checkbox id="emailNotification" defaultChecked className="border-lawbot-blue-300 text-lawbot-blue-600" />
                    <Label htmlFor="emailNotification" className="text-sm font-medium text-lawbot-slate-900 dark:text-white">
                      ✉️ Send email notifications
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white dark:bg-lawbot-slate-700 rounded-lg">
                    <Checkbox id="smsNotification" className="border-lawbot-blue-300 text-lawbot-blue-600" />
                    <Label htmlFor="smsNotification" className="text-sm font-medium text-lawbot-slate-900 dark:text-white">
                      📱 Send SMS notifications (urgent cases only)
                    </Label>
                  </div>
                </div>
              </div>
            </div>


            {/* Action Buttons */}
            {/* Success Display */}
            {submitSuccess && (
              <div className="p-4 bg-lawbot-emerald-50 dark:bg-lawbot-emerald-900/20 border-2 border-lawbot-emerald-200 dark:border-lawbot-emerald-800 rounded-xl mb-6 animate-fade-in">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-lawbot-emerald-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lawbot-emerald-800 dark:text-lawbot-emerald-200">Status Updated Successfully!</h4>
                    <p className="text-sm text-lawbot-emerald-700 dark:text-lawbot-emerald-300 mt-1">
                      Case status has been changed to <span className="font-semibold">"{selectedStatus}"</span>. 
                      You can close this dialog or update again if needed.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {submitError && (
              <div className="p-4 bg-lawbot-red-50 dark:bg-lawbot-red-900/20 border-2 border-lawbot-red-200 dark:border-lawbot-red-800 rounded-xl mb-6 animate-fade-in">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-lawbot-red-500 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lawbot-red-800 dark:text-lawbot-red-200">Status Update Failed</h4>
                    <p className="text-sm text-lawbot-red-700 dark:text-lawbot-red-300 mt-1">{submitError}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-6 border-t border-lawbot-slate-200 dark:border-lawbot-slate-700 animate-fade-in-up" style={{ animationDelay: '1200ms' }}>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={isSubmitting}
                className="btn-modern border-lawbot-slate-300 text-lawbot-slate-600 hover:bg-lawbot-slate-50 dark:hover:bg-lawbot-slate-800 px-6 py-3 disabled:opacity-50"
              >
                ❌ Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || isLoadingCurrentOfficer}
                className="btn-gradient bg-gradient-to-r from-lawbot-blue-600 to-lawbot-emerald-600 hover:from-lawbot-blue-700 hover:to-lawbot-emerald-700 text-white px-8 py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    🔄 Updating...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    📝 Update Status
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}
