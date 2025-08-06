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

interface StatusUpdateModalProps {
  isOpen: boolean
  onClose: () => void
  caseData: any
  onStatusUpdate: (newStatus: string, updateData: any) => void
}

export function StatusUpdateModal({ isOpen, onClose, caseData, onStatusUpdate }: StatusUpdateModalProps) {
  const [selectedStatus, setSelectedStatus] = useState(caseData?.status || "")
  const [updateNotes, setUpdateNotes] = useState("")
  const [notifyStakeholders, setNotifyStakeholders] = useState(true)
  const [urgencyLevel, setUrgencyLevel] = useState("normal")
  const [followUpDate, setFollowUpDate] = useState("")
  const [assignedOfficer, setAssignedOfficer] = useState("")
  const [officers, setOfficers] = useState<{ id: string; name: string; unit: string; badge: string }[]>([])
  const [isLoadingOfficers, setIsLoadingOfficers] = useState(true)

  // Fetch real officers from database
  useEffect(() => {
    const fetchOfficers = async () => {
      try {
        setIsLoadingOfficers(true)
        console.log('🔄 Fetching PNP officers for status update modal...')
        
        const { data, error } = await supabase
          .from('pnp_officer_profiles')
          .select(`
            id, 
            firebase_uid, 
            full_name, 
            badge_number,
            unit_id,
            pnp_units (
              id,
              unit_name
            )
          `)
          .order('full_name')
        
        if (error) {
          console.error('❌ Error fetching officers:', error)
          return
        }
        
        const formattedOfficers = data?.map(officer => ({
          id: officer.firebase_uid,
          name: officer.full_name,
          unit: officer.pnp_units?.unit_name || 'No Unit Assigned',
          badge: officer.badge_number
        })) || []
        
        setOfficers(formattedOfficers)
        console.log('✅ Officers loaded:', formattedOfficers.length)
      } catch (error) {
        console.error('❌ Error fetching officers:', error)
      } finally {
        setIsLoadingOfficers(false)
      }
    }
    
    if (isOpen) {
      fetchOfficers()
    }
  }, [isOpen])

  if (!isOpen || !caseData) return null

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
      value: "Requires More Info",
      label: "Requires More Info",
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

  const updateTemplates = [
    {
      title: "Initial Contact Made",
      content:
        "Successfully contacted the complainant. Gathered additional details about the incident. Proceeding with evidence collection.",
    },
    {
      title: "Evidence Collected",
      content:
        "All relevant digital evidence has been secured and documented. Chain of custody established. Ready for technical analysis.",
    },
    {
      title: "Investigation Complete",
      content:
        "Investigation concluded. All evidence analyzed and documented. Preparing final report and recommendations.",
    },
    {
      title: "Case Resolved",
      content:
        "Case successfully resolved. Suspect identified and appropriate action taken. Complainant notified of outcome.",
    },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      console.log('🔄 Submitting status update...')
      
      // Create update data object
      const updateData = {
        status: selectedStatus,
        notes: updateNotes,
        notifyStakeholders,
        urgencyLevel,
        followUpDate,
        assignedOfficer,
        timestamp: new Date().toISOString(),
      }
      
      // Call the parent's status update handler
      await onStatusUpdate(selectedStatus, updateData)
      
      console.log('✅ Status update submitted successfully')
      onClose()
    } catch (error) {
      console.error('❌ Error submitting status update:', error)
      // TODO: Show error toast to user
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
          <Button variant="ghost" size="sm" onClick={onClose} className="absolute right-4 top-4 h-8 w-8 p-0 hover:bg-lawbot-red-50 dark:hover:bg-lawbot-red-900/20 hover:text-lawbot-red-600">
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
            {/* Current Status */}
            <div className="bg-gradient-to-r from-lawbot-blue-50 to-lawbot-emerald-50 dark:from-lawbot-blue-900/20 dark:to-lawbot-emerald-900/20 p-6 rounded-xl border border-lawbot-blue-200 dark:border-lawbot-blue-800 animate-fade-in-up">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400 font-medium mb-2">📊 Current Status</p>
                  <div className="flex items-center space-x-3 mt-1">
                    {(() => {
                      const StatusIcon = getStatusIcon(caseData.status)
                      return <StatusIcon className="h-5 w-5 text-lawbot-blue-500" />
                    })()}
                    <span className="font-bold text-lawbot-slate-900 dark:text-white text-lg">{caseData.status}</span>
                  </div>
                </div>
                <Badge className={`${getStatusColor(caseData.status)} text-white px-4 py-2 text-sm font-medium`}>{caseData.status}</Badge>
              </div>
            </div>

            {/* New Status Selection */}
            <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-lawbot-emerald-500 rounded-lg">
                  <Edit className="h-5 w-5 text-white" />
                </div>
                <Label className="text-lg font-bold text-lawbot-slate-900 dark:text-white">🔄 Select New Status</Label>
              </div>
              <RadioGroup value={selectedStatus} onValueChange={setSelectedStatus}>
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
                <div className="p-4 bg-gradient-to-r from-lawbot-purple-50 to-lawbot-blue-50 dark:from-lawbot-purple-900/20 dark:to-lawbot-blue-900/20 rounded-xl border border-lawbot-purple-200 dark:border-lawbot-purple-800">
                  <Label className="text-sm font-semibold text-lawbot-purple-700 dark:text-lawbot-purple-300 mb-3 block">⚡ Quick Templates</Label>
                  <div className="flex flex-wrap gap-3">
                    {updateTemplates.map((template, index) => (
                      <Button
                        key={index}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="btn-modern border-lawbot-purple-300 text-lawbot-purple-600 hover:bg-lawbot-purple-50 dark:hover:bg-lawbot-purple-900/20 font-medium"
                        onClick={() => setUpdateNotes(template.content)}
                      >
                        {template.title}
                      </Button>
                    ))}
                  </div>
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
                  <Label htmlFor="assignedOfficer" className="text-base font-bold text-lawbot-slate-900 dark:text-white">
                    👮 Assign to Officer
                  </Label>
                </div>
                <Select value={assignedOfficer} onValueChange={setAssignedOfficer}>
                  <SelectTrigger className="border-lawbot-slate-300 dark:border-lawbot-slate-600 focus:border-lawbot-blue-500 rounded-xl">
                    <SelectValue placeholder="Select officer" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingOfficers ? (
                      <SelectItem value="loading" disabled>
                        Loading officers...
                      </SelectItem>
                    ) : officers.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No officers available
                      </SelectItem>
                    ) : (
                      officers.map((officer) => (
                        <SelectItem key={officer.id} value={officer.id}>
                          {officer.name} - {officer.unit}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
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
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-lawbot-slate-400" />
                <Input
                  id="followUpDate"
                  type="datetime-local"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="pl-12 border-lawbot-slate-300 dark:border-lawbot-slate-600 focus:border-lawbot-blue-500 rounded-xl h-12"
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

            {/* Resolution Checklist (for resolved status) */}
            {selectedStatus === "Resolved" && (
              <div className="space-y-4 p-6 bg-gradient-to-r from-lawbot-emerald-50 to-lawbot-green-50 dark:from-lawbot-emerald-900/20 dark:to-lawbot-green-900/20 rounded-xl border border-lawbot-emerald-200 dark:border-lawbot-emerald-800 animate-fade-in-up">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-lawbot-emerald-500 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <Label className="text-lg font-bold text-lawbot-emerald-800 dark:text-lawbot-emerald-200">✅ Resolution Checklist</Label>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-white dark:bg-lawbot-slate-700 rounded-lg border border-lawbot-emerald-200 dark:border-lawbot-emerald-700">
                    <Checkbox id="evidenceSecured" className="border-lawbot-emerald-300 text-lawbot-emerald-600" />
                    <Label htmlFor="evidenceSecured" className="text-sm font-medium text-lawbot-slate-900 dark:text-white">
                      🔒 All evidence properly secured and documented
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white dark:bg-lawbot-slate-700 rounded-lg border border-lawbot-emerald-200 dark:border-lawbot-emerald-700">
                    <Checkbox id="complainantNotified" className="border-lawbot-emerald-300 text-lawbot-emerald-600" />
                    <Label htmlFor="complainantNotified" className="text-sm font-medium text-lawbot-slate-900 dark:text-white">
                      📞 Complainant notified of resolution
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white dark:bg-lawbot-slate-700 rounded-lg border border-lawbot-emerald-200 dark:border-lawbot-emerald-700">
                    <Checkbox id="reportCompleted" className="border-lawbot-emerald-300 text-lawbot-emerald-600" />
                    <Label htmlFor="reportCompleted" className="text-sm font-medium text-lawbot-slate-900 dark:text-white">
                      📋 Final investigation report completed
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white dark:bg-lawbot-slate-700 rounded-lg border border-lawbot-emerald-200 dark:border-lawbot-emerald-700">
                    <Checkbox id="supervisorApproval" className="border-lawbot-emerald-300 text-lawbot-emerald-600" />
                    <Label htmlFor="supervisorApproval" className="text-sm font-medium text-lawbot-slate-900 dark:text-white">
                      👨‍💼 Supervisor approval obtained
                    </Label>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-lawbot-slate-200 dark:border-lawbot-slate-700 animate-fade-in-up" style={{ animationDelay: '1200ms' }}>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="btn-modern border-lawbot-slate-300 text-lawbot-slate-600 hover:bg-lawbot-slate-50 dark:hover:bg-lawbot-slate-800 px-6 py-3"
              >
                ❌ Cancel
              </Button>
              <Button 
                type="submit" 
                className="btn-gradient bg-gradient-to-r from-lawbot-blue-600 to-lawbot-emerald-600 hover:from-lawbot-blue-700 hover:to-lawbot-emerald-700 text-white px-8 py-3 font-semibold"
              >
                <Send className="mr-2 h-5 w-5" />
                📝 Update Status
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}
