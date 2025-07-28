"use client"

import React, { useState, useEffect } from "react"
import { X, Shield, User, Mail, Phone, Badge, MapPin, Building, Edit, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge as UIBadge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { AuthService } from "@/lib/auth"
import PSGCApiService, { SimplifiedRegion, APISource, APIEndpoint } from "@/lib/psgc-api"

interface EditOfficerModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  officer: any
}

export function EditOfficerModal({ isOpen, onClose, onSuccess, officer }: EditOfficerModalProps) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [resetPasswordMessage, setResetPasswordMessage] = useState('')
  const [regions, setRegions] = useState<SimplifiedRegion[]>([])
  const [isLoadingRegions, setIsLoadingRegions] = useState(false)
  // Removed API source selector - now using PSGC Cloud API as default
  // const [selectedAPISource, setSelectedAPISource] = useState<APISource>('auto')
  // const [availableAPIs, setAvailableAPIs] = useState<APIEndpoint[]>([])
  
  const [officerForm, setOfficerForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    badgeNumber: "",
    rank: "",
    unit: "",
    region: "",
    status: "active", // Default to active status
  })

  // Populate form when officer data changes
  useEffect(() => {
    if (officer && isOpen) {
      const nameParts = officer.name?.split(' ') || ['', '']
      
      // Extract all the officer data we need with fallbacks
      const officerData = {
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: officer.email || '',
        phoneNumber: officer.phone || '',
        badgeNumber: officer.badge || '',
        rank: officer.rank || '',
        unit: officer.unit || '',
        region: officer.region || '',
        status: officer.status || 'active',
      }
      
      console.log('🔍 Populating edit form with officer data:', {
        officerName: officer.name,
        officerStatus: officer.status,
        statusToBeSet: officerData.status,
        fullOfficerData: officer
      })
      
      // Update form state and manually force state update for each field
      setOfficerForm(officerData)
      
      // Use refs to manually update the select component values if needed
      setTimeout(() => {
        // Check if status is populating correctly
        console.log('🔄 Form state after update:', {
          currentStatus: officerData.status,
          formStatus: document.querySelector('[data-testid="status-trigger"]')?.textContent?.trim()
        })
        
        // Try setting the status again if it's not being applied
        if (officerData.status && 
            document.querySelector('[data-testid="status-trigger"]')?.textContent?.includes('Select officer status')) {
          console.log('⚠️ Status not applied, forcing update...')
          setOfficerForm(current => ({...current, status: officerData.status}))
        }
      }, 200)
    }
  }, [officer, isOpen])

  // Fetch regions when modal opens using PSGC Cloud API as default
  useEffect(() => {
    if (isOpen) {
      fetchRegions()
      
      // Debug the dropdown rendering
      setTimeout(() => {
        console.log('🔍 Current officer data:', {
          status: officer?.status,
          rank: officer?.rank,
          region: officer?.region
        })
        console.log('🔍 Current form data:', {
          status: officerForm.status,
          rank: officerForm.rank,
          region: officerForm.region
        })
        
        // Check if the trigger elements are properly updated
        const statusTrigger = document.querySelector('[data-testid="status-trigger"]')
        const rankTrigger = document.querySelector('[data-testid="rank-trigger"]')
        
        if (statusTrigger) {
          console.log('📌 Status trigger content:', statusTrigger.textContent)
        }
        
        if (rankTrigger) {
          console.log('📌 Rank trigger content:', rankTrigger.textContent)
        }
        
        // Check dropdown components structure
        console.log('⚙️ Select components comparison:', {
          statusTriggerHtml: statusTrigger?.innerHTML,
          rankTriggerHtml: rankTrigger?.innerHTML
        })
      }, 500)
    }
  }, [isOpen, officer?.status, officerForm.status])

  const fetchRegions = async () => {
    setIsLoadingRegions(true)
    try {
      // Use PSGC Cloud API as default with fallback to other sources
      const fetchedRegions = await PSGCApiService.getRegions('cloud')
      setRegions(fetchedRegions)
      console.log(`✅ Loaded ${fetchedRegions.length} regions using PSGC Cloud API`)
      
      // Future reference - commented alternative API sources:
      // const fetchedRegions = await PSGCApiService.getRegions('gitlab') // GitLab API
      // const fetchedRegions = await PSGCApiService.getRegions('auto')   // Auto-select best API
      // const fetchedRegions = await PSGCApiService.getRegions('fallback') // Hardcoded fallback
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
    setResetPasswordMessage('')
    setErrors({})
    setOfficerForm({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      badgeNumber: "",
      rank: "",
      unit: "",
      region: "",
      status: "active", // Default to active instead of empty string
    })
    onClose()
  }

  const handleUpdateOfficer = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsLoading(true)
    
    try {
      // Validate required fields
      const newErrors: { [key: string]: string } = {}
      
      if (!officerForm.firstName.trim()) newErrors.firstName = 'First name is required'
      if (!officerForm.lastName.trim()) newErrors.lastName = 'Last name is required'
      if (!officerForm.badgeNumber.trim()) newErrors.badgeNumber = 'Badge number is required'
      if (!officerForm.rank) newErrors.rank = 'Rank is required'
      if (!officerForm.unit) newErrors.unit = 'Unit is required'
      if (!officerForm.region) newErrors.region = 'Region is required'

      // Note: Email validation removed since email field is read-only

      // Badge number validation (format: PNP-XXXXX)
      const badgeRegex = /^PNP-\d{5}$/
      if (officerForm.badgeNumber && !badgeRegex.test(officerForm.badgeNumber)) {
        newErrors.badgeNumber = 'Badge number must be in format: PNP-XXXXX (e.g., PNP-12345)'
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        return
      }

      const fullName = `${officerForm.firstName.trim()} ${officerForm.lastName.trim()}`
      
      console.log('🔄 Updating PNP officer profile...')
      
      // Update PNP officer profile in Supabase
      const updateData: any = {
        full_name: fullName,
        email: officerForm.email,
        phone_number: officerForm.phoneNumber,
        badge_number: officerForm.badgeNumber,
        rank: officerForm.rank,
        unit: officerForm.unit,
        region: officerForm.region,
        status: officerForm.status,
        updated_at: new Date().toISOString()
      }

      const { data: updatedProfile, error: supabaseError } = await supabase
        .from('pnp_officer_profiles')
        .update(updateData)
        .eq('id', officer.id)
        .select()
        .single()

      if (supabaseError) {
        console.error('💥 Supabase error:', supabaseError)
        throw new Error(`Failed to update officer profile: ${supabaseError.message}`)
      }

      console.log('✅ Officer updated successfully:', updatedProfile)
      
      // Clear any previous errors
      setErrors({})
      
      // Show success message
      setSuccessMessage(`✅ Officer ${officerForm.badgeNumber} updated successfully!`)
      
      // Notify parent component of success
      onSuccess()
      
      // Auto close after 2 seconds
      setTimeout(() => {
        setSuccessMessage('')
        handleClose()
      }, 2000)
    } catch (error: any) {
      console.error('Officer update failed:', error)
      setErrors({ general: error.toString().replace('Error: ', '') })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle password reset
  const handleResetPassword = async () => {
    if (!officerForm.email) {
      setErrors({ resetPassword: 'No email address found for this officer' })
      return
    }

    setIsResettingPassword(true)
    setResetPasswordMessage('')
    setErrors({})

    try {
      console.log('📧 Sending password reset email to:', officerForm.email)
      
      await AuthService.resetPassword(officerForm.email)
      
      setResetPasswordMessage(`✅ Password reset email sent to ${officerForm.email}`)
      console.log('✅ Password reset email sent successfully')
      
      // Clear message after 5 seconds
      setTimeout(() => {
        setResetPasswordMessage('')
      }, 5000)
      
    } catch (error: any) {
      console.error('💥 Error sending password reset email:', error)
      setErrors({ resetPassword: `Failed to send password reset email: ${error}` })
    } finally {
      setIsResettingPassword(false)
    }
  }

  const pnpRanks = [
    "Police Officer I",
    "Police Officer II", 
    "Police Officer III",
    "Senior Police Officer I",
    "Senior Police Officer II",
    "Senior Police Officer III",
    "Senior Police Officer IV",
    "Police Chief Master Sergeant",
    "Police Executive Master Sergeant",
    "Police Lieutenant",
    "Police Captain",
    "Police Major",
    "Police Lieutenant Colonel",
    "Police Colonel",
  ]

  const pnpUnits = [
    "Cyber Crime Investigation Cell",
    "Economic Offenses Wing",
    "Cyber Security Division",
    "Cyber Crime Technical Unit",
    "Cyber Crime Against Women and Children",
    "Special Investigation Team",
    "Critical Infrastructure Protection Unit",
    "National Security Cyber Division",
    "Advanced Cyber Forensics Unit",
    "Special Cyber Operations Unit",
  ]

  const statusOptions = [
    { value: 'active', label: 'Active', icon: '✅', description: 'Officer is actively working' },
    { value: 'on_leave', label: 'On Leave', icon: '🏖️', description: 'Officer is on approved leave' },
    { value: 'suspended', label: 'Suspended', icon: '⚠️', description: 'Officer is temporarily suspended' },
    { value: 'retired', label: 'Retired', icon: '🏆', description: 'Officer has retired from service' }
  ]

  // Regions are now fetched dynamically from PSGC API

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-800 shadow-2xl overflow-hidden">
        <CardHeader className="relative">
          <Button variant="ghost" size="sm" onClick={handleClose} className="absolute right-2 top-2 h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-600">
              <Edit className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Edit PNP Officer</CardTitle>
              <CardDescription>
                Update officer information for {officer?.name} ({officer?.badge})
              </CardDescription>
            </div>
          </div>
          <UIBadge variant="outline" className="w-fit">
            🔄 Update Officer Profile
          </UIBadge>
        </CardHeader>

        <CardContent className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <form onSubmit={handleUpdateOfficer} className="space-y-4">
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
                {/* Personal Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      placeholder="Juan"
                      value={officerForm.firstName}
                      onChange={(e) => {
                        setOfficerForm({ ...officerForm, firstName: e.target.value })
                        if (errors.firstName) setErrors({ ...errors, firstName: '' })
                      }}
                      className={errors.firstName ? 'border-red-500 focus:border-red-500' : ''}
                    />
                    {errors.firstName && (
                      <p className="text-red-600 text-xs mt-1">{errors.firstName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      placeholder="Dela Cruz"
                      value={officerForm.lastName}
                      onChange={(e) => {
                        setOfficerForm({ ...officerForm, lastName: e.target.value })
                        if (errors.lastName) setErrors({ ...errors, lastName: '' })
                      }}
                      className={errors.lastName ? 'border-red-500 focus:border-red-500' : ''}
                    />
                    {errors.lastName && (
                      <p className="text-red-600 text-xs mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="officer@pnp.gov.ph"
                        className="pl-10 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        value={officerForm.email}
                        disabled
                        readOnly
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResetPassword}
                      disabled={isResettingPassword || !officerForm.email}
                      className="shrink-0 text-blue-600 border-blue-300 hover:bg-blue-50"
                    >
                      {isResettingPassword ? 'Sending...' : 'Reset Password'}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Email cannot be changed. Use "Reset Password" to send a password reset link.
                  </p>
                  {errors.resetPassword && (
                    <p className="text-red-600 text-xs mt-1">{errors.resetPassword}</p>
                  )}
                  {resetPasswordMessage && (
                    <p className="text-green-600 text-xs mt-1">{resetPasswordMessage}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phoneNumber"
                      placeholder="+63 9XX XXX XXXX"
                      className="pl-10"
                      value={officerForm.phoneNumber}
                      onChange={(e) => setOfficerForm({ ...officerForm, phoneNumber: e.target.value })}
                    />
                  </div>
                </div>

                {/* PNP Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="badgeNumber">Badge Number *</Label>
                    <div className="relative">
                      <Badge className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="badgeNumber"
                        placeholder="PNP-12345"
                        className={`pl-10 font-mono ${errors.badgeNumber ? 'border-red-500 focus:border-red-500' : ''}`}
                        value={officerForm.badgeNumber}
                        onChange={(e) => {
                          setOfficerForm({ ...officerForm, badgeNumber: e.target.value.toUpperCase() })
                          if (errors.badgeNumber) setErrors({ ...errors, badgeNumber: '' })
                        }}
                      />
                    </div>
                    {errors.badgeNumber && (
                      <p className="text-red-600 text-xs mt-1">{errors.badgeNumber}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rank">Rank *</Label>
                    <Select 
                      value={officerForm.rank} 
                      onValueChange={(value) => {
                        console.log('🔄 Rank changed to:', value)
                        setOfficerForm({ ...officerForm, rank: value })
                        if (errors.rank) setErrors({ ...errors, rank: '' })
                      }}
                    >
                      <SelectTrigger 
                        data-testid="rank-trigger"
                        className={errors.rank ? 'border-red-500 focus:border-red-500' : ''}
                      >
                        <SelectValue placeholder="Select rank" />
                      </SelectTrigger>
                      <SelectContent>
                        {pnpRanks.map((rank) => (
                          <SelectItem key={rank} value={rank}>
                            {rank}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.rank && (
                      <p className="text-red-600 text-xs mt-1">{errors.rank}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Specialized Unit *</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Select value={officerForm.unit} onValueChange={(value) => {
                      setOfficerForm({ ...officerForm, unit: value })
                      if (errors.unit) setErrors({ ...errors, unit: '' })
                    }}>
                      <SelectTrigger className={`pl-10 ${errors.unit ? 'border-red-500 focus:border-red-500' : ''}`}>
                        <SelectValue placeholder="Select specialized unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {pnpUnits.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {errors.unit && (
                    <p className="text-red-600 text-xs mt-1">{errors.unit}</p>
                  )}
                </div>


                <div className="space-y-2">
                  <Label htmlFor="region">Region *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Select value={officerForm.region} onValueChange={(value) => {
                      setOfficerForm({ ...officerForm, region: value })
                      if (errors.region) setErrors({ ...errors, region: '' })
                    }} disabled={isLoadingRegions}>
                      <SelectTrigger className={`pl-10 ${errors.region ? 'border-red-500 focus:border-red-500' : ''}`}>
                        <SelectValue placeholder={isLoadingRegions ? "Loading regions..." : "Select region"} />
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
                                <span key={`${region.id}-name`}>{region.name}</span>
                                {region.population !== 'N/A' && (
                                  <span key={`${region.id}-population`} className="text-xs text-gray-500">Population: {region.population}</span>
                                )}
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  {errors.region && (
                    <p className="text-red-600 text-xs mt-1">{errors.region}</p>
                  )}
                  {!isLoadingRegions && regions.length > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      ✅ Data from Philippine Statistics Authority (PSGC Cloud API)
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Officer Status *</Label>
                  <div className="relative">
                    <Activity className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Select value={officerForm.status} onValueChange={(value) => {
                      console.log('🔄 Status changed to:', value)
                      setOfficerForm({ ...officerForm, status: value })
                      if (errors.status) setErrors({ ...errors, status: '' })
                    }}>
                      <SelectTrigger 
                        data-testid="status-trigger" 
                        className={`pl-10 ${errors.status ? 'border-red-500 focus:border-red-500' : ''}`}
                      >
                        {/* Conditionally render the value or placeholder */}
                        {officerForm.status ? (
                          <span className="flex items-center space-x-2">
                            <span>
                              {officerForm.status === 'active' && '✅'}
                              {officerForm.status === 'on_leave' && '🏖️'}
                              {officerForm.status === 'suspended' && '⚠️'}
                              {officerForm.status === 'retired' && '🏆'}
                            </span>
                            <span>
                              {officerForm.status === 'active' && 'Active'}
                              {officerForm.status === 'on_leave' && 'On Leave'}
                              {officerForm.status === 'suspended' && 'Suspended'}
                              {officerForm.status === 'retired' && 'Retired'}
                            </span>
                          </span>
                        ) : (
                          <SelectValue placeholder="Select officer status" />
                        )}
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
                  </div>
                  {errors.status && (
                    <p className="text-red-600 text-xs mt-1">{errors.status}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    💼 Current operational status of this officer
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  {isLoading ? 'Updating Officer...' : 'Update Officer Profile'}
                </Button>
              </>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}