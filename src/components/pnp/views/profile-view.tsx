"use client"

import { useState, useEffect } from "react"
import { Shield, Award, Calendar, Mail, Phone, MapPin, Edit, Save, User, TrendingUp, Lock, Settings, Bell, Eye, Building2, Target, BookOpen, Loader2, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PNPOfficerService, PNPOfficerProfile } from "@/lib/pnp-officer-service"

export function ProfileView() {
  const [officerProfile, setOfficerProfile] = useState<PNPOfficerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)
  
  // Form state for editable fields
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: ''
  })

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
          email: profile.email,
          phone_number: profile.phone_number || ''
        })
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
        email: formData.email,
        phone_number: formData.phone_number || null
      })
      
      if (success) {
        // Reload profile to get updated data
        await loadOfficerProfile()
        setEditMode(false)
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

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="animate-fade-in-up">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-lawbot-blue-600 to-lawbot-emerald-600 bg-clip-text text-transparent">
            Officer Profile
          </h2>
          <p className="text-lawbot-slate-600 dark:text-lawbot-slate-400 text-lg mt-2">
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
          <h2 className="text-4xl font-bold bg-gradient-to-r from-lawbot-blue-600 to-lawbot-emerald-600 bg-clip-text text-transparent">
            Officer Profile
          </h2>
          <p className="text-lawbot-slate-600 dark:text-lawbot-slate-400 text-lg mt-2">
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
    location: officerProfile.region,
    joinDate: new Date(officerProfile.created_at).toLocaleDateString(),
    specializations: [], // TODO: Add specializations to database schema
    certifications: [], // TODO: Add certifications to database schema
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
        <h2 className="text-4xl font-bold bg-gradient-to-r from-lawbot-blue-600 to-lawbot-emerald-600 bg-clip-text text-transparent">
          Officer Profile
        </h2>
        <p className="text-lawbot-slate-600 dark:text-lawbot-slate-400 text-lg mt-2">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        {/* Enhanced Profile Overview */}
        <Card className="lg:col-span-1 card-modern bg-gradient-to-br from-lawbot-blue-50 to-white dark:from-lawbot-blue-900/10 dark:to-lawbot-slate-800 border-lawbot-blue-200 dark:border-lawbot-blue-800">
          <CardHeader className="text-center">
            <div className="relative mx-auto mb-4">
              <Avatar className="h-32 w-32 mx-auto shadow-lg ring-4 ring-lawbot-blue-100 dark:ring-lawbot-blue-800">
                <AvatarImage src="/placeholder.svg?height=128&width=128" />
                <AvatarFallback className="text-3xl bg-gradient-to-br from-lawbot-blue-500 to-lawbot-blue-600 text-white font-bold">
                  {officerData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 p-2 bg-lawbot-emerald-500 rounded-full shadow-lg">
                <User className="h-4 w-4 text-white" />
              </div>
            </div>
            <CardTitle className="text-xl text-lawbot-slate-900 dark:text-white">{officerData.name}</CardTitle>
            <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400 font-medium">{officerData.rank}</CardDescription>
            <Badge className="mt-3 bg-gradient-to-r from-lawbot-blue-500 to-lawbot-blue-600 text-white border-0 text-sm font-bold">
              🏷️ {officerData.badge}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-blue-200 dark:border-lawbot-blue-800">
              <div className="p-2 bg-lawbot-blue-500 rounded-lg">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium text-lawbot-slate-700 dark:text-lawbot-slate-300">{officerData.unit}</span>
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
            <Button onClick={() => setEditMode(true)} className="w-full mt-6 btn-gradient">
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
        <TabsList className="bg-lawbot-slate-100 dark:bg-lawbot-slate-800 p-1 rounded-xl grid grid-cols-5">
          <TabsTrigger value="details" className="data-[state=active]:bg-white dark:data-[state=active]:bg-lawbot-slate-700 data-[state=active]:text-lawbot-blue-600 font-medium">
            👤 Personal Details
          </TabsTrigger>
          <TabsTrigger value="unit" className="data-[state=active]:bg-white dark:data-[state=active]:bg-lawbot-slate-700 data-[state=active]:text-lawbot-indigo-600 font-medium">
            🏢 Unit Information
          </TabsTrigger>
          <TabsTrigger value="specializations" className="data-[state=active]:bg-white dark:data-[state=active]:bg-lawbot-slate-700 data-[state=active]:text-lawbot-emerald-600 font-medium">
            🎯 Specializations
          </TabsTrigger>
          <TabsTrigger value="certifications" className="data-[state=active]:bg-white dark:data-[state=active]:bg-lawbot-slate-700 data-[state=active]:text-lawbot-purple-600 font-medium">
            🏆 Certifications
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-white dark:data-[state=active]:bg-lawbot-slate-700 data-[state=active]:text-lawbot-amber-600 font-medium">
            ⚙️ Settings
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
                </div>
                <div className="space-y-3">
                  <Label htmlFor="badge" className="text-sm font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300">🏷️ Badge Number</Label>
                  <Input id="badge" value={officerData.badge} disabled className="bg-lawbot-slate-100 dark:bg-lawbot-slate-800 border-lawbot-slate-300 dark:border-lawbot-slate-600" />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="rank" className="text-sm font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300">⭐ Rank</Label>
                  <Input id="rank" value={officerData.rank} disabled className="bg-lawbot-slate-100 dark:bg-lawbot-slate-800 border-lawbot-slate-300 dark:border-lawbot-slate-600" />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="unit" className="text-sm font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300">🛡️ Assigned Unit</Label>
                  <Input id="unit" value={officerData.unit} disabled className="bg-lawbot-slate-100 dark:bg-lawbot-slate-800 border-lawbot-slate-300 dark:border-lawbot-slate-600" />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300">📧 Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!editMode}
                    className={editMode ? "border-lawbot-slate-300 dark:border-lawbot-slate-600 focus:border-lawbot-blue-500 focus:ring-lawbot-blue-500" : "bg-lawbot-slate-100 dark:bg-lawbot-slate-800 border-lawbot-slate-300 dark:border-lawbot-slate-600"}
                  />
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
                </div>
                <div className="space-y-3">
                  <Label htmlFor="location" className="text-sm font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300">📍 Region</Label>
                  <Input id="location" value={officerData.location} disabled className="bg-lawbot-slate-100 dark:bg-lawbot-slate-800 border-lawbot-slate-300 dark:border-lawbot-slate-600" />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="joinDate" className="text-sm font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300">📅 Join Date</Label>
                  <Input id="joinDate" value={officerData.joinDate} disabled className="bg-lawbot-slate-100 dark:bg-lawbot-slate-800 border-lawbot-slate-300 dark:border-lawbot-slate-600" />
                </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor="bio" className="text-sm font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300">📝 Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Brief description about yourself and your experience in cybercrime investigation..."
                  className="min-h-24 border-lawbot-slate-300 dark:border-lawbot-slate-600 focus:border-lawbot-blue-500 focus:ring-lawbot-blue-500"
                  disabled
                />
                <p className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-500">Bio functionality coming soon</p>
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
                  <Button onClick={() => setEditMode(true)} className="btn-gradient flex-1">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
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
                  <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400">Your assigned PNP unit, specialization area, and crime types you handle</CardDescription>
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
                          <CardTitle className="text-lg text-lawbot-slate-900 dark:text-white">Specialization Area</CardTitle>
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
                                    Cases involving these crime types will be automatically routed to your unit for assignment and investigation.
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

        <TabsContent value="specializations">
          <Card className="card-modern bg-gradient-to-br from-lawbot-emerald-50/30 to-white dark:from-lawbot-emerald-900/10 dark:to-lawbot-slate-800 border-lawbot-emerald-200 dark:border-lawbot-emerald-800">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-lawbot-emerald-500 rounded-lg">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl text-lawbot-slate-900 dark:text-white">Areas of Specialization</CardTitle>
                  <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400">Your expertise in different cybercrime categories and investigation techniques</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Target className="h-16 w-16 text-lawbot-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-lawbot-slate-900 dark:text-white mb-2">Specializations Coming Soon</h3>
                <p className="text-lawbot-slate-600 dark:text-lawbot-slate-400 mb-4">
                  Individual officer specializations and training records will be added in a future update.
                </p>
                <p className="text-sm text-lawbot-slate-500 dark:text-lawbot-slate-500">
                  For now, your specializations are based on your unit assignment: <strong>{officerProfile.unit?.category || 'No unit assigned'}</strong>
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certifications">
          <Card className="card-modern bg-gradient-to-br from-lawbot-purple-50/30 to-white dark:from-lawbot-purple-900/10 dark:to-lawbot-slate-800 border-lawbot-purple-200 dark:border-lawbot-purple-800">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-lawbot-purple-500 rounded-lg">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl text-lawbot-slate-900 dark:text-white">Certifications & Training</CardTitle>
                  <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400">Your professional certifications and completed training programs</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Award className="h-16 w-16 text-lawbot-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-lawbot-slate-900 dark:text-white mb-2">Certifications Coming Soon</h3>
                <p className="text-lawbot-slate-600 dark:text-lawbot-slate-400 mb-4">
                  Officer certifications and training records will be managed in a future update.
                </p>
                <p className="text-sm text-lawbot-slate-500 dark:text-lawbot-slate-500">
                  This will include PNP training completions, external certifications, and continuing education requirements.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="card-modern bg-gradient-to-br from-lawbot-amber-50/30 to-white dark:from-lawbot-amber-900/10 dark:to-lawbot-slate-800 border-lawbot-amber-200 dark:border-lawbot-amber-800">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-lawbot-amber-500 rounded-lg">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl text-lawbot-slate-900 dark:text-white">Account Settings</CardTitle>
                  <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400">Manage your account preferences and security settings</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="text-center py-8">
                <Settings className="h-16 w-16 text-lawbot-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-lawbot-slate-900 dark:text-white mb-2">Settings Coming Soon</h3>
                <p className="text-lawbot-slate-600 dark:text-lawbot-slate-400 mb-4">
                  Advanced account settings including notifications, security, and privacy preferences will be available in a future update.
                </p>
                <p className="text-sm text-lawbot-slate-500 dark:text-lawbot-slate-500">
                  For now, you can edit your basic profile information in the Personal Details tab.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}