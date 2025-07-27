"use client"

import type React from "react"

import { useState } from "react"
import { X, CheckCircle, Clock, AlertTriangle, FileText, Send, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

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

  const officers = [
    "Maria Santos - Cyber Crime Investigation Cell",
    "John Rodriguez - Economic Offenses Wing",
    "Ana Reyes - Special Investigation Team",
    "Carlos Mendoza - Cyber Security Division",
    "Lisa Garcia - Advanced Cyber Forensics Unit",
    "Roberto Cruz - Cyber Crime Technical Unit",
    "Diana Lopez - Cyber Crime Against Women and Children",
    "Miguel Torres - Critical Infrastructure Protection Unit",
    "Sofia Reyes - National Security Cyber Division",
    "Eduardo Santos - Special Cyber Operations Unit",
  ]

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const updateData = {
      status: selectedStatus,
      notes: updateNotes,
      notifyStakeholders,
      urgencyLevel,
      followUpDate,
      assignedOfficer,
      timestamp: new Date().toISOString(),
    }
    onStatusUpdate(selectedStatus, updateData)
    onClose()
  }

  const getStatusIcon = (status: string) => {
    const statusOption = statusOptions.find((opt) => opt.value === status)
    return statusOption ? statusOption.icon : Clock
  }

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find((opt) => opt.value === status)
    return statusOption ? statusOption.color : "bg-gray-500"
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden bg-white dark:bg-slate-800 shadow-2xl">
        <CardHeader className="relative border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <Button variant="ghost" size="sm" onClick={onClose} className="absolute right-4 top-4 h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Update Case Status</CardTitle>
          <CardDescription>
            Case #{caseData.id} - {caseData.title}
          </CardDescription>
        </CardHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Current Status */}
            <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Current Status</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {(() => {
                      const StatusIcon = getStatusIcon(caseData.status)
                      return <StatusIcon className="h-4 w-4" />
                    })()}
                    <span className="font-medium">{caseData.status}</span>
                  </div>
                </div>
                <Badge className={`${getStatusColor(caseData.status)} text-white`}>{caseData.status}</Badge>
              </div>
            </div>

            {/* New Status Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Select New Status</Label>
              <RadioGroup value={selectedStatus} onValueChange={setSelectedStatus}>
                <div className="grid gap-3">
                  {statusOptions.map((status) => (
                    <div
                      key={status.value}
                      className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700"
                    >
                      <RadioGroupItem value={status.value} id={status.value} />
                      <div className="flex items-center space-x-3 flex-1">
                        <div className={`p-2 rounded-full ${status.color} text-white`}>
                          <status.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <Label htmlFor={status.value} className="font-medium cursor-pointer">
                            {status.label}
                          </Label>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{status.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Update Notes */}
            <div className="space-y-3">
              <Label htmlFor="updateNotes" className="text-base font-medium">
                Update Notes
              </Label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {updateTemplates.map((template, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setUpdateNotes(template.content)}
                    >
                      {template.title}
                    </Button>
                  ))}
                </div>
                <Textarea
                  id="updateNotes"
                  placeholder="Enter detailed notes about this status update..."
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                  rows={4}
                  required
                />
              </div>
            </div>

            {/* Additional Options */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-base font-medium">Urgency Level</Label>
                <Select value={urgencyLevel} onValueChange={setUrgencyLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select urgency level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Routine update</SelectItem>
                    <SelectItem value="normal">Normal - Standard priority</SelectItem>
                    <SelectItem value="high">High - Requires attention</SelectItem>
                    <SelectItem value="urgent">Urgent - Immediate action needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="assignedOfficer" className="text-base font-medium">
                  Assign to Officer
                </Label>
                <Select value={assignedOfficer} onValueChange={setAssignedOfficer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select officer" />
                  </SelectTrigger>
                  <SelectContent>
                    {officers.map((officer) => (
                      <SelectItem key={officer} value={officer}>
                        {officer}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Follow-up Date */}
            <div className="space-y-3">
              <Label htmlFor="followUpDate" className="text-base font-medium">
                Follow-up Date (Optional)
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="followUpDate"
                  type="datetime-local"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Notification Options */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Notification Settings</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notifyStakeholders"
                    checked={notifyStakeholders}
                    onCheckedChange={setNotifyStakeholders}
                  />
                  <Label htmlFor="notifyStakeholders" className="text-sm">
                    Notify all stakeholders (complainant, supervisors, assigned officers)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="emailNotification" defaultChecked />
                  <Label htmlFor="emailNotification" className="text-sm">
                    Send email notifications
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="smsNotification" />
                  <Label htmlFor="smsNotification" className="text-sm">
                    Send SMS notifications (urgent cases only)
                  </Label>
                </div>
              </div>
            </div>

            {/* Resolution Checklist (for resolved status) */}
            {selectedStatus === "Resolved" && (
              <div className="space-y-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <Label className="text-base font-medium text-green-800 dark:text-green-200">Resolution Checklist</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="evidenceSecured" />
                    <Label htmlFor="evidenceSecured" className="text-sm">
                      All evidence properly secured and documented
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="complainantNotified" />
                    <Label htmlFor="complainantNotified" className="text-sm">
                      Complainant notified of resolution
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="reportCompleted" />
                    <Label htmlFor="reportCompleted" className="text-sm">
                      Final investigation report completed
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="supervisorApproval" />
                    <Label htmlFor="supervisorApproval" className="text-sm">
                      Supervisor approval obtained
                    </Label>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Send className="mr-2 h-4 w-4" />
                Update Status
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}
