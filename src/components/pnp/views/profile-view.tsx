"use client"

import { useState, useEffect } from "react"
import { Shield, Mail, Phone, MapPin, Edit, Save, User, TrendingUp, Building2, Target, BookOpen, Loader2, AlertCircle, Activity, AlertTriangle, Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PNPOfficerService, PNPOfficerProfile } from "@/lib/pnp-officer-service"
import { PhilippineTime } from "@/lib/philippine-time"

interface ProfileViewProps {
  onProfileUpdate?: () => void // Callback to refresh header data
}

export function ProfileView({ onProfileUpdate }: ProfileViewProps = {}) {
  // Fixed region value - defined at component level for global access
  const fixedRegion = "Philippine National Police No. 3, Santolan Road, Brgy. Corazon de Jesus, San Juan City, Metro Manila 1500, Philippines"
  
  const [officerProfile, setOfficerProfile] = useState<PNPOfficerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)
  
  // Form state for editable fields
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: ''
  })
  
  
  // Simple availability management state
  const [availabilityMode, setAvailabilityMode] = useState(false)
  const [availabilityStatus, setAvailabilityStatus] = useState<'available' | 'busy' | 'overloaded' | 'unavailable'>('available')
  const [savingAvailability, setSavingAvailability] = useState(false)

  useEffect(() => {
    loadOfficerProfile()
  }, [])

  const loadOfficerProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      const profile = await PNPOfficerService.getCurrentOfficerProfile()
      
      if (profile) {
        setOfficerProfile(profile)
        setFormData({
          full_name: profile.full_name,
          phone_number: profile.phone_number || ''
        })
        
        // Set simple availability status
        setAvailabilityStatus(profile.availability_status || 'available')
      } else {
        setError('Officer profile not found. Please contact your administrator.')
      }
    } catch (err) {
      console.error('Error loading officer profile:', err)
      setError('Failed to load officer profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      setSaving(true)
      const success = await PNPOfficerService.updateOfficerProfile({
        full_name: formData.full_name,
        phone_number: formData.phone_number || null
      })
      
      if (success) {
        // Reload profile to get updated data
        await loadOfficerProfile()
        setEditMode(false)
        // Trigger header refresh
        if (onProfileUpdate) {
          onProfileUpdate()
        }
      } else {
        setError('Failed to update profile. Please try again.')
      }
    } catch (err) {
      console.error('Error saving profile:', err)
      setError('Failed to save profile changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveAvailability = async () => {
    try {
      setSavingAvailability(true)
      setError(null)
      
      const success = await PNPOfficerService.updateOfficerAvailability({
        availability_status: availabilityStatus
      })
      
      if (success) {
        // Reload profile to get updated data
        await loadOfficerProfile()
        setAvailabilityMode(false)
        // Trigger header refresh
        if (onProfileUpdate) {
          onProfileUpdate()
        }
      } else {
        setError('Failed to update availability status. Please try again.')
      }
    } catch (err) {
      console.error('Error saving availability:', err)
      setError('Failed to save availability changes. Please try again.')
    } finally {
      setSavingAvailability(false)
    }
  }


  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="animate-fade-in-up">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-lawbot-blue-600 to-lawbot-emerald-600 bg-clip-text text-transparent">
            Officer Profile
          </h2>
          <p className="text-lawbot-slate-600 dark:text-lawbot-slate-400 text-sm sm:text-base lg:text-lg mt-2">
            Loading your profile information...
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-lawbot-blue-500" />
          <span className="ml-2 text-lawbot-slate-600 dark:text-lawbot-slate-400">Loading profile...</span>
        </div>
      </div>
    )
  }

  if (error || !officerProfile) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="animate-fade-in-up">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-lawbot-blue-600 to-lawbot-emerald-600 bg-clip-text text-transparent">
            Officer Profile
          </h2>
          <p className="text-lawbot-slate-600 dark:text-lawbot-slate-400 text-sm sm:text-base lg:text-lg mt-2">
            Unable to load your profile information
          </p>
        </div>
        <Alert className="border-lawbot-red-200 dark:border-lawbot-red-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-lawbot-red-700 dark:text-lawbot-red-300">
            {error || 'Officer profile not found'}
          </AlertDescription>
        </Alert>
        <Button onClick={loadOfficerProfile} className="btn-gradient">
          <Loader2 className="h-4 w-4 mr-2" />
          Retry Loading Profile
        </Button>
      </div>
    )
  }

  const officerData = {
    name: officerProfile.full_name,
    badge: officerProfile.badge_number,
    rank: officerProfile.rank,
    unit: officerProfile.unit?.unit_name || 'No Unit Assigned',
    email: officerProfile.email,
    phone: officerProfile.phone_number || 'Not provided',
    location: fixedRegion,
    joinDate: PhilippineTime.formatDatabaseTime(officerProfile.created_at),
    stats: {
      totalCases: officerProfile.total_cases,
      resolvedCases: officerProfile.resolved_cases,
      successRate: officerProfile.success_rate,
      avgResolutionTime: 0, // Will be calculated from PNPOfficerService.getOfficerStats()
    },
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="animate-fade-in-up">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-lawbot-blue-600 to-lawbot-emerald-600 bg-clip-text text-transparent">
          Officer Profile
        </h2>
        <p className="text-lawbot-slate-600 dark:text-lawbot-slate-400 text-sm sm:text-base lg:text-lg mt-2">
          Manage your profile, view performance metrics, and update your settings
        </p>
      </div>

      {error && (
        <Alert className="border-lawbot-amber-200 dark:border-lawbot-amber-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-lawbot-amber-700 dark:text-lawbot-amber-300">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        {/* Enhanced Profile Overview */}
        <Card className={`lg:col-span-1 card-modern bg-gradient-to-br from-lawbot-blue-50 to-white dark:from-lawbot-blue-900/10 dark:to-lawbot-slate-800 border-2 ${
          // Dynamic border color based on availability status
          (officerProfile.availability_status || 'available') === 'available' 
            ? 'border-lawbot-emerald-400 dark:border-lawbot-emerald-600 shadow-lawbot-emerald-100 dark:shadow-lawbot-emerald-900/20' 
          : (officerProfile.availability_status || 'available') === 'busy' 
            ? 'border-lawbot-amber-400 dark:border-lawbot-amber-600 shadow-lawbot-amber-100 dark:shadow-lawbot-amber-900/20'
          : (officerProfile.availability_status || 'available') === 'overloaded' 
            ? 'border-lawbot-red-400 dark:border-lawbot-red-600 shadow-lawbot-red-100 dark:shadow-lawbot-red-900/20'
          : 'border-lawbot-slate-400 dark:border-lawbot-slate-600 shadow-lawbot-slate-100 dark:shadow-lawbot-slate-900/20'
        } shadow-lg`}>
          <CardHeader className="text-center">
            <div className="relative mx-auto mb-4">
              <Avatar className={`h-32 w-32 mx-auto shadow-lg ring-4 ${
                // Dynamic ring color based on availability status
                (officerProfile.availability_status || 'available') === 'available' 
                  ? 'ring-lawbot-emerald-200 dark:ring-lawbot-emerald-700' 
                : (officerProfile.availability_status || 'available') === 'busy' 
                  ? 'ring-lawbot-amber-200 dark:ring-lawbot-amber-700'
                : (officerProfile.availability_status || 'available') === 'overloaded' 
                  ? 'ring-lawbot-red-200 dark:ring-lawbot-red-700'
                : 'ring-lawbot-slate-200 dark:ring-lawbot-slate-700'
              }`}>
                <AvatarImage src="/placeholder.svg?height=128&width=128" />
                <AvatarFallback className="text-3xl bg-gradient-to-br from-lawbot-blue-500 to-lawbot-blue-600 text-white font-bold">
                  {officerData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              {/* Availability Status Indicator */}
              <div className={`absolute -bottom-2 -right-2 p-2 rounded-full shadow-lg ${
                (officerProfile.availability_status || 'available') === 'available' 
                  ? 'bg-lawbot-emerald-500' 
                : (officerProfile.availability_status || 'available') === 'busy' 
                  ? 'bg-lawbot-amber-500'
                : (officerProfile.availability_status || 'available') === 'overloaded' 
                  ? 'bg-lawbot-red-500'
                : 'bg-lawbot-slate-500'
              }`}>
                {(officerProfile.availability_status || 'available') === 'available' && (
                  <div className="h-4 w-4 bg-white rounded-full flex items-center justify-center">
                    <div className="h-2 w-2 bg-lawbot-emerald-500 rounded-full"></div>
                  </div>
                )}
                {(officerProfile.availability_status || 'available') === 'busy' && (
                  <div className="h-4 w-4 bg-white rounded-full flex items-center justify-center">
                    <div className="h-2 w-2 bg-lawbot-amber-500 rounded-full"></div>
                  </div>
                )}
                {(officerProfile.availability_status || 'available') === 'overloaded' && (
                  <div className="h-4 w-4 bg-white rounded-full flex items-center justify-center">
                    <div className="h-2 w-2 bg-lawbot-red-500 rounded-full"></div>
                  </div>
                )}
                {(officerProfile.availability_status || 'available') === 'unavailable' && (
                  <div className="h-4 w-4 bg-white rounded-full flex items-center justify-center">
                    <div className="h-2 w-2 bg-lawbot-slate-500 rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
            <CardTitle className="text-xl text-lawbot-slate-900 dark:text-white">{officerData.name}</CardTitle>
            <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400 font-medium">{officerData.rank}</CardDescription>
            
            {/* Availability Status Badge */}
            <Badge className={`mt-2 border-0 text-xs font-bold ${
              (officerProfile.availability_status || 'available') === 'available' 
                ? 'bg-lawbot-emerald-100 text-lawbot-emerald-800 dark:bg-lawbot-emerald-900/30 dark:text-lawbot-emerald-200' 
              : (officerProfile.availability_status || 'available') === 'busy' 
                ? 'bg-lawbot-amber-100 text-lawbot-amber-800 dark:bg-lawbot-amber-900/30 dark:text-lawbot-amber-200'
              : (officerProfile.availability_status || 'available') === 'overloaded' 
                ? 'bg-lawbot-red-100 text-lawbot-red-800 dark:bg-lawbot-red-900/30 dark:text-lawbot-red-200'
              : 'bg-lawbot-slate-100 text-lawbot-slate-800 dark:bg-lawbot-slate-900/30 dark:text-lawbot-slate-200'
            }`}>
              {(officerProfile.availability_status || 'available') === 'available' && '🟢 AVAILABLE'}
              {(officerProfile.availability_status || 'available') === 'busy' && '🟡 BUSY'}
              {(officerProfile.availability_status || 'available') === 'overloaded' && '🔴 OVERLOADED'}
              {(officerProfile.availability_status || 'available') === 'unavailable' && '⚫ UNAVAILABLE'}
            </Badge>
            
            <Badge className="mt-2 bg-gradient-to-r from-lawbot-blue-500 to-lawbot-blue-600 text-white border-0 text-sm font-bold">
              🏷️ {officerData.badge}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
            <div className="flex items-center space-x-3 p-2 sm:p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-blue-200 dark:border-lawbot-blue-800">
              <div className="p-1.5 sm:p-2 bg-lawbot-blue-500 rounded-lg flex-shrink-0">
                <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-lawbot-slate-700 dark:text-lawbot-slate-300 truncate">{officerData.unit}</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-slate-200 dark:border-lawbot-slate-700">
              <div className="p-2 bg-lawbot-emerald-500 rounded-lg">
                <Mail className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium text-lawbot-slate-700 dark:text-lawbot-slate-300">{officerData.email}</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-slate-200 dark:border-lawbot-slate-700">
              <div className="p-2 bg-lawbot-purple-500 rounded-lg">
                <Phone className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium text-lawbot-slate-700 dark:text-lawbot-slate-300">{officerData.phone}</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-slate-200 dark:border-lawbot-slate-700">
              <div className="p-2 bg-lawbot-amber-500 rounded-lg">
                <MapPin className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium text-lawbot-slate-700 dark:text-lawbot-slate-300">{officerData.location}</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-slate-200 dark:border-lawbot-slate-700">
              <div className="p-2 bg-lawbot-red-500 rounded-lg">
                <Calendar className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium text-lawbot-slate-700 dark:text-lawbot-slate-300">📅 Joined {officerData.joinDate}</span>
            </div>
            <Button onClick={() => {
              setEditMode(true)
            }} className="w-full mt-6 btn-gradient">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </CardContent>
        </Card>

        {/* Enhanced Performance Stats */}
        <Card className="lg:col-span-2 card-modern bg-gradient-to-br from-lawbot-emerald-50 to-white dark:from-lawbot-emerald-900/10 dark:to-lawbot-slate-800 border-lawbot-emerald-200 dark:border-lawbot-emerald-800">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-lawbot-emerald-500 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl text-lawbot-slate-900 dark:text-white">Performance Overview</CardTitle>
                <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400">Your investigation performance metrics and achievements</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-gradient-to-br from-lawbot-blue-50 to-white dark:from-lawbot-blue-900/20 dark:to-lawbot-slate-800 rounded-xl border border-lawbot-blue-200 dark:border-lawbot-blue-800">
                <div className="text-3xl font-bold text-lawbot-blue-600 dark:text-lawbot-blue-400 mb-2">{officerData.stats.totalCases}</div>
                <div className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">📊 Total Cases</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-lawbot-emerald-50 to-white dark:from-lawbot-emerald-900/20 dark:to-lawbot-slate-800 rounded-xl border border-lawbot-emerald-200 dark:border-lawbot-emerald-800">
                <div className="text-3xl font-bold text-lawbot-emerald-600 dark:text-lawbot-emerald-400 mb-2">{officerData.stats.resolvedCases}</div>
                <div className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">✅ Resolved</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-lawbot-purple-50 to-white dark:from-lawbot-purple-900/20 dark:to-lawbot-slate-800 rounded-xl border border-lawbot-purple-200 dark:border-lawbot-purple-800">
                <div className="text-3xl font-bold text-lawbot-purple-600 dark:text-lawbot-purple-400 mb-2">{officerData.stats.successRate}%</div>
                <div className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">🎯 Success Rate</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-lawbot-amber-50 to-white dark:from-lawbot-amber-900/20 dark:to-lawbot-slate-800 rounded-xl border border-lawbot-amber-200 dark:border-lawbot-amber-800">
                <div className="text-3xl font-bold text-lawbot-amber-600 dark:text-lawbot-amber-400 mb-2">{officerProfile.active_cases}</div>
                <div className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">⚡ Active Cases</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="details" className="space-y-6 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <TabsList className="bg-lawbot-slate-100 dark:bg-lawbot-slate-800 p-1 rounded-xl grid grid-cols-3">
          <TabsTrigger value="details" className="data-[state=active]:bg-white dark:data-[state=active]:bg-lawbot-slate-700 data-[state=active]:text-lawbot-blue-600 font-medium text-xs">
            👤 Personal
          </TabsTrigger>
          <TabsTrigger value="availability" className="data-[state=active]:bg-white dark:data-[state=active]:bg-lawbot-slate-700 data-[state=active]:text-lawbot-green-600 font-medium text-xs">
            ⚡ Work Availability
          </TabsTrigger>
          <TabsTrigger value="unit" className="data-[state=active]:bg-white dark:data-[state=active]:bg-lawbot-slate-700 data-[state=active]:text-lawbot-indigo-600 font-medium text-xs">
            🏢 Unit
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card className="card-modern bg-gradient-to-br from-lawbot-blue-50/30 to-white dark:from-lawbot-blue-900/10 dark:to-lawbot-slate-800 border-lawbot-blue-200 dark:border-lawbot-blue-800">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-lawbot-blue-500 rounded-lg">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl text-lawbot-slate-900 dark:text-white">Personal Information</CardTitle>
                  <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400">Update your personal and contact information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="fullName" className="text-sm font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300">👤 Full Name</Label>
                  <Input 
                    id="fullName" 
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    disabled={!editMode}
                    className={editMode ? "border-lawbot-slate-300 dark:border-lawbot-slate-600 focus:border-lawbot-blue-500 focus:ring-lawbot-blue-500" : "bg-lawbot-slate-100 dark:bg-lawbot-slate-800 border-lawbot-slate-300 dark:border-lawbot-slate-600"} 
                  />
                  <p className="text-xs text-lawbot-emerald-600 dark:text-lawbot-emerald-400 font-medium">
                    ✅ You can edit this field
                  </p>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="badge" className="text-sm font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300">🏷️ Badge Number</Label>
                  <Input id="badge" value={officerData.badge} disabled className="bg-lawbot-slate-100 dark:bg-lawbot-slate-800 border-lawbot-slate-300 dark:border-lawbot-slate-600" />
                  <p className="text-xs text-lawbot-blue-600 dark:text-lawbot-blue-400 font-medium">
                    ⚠️ Official assignment - Contact admin to change
                  </p>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="rank" className="text-sm font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300">⭐ Rank</Label>
                  <Input id="rank" value={officerData.rank} disabled className="bg-lawbot-slate-100 dark:bg-lawbot-slate-800 border-lawbot-slate-300 dark:border-lawbot-slate-600" />
                  <p className="text-xs text-lawbot-blue-600 dark:text-lawbot-blue-400 font-medium">
                    ⚠️ Official rank - Contact admin to change
                  </p>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="unit" className="text-sm font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300">🛡️ Assigned Unit</Label>
                  <Input id="unit" value={officerData.unit} disabled className="bg-lawbot-slate-100 dark:bg-lawbot-slate-800 border-lawbot-slate-300 dark:border-lawbot-slate-600" />
                  <p className="text-xs text-lawbot-blue-600 dark:text-lawbot-blue-400 font-medium">
                    ⚠️ Unit assignment - Contact admin to change
                  </p>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300">📧 Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={officerData.email}
                    disabled
                    className="bg-lawbot-slate-100 dark:bg-lawbot-slate-800 border-lawbot-slate-300 dark:border-lawbot-slate-600"
                  />
                  <p className="text-xs text-lawbot-blue-600 dark:text-lawbot-blue-400 font-medium">
                    ⚠️ System email - Contact admin to change
                  </p>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-sm font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300">📱 Phone Number</Label>
                  <Input 
                    id="phone" 
                    value={formData.phone_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                    disabled={!editMode}
                    className={editMode ? "border-lawbot-slate-300 dark:border-lawbot-slate-600 focus:border-lawbot-blue-500 focus:ring-lawbot-blue-500" : "bg-lawbot-slate-100 dark:bg-lawbot-slate-800 border-lawbot-slate-300 dark:border-lawbot-slate-600"}
                  />
                  <p className="text-xs text-lawbot-emerald-600 dark:text-lawbot-emerald-400 font-medium">
                    ✅ You can edit this field
                  </p>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="region" className="text-sm font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300">📍 Region</Label>
                  <Input 
                    id="region" 
                    value={fixedRegion} 
                    disabled 
                    className="bg-lawbot-slate-100 dark:bg-lawbot-slate-800 border-lawbot-slate-300 dark:border-lawbot-slate-600" 
                  />
                  <p className="text-xs text-lawbot-blue-600 dark:text-lawbot-blue-400 font-medium">
                    ⚠️ System location - Contact admin to change
                  </p>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="joinDate" className="text-sm font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300">📅 Join Date</Label>
                  <Input id="joinDate" value={officerData.joinDate} disabled className="bg-lawbot-slate-100 dark:bg-lawbot-slate-800 border-lawbot-slate-300 dark:border-lawbot-slate-600" />
                  <p className="text-xs text-lawbot-blue-600 dark:text-lawbot-blue-400 font-medium">
                    ⚠️ Historical record - Cannot be changed
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                {editMode ? (
                  <>
                    <Button onClick={handleSaveProfile} disabled={saving} className="btn-gradient flex-1">
                      {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button onClick={() => setEditMode(false)} variant="outline" className="btn-modern border-lawbot-slate-300 text-lawbot-slate-600 hover:bg-lawbot-slate-50">
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => {
                    setEditMode(true)
                  }} className="btn-gradient flex-1">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="availability">
          <Card className="card-modern bg-gradient-to-br from-lawbot-green-50/30 to-white dark:from-lawbot-green-900/10 dark:to-lawbot-slate-800 border-lawbot-green-200 dark:border-lawbot-green-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-lawbot-green-500 rounded-lg">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-lawbot-slate-900 dark:text-white">Work Availability</CardTitle>
                    <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400">Manage your work availability for case assignments</CardDescription>
                  </div>
                </div>
                <Button
                  onClick={() => setAvailabilityMode(!availabilityMode)}
                  variant={availabilityMode ? "outline" : "default"}
                  className={availabilityMode ? "btn-modern" : "btn-gradient"}
                >
                  {availabilityMode ? (
                    <>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Update Status
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Status Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="card-modern bg-gradient-to-br from-lawbot-blue-50 to-white dark:from-lawbot-blue-900/10 dark:to-lawbot-slate-800 border-lawbot-blue-200 dark:border-lawbot-blue-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">Employment Status</span>
                      {(() => {
                        const status = officerProfile.status || 'active'
                        return (
                          <Badge className={`${
                            status === 'active' ? 'bg-green-100 text-green-800 border-green-200' :
                            status === 'on_leave' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                            status === 'suspended' ? 'bg-red-100 text-red-800 border-red-200' :
                            'bg-gray-100 text-gray-800 border-gray-200'
                          }`}>
                            {status === 'active' && '✅'}
                            {status === 'on_leave' && '🏖️'}
                            {status === 'suspended' && '⚠️'}
                            {status === 'retired' && '🏆'}
                            {' '}{status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        )
                      })()}
                    </div>
                    <p className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400">
                      {officerProfile.status === 'active' ? 'Operational and available for duty' :
                       officerProfile.status === 'on_leave' ? 'Currently on approved leave' :
                       officerProfile.status === 'suspended' ? 'Temporarily suspended from duty' :
                       'Retired from active service'}
                    </p>
                    <p className="text-xs text-lawbot-amber-600 dark:text-lawbot-amber-400 mt-2 font-medium">
                      ⚠️ Managed by Admin - Contact your administrator to change this status
                    </p>
                  </CardContent>
                </Card>

                <Card className="card-modern bg-gradient-to-br from-lawbot-emerald-50 to-white dark:from-lawbot-emerald-900/10 dark:to-lawbot-slate-800 border-lawbot-emerald-200 dark:border-lawbot-emerald-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">Work Availability</span>
                      {(() => {
                        const availability = officerProfile.availability_status || 'available'
                        return (
                          <Badge className={`${
                            availability === 'available' ? 'bg-green-100 text-green-800 border-green-200' :
                            availability === 'busy' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                            availability === 'overloaded' ? 'bg-red-100 text-red-800 border-red-200' :
                            'bg-gray-100 text-gray-800 border-gray-200'
                          }`}>
                            {availability === 'available' && '🟢'}
                            {availability === 'busy' && '🟡'}
                            {availability === 'overloaded' && '🔴'}
                            {availability === 'unavailable' && '⚫'}
                            {' '}{availability.toUpperCase()}
                          </Badge>
                        )
                      })()}
                    </div>
                    <p className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400">
                      {(officerProfile.availability_status || 'available') === 'available' ? 'Ready for new case assignments' :
                       (officerProfile.availability_status || 'available') === 'busy' ? 'At capacity but can take urgent cases' :
                       (officerProfile.availability_status || 'available') === 'overloaded' ? 'Cannot take new cases' :
                       'Currently unavailable for assignments'}
                    </p>
                    <p className="text-xs text-lawbot-emerald-600 dark:text-lawbot-emerald-400 mt-2 font-medium">
                      ✅ You can update this - Use 'Update Status' button above
                    </p>
                  </CardContent>
                </Card>
              </div>


              {/* Edit Availability Form */}
              {availabilityMode && (
                <Card className="card-modern bg-gradient-to-br from-lawbot-blue-50 to-white dark:from-lawbot-blue-900/10 dark:to-lawbot-slate-800 border-lawbot-blue-200 dark:border-lawbot-blue-800">
                  <CardHeader>
                    <CardTitle className="text-lg text-lawbot-slate-900 dark:text-white flex items-center">
                      <Edit className="h-4 w-4 mr-2 text-lawbot-blue-500" />
                      Update Work Availability
                    </CardTitle>
                    <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400">
                      Update your work availability for case assignments
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Availability Status */}
                    <div className="space-y-2">
                      <Label htmlFor="availabilityStatus">Work Availability</Label>
                      <Select 
                        value={availabilityStatus}
                        onValueChange={(value: 'available' | 'busy' | 'overloaded' | 'unavailable') => setAvailabilityStatus(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select work availability" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">
                            <div className="flex items-center space-x-2">
                              <span>🟢</span>
                              <div className="flex flex-col">
                                <span className="font-medium">Available</span>
                                <span className="text-xs text-gray-500">Ready for new case assignments</span>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem value="busy">
                            <div className="flex items-center space-x-2">
                              <span>🟡</span>
                              <div className="flex flex-col">
                                <span className="font-medium">Busy</span>
                                <span className="text-xs text-gray-500">At capacity but can take urgent cases</span>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem value="overloaded">
                            <div className="flex items-center space-x-2">
                              <span>🔴</span>
                              <div className="flex flex-col">
                                <span className="font-medium">Overloaded</span>
                                <span className="text-xs text-gray-500">Cannot take new cases</span>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem value="unavailable">
                            <div className="flex items-center space-x-2">
                              <span>⚫</span>
                              <div className="flex flex-col">
                                <span className="font-medium">Unavailable</span>
                                <span className="text-xs text-gray-500">Not available for assignments</span>
                              </div>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Save/Cancel Buttons */}
                    <div className="flex space-x-3 pt-4">
                      <Button
                        onClick={handleSaveAvailability}
                        disabled={savingAvailability}
                        className="btn-gradient flex-1"
                      >
                        {savingAvailability ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        {savingAvailability ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button
                        onClick={() => setAvailabilityMode(false)}
                        variant="outline"
                        className="btn-modern"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Info Alert */}
              <Alert className="border-lawbot-blue-200 dark:border-lawbot-blue-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-lawbot-blue-700 dark:text-lawbot-blue-300">
                  <strong>Important Reminders:</strong><br/>
                  • <strong>Employment Status</strong> (Active/On Leave/Suspended/Retired) - Only admins can change this<br/>
                  • <strong>Work Availability</strong> (Available/Busy/Overloaded/Unavailable) - You can update this yourself<br/>
                  • Work availability changes affect your eligibility for new case assignments
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unit">
          <Card className="card-modern bg-gradient-to-br from-lawbot-indigo-50/30 to-white dark:from-lawbot-indigo-900/10 dark:to-lawbot-slate-800 border-lawbot-indigo-200 dark:border-lawbot-indigo-800">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-lawbot-indigo-500 rounded-lg">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl text-lawbot-slate-900 dark:text-white">Unit Assignment Information</CardTitle>
                  <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400">Your assigned PNP unit and crime types you handle</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              {officerProfile.unit ? (
                <>
                  {/* Unit Overview */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="card-modern bg-gradient-to-br from-lawbot-blue-50 to-white dark:from-lawbot-blue-900/10 dark:to-lawbot-slate-800 border-lawbot-blue-200 dark:border-lawbot-blue-800">
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-lawbot-blue-500 rounded-lg">
                            <Shield className="h-4 w-4 text-white" />
                          </div>
                          <CardTitle className="text-lg text-lawbot-slate-900 dark:text-white">Assigned Unit</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-bold text-lg text-lawbot-blue-600 dark:text-lawbot-blue-400 mb-2">{officerProfile.unit.unit_name}</h4>
                            <p className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400 font-medium mb-3">🏷️ Unit Code: {officerProfile.unit.unit_code}</p>
                            <p className="text-sm text-lawbot-slate-700 dark:text-lawbot-slate-300 leading-relaxed mb-4">{officerProfile.unit.description}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-lawbot-slate-50 dark:bg-lawbot-slate-800 rounded-lg">
                              <div className="text-lg font-bold text-lawbot-blue-600 dark:text-lawbot-blue-400">{officerProfile.unit.current_officers}</div>
                              <div className="text-xs text-lawbot-slate-600 dark:text-lawbot-slate-400">👥 Current Officers</div>
                            </div>
                            <div className="p-3 bg-lawbot-slate-50 dark:bg-lawbot-slate-800 rounded-lg">
                              <div className="text-lg font-bold text-lawbot-emerald-600 dark:text-lawbot-emerald-400">{officerProfile.unit.success_rate}%</div>
                              <div className="text-xs text-lawbot-slate-600 dark:text-lawbot-slate-400">🎯 Unit Success Rate</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="card-modern bg-gradient-to-br from-lawbot-emerald-50 to-white dark:from-lawbot-emerald-900/10 dark:to-lawbot-slate-800 border-lawbot-emerald-200 dark:border-lawbot-emerald-800">
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-lawbot-emerald-500 rounded-lg">
                            <Target className="h-4 w-4 text-white" />
                          </div>
                          <CardTitle className="text-lg text-lawbot-slate-900 dark:text-white">Unit Category</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Badge className="bg-gradient-to-r from-lawbot-emerald-100 to-lawbot-emerald-200 text-lawbot-emerald-800 border border-lawbot-emerald-300 dark:from-lawbot-emerald-900/30 dark:to-lawbot-emerald-800/30 dark:text-lawbot-emerald-200 dark:border-lawbot-emerald-700 text-sm font-bold px-4 py-2 mb-4">
                            📊 {officerProfile.unit.category}
                          </Badge>
                          <div className="space-y-3">
                            <div className="p-3 bg-lawbot-slate-50 dark:bg-lawbot-slate-800 rounded-lg">
                              <div className="text-lg font-bold text-lawbot-emerald-600 dark:text-lawbot-emerald-400">{officerProfile.unit.active_cases}</div>
                              <div className="text-xs text-lawbot-slate-600 dark:text-lawbot-slate-400">📋 Active Unit Cases</div>
                            </div>
                            <div className="p-3 bg-lawbot-slate-50 dark:bg-lawbot-slate-800 rounded-lg">
                              <div className="text-lg font-bold text-lawbot-blue-600 dark:text-lawbot-blue-400">{officerProfile.unit.resolved_cases}</div>
                              <div className="text-xs text-lawbot-slate-600 dark:text-lawbot-slate-400">✅ Unit Resolved Cases</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Crime Types */}
                  <div>
                    <h4 className="font-semibold mb-5 text-lawbot-slate-800 dark:text-lawbot-slate-200 flex items-center">
                      <BookOpen className="h-4 w-4 mr-2 text-lawbot-indigo-500" />
                      🎯 Crime Types You Handle
                    </h4>
                    <Card className="card-modern bg-gradient-to-br from-lawbot-purple-50 to-white dark:from-lawbot-purple-900/10 dark:to-lawbot-slate-800 border-lawbot-purple-200 dark:border-lawbot-purple-800">
                      <CardHeader>
                        <CardTitle className="text-lg text-lawbot-slate-900 dark:text-white flex items-center">
                          <Shield className="h-4 w-4 mr-2 text-lawbot-purple-500" /> 
                          Specialized Crime Types ({officerProfile.unit.crime_types?.length || 0} types)
                        </CardTitle>
                        <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400">
                          Based on your unit assignment, you are qualified to investigate these specific cybercrime categories:
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {officerProfile.unit.crime_types && officerProfile.unit.crime_types.length > 0 ? (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {officerProfile.unit.crime_types.map((crimeType, index) => (
                                <div key={index} className="flex items-center p-3 bg-gradient-to-r from-white to-lawbot-purple-50/30 dark:from-lawbot-slate-800 dark:to-lawbot-purple-900/10 border border-lawbot-purple-200 dark:border-lawbot-purple-800 rounded-lg hover:shadow-md transition-all duration-300">
                                  <div className="p-1 bg-lawbot-purple-500 rounded-md mr-3">
                                    <Shield className="h-3 w-3 text-white" />
                                  </div>
                                  <span className="text-sm font-medium text-lawbot-slate-700 dark:text-lawbot-slate-300">{crimeType}</span>
                                </div>
                              ))}
                            </div>
                            <div className="mt-6 p-4 bg-gradient-to-r from-lawbot-blue-50 to-lawbot-indigo-50 dark:from-lawbot-blue-900/20 dark:to-lawbot-indigo-900/20 rounded-xl border border-lawbot-blue-200 dark:border-lawbot-blue-800">
                              <div className="flex items-start space-x-3">
                                <div className="p-2 bg-lawbot-blue-500 rounded-lg">
                                  <BookOpen className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                  <h5 className="font-semibold text-lawbot-slate-900 dark:text-white mb-2">📚 Investigation Authority</h5>
                                  <p className="text-sm text-lawbot-slate-700 dark:text-lawbot-slate-300 leading-relaxed">
                                    As a member of the <strong>{officerProfile.unit.unit_name}</strong>, you have specialized training and authority to investigate all crimes listed above. 
                                    Citizens will see available officers from your unit when reporting these crime types through the mobile app, and assignments depend on your availability status.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-8">
                            <AlertCircle className="h-12 w-12 text-lawbot-slate-400 mx-auto mb-4" />
                            <p className="text-lawbot-slate-600 dark:text-lawbot-slate-400">No crime types assigned to your unit</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-lawbot-blue-50 to-lawbot-indigo-50 dark:from-lawbot-blue-900/20 dark:to-lawbot-indigo-900/20 rounded-xl border border-lawbot-blue-200 dark:border-lawbot-blue-800">
                    <Badge className="bg-gradient-to-r from-lawbot-indigo-100 to-lawbot-indigo-200 text-lawbot-indigo-800 border border-lawbot-indigo-300 dark:from-lawbot-indigo-900/30 dark:to-lawbot-indigo-800/30 dark:text-lawbot-indigo-200 dark:border-lawbot-indigo-700 text-sm font-bold px-4 py-2 mb-3">
                      📊 {officerProfile.unit.category}
                    </Badge>
                    <p className="text-sm text-lawbot-slate-700 dark:text-lawbot-slate-300">
                      Specializing in <strong>{officerProfile.unit.category.toLowerCase()}</strong>, your unit currently handles <strong>{officerProfile.unit.active_cases} active cases</strong> with a proven track record of <strong>{officerProfile.unit.resolved_cases} resolved cases</strong>.
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <Building2 className="h-16 w-16 text-lawbot-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-lawbot-slate-900 dark:text-white mb-2">No Unit Assignment</h3>
                  <p className="text-lawbot-slate-600 dark:text-lawbot-slate-400 mb-4">
                    You are not currently assigned to any PNP unit. Please contact your administrator to be assigned to a specialized cybercrime unit.
                  </p>
                  <Alert className="border-lawbot-amber-200 dark:border-lawbot-amber-800 text-left">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-lawbot-amber-700 dark:text-lawbot-amber-300">
                      Without a unit assignment, you cannot be assigned cases or access specialized investigation tools.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>


      </Tabs>
    </div>
  )
}