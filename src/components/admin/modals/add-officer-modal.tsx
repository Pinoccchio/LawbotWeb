"use client"

import React, { useState, useEffect } from "react"
import { X, Shield, User, Lock, Mail, Phone, Eye, EyeOff, Badge, MapPin, Building } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge as UIBadge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import PSGCApiService, { SimplifiedRegion, APISource, APIEndpoint } from "@/lib/psgc-api"

interface AddOfficerModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddOfficerModal({ isOpen, onClose, onSuccess }: AddOfficerModalProps) {
  const { user } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [regions, setRegions] = useState<SimplifiedRegion[]>([])
  const [isLoadingRegions, setIsLoadingRegions] = useState(false)
  // Removed API source selector - now using PSGC Cloud API as default
  // const [selectedAPISource, setSelectedAPISource] = useState<APISource>('auto')
  // const [availableAPIs, setAvailableAPIs] = useState<APIEndpoint[]>([])
  
  const [officerForm, setOfficerForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    badgeNumber: "",
    rank: "",
    unit: "",
    region: "",
  })

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
    setErrors({})
    setOfficerForm({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
      badgeNumber: "",
      rank: "",
      unit: "",
      region: "",
    })
    onClose()
  }

  const handleCreateOfficer = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsLoading(true)
    
    try {
      // Validate required fields
      const newErrors: { [key: string]: string } = {}
      
      if (!officerForm.firstName.trim()) newErrors.firstName = 'First name is required'
      if (!officerForm.lastName.trim()) newErrors.lastName = 'Last name is required'
      if (!officerForm.email.trim()) newErrors.email = 'Email is required'
      if (!officerForm.password) newErrors.password = 'Password is required'
      if (!officerForm.confirmPassword) newErrors.confirmPassword = 'Please confirm password'
      if (!officerForm.badgeNumber.trim()) newErrors.badgeNumber = 'Badge number is required'
      if (!officerForm.rank) newErrors.rank = 'Rank is required'
      if (!officerForm.unit) newErrors.unit = 'Unit is required'
      if (!officerForm.region) newErrors.region = 'Region is required'
      
      if (officerForm.password !== officerForm.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
      
      if (officerForm.password && officerForm.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters'
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (officerForm.email && !emailRegex.test(officerForm.email)) {
        newErrors.email = 'Please enter a valid email address'
      }

      // Badge number validation (format: PNP-XXXXX)
      const badgeRegex = /^PNP-\d{5}$/
      if (officerForm.badgeNumber && !badgeRegex.test(officerForm.badgeNumber)) {
        newErrors.badgeNumber = 'Badge number must be in format: PNP-XXXXX (e.g., PNP-12345)'
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        return
      }

      // Check if admin is logged in
      if (!user) {
        setErrors({ general: 'Admin authentication required. Please log in again.' })
        return
      }

      const fullName = `${officerForm.firstName.trim()} ${officerForm.lastName.trim()}`
      
      console.log('🔐 Getting admin ID token...')
      
      // Get admin's ID token for API authentication
      const idToken = await user.getIdToken()
      
      console.log('📡 Calling API to create PNP officer...')
      
      // Call API to create PNP officer (server-side, admin stays logged in)
      const response = await fetch('/api/admin/create-officer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          email: officerForm.email,
          password: officerForm.password,
          fullName: fullName,
          phoneNumber: officerForm.phoneNumber,
          badgeNumber: officerForm.badgeNumber,
          rank: officerForm.rank,
          unit: officerForm.unit,
          region: officerForm.region
        })
      })

      const result = await response.json()
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || result.error || 'Failed to create officer account')
      }

      console.log('✅ Officer created successfully via API')
      
      // Clear any previous errors
      setErrors({})
      
      // Show success message
      setSuccessMessage(`✅ PNP Officer account created successfully! Badge: ${officerForm.badgeNumber} | Admin session preserved (Server-side)`)
      
      // Clear the form
      setOfficerForm({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phoneNumber: "",
        badgeNumber: "",
        rank: "",
        unit: "",
        region: "",
      })
      
      // Notify parent component of success
      onSuccess()
      
      // Auto close after 2 seconds
      setTimeout(() => {
        setSuccessMessage('')
        handleClose()
      }, 2000)
    } catch (error: any) {
      console.error('Officer creation failed:', error)
      setErrors({ general: error.toString().replace('Error: ', '') })
    } finally {
      setIsLoading(false)
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
            <div className="p-2 rounded-lg bg-green-600">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Add PNP Officer</CardTitle>
              <CardDescription>
                Create a new Philippine National Police officer account
              </CardDescription>
            </div>
          </div>
          <UIBadge variant="outline" className="w-fit">
            🔒 Firebase Admin SDK + Supabase DB
          </UIBadge>
        </CardHeader>

        <CardContent className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <form onSubmit={handleCreateOfficer} className="space-y-4">
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
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="officer@pnp.gov.ph"
                      className={`pl-10 ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                      value={officerForm.email}
                      onChange={(e) => {
                        setOfficerForm({ ...officerForm, email: e.target.value })
                        if (errors.email) setErrors({ ...errors, email: '' })
                      }}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-600 text-xs mt-1">{errors.email}</p>
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
                      <UIBadge className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
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
                    <Select onValueChange={(value) => {
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
                    <Select onValueChange={(value) => {
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
                    <Select onValueChange={(value) => {
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

                {/* Password Section */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password (min 6 chars)"
                        className={`pl-10 pr-10 ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                        value={officerForm.password}
                        onChange={(e) => {
                          setOfficerForm({ ...officerForm, password: e.target.value })
                          if (errors.password) setErrors({ ...errors, password: '' })
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {errors.password && (
                      <p className="text-red-600 text-xs mt-1">{errors.password}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm password"
                        className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''}`}
                        value={officerForm.confirmPassword}
                        onChange={(e) => {
                          setOfficerForm({ ...officerForm, confirmPassword: e.target.value })
                          if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' })
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-600 text-xs mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  {isLoading ? 'Creating Officer Account...' : 'Create PNP Officer Account'}
                </Button>
              </>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}