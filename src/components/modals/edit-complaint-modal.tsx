"use client"
import { useState, useEffect } from "react"
import {
  X,
  Save,
  AlertCircle,
  FileText,
  DollarSign,
  User,
  MapPin,
  Globe,
  Shield,
  Info,
  CheckCircle,
  History,
  Brain,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import ComplaintService from "@/lib/complaint-service"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/AuthContext"

interface EditComplaintModalProps {
  isOpen: boolean
  onClose: () => void
  caseData: any
  onUpdate?: () => void
}

interface FieldChange {
  field: string
  oldValue: any
  newValue: any
}

export function EditComplaintModal({ isOpen, onClose, caseData, onUpdate }: EditComplaintModalProps) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [originalData, setOriginalData] = useState<any>({})
  const [modifiedFields, setModifiedFields] = useState<Set<string>>(new Set())
  const [updateHistory, setUpdateHistory] = useState<any[]>([])
  const [updateReason, setUpdateReason] = useState("")
  const [activeTab, setActiveTab] = useState("basic")

  // Dynamic fields based on crime type
  const crimeTypeFields: Record<string, string[]> = {
    financial: ["platform_website", "account_reference", "estimated_loss"],
    harassment: ["suspect_name", "suspect_relationship", "suspect_contact", "suspect_details"],
    technical: ["system_details", "technical_info", "vulnerability_details", "attack_vector"],
    general: ["incident_location", "content_description", "impact_assessment"]
  }

  useEffect(() => {
    if (isOpen && caseData) {
      const complaint = caseData.complaintDetails || caseData
      
      // Initialize form data with current values
      const initialData = {
        title: complaint.title || "",
        description: complaint.description || "",
        incident_location: complaint.incident_location || "",
        estimated_loss: complaint.estimated_loss || "",
        platform_website: complaint.platform_website || "",
        account_reference: complaint.account_reference || "",
        suspect_name: complaint.suspect_name || "",
        suspect_relationship: complaint.suspect_relationship || "",
        suspect_contact: complaint.suspect_contact || "",
        suspect_details: complaint.suspect_details || "",
        system_details: complaint.system_details || "",
        technical_info: complaint.technical_info || "",
        vulnerability_details: complaint.vulnerability_details || "",
        attack_vector: complaint.attack_vector || "",
        security_level: complaint.security_level || "",
        target_info: complaint.target_info || "",
        impact_assessment: complaint.impact_assessment || "",
        content_description: complaint.content_description || "",
      }
      
      setFormData(initialData)
      setOriginalData(initialData)
      setModifiedFields(new Set())
      
      // Load update history
      fetchUpdateHistory(complaint.id)
    }
  }, [isOpen, caseData])

  const fetchUpdateHistory = async (complaintId: string) => {
    try {
      const history = await ComplaintService.getComplaintUpdateHistory(complaintId)
      setUpdateHistory(history)
    } catch (error) {
      console.error("Error fetching update history:", error)
    }
  }

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
    
    // Track modified fields
    const newModifiedFields = new Set(modifiedFields)
    if (value !== originalData[field]) {
      newModifiedFields.add(field)
    } else {
      newModifiedFields.delete(field)
    }
    setModifiedFields(newModifiedFields)
  }

  const getFieldChanges = (): FieldChange[] => {
    const changes: FieldChange[] = []
    modifiedFields.forEach(field => {
      changes.push({
        field,
        oldValue: originalData[field],
        newValue: formData[field]
      })
    })
    return changes
  }

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to update complaints.",
        variant: "destructive"
      })
      return
    }

    if (modifiedFields.size === 0) {
      toast({
        title: "No Changes",
        description: "No fields have been modified.",
        variant: "default"
      })
      return
    }

    if (!updateReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for the update.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    
    try {
      const complaint = caseData.complaintDetails || caseData
      const updates: Record<string, any> = {}
      
      // Collect only modified fields
      modifiedFields.forEach(field => {
        updates[field] = formData[field]
      })

      await ComplaintService.updateComplaint(
        complaint.id, 
        {
          updates,
          updateReason,
          updateType: "officer_update",
          requiresApproval: true
        },
        user.uid  // Pass Firebase UID
      )

      toast({
        title: "Success",
        description: "Complaint updated successfully. AI re-assessment will be triggered.",
        variant: "default"
      })

      if (onUpdate) {
        onUpdate()
      }
      
      onClose()
    } catch (error) {
      console.error("Error updating complaint:", error)
      toast({
        title: "Error",
        description: "Failed to update complaint. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  const complaint = caseData?.complaintDetails || caseData || {}
  const changes = getFieldChanges()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-2xl font-bold">Edit Complaint Information</CardTitle>
            <CardDescription>
              Update complaint details for case {complaint.complaint_number}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        
        <CardContent className="overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Status Check */}
          {complaint.status !== "Requires More Information" && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This complaint can only be edited when its status is "Requires More Information".
                Current status: <strong>{complaint.status}</strong>
              </AlertDescription>
            </Alert>
          )}

          {/* Modified Fields Indicator */}
          {changes.length > 0 && (
            <Alert className="mb-4 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-700 dark:text-blue-300">
                <strong>{changes.length} field{changes.length > 1 ? 's' : ''} modified</strong>
                <div className="mt-2 space-y-1">
                  {changes.map((change, index) => (
                    <div key={index} className="text-sm">
                      • {formatFieldName(change.field)}: 
                      <span className="line-through text-gray-500 mx-1">{change.oldValue || "(empty)"}</span>
                      →
                      <span className="font-medium mx-1">{change.newValue || "(empty)"}</span>
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="dynamic">Additional Fields</TabsTrigger>
              <TabsTrigger value="history">Update History</TabsTrigger>
              <TabsTrigger value="ai">AI Analysis</TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleFieldChange("title", e.target.value)}
                  disabled={complaint.status !== "Requires More Information"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleFieldChange("description", e.target.value)}
                  rows={5}
                  disabled={complaint.status !== "Requires More Information"}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="incident_location">Incident Location</Label>
                  <Input
                    id="incident_location"
                    value={formData.incident_location}
                    onChange={(e) => handleFieldChange("incident_location", e.target.value)}
                    disabled={complaint.status !== "Requires More Information"}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimated_loss">Estimated Loss (₱)</Label>
                  <Input
                    id="estimated_loss"
                    type="number"
                    value={formData.estimated_loss}
                    onChange={(e) => handleFieldChange("estimated_loss", e.target.value)}
                    disabled={complaint.status !== "Requires More Information"}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Dynamic Fields Tab */}
            <TabsContent value="dynamic" className="space-y-4 mt-4">
              <div className="space-y-4">
                {/* Platform/Website Information */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Platform Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="platform_website">Platform/Website</Label>
                      <Input
                        id="platform_website"
                        value={formData.platform_website}
                        onChange={(e) => handleFieldChange("platform_website", e.target.value)}
                        disabled={complaint.status !== "Requires More Information"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="account_reference">Account Reference</Label>
                      <Input
                        id="account_reference"
                        value={formData.account_reference}
                        onChange={(e) => handleFieldChange("account_reference", e.target.value)}
                        disabled={complaint.status !== "Requires More Information"}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Suspect Information */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Suspect Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="suspect_name">Suspect Name</Label>
                        <Input
                          id="suspect_name"
                          value={formData.suspect_name}
                          onChange={(e) => handleFieldChange("suspect_name", e.target.value)}
                          disabled={complaint.status !== "Requires More Information"}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="suspect_relationship">Relationship</Label>
                        <Input
                          id="suspect_relationship"
                          value={formData.suspect_relationship}
                          onChange={(e) => handleFieldChange("suspect_relationship", e.target.value)}
                          disabled={complaint.status !== "Requires More Information"}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="suspect_contact">Contact Information</Label>
                      <Input
                        id="suspect_contact"
                        value={formData.suspect_contact}
                        onChange={(e) => handleFieldChange("suspect_contact", e.target.value)}
                        disabled={complaint.status !== "Requires More Information"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="suspect_details">Additional Details</Label>
                      <Textarea
                        id="suspect_details"
                        value={formData.suspect_details}
                        onChange={(e) => handleFieldChange("suspect_details", e.target.value)}
                        rows={3}
                        disabled={complaint.status !== "Requires More Information"}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Technical Information */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Technical Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="technical_info">Technical Details</Label>
                      <Textarea
                        id="technical_info"
                        value={formData.technical_info}
                        onChange={(e) => handleFieldChange("technical_info", e.target.value)}
                        rows={3}
                        disabled={complaint.status !== "Requires More Information"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vulnerability_details">Vulnerability Details</Label>
                      <Textarea
                        id="vulnerability_details"
                        value={formData.vulnerability_details}
                        onChange={(e) => handleFieldChange("vulnerability_details", e.target.value)}
                        rows={3}
                        disabled={complaint.status !== "Requires More Information"}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Update History Tab */}
            <TabsContent value="history" className="mt-4">
              <div className="space-y-4">
                {updateHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No update history available
                  </div>
                ) : (
                  updateHistory.map((update, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant={update.update_type === "citizen_update" ? "default" : "secondary"}>
                                {update.update_type === "citizen_update" ? "Citizen" : "Officer"}
                              </Badge>
                              <span className="text-sm font-medium">{update.updater_name}</span>
                            </div>
                            <p className="text-sm text-gray-500">
                              {new Date(update.created_at).toLocaleString()}
                            </p>
                          </div>
                          {update.ai_reassessment_completed && (
                            <Badge variant="outline" className="gap-1">
                              <Brain className="h-3 w-3" />
                              AI Reassessed
                            </Badge>
                          )}
                        </div>
                        <Separator className="my-3" />
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Fields Updated:</p>
                          <div className="flex flex-wrap gap-2">
                            {update.fields_updated.map((field: string, i: number) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {formatFieldName(field)}
                              </Badge>
                            ))}
                          </div>
                          {update.update_reason && (
                            <p className="text-sm text-gray-600 mt-2">
                              <strong>Reason:</strong> {update.update_reason}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* AI Analysis Tab */}
            <TabsContent value="ai" className="mt-4">
              <Alert className="mb-4">
                <Brain className="h-4 w-4" />
                <AlertDescription>
                  After saving your changes, the AI will automatically re-assess this complaint
                  based on the updated information. This may affect the priority and risk scores.
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Current AI Assessment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>AI Priority</Label>
                      <p className="text-lg font-semibold">{complaint.ai_priority || "Not assessed"}</p>
                    </div>
                    <div>
                      <Label>Risk Score</Label>
                      <p className="text-lg font-semibold">{complaint.ai_risk_score || 0}%</p>
                    </div>
                  </div>
                  {complaint.ai_reasoning && (
                    <div>
                      <Label>AI Reasoning</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {complaint.ai_reasoning}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Update Reason */}
          {complaint.status === "Requires More Information" && (
            <div className="mt-6 space-y-2">
              <Label htmlFor="updateReason">Reason for Update *</Label>
              <Textarea
                id="updateReason"
                value={updateReason}
                onChange={(e) => setUpdateReason(e.target.value)}
                placeholder="Explain why these changes are being made..."
                rows={3}
                required
              />
            </div>
          )}
        </CardContent>

        <div className="flex items-center justify-between p-6 border-t">
          <div className="text-sm text-gray-500">
            {changes.length > 0 && (
              <span>{changes.length} field{changes.length > 1 ? 's' : ''} will be updated</span>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading || changes.length === 0 || complaint.status !== "Requires More Information"}
              className="min-w-[100px]"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

function formatFieldName(field: string): string {
  return field
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}