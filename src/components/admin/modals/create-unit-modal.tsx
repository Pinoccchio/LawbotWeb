"use client"

import React, { useState, useEffect } from "react"
import { X, Shield, Target, Building, MapPin, Hash, MessageCircle, Plus, Users, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import PSGCApiService, { SimplifiedRegion } from "@/lib/psgc-api"
import PNPUnitsService from "@/lib/pnp-units-service"

interface CreateUnitModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateUnitModal({ isOpen, onClose, onSuccess }: CreateUnitModalProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [regions, setRegions] = useState<SimplifiedRegion[]>([])
  const [isLoadingRegions, setIsLoadingRegions] = useState(false)
  const [isAutoFilled, setIsAutoFilled] = useState({
    unitName: false,
    description: false,
    primaryCrimeTypes: false,
  })
  
  const [unitForm, setUnitForm] = useState({
    unitName: "",
    category: "",
    unitCode: "",
    description: "",
    region: "",
    maxOfficers: "",
    primaryCrimeTypes: [] as string[],
  })

  // Define unit data by category based on WEB_DOCUMENTATION.md
  const unitDataByCategory: {[key: string]: {unitName: string, description: string, crimeTypes: string[]}} = {
    "Communication & Social Media Crimes": {
      unitName: "Cyber Crime Investigation Cell",
      description: "Specialized unit handling social media scams, phishing, online impersonation and communication-based cybercrimes.",
      crimeTypes: ["Phishing", "Social Engineering", "Spam Messages", "Fake Social Media Profiles", "Online Impersonation", "Business Email Compromise", "SMS Fraud"]
    },
    "Financial & Economic Crimes": {
      unitName: "Economic Offenses Wing",
      description: "Elite unit dedicated to financial fraud, online banking scams, cryptocurrency crimes and economic cybercrimes.",
      crimeTypes: ["Online Banking Fraud", "Credit Card Fraud", "Investment Scams", "Cryptocurrency Fraud", "Online Shopping Scams", "Payment Gateway Fraud", "Money Laundering"]
    },
    "Data & Privacy Crimes": {
      unitName: "Cyber Security Division",
      description: "Expert team investigating data breaches, identity theft, unauthorized access and privacy violations.",
      crimeTypes: ["Identity Theft", "Data Breach", "Unauthorized System Access", "Corporate Espionage", "Government Data Theft", "Medical Records Theft", "Personal Information Theft"]
    },
    "Malware & System Attacks": {
      unitName: "Cyber Crime Technical Unit",
      description: "Technical unit handling ransomware, malware, viruses and technical system exploitation cases.",
      crimeTypes: ["Ransomware", "Virus Attacks", "Trojan Horses", "Spyware", "Adware", "Worms", "Keyloggers", "Rootkits"]
    },
    "Harassment & Exploitation": {
      unitName: "Cyber Crime Against Women and Children",
      description: "Dedicated unit for cyberbullying, online harassment, stalking and exploitation crimes.",
      crimeTypes: ["Cyberstalking", "Online Harassment", "Cyberbullying", "Revenge Porn", "Sextortion", "Online Predatory Behavior", "Doxxing"]
    },
    "Content-Related Crimes": {
      unitName: "Special Investigation Team",
      description: "Specialized team handling illegal content distribution, copyright violations and illicit material.",
      crimeTypes: ["Child Sexual Abuse Material", "Illegal Content Distribution", "Copyright Infringement", "Software Piracy", "Illegal Online Gambling"]
    },
    "System Disruption & Sabotage": {
      unitName: "Critical Infrastructure Protection Unit",
      description: "Expert unit protecting against DDoS attacks, system sabotage and critical infrastructure threats.",
      crimeTypes: ["Denial of Service Attacks", "Website Defacement", "System Sabotage", "Network Intrusion", "SQL Injection", "Cross-Site Scripting"]
    },
    "Government & Terrorism": {
      unitName: "National Security Cyber Division",
      description: "Elite division handling cyberterrorism, government system attacks and national security threats.",
      crimeTypes: ["Cyberterrorism", "Cyber Warfare", "Government System Hacking", "Election Interference", "Critical Infrastructure Attacks", "Propaganda Distribution"]
    },
    "Technical Exploitation": {
      unitName: "Advanced Cyber Forensics Unit",
      description: "Advanced technical unit handling zero-day exploits, sophisticated technical attacks and forensic analysis.",
      crimeTypes: ["Zero-Day Exploits", "Vulnerability Exploitation", "Backdoor Creation", "Privilege Escalation", "Code Injection", "Buffer Overflow Attacks"]
    },
    "Targeted Attacks": {
      unitName: "Special Cyber Operations Unit",
      description: "Specialized operations unit for advanced persistent threats, targeted attacks and sophisticated campaigns.",
      crimeTypes: ["Advanced Persistent Threats", "Spear Phishing", "CEO Fraud", "Supply Chain Attacks", "Insider Threats"]
    }
  }

  // Fetch regions when modal opens using PSGC Cloud API as default
  useEffect(() => {
    if (isOpen) {
      fetchRegions()
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

  if (!isOpen) return null

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
    })
    setIsAutoFilled({
      unitName: false,
      description: false,
      primaryCrimeTypes: false,
    })
    onClose()
  }



  // Generate a unique unit code using the service
  const generateUniqueUnitCode = async (category: string): Promise<string> => {
    try {
      return await PNPUnitsService.generateUniqueUnitCode(category)
    } catch (error) {
      console.error('Failed to generate unique unit code:', error)
      // Fallback to random generation (may still conflict)
      const randomNum = Math.floor(100 + Math.random() * 900)
      return `PCU-${randomNum}`
    }
  }

  const handleCategoryChange = async (value: string) => {
    const categoryData = unitDataByCategory[value]
    
    if (categoryData) {
      // Generate unique unit code asynchronously
      try {
        const uniqueUnitCode = await generateUniqueUnitCode(value)
        
        // Auto-fill fields based on selected category
        setUnitForm({
          ...unitForm,
          category: value,
          unitName: categoryData.unitName,
          unitCode: uniqueUnitCode,
          description: categoryData.description,
          primaryCrimeTypes: [...categoryData.crimeTypes]
        })
        // Mark fields as auto-filled
        setIsAutoFilled({
          unitName: true,
          description: true,
          primaryCrimeTypes: true,
        })
      } catch (error) {
        console.error('Error generating unique unit code:', error)
        // Still set other fields, but show error for unit code
        setUnitForm({
          ...unitForm,
          category: value,
          unitName: categoryData.unitName,
          unitCode: '', // Leave empty if generation fails
          description: categoryData.description,
          primaryCrimeTypes: [...categoryData.crimeTypes]
        })
        setErrors({ ...errors, unitCode: 'Failed to generate unique unit code. Please enter one manually.' })
      }
    } else {
      // Just update the category if no matching data
      setUnitForm({ ...unitForm, category: value })
    }
    
    if (errors.category) setErrors({ ...errors, category: '' })
  }

  const handleCreateUnit = async (e: React.FormEvent) => {
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

      // Get ID token for authentication
      const idToken = await user.getIdToken()
      
      // Create the unit in the database
      console.log('🔐 Getting admin ID token for authentication...')
      console.log('📡 Creating PNP unit in Supabase database...')
      
      try {
        // Create the unit using PNPUnitsService
        await PNPUnitsService.createPNPUnit({
          unit_name: unitForm.unitName,
          unit_code: unitForm.unitCode,
          category: unitForm.category,
          description: unitForm.description,
          region: unitForm.region,
          max_officers: parseInt(unitForm.maxOfficers),
          primary_crime_types: unitForm.primaryCrimeTypes
        })
        
        console.log('✅ PNP Unit created successfully in database')
        
        // Show toast notification for success
        toast({
          title: "New Unit Created",
          description: `${unitForm.unitName} has been successfully added to the system`,
          variant: "success",
        })
        
        // Show success message in modal
        setSuccessMessage(`✅ PNP Unit "${unitForm.unitName}" created successfully! (Code: ${unitForm.unitCode})`)
        
        // Clear the form
        setUnitForm({
          unitName: "",
          category: "",
          unitCode: "",
          description: "",
          region: "",
          maxOfficers: "",
          primaryCrimeTypes: [],
        })
        
        // Reset auto-filled flags
        setIsAutoFilled({
          unitName: false,
          description: false,
          primaryCrimeTypes: false,
        })
        
        // Notify parent component of success
        onSuccess()
        
        // Auto close after 2 seconds
        setTimeout(() => {
          setSuccessMessage('')
          handleClose()
        }, 2000)
      } catch (dbError: any) {
        console.error('Database error creating unit:', dbError)
        setErrors({ general: dbError.toString().replace('Error: ', '') })
      }
    } catch (error: any) {
      console.error('Unit creation failed:', error)
      setErrors({ general: error.toString().replace('Error: ', '') })
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

  // Regions are now loaded dynamically from PSGC API

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
              <CardTitle className="text-xl">Create PNP Unit</CardTitle>
              <CardDescription>
                Add a new specialized cybercrime investigation unit
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="w-fit">
            🛡️ Specialized Unit Configuration
          </Badge>
        </CardHeader>

        <CardContent className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <form onSubmit={handleCreateUnit} className="space-y-4">
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
                {/* Crime Category - Auto-fills other fields */}
                <div className="space-y-2">
                  <Label htmlFor="category">Crime Category *</Label>
                  <Select onValueChange={(value) => handleCategoryChange(value)}>
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
                  {unitForm.category && unitDataByCategory[unitForm.category] && (
                    <p className="text-lawbot-blue-600 dark:text-lawbot-blue-400 text-xs mt-1">
                      <span className="font-medium">Selected category</span> will auto-fill unit details
                    </p>
                  )}
                </div>
                
                {/* Unit Name - Auto-filled and non-editable after category selection */}
                <div className="space-y-2">
                  <Label htmlFor="unitName">
                    Unit Name * 
                    {isAutoFilled.unitName && (
                      <span className="ml-2 text-xs text-lawbot-blue-600 dark:text-lawbot-blue-400 font-medium">
                        (Auto-filled)
                      </span>
                    )}
                  </Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="unitName"
                      placeholder={!unitForm.category ? "Select a crime category first" : "e.g., Advanced Cyber Forensics Unit"}
                      className={`pl-10 ${errors.unitName ? 'border-red-500 focus:border-red-500' : ''} ${isAutoFilled.unitName ? 'bg-lawbot-blue-50 dark:bg-lawbot-blue-900/20 border-lawbot-blue-200 dark:border-lawbot-blue-800' : ''}`}
                      value={unitForm.unitName}
                      onChange={(e) => {
                        // Unit Name is not editable after auto-fill
                      }}
                      disabled={!unitForm.category || isAutoFilled.unitName}
                      readOnly={isAutoFilled.unitName}
                    />
                  </div>
                  {errors.unitName && (
                    <p className="text-red-600 text-xs mt-1">{errors.unitName}</p>
                  )}
                  {!unitForm.category && (
                    <p className="text-amber-600 dark:text-amber-400 text-xs mt-1">
                      Select a crime category above to auto-fill unit details
                    </p>
                  )}
                  {isAutoFilled.unitName && (
                    <p className="text-lawbot-blue-600 dark:text-lawbot-blue-400 text-xs mt-1">
                      Unit name is automatically set based on crime category
                    </p>
                  )}
                </div>


                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="unitCode">Unit Code *</Label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="unitCode"
                        placeholder={!unitForm.category ? "Select a crime category first" : "PCU-XXX"}
                        className={`pl-10 font-mono ${errors.unitCode ? 'border-red-500 focus:border-red-500' : ''} ${unitForm.unitCode ? 'bg-lawbot-blue-50 dark:bg-lawbot-blue-900/20 border-lawbot-blue-200 dark:border-lawbot-blue-800' : ''}`}
                        value={unitForm.unitCode}
                        onChange={(e) => {
                          setUnitForm({ ...unitForm, unitCode: e.target.value.toUpperCase() })
                          if (errors.unitCode) setErrors({ ...errors, unitCode: '' })
                        }}
                        disabled={!unitForm.category}
                      />
                    </div>
                    {errors.unitCode && (
                      <p className="text-red-600 text-xs mt-1">{errors.unitCode}</p>
                    )}
                    {unitForm.category && unitForm.unitCode && (
                      <p className="text-lawbot-blue-600 dark:text-lawbot-blue-400 text-xs mt-1">
                        ✅ Unique code generated, you can edit if needed
                      </p>
                    )}
                    {!unitForm.unitCode && unitForm.category && (
                      <p className="text-amber-600 dark:text-amber-400 text-xs mt-1">
                        ⚠️ Please enter a unit code manually
                      </p>
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
                        placeholder={!unitForm.category ? "Select a crime category first" : "10"}
                        className={`pl-10 ${errors.maxOfficers ? 'border-red-500 focus:border-red-500' : ''}`}
                        value={unitForm.maxOfficers}
                        onChange={(e) => {
                          setUnitForm({ ...unitForm, maxOfficers: e.target.value })
                          if (errors.maxOfficers) setErrors({ ...errors, maxOfficers: '' })
                        }}
                        disabled={!unitForm.category}
                      />
                    </div>
                    {errors.maxOfficers && (
                      <p className="text-red-600 text-xs mt-1">{errors.maxOfficers}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region">Primary Region *</Label>
                  <Select 
                    onValueChange={(value) => {
                      setUnitForm({ ...unitForm, region: value })
                      if (errors.region) setErrors({ ...errors, region: '' })
                    }}
                    disabled={!unitForm.category || isLoadingRegions}
                  >
                    <SelectTrigger className={errors.region ? 'border-red-500 focus:border-red-500' : ''}>
                      <SelectValue placeholder={
                        !unitForm.category ? "Select a crime category first" : 
                        isLoadingRegions ? "Loading regions..." : 
                        "Select region"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingRegions ? (
                        <SelectItem key="loading-regions" value="loading" disabled>
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span>Loading Philippine regions...</span>
                          </div>
                        </SelectItem>
                      ) : regions.length === 0 ? (
                        <SelectItem key="error-regions" value="error" disabled>
                          <span className="text-red-600">Failed to load regions. Please try again.</span>
                        </SelectItem>
                      ) : (
                        regions.map((region) => (
                          <SelectItem key={region.id} value={region.name}>
                            <div className="flex flex-col">
                              <span>{region.name}</span>
                              {region.population !== 'N/A' && (
                                <span className="text-xs text-gray-500">Population: {region.population}</span>
                              )}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {errors.region && (
                    <p className="text-red-600 text-xs mt-1">{errors.region}</p>
                  )}
                  {!isLoadingRegions && regions.length > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      ✅ Data from Philippine Statistics Authority (PSGC API)
                    </p>
                  )}
                </div>

                {/* Unit Description - Auto-filled but editable after category selection */}
                <div className="space-y-2">
                  <Label htmlFor="description">
                    Unit Description * 
                    {isAutoFilled.description && (
                      <span className="ml-2 text-xs text-lawbot-blue-600 dark:text-lawbot-blue-400 font-medium">
                        (Auto-filled)
                      </span>
                    )}
                  </Label>
                  <div className="relative">
                    <MessageCircle className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Textarea
                      id="description"
                      placeholder={!unitForm.category ? "Select a crime category first" : "Describe the unit's responsibilities and jurisdiction..."}
                      className={`pl-10 min-h-[100px] ${errors.description ? 'border-red-500 focus:border-red-500' : ''} ${isAutoFilled.description ? 'bg-lawbot-blue-50 dark:bg-lawbot-blue-900/20 border-lawbot-blue-200 dark:border-lawbot-blue-800' : ''}`}
                      value={unitForm.description}
                      onChange={(e) => {
                        setUnitForm({ ...unitForm, description: e.target.value })
                        // If we're editing, it's no longer auto-filled
                        if (isAutoFilled.description) {
                          setIsAutoFilled({...isAutoFilled, description: false})
                        }
                        if (errors.description) setErrors({ ...errors, description: '' })
                      }}
                      disabled={!unitForm.category}
                    />
                  </div>
                  {errors.description && (
                    <p className="text-red-600 text-xs mt-1">{errors.description}</p>
                  )}
                </div>

                {/* Primary Crime Types - Auto-filled */}
                <div className="space-y-2">
                  <Label htmlFor="primaryCrimeTypes">
                    Primary Crime Types * 
                    {isAutoFilled.primaryCrimeTypes && (
                      <span className="ml-2 text-xs text-lawbot-blue-600 dark:text-lawbot-blue-400 font-medium">
                        (Auto-filled)
                      </span>
                    )}
                  </Label>
                  {errors.primaryCrimeTypes && (
                    <p className="text-red-600 text-xs mt-1">{errors.primaryCrimeTypes}</p>
                  )}
                  
                  {unitForm.primaryCrimeTypes.length > 0 && (
                    <div className={`flex flex-wrap gap-2 mt-2 p-3 rounded-lg ${isAutoFilled.primaryCrimeTypes ? 'bg-lawbot-blue-50 dark:bg-lawbot-blue-900/20 border border-lawbot-blue-200 dark:border-lawbot-blue-800' : ''}`}>
                      {unitForm.primaryCrimeTypes.map((crimeType) => (
                        <Badge 
                          key={crimeType} 
                          className="bg-lawbot-purple-100 text-lawbot-purple-800 hover:bg-lawbot-purple-200 border border-lawbot-purple-200 dark:bg-lawbot-purple-900/20 dark:text-lawbot-purple-300 dark:border-lawbot-purple-800"
                        >
                          {crimeType}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !unitForm.category}
                  className="w-full text-white bg-lawbot-blue-600 hover:bg-lawbot-blue-700 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Unit...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Create PNP Unit
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