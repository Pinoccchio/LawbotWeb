"use client"

import { useState, useEffect } from "react"
import { X, User, Shield, Activity, AlertCircle, CheckCircle, Search, Info, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import OfficerAssignmentService, { AvailableOfficer } from "@/lib/officer-assignment-service"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "@/components/ui/use-toast"
import { PhilippineTime } from "@/lib/philippine-time"

interface AssignOfficerModalProps {
  isOpen: boolean
  onClose: () => void
  caseData: any
  onAssignmentComplete?: () => void
  isReassignment?: boolean
}

export function AssignOfficerModal({ 
  isOpen, 
  onClose, 
  caseData, 
  onAssignmentComplete,
  isReassignment = false 
}: AssignOfficerModalProps) {
  const { user } = useAuth()
  const [availableOfficers, setAvailableOfficers] = useState<AvailableOfficer[]>([])
  const [filteredOfficers, setFilteredOfficers] = useState<AvailableOfficer[]>([])
  const [selectedOfficer, setSelectedOfficer] = useState<string>("")
  const [assignmentNotes, setAssignmentNotes] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggestedOfficer, setSuggestedOfficer] = useState<AvailableOfficer | null>(null)

  useEffect(() => {
    if (isOpen && caseData) {
      fetchAvailableOfficers()
    }
  }, [isOpen, caseData])

  useEffect(() => {
    // Filter officers based on search term
    const filtered = availableOfficers.filter(officer => 
      officer.officer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      officer.badge_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      officer.rank.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredOfficers(filtered)
  }, [searchTerm, availableOfficers])

  const fetchAvailableOfficers = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Get available officers for the unit or crime type
      const officers = await OfficerAssignmentService.getAvailableOfficersForAssignment(
        caseData.unit_id,
        caseData.crime_type
      )
      
      setAvailableOfficers(officers)
      setFilteredOfficers(officers)
      
      // Get suggested officer if available
      if (caseData.unit_id) {
        const suggested = await OfficerAssignmentService.getSuggestedOfficer(
          caseData.unit_id,
          caseData.crime_type
        )
        setSuggestedOfficer(suggested)
        
        // Auto-select suggested officer if it's the only good option
        if (suggested && officers.filter(o => o.workload_level === 'low').length === 1) {
          setSelectedOfficer(suggested.officer_id)
        }
      }
      
      console.log(`✅ Loaded ${officers.length} available officers`)
    } catch (err: any) {
      console.error('❌ Error loading officers:', err)
      setError('Failed to load available officers')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssignment = async () => {
    if (!selectedOfficer) {
      setError('Please select an officer')
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      const adminId = user?.uid || 'admin_id' // Get actual admin ID from auth
      
      let result
      if (isReassignment) {
        result = await OfficerAssignmentService.reassignCase(
          caseData.id,
          selectedOfficer,
          adminId,
          assignmentNotes || 'Reassigned by administrator'
        )
      } else {
        result = await OfficerAssignmentService.assignOfficerToCase(
          caseData.id,
          selectedOfficer,
          adminId,
          assignmentNotes
        )
      }
      
      if (result.success) {
        toast({
          title: isReassignment ? "Case Reassigned" : "Officer Assigned",
          description: `Case has been assigned to ${result.officer_name}`,
        })
        
        // Reset form
        setSelectedOfficer("")
        setAssignmentNotes("")
        setSearchTerm("")
        
        // Notify parent component
        if (onAssignmentComplete) {
          onAssignmentComplete()
        }
        
        onClose()
      } else {
        setError(result.error || 'Assignment failed')
      }
    } catch (err: any) {
      console.error('❌ Assignment error:', err)
      setError('Failed to assign officer')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getWorkloadColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'high': return 'text-orange-600 bg-orange-50'
      case 'overloaded': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500'
      case 'busy': return 'bg-yellow-500'
      case 'overloaded': return 'bg-red-500'
      case 'unavailable': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-lawbot-slate-800 rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-lawbot-blue-600 to-lawbot-purple-600 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Shield className="h-6 w-6" />
                {isReassignment ? 'Reassign Case' : 'Assign Officer to Case'}
              </h2>
              <p className="mt-1 text-lawbot-blue-100">
                Select an officer to handle this case
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
          {/* Case Information */}
          <Card className="mb-6 border-lawbot-blue-200 dark:border-lawbot-blue-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-5 w-5 text-lawbot-blue-500" />
                Case Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">Case ID:</span>
                  <span className="ml-2 font-mono">{caseData.complaint_number || caseData.id}</span>
                </div>
                <div>
                  <span className="font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">Crime Type:</span>
                  <span className="ml-2">{caseData.crime_type}</span>
                </div>
                <div>
                  <span className="font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">Priority:</span>
                  <Badge className={`ml-2 ${
                    caseData.priority === 'high' ? 'bg-red-100 text-red-700' :
                    caseData.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {caseData.priority}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">Unit:</span>
                  <span className="ml-2">{caseData.assigned_unit || 'Unassigned'}</span>
                </div>
                {caseData.assigned_officer && isReassignment && (
                  <div className="col-span-2">
                    <span className="font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">Current Officer:</span>
                    <span className="ml-2 text-lawbot-red-600">{caseData.assigned_officer}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lawbot-slate-400 h-4 w-4" />
              <Input
                placeholder="Search officers by name, badge, or rank..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Suggested Officer */}
          {suggestedOfficer && (
            <Alert className="mb-4 border-lawbot-blue-200 bg-lawbot-blue-50 dark:bg-lawbot-blue-900/20">
              <AlertCircle className="h-4 w-4 text-lawbot-blue-600" />
              <AlertDescription>
                <strong>Suggested:</strong> {suggestedOfficer.officer_name} ({suggestedOfficer.badge_number}) 
                - {suggestedOfficer.active_cases} active cases, {suggestedOfficer.workload_level} workload
              </AlertDescription>
            </Alert>
          )}

          {/* Officer List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lawbot-blue-500"></div>
              <span className="ml-3 text-lawbot-slate-600">Loading available officers...</span>
            </div>
          ) : error ? (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          ) : filteredOfficers.length === 0 ? (
            <div className="text-center py-12 text-lawbot-slate-600 dark:text-lawbot-slate-400">
              No officers available for assignment
            </div>
          ) : (
            <RadioGroup value={selectedOfficer} onValueChange={setSelectedOfficer}>
              <div className="space-y-3">
                {filteredOfficers.map((officer) => (
                  <label
                    key={officer.officer_id}
                    htmlFor={officer.officer_id}
                    className={`block p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedOfficer === officer.officer_id
                        ? 'border-lawbot-blue-500 bg-lawbot-blue-50 dark:bg-lawbot-blue-900/20'
                        : 'border-lawbot-slate-200 dark:border-lawbot-slate-700 hover:border-lawbot-blue-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value={officer.officer_id} id={officer.officer_id} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="font-semibold text-lawbot-slate-900 dark:text-white">
                              {officer.officer_name}
                            </span>
                            <Badge className="ml-2 text-xs">{officer.rank}</Badge>
                            <span className="ml-2 text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400">
                              Badge: {officer.badge_number}
                            </span>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${getAvailabilityColor(officer.availability_status)}`} 
                               title={officer.availability_status} />
                        </div>
                        
                        <div className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400 mb-2">
                          Unit: {officer.unit_name}
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Activity className="h-4 w-4 text-lawbot-slate-400" />
                            <span className="text-sm">
                              <strong>{officer.active_cases}</strong> active cases
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-lawbot-slate-400" />
                            <span className="text-sm">
                              <strong>{officer.total_cases}</strong> total
                            </span>
                          </div>
                          <Badge className={`text-xs ${getWorkloadColor(officer.workload_level)}`}>
                            {officer.workload_level} workload
                          </Badge>
                        </div>
                        
                        {officer.last_assignment && (
                          <div className="text-xs text-lawbot-slate-500 mt-1">
                            Last assigned: {PhilippineTime.formatRelativeTime(officer.last_assignment)}
                          </div>
                        )}
                        
                        {/* Workload indicator bar */}
                        <div className="mt-2">
                          <Progress 
                            value={Math.min((Number(officer.active_cases) / 15) * 100, 100)} 
                            max={100}
                            className="h-1"
                          />
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </RadioGroup>
          )}

          {/* Assignment Notes */}
          {selectedOfficer && (
            <div className="mt-6">
              <Label htmlFor="notes">Assignment Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder={isReassignment ? "Reason for reassignment..." : "Additional notes about this assignment..."}
                value={assignmentNotes}
                onChange={(e) => setAssignmentNotes(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-lawbot-slate-800 border-t border-lawbot-slate-200 dark:border-lawbot-slate-700 p-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400">
              {filteredOfficers.length} officers available
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssignment}
                disabled={!selectedOfficer || isSubmitting}
                className="bg-gradient-to-r from-lawbot-blue-600 to-lawbot-purple-600 text-white"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Assigning...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {isReassignment ? 'Reassign Case' : 'Assign Officer'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}