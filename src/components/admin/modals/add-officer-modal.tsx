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
import PNPUnitsService, { PNPUnit } from "@/lib/pnp-units-service"

interface AddOfficerModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddOfficerModal({ isOpen, onClose, onSuccess }: AddOfficerModalProps) {
  const { user } = useAuth()
  
  // Fixed region value - defined at component level for global access
  const fixedRegion = "Philippine National Police No. 3, Santolan Road, Brgy. Corazon de Jesus, San Juan City, Metro Manila 1500, Philippines"
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [regions, setRegions] = useState<SimplifiedRegion[]>([])
  const [isLoadingRegions, setIsLoadingRegions] = useState(false)
  const [pnpUnits, setPnpUnits] = useState<PNPUnit[]>([])
  const [isLoadingUnits, setIsLoadingUnits] = useState(false)
  const [selectedUnitCrimeTypes, setSelectedUnitCrimeTypes] = useState<string[]>([])
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
    unitId: "",  // Changed from unit to unitId
    region: ""
  })

  // Set default values and fetch PNP units when modal opens
  useEffect(() => {
    if (isOpen) {
      // No need to fetch regions anymore
      // fetchRegions()
      fetchPNPUnits()
      
      // Set default value for PNP HQ location using the component-level constant
      setOfficerForm(current => ({
        ...current,
        region: fixedRegion
      }))
      console.log('✅ Set default region value to:', fixedRegion)
    }
  }, [isOpen])

  const fetchRegions = async () => {
    setIsLoadingRegions(true)
    try {
      // COMMENTED OUT: API calls to external sources
      // Use PSGC Cloud API as default with fallback to other sources
      // const fetchedRegions = await PSGCApiService.getRegions('cloud')
      // setRegions(fetchedRegions)
      // console.log(`✅ Loaded ${fetchedRegions.length} regions using PSGC Cloud API`)
      
      // Using hardcoded fallback regions directly instead of API calls
      const fallbackRegions = await PSGCApiService.getRegions('fallback')
      setRegions(fallbackRegions)
      console.log(`✅ Using default regions data (${fallbackRegions.length} regions)`)
      
      // Future reference - commented alternative API sources:
      // const fetchedRegions = await PSGCApiService.getRegions('gitlab') // GitLab API
      // const fetchedRegions = await PSGCApiService.getRegions('auto')   // Auto-select best API
    } catch (error) {
      console.error('Error loading default regions:', error)
      // In case of any errors, set empty regions array
      setRegions([])
    } finally {
      setIsLoadingRegions(false)
    }
  }

  const fetchPNPUnits = async () => {
    setIsLoadingUnits(true)
    try {
      // Fetch only active PNP units from the database
      const units = await PNPUnitsService.getAllUnits({ status: 'active' })
      setPnpUnits(units)
      console.log(`✅ Loaded ${units.length} active PNP units from database`)
    } catch (error) {
      console.error('Error fetching PNP units:', error)
      setPnpUnits([])
    } finally {
      setIsLoadingUnits(false)
    }
  }

  if (!isOpen) return null

  const handleClose = () => {
    setSuccessMessage('')
    setErrors({})
    setSelectedUnitCrimeTypes([])
    setOfficerForm({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
      badgeNumber: "",
      rank: "",
      unitId: "",
      region: ""
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
      if (!officerForm.unitId) newErrors.unit = 'Unit is required'
      
      // Always use the same fixed region value defined earlier
      if (!officerForm.region) {
        console.log('⚠️ Region is empty, using fixed value:', fixedRegion)
        setOfficerForm(current => ({...current, region: fixedRegion}))
      }
      
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
      
      // Always use the same fixed region value for consistency
      console.log('📝 Sending officer creation data with region:', fixedRegion)
      
      // Call API to create PNP officer (server-side, admin stays logged in)
      const response = await fetch('/api/admin/create-officer-revised', {
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
          unitId: officerForm.unitId,  // Now sending unitId instead of unit name
          region: fixedRegion // Always use our fixed value for consistency
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
      setSelectedUnitCrimeTypes([])
      setOfficerForm({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phoneNumber: "",
        badgeNumber: "",
        rank: "",
        unitId: "",
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

  // Handle unit selection and update crime types
  const handleUnitSelection = (unitId: string) => {
    setOfficerForm({ ...officerForm, unitId: unitId })
    if (errors.unit) setErrors({ ...errors, unit: '' })
    
    // Find the selected unit and get its crime types
    const selectedUnit = pnpUnits.find(unit => unit.id === unitId)
    if (selectedUnit && selectedUnit.crime_types) {
      setSelectedUnitCrimeTypes(selectedUnit.crime_types)
      console.log(`✅ Selected unit: ${selectedUnit.unit_name}, Crime types:`, selectedUnit.crime_types)
    } else {
      setSelectedUnitCrimeTypes([])
      console.log(`⚠️ No crime types found for unit ID: ${unitId}`)
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



  // Regions and PNP Units are now fetched dynamically from APIs/Database

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-800 shadow-2xl overflow-hidden mx-auto">
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

        <CardContent className="overflow-y-auto max-h-[calc(90vh-180px)] px-4 sm:px-6">
          <form onSubmit={handleCreateOfficer} className="space-y-4 sm:space-y-6">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium">First Name *</Label>
                    <Input
                      id="firstName"
                      placeholder="Juan"
                      value={officerForm.firstName}
                      onChange={(e) => {
                        setOfficerForm({ ...officerForm, firstName: e.target.value })
                        if (errors.firstName) setErrors({ ...errors, firstName: '' })
                      }}
                      className={`h-10 ${errors.firstName ? 'border-red-500 focus:border-red-500' : ''}`}
                    />
                    {errors.firstName && (
                      <p className="text-red-600 text-xs mt-1">{errors.firstName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium">Last Name *</Label>
                    <Input
                      id="lastName"
                      placeholder="Dela Cruz"
                      value={officerForm.lastName}
                      onChange={(e) => {
                        setOfficerForm({ ...officerForm, lastName: e.target.value })
                        if (errors.lastName) setErrors({ ...errors, lastName: '' })
                      }}
                      className={`h-10 ${errors.lastName ? 'border-red-500 focus:border-red-500' : ''}`}
                    />
                    {errors.lastName && (
                      <p className="text-red-600 text-xs mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="officer@pnp.gov.ph"
                      className={`pl-10 h-10 ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
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
                  <Label htmlFor="phoneNumber" className="text-sm font-medium">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="phoneNumber"
                      placeholder="+63 9XX XXX XXXX"
                      className="pl-10 h-10"
                      value={officerForm.phoneNumber}
                      onChange={(e) => setOfficerForm({ ...officerForm, phoneNumber: e.target.value })}
                    />
                  </div>
                </div>

                {/* PNP Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="badgeNumber" className="text-sm font-medium">Badge Number *</Label>
                    <div className="relative">
                      <UIBadge className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="badgeNumber"
                        placeholder="PNP-12345"
                        className={`pl-10 h-10 font-mono ${errors.badgeNumber ? 'border-red-500 focus:border-red-500' : ''}`}
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
                    <Label htmlFor="rank" className="text-sm font-medium">Rank *</Label>
                    <Select onValueChange={(value) => {
                      setOfficerForm({ ...officerForm, rank: value })
                      if (errors.rank) setErrors({ ...errors, rank: '' })
                    }}>
                      <SelectTrigger className={`h-10 ${errors.rank ? 'border-red-500 focus:border-red-500' : ''}`}>
                        <SelectValue placeholder="Select rank" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {pnpRanks.map((rank) => (
                          <SelectItem key={rank} value={rank} className="text-sm">
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
                  <Label htmlFor="unit" className="text-sm font-medium">Specialized Unit *</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Select value={officerForm.unitId} onValueChange={handleUnitSelection} disabled={isLoadingUnits}>
                      <SelectTrigger className={`pl-10 h-10 ${errors.unit ? 'border-red-500 focus:border-red-500' : ''}`}>
                        <SelectValue placeholder={isLoadingUnits ? "Loading units..." : "Select specialized unit"} />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {isLoadingUnits ? (
                          <SelectItem key="loading-units" value="loading" disabled>
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                              <span className="text-sm">Loading PNP units...</span>
                            </div>
                          </SelectItem>
                        ) : pnpUnits.length === 0 ? (
                          <SelectItem key="error-units" value="error" disabled>
                            <span className="text-red-600 text-sm">No active units found. Please create units first.</span>
                          </SelectItem>
                        ) : (
                          pnpUnits.map((unit) => (
                            <SelectItem key={unit.id} value={unit.id} className="py-3">
                              <div className="flex flex-col">
                                <span key={`${unit.id}-name`} className="text-sm font-medium truncate">{unit.unit_name}</span>
                                <span key={`${unit.id}-code`} className="text-xs text-gray-500 truncate">{unit.unit_code} • {unit.category}</span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  {errors.unit && (
                    <p className="text-red-600 text-xs mt-1">{errors.unit}</p>
                  )}
                  {!isLoadingUnits && pnpUnits.length > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      ✅ Units loaded from database ({pnpUnits.length} active units)
                    </p>
                  )}
                  
                  {/* Display crime types for selected unit */}
                  {selectedUnitCrimeTypes.length > 0 && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center">
                        <span className="mr-2">🎯</span>
                        Specialized Crime Types:
                      </h4>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {selectedUnitCrimeTypes.slice(0, 8).map((crimeType, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-800/50 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700 rounded-md truncate max-w-[120px] sm:max-w-none"
                            title={crimeType}
                          >
                            <span className="hidden sm:inline">{crimeType}</span>
                            <span className="sm:hidden">{crimeType.length > 15 ? `${crimeType.substring(0, 15)}...` : crimeType}</span>
                          </span>
                        ))}
                        {selectedUnitCrimeTypes.length > 8 && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-800/50 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700 rounded-md">
                            +{selectedUnitCrimeTypes.length - 8} more
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                        This officer will handle these types of cybercrime cases
                      </p>
                    </div>
                  )}
                </div>


                <div className="space-y-2">
                  <Label htmlFor="region" className="text-sm font-medium">Region *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Select 
                      value={officerForm.region} 
                      onValueChange={(value) => {
                        setOfficerForm({ ...officerForm, region: value })
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

                {/* Password Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password (min 6 chars)"
                        className={`pl-10 pr-10 h-10 ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
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
                        className="absolute right-0 top-0 h-10 px-3"
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
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm password"
                        className={`pl-10 pr-10 h-10 ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''}`}
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
                        className="absolute right-0 top-0 h-10 px-3"
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
                  className="w-full h-12 text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 text-sm sm:text-base"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">{isLoading ? 'Creating Officer Account...' : 'Create PNP Officer Account'}</span>
                  <span className="sm:hidden">{isLoading ? 'Creating...' : 'Create Officer'}</span>
                </Button>
              </>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}