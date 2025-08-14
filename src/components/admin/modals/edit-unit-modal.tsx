"use client"

import React, { useState, useEffect } from "react"
import { X, Shield, Target, Building, MapPin, Hash, MessageCircle, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import PSGCApiService, { SimplifiedRegion } from "@/lib/psgc-api"
import PNPUnitsService, { PNPUnit } from "@/lib/pnp-units-service"

interface EditUnitModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  unit: PNPUnit | null
}

export function EditUnitModal({ isOpen, onClose, onSuccess, unit }: EditUnitModalProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  
  // Fixed region value - defined at component level for global access
  const fixedRegion = "Philippine National Police No. 3, Santolan Road, Brgy. Corazon de Jesus, San Juan City, Metro Manila 1500, Philippines"
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [regions, setRegions] = useState<SimplifiedRegion[]>([])
  const [isLoadingRegions, setIsLoadingRegions] = useState(false)
  
  const [unitForm, setUnitForm] = useState({
    unitName: "",
    category: "",
    unitCode: "",
    description: "",
    region: "",
    maxOfficers: "",
    primaryCrimeTypes: [] as string[],
    status: "active" as "active" | "inactive" | "disbanded"
  })

  // Populate form when unit data changes
  useEffect(() => {
    if (unit && isOpen) {
      setUnitForm({
        unitName: unit.unit_name || "",
        category: unit.category || "",
        unitCode: unit.unit_code || "",
        description: unit.description || "",
        region: fixedRegion, // Always use our fixed value instead of unit.region
        maxOfficers: unit.max_officers ? String(unit.max_officers) : "",
        primaryCrimeTypes: unit.crime_types || [],
        status: unit.status || "active"
      })
      console.log('✅ Populated edit form with fixed region:', fixedRegion)
    }
  }, [unit, isOpen])

  // Set default values when modal opens
  useEffect(() => {
    if (isOpen) {
      // No need to fetch regions anymore - using fixed value
      // fetchRegions()
      console.log('✅ Modal opened with fixed region value:', fixedRegion)
    }
  }, [isOpen])

  const fetchRegions = async () => {
    setIsLoadingRegions(true)
    try {
      // Use PSGC Cloud API as default with fallback to other sources
      const fetchedRegions = await PSGCApiService.getRegions('cloud')
      setRegions(fetchedRegions)
      console.log(`✅ Loaded ${fetchedRegions.length} regions using PSGC Cloud API`)
    } catch (error) {
      console.error('Error fetching regions from PSGC Cloud API:', error)
      console.log('🔄 Attempting fallback to other API sources...')
      
      try {
        // Fallback to auto mode (tries all APIs)
        const fallbackRegions = await PSGCApiService.getRegions('auto')
        setRegions(fallbackRegions)
        console.log(`✅ Loaded ${fallbackRegions.length} regions using fallback API sources`)
      } catch (fallbackError) {
        console.error('All API sources failed:', fallbackError)
        // Regions state will remain empty, and we'll show an error message
      }
    } finally {
      setIsLoadingRegions(false)
    }
  }

  if (!isOpen || !unit) return null

  const handleClose = () => {
    setSuccessMessage('')
    setErrors({})
    setUnitForm({
      unitName: "",
      category: "",
      unitCode: "",
      description: "",
      region: "",
      maxOfficers: "",
      primaryCrimeTypes: [],
      status: "active"
    })
    onClose()
  }

  const handleUpdateUnit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsLoading(true)
    
    try {
      // Validate required fields
      const newErrors: { [key: string]: string } = {}
      
      if (!unitForm.unitName.trim()) newErrors.unitName = 'Unit name is required'
      if (!unitForm.category) newErrors.category = 'Category is required'
      if (!unitForm.unitCode.trim()) newErrors.unitCode = 'Unit code is required'
      if (!unitForm.description.trim()) newErrors.description = 'Description is required'
      if (!unitForm.region) newErrors.region = 'Region is required'
      if (!unitForm.maxOfficers.trim()) newErrors.maxOfficers = 'Maximum officers is required'
      if (!unitForm.status) newErrors.status = 'Status is required'
      if (unitForm.primaryCrimeTypes.length === 0) newErrors.primaryCrimeTypes = 'At least one crime type is required'
      
      // Unit code validation (format: PCU-XXX)
      const unitCodeRegex = /^PCU-\d{3}$/
      if (unitForm.unitCode && !unitCodeRegex.test(unitForm.unitCode)) {
        newErrors.unitCode = 'Unit code must be in format: PCU-XXX (e.g., PCU-001)'
      }

      // Max officers validation (must be a number between 1-50)
      if (unitForm.maxOfficers) {
        const maxOfficers = parseInt(unitForm.maxOfficers)
        if (isNaN(maxOfficers) || maxOfficers < 1 || maxOfficers > 50) {
          newErrors.maxOfficers = 'Maximum officers must be a number between 1 and 50'
        }
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        setIsLoading(false)
        return
      }

      // Check if admin is logged in
      if (!user) {
        setErrors({ general: 'Admin authentication required. Please log in again.' })
        setIsLoading(false)
        return
      }

      // Update the unit
      try {
        await PNPUnitsService.updatePNPUnit(unit.id, {
          unit_name: unitForm.unitName,
          unit_code: unitForm.unitCode,
          category: unitForm.category,
          description: unitForm.description,
          region: fixedRegion, // Always use our fixed value for consistency
          max_officers: parseInt(unitForm.maxOfficers),
          primary_crime_types: unitForm.primaryCrimeTypes
        }, user?.uid) // Pass admin Firebase UID for consistency
        
        // Change status if needed
        if (unit.status !== unitForm.status) {
          await PNPUnitsService.changeUnitStatus(unit.id, unitForm.status)
        }
        
        // Show toast notification for success
        toast({
          title: "Unit Updated",
          description: `${unitForm.unitName} has been successfully updated`,
          variant: "success",
        })
        
        // Show success message in modal
        setSuccessMessage(`✅ PNP Unit "${unitForm.unitName}" updated successfully!`)
        
        // Notify parent component of success
        onSuccess()
        
        // Auto close after 2 seconds
        setTimeout(() => {
          setSuccessMessage('')
          handleClose()
        }, 2000)
      } catch (dbError: any) {
        console.error('Database error updating unit:', dbError)
        const errorMessage = dbError.toString().replace('Error: ', '')
        
        // Show toast notification for error
        toast({
          title: "Update Failed",
          description: errorMessage,
          variant: "destructive",
        })
        
        setErrors({ general: errorMessage })
      }
    } catch (error: any) {
      console.error('Unit update failed:', error)
      const errorMessage = error.toString().replace('Error: ', '')
      
      // Show toast notification for error
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      })
      
      setErrors({ general: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }

  const crimeCategories = [
    "Communication & Social Media Crimes",
    "Financial & Economic Crimes",
    "Data & Privacy Crimes",
    "Malware & System Attacks",
    "Harassment & Exploitation",
    "Content-Related Crimes",
    "System Disruption & Sabotage",
    "Government & Terrorism",
    "Technical Exploitation",
    "Targeted Attacks"
  ]

  const statusOptions = [
    { value: 'active', label: 'Active', icon: '✅', description: 'Unit is operational' },
    { value: 'inactive', label: 'Inactive', icon: '⚠️', description: 'Unit is temporarily inactive' },
    { value: 'disbanded', label: 'Disbanded', icon: '🚫', description: 'Unit has been disbanded' }
  ]

  // All possible crime types organized by category
  const allCrimeTypes: Record<string, string[]> = {
    "Communication & Social Media Crimes": ["Phishing", "Social Engineering", "Spam Messages", "Fake Social Media Profiles", "Online Impersonation", "Business Email Compromise", "SMS Fraud"],
    "Financial & Economic Crimes": ["Online Banking Fraud", "Credit Card Fraud", "Investment Scams", "Cryptocurrency Fraud", "Online Shopping Scams", "Payment Gateway Fraud", "Money Laundering"],
    "Data & Privacy Crimes": ["Identity Theft", "Data Breach", "Unauthorized System Access", "Corporate Espionage", "Government Data Theft", "Medical Records Theft", "Personal Information Theft"],
    "Malware & System Attacks": ["Ransomware", "Virus Attacks", "Trojan Horses", "Spyware", "Adware", "Worms", "Keyloggers", "Rootkits"],
    "Harassment & Exploitation": ["Cyberstalking", "Online Harassment", "Cyberbullying", "Revenge Porn", "Sextortion", "Online Predatory Behavior", "Doxxing"],
    "Content-Related Crimes": ["Child Sexual Abuse Material", "Illegal Content Distribution", "Copyright Infringement", "Software Piracy", "Illegal Online Gambling"],
    "System Disruption & Sabotage": ["Denial of Service Attacks", "Website Defacement", "System Sabotage", "Network Intrusion", "SQL Injection", "Cross-Site Scripting"],
    "Government & Terrorism": ["Cyberterrorism", "Cyber Warfare", "Government System Hacking", "Election Interference", "Critical Infrastructure Attacks", "Propaganda Distribution"],
    "Technical Exploitation": ["Zero-Day Exploits", "Vulnerability Exploitation", "Backdoor Creation", "Privilege Escalation", "Code Injection", "Buffer Overflow Attacks"],
    "Targeted Attacks": ["Advanced Persistent Threats", "Spear Phishing", "CEO Fraud", "Supply Chain Attacks", "Insider Threats"]
  }

  // Get crime types based on selected category
  const availableCrimeTypes = unitForm.category ? allCrimeTypes[unitForm.category] || [] : []

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-800 shadow-2xl overflow-hidden">
        <CardHeader className="relative">
          <Button variant="ghost" size="sm" onClick={handleClose} className="absolute right-2 top-2 h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 rounded-lg bg-lawbot-blue-600 bg-gradient-to-r from-lawbot-blue-500 to-lawbot-blue-600">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Edit PNP Unit</CardTitle>
              <CardDescription>
                Update specialized cybercrime investigation unit
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="w-fit">
            🛡️ {unit.unit_code} - {unit.unit_name}
          </Badge>
        </CardHeader>

        <CardContent className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <form onSubmit={handleUpdateUnit} className="space-y-4">
            {errors.general && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-red-800 dark:text-red-200 text-sm font-medium">
                  ⚠️ {errors.general}
                </p>
              </div>
            )}
            
            {successMessage && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <p className="text-green-800 dark:text-green-200 text-sm font-medium">
                  {successMessage}
                </p>
                <p className="text-green-700 dark:text-green-300 text-xs mt-1">
                  This modal will close automatically...
                </p>
              </div>
            )}
            
            {!successMessage && (
              <>
                {/* Crime Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Crime Category *</Label>
                  <Select 
                    value={unitForm.category} 
                    onValueChange={(value) => {
                      setUnitForm({ 
                        ...unitForm, 
                        category: value,
                        // Clear crime types when changing category
                        primaryCrimeTypes: []
                      })
                      if (errors.category) setErrors({ ...errors, category: '' })
                    }}
                  >
                    <SelectTrigger className={errors.category ? 'border-red-500 focus:border-red-500' : ''}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {crimeCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-red-600 text-xs mt-1">{errors.category}</p>
                  )}
                </div>
                
                {/* Unit Name */}
                <div className="space-y-2">
                  <Label htmlFor="unitName">Unit Name *</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="unitName"
                      placeholder="e.g., Advanced Cyber Forensics Unit"
                      className={`pl-10 ${errors.unitName ? 'border-red-500 focus:border-red-500' : ''}`}
                      value={unitForm.unitName}
                      onChange={(e) => {
                        setUnitForm({ ...unitForm, unitName: e.target.value })
                        if (errors.unitName) setErrors({ ...errors, unitName: '' })
                      }}
                    />
                  </div>
                  {errors.unitName && (
                    <p className="text-red-600 text-xs mt-1">{errors.unitName}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="unitCode">Unit Code *</Label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="unitCode"
                        placeholder="PCU-XXX"
                        className={`pl-10 font-mono ${errors.unitCode ? 'border-red-500 focus:border-red-500' : ''}`}
                        value={unitForm.unitCode}
                        onChange={(e) => {
                          setUnitForm({ ...unitForm, unitCode: e.target.value.toUpperCase() })
                          if (errors.unitCode) setErrors({ ...errors, unitCode: '' })
                        }}
                      />
                    </div>
                    {errors.unitCode && (
                      <p className="text-red-600 text-xs mt-1">{errors.unitCode}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxOfficers">Maximum Officers *</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="maxOfficers"
                        type="number"
                        min="1"
                        max="50"
                        placeholder="10"
                        className={`pl-10 ${errors.maxOfficers ? 'border-red-500 focus:border-red-500' : ''}`}
                        value={unitForm.maxOfficers}
                        onChange={(e) => {
                          setUnitForm({ ...unitForm, maxOfficers: e.target.value })
                          if (errors.maxOfficers) setErrors({ ...errors, maxOfficers: '' })
                        }}
                      />
                    </div>
                    {errors.maxOfficers && (
                      <p className="text-red-600 text-xs mt-1">{errors.maxOfficers}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region">Region *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Select 
                      value={unitForm.region}
                      onValueChange={(value) => {
                        setUnitForm({ ...unitForm, region: value })
                        if (errors.region) setErrors({ ...errors, region: '' })
                      }}>
                      <SelectTrigger className={`pl-10 h-10 ${errors.region ? 'border-red-500 focus:border-red-500' : ''}`}>
                        <SelectValue placeholder="Select region">
                          <span className="truncate">Philippine National Police No. 3...</span>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        <SelectItem value={fixedRegion} className="py-2">
                          <div className="flex flex-col">
                            <span className="text-sm">Philippine National Police No. 3</span>
                            <span className="text-xs text-gray-500">
                              Santolan Road, Brgy. Corazon de Jesus
                            </span>
                            <span className="text-xs text-gray-500">
                              San Juan City, Metro Manila 1500
                            </span>
                            <span className="text-xs text-gray-500">
                              Philippines
                            </span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {errors.region && (
                    <p className="text-red-600 text-xs mt-1">{errors.region}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    ✅ PNP National Headquarters
                  </p>
                </div>

                {/* Unit Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">Unit Status *</Label>
                  <Select 
                    value={unitForm.status} 
                    onValueChange={(value: "active" | "inactive" | "disbanded") => {
                      setUnitForm({ ...unitForm, status: value })
                      if (errors.status) setErrors({ ...errors, status: '' })
                    }}
                  >
                    <SelectTrigger className={errors.status ? 'border-red-500 focus:border-red-500' : ''}>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          <div className="flex items-center space-x-2">
                            <span>{status.icon}</span>
                            <div className="flex flex-col">
                              <span className="font-medium">{status.label}</span>
                              <span className="text-xs text-gray-500">{status.description}</span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="text-red-600 text-xs mt-1">{errors.status}</p>
                  )}
                </div>

                {/* Unit Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Unit Description *</Label>
                  <div className="relative">
                    <MessageCircle className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Textarea
                      id="description"
                      placeholder="Describe the unit's responsibilities and jurisdiction..."
                      className={`pl-10 min-h-[100px] ${errors.description ? 'border-red-500 focus:border-red-500' : ''}`}
                      value={unitForm.description}
                      onChange={(e) => {
                        setUnitForm({ ...unitForm, description: e.target.value })
                        if (errors.description) setErrors({ ...errors, description: '' })
                      }}
                    />
                  </div>
                  {errors.description && (
                    <p className="text-red-600 text-xs mt-1">{errors.description}</p>
                  )}
                </div>

                {/* Primary Crime Types */}
                <div className="space-y-2">
                  <Label htmlFor="primaryCrimeTypes">
                    Primary Crime Types * 
                  </Label>
                  {errors.primaryCrimeTypes && (
                    <p className="text-red-600 text-xs mt-1">{errors.primaryCrimeTypes}</p>
                  )}
                  
                  {unitForm.category && availableCrimeTypes.length > 0 && (
                    <>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {availableCrimeTypes.map((crimeType) => {
                          const isSelected = unitForm.primaryCrimeTypes.includes(crimeType)
                          return (
                            <div 
                              key={crimeType} 
                              className={`flex items-center p-2 border rounded-md cursor-pointer ${
                                isSelected 
                                  ? 'bg-lawbot-blue-50 border-lawbot-blue-300 dark:bg-lawbot-blue-900/20 dark:border-lawbot-blue-700' 
                                  : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                              }`}
                              onClick={() => {
                                let newCrimeTypes = [...unitForm.primaryCrimeTypes]
                                if (isSelected) {
                                  newCrimeTypes = newCrimeTypes.filter(type => type !== crimeType)
                                } else {
                                  newCrimeTypes.push(crimeType)
                                }
                                setUnitForm({ ...unitForm, primaryCrimeTypes: newCrimeTypes })
                                if (errors.primaryCrimeTypes) setErrors({ ...errors, primaryCrimeTypes: '' })
                              }}
                            >
                              <div className={`w-4 h-4 mr-2 border rounded ${
                                isSelected 
                                  ? 'bg-lawbot-blue-500 border-lawbot-blue-500' 
                                  : 'border-gray-300 dark:border-gray-600'
                              }`}>
                                {isSelected && (
                                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                              <span className="text-sm">{crimeType}</span>
                            </div>
                          )
                        })}
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-4">
                        <p className="text-sm font-medium text-lawbot-slate-700 dark:text-lawbot-slate-300 mb-2">
                          Selected Crime Types ({unitForm.primaryCrimeTypes.length}):
                        </p>
                        <div className="flex flex-wrap gap-2 w-full">
                          {unitForm.primaryCrimeTypes.map((crimeType) => (
                            <Badge 
                              key={crimeType} 
                              className="bg-lawbot-purple-100 text-lawbot-purple-800 hover:bg-lawbot-purple-200 border border-lawbot-purple-200 dark:bg-lawbot-purple-900/20 dark:text-lawbot-purple-300 dark:border-lawbot-purple-800"
                            >
                              {crimeType}
                              <button 
                                className="ml-1 text-lawbot-purple-600 dark:text-lawbot-purple-300 hover:text-lawbot-purple-800 dark:hover:text-lawbot-purple-100"
                                onClick={(e) => {
                                  e.preventDefault()
                                  setUnitForm({ 
                                    ...unitForm, 
                                    primaryCrimeTypes: unitForm.primaryCrimeTypes.filter(type => type !== crimeType) 
                                  })
                                }}
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                  
                  {!unitForm.category && (
                    <p className="text-amber-600 dark:text-amber-400 text-sm mt-2">
                      Please select a crime category to view available crime types
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full text-white bg-lawbot-blue-600 hover:bg-lawbot-blue-700 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating Unit...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Update PNP Unit
                    </>
                  )}
                </Button>
              </>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}