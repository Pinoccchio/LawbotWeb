"use client"

import React, { useState, useEffect } from "react"
import { X, Shield, User, Mail, Phone, Badge, MapPin, Building, Edit } from "lucide-react"
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
  const [selectedAPISource, setSelectedAPISource] = useState<APISource>('auto')
  const [availableAPIs, setAvailableAPIs] = useState<APIEndpoint[]>([])
  
  const [officerForm, setOfficerForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    badgeNumber: "",
    rank: "",
    unit: "",
    region: "",
  })

  // Populate form when officer data changes
  useEffect(() => {
    if (officer && isOpen) {
      const nameParts = officer.name?.split(' ') || ['', '']
      setOfficerForm({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: officer.email || '',
        phoneNumber: officer.phone || '',
        badgeNumber: officer.badge || '',
        rank: officer.rank || '',
        unit: officer.unit || '',
        region: officer.region || '',
      })
    }
  }, [officer, isOpen])

  // Initialize available APIs when modal opens
  useEffect(() => {
    if (isOpen && availableAPIs.length === 0) {
      setAvailableAPIs(PSGCApiService.getAPIEndpoints())
    }
  }, [isOpen])

  // Fetch regions when modal opens or API source changes
  useEffect(() => {
    if (isOpen) {
      fetchRegions()
    }
  }, [isOpen, selectedAPISource])

  const fetchRegions = async () => {
    setIsLoadingRegions(true)
    try {
      const fetchedRegions = await PSGCApiService.getRegions(selectedAPISource)
      setRegions(fetchedRegions)
      console.log(`✅ Loaded ${fetchedRegions.length} regions using ${selectedAPISource} API source`)
    } catch (error) {
      console.error('Error fetching regions:', error)
      // Regions state will remain empty, and we'll show an error message
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
                    <Select value={officerForm.rank} onValueChange={(value) => {
                      setOfficerForm({ ...officerForm, rank: value })
                      if (errors.rank) setErrors({ ...errors, rank: '' })
                    }}>
                      <SelectTrigger className={errors.rank ? 'border-red-500 focus:border-red-500' : ''}>
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

                {/* API Source Selector for Testing */}
                <div className="space-y-2">
                  <Label htmlFor="apiSource">API Data Source (Compare APIs)</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Select value={selectedAPISource} onValueChange={(value: APISource) => {
                      setSelectedAPISource(value)
                      setRegions([]) // Clear regions to trigger refetch
                    }}>
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Select API source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem key="auto" value="auto">
                          <div className="flex flex-col">
                            <span>🔄 Auto (Try All APIs)</span>
                            <span className="text-xs text-gray-500">Automatically tries all endpoints in order</span>
                          </div>
                        </SelectItem>
                        {availableAPIs.map((api) => (
                          <SelectItem key={api.source} value={api.source}>
                            <div className="flex flex-col">
                              <span>{api.name}</span>
                              <span className="text-xs text-gray-500">{api.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                        <SelectItem key="fallback" value="fallback">
                          <div className="flex flex-col">
                            <span>📋 Fallback (Hardcoded)</span>
                            <span className="text-xs text-gray-500">Use built-in Philippine regions data</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
                    🧪 Compare different API endpoints for Philippine regions data. Select specific APIs to test their response formats and data quality.
                  </p>
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
                      ✅ Data from Philippine Statistics Authority (PSGC)
                    </p>
                  )}
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