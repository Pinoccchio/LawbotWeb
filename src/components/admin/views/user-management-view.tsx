"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Edit, Trash2, Shield, User, Mail, Phone, Activity, Users, Settings, AlertTriangle, RefreshCw, Crown } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddOfficerModal } from "@/components/admin/modals/add-officer-modal"
import { EditOfficerModal } from "@/components/admin/modals/edit-officer-modal"
import { DeleteOfficerModal } from "@/components/admin/modals/delete-officer-modal"
import { AddSuperAdminModal } from "@/components/admin/modals/add-super-admin-modal"
import { EditSuperAdminModal } from "@/components/admin/modals/edit-super-admin-modal"
import { DeleteSuperAdminModal } from "@/components/admin/modals/delete-super-admin-modal"
import { UserProfileModal } from "@/components/admin/modals/user-profile-modal"
import { UserEditModal } from "@/components/admin/modals/user-edit-modal"
import { supabase } from "@/lib/supabase"
import UserService, { UserProfile, UserStats } from "@/lib/user-service"
import AdminManagementService, { SuperAdminProfile, AdminStats } from "@/lib/admin-management-service"
import { PhilippineTime } from "@/lib/philippine-time"

export function UserManagementView() {
  // Super Admin state
  const [isAddSuperAdminModalOpen, setIsAddSuperAdminModalOpen] = useState(false)
  const [isEditSuperAdminModalOpen, setIsEditSuperAdminModalOpen] = useState(false)
  const [isDeleteSuperAdminModalOpen, setIsDeleteSuperAdminModalOpen] = useState(false)
  const [selectedSuperAdmin, setSelectedSuperAdmin] = useState<SuperAdminProfile | null>(null)
  const [superAdmins, setSuperAdmins] = useState<SuperAdminProfile[]>([])
  const [isLoadingSuperAdmins, setIsLoadingSuperAdmins] = useState(false)
  const [superAdminSearchTerm, setSuperAdminSearchTerm] = useState("")
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null)
  
  // PNP Officer state
  const [isAddOfficerModalOpen, setIsAddOfficerModalOpen] = useState(false)
  const [isEditOfficerModalOpen, setIsEditOfficerModalOpen] = useState(false)
  const [isDeleteOfficerModalOpen, setIsDeleteOfficerModalOpen] = useState(false)
  const [selectedOfficer, setSelectedOfficer] = useState<any>(null)
  const [pnpOfficers, setPnpOfficers] = useState<any[]>([])
  const [isLoadingOfficers, setIsLoadingOfficers] = useState(false)
  const [officerSearchTerm, setOfficerSearchTerm] = useState("")
  const [clientSearchTerm, setClientSearchTerm] = useState("")
  
  // Real client data state
  const [clientUsers, setClientUsers] = useState<UserProfile[]>([])
  const [isLoadingClients, setIsLoadingClients] = useState(false)
  const [clientError, setClientError] = useState<string | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  
  // User modal state
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false)
  const [isUserEditModalOpen, setIsUserEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)

  // Fetch Super Admins from Supabase
  const fetchSuperAdmins = async () => {
    setIsLoadingSuperAdmins(true)
    try {
      const [admins, stats] = await Promise.all([
        AdminManagementService.getAllSuperAdmins(),
        AdminManagementService.getAdminStats()
      ])
      
      setSuperAdmins(admins)
      setAdminStats(stats)
      console.log(`✅ Loaded ${admins.length} super admins`)
    } catch (error) {
      console.error('❌ Error fetching super admins:', error)
      setSuperAdmins([])
    } finally {
      setIsLoadingSuperAdmins(false)
    }
  }

  // Fetch PNP officers from Supabase with enhanced availability data and real-time case counts
  const fetchPnpOfficers = async () => {
    setIsLoadingOfficers(true)
    try {
      // First, get officers with their units
      const { data: officersData, error: officersError } = await supabase
        .from('pnp_officer_profiles')
        .select(`
          *,
          pnp_units(id, unit_name, unit_code, category)
        `)
        .order('created_at', { ascending: false })

      if (officersError) {
        console.error('Error fetching PNP officers:', officersError)
        setPnpOfficers([])
        return
      }

      // Get real-time case counts for each officer using the database function
      const transformedOfficers = await Promise.all(
        officersData.map(async (officer: any) => {
          // Get real-time case counts using the database function
          const { data: caseCounts, error: countsError } = await supabase
            .rpc('calculate_officer_case_counts', { officer_uuid: officer.id })

          let realTimeCounts = {
            total_cases: officer.total_cases || 0,
            active_cases: officer.active_cases || 0,
            resolved_cases: officer.resolved_cases || 0,
            success_rate: officer.success_rate || 0
          }

          // Use real-time counts if available, fallback to stored values
          if (!countsError && caseCounts && caseCounts.length > 0) {
            realTimeCounts = caseCounts[0]
          } else if (countsError) {
            console.warn(`Error getting real-time counts for officer ${officer.full_name}:`, countsError)
          }

          return {
            id: officer.id,
            name: officer.full_name,
            email: officer.email,
            phone: officer.phone_number || 'N/A',
            badge: officer.badge_number,
            rank: officer.rank,
            unit: officer.pnp_units?.unit_name || 'No Unit',
            unitId: officer.unit_id,
            unitCode: officer.pnp_units?.unit_code || 'N/A',
            unitCategory: officer.pnp_units?.category || 'N/A',
            region: officer.region,
            status: officer.status || 'active',
            availabilityStatus: officer.availability_status || 'available',
            // Activity tracking
            lastLoginAt: officer.last_login_at,
            lastCaseAssignmentAt: officer.last_case_assignment_at,
            lastStatusUpdateAt: officer.last_status_update_at,
            // Real-time performance metrics
            cases: realTimeCounts.total_cases,
            activeCases: realTimeCounts.active_cases,
            resolved: realTimeCounts.resolved_cases,
            successRate: parseFloat(realTimeCounts.success_rate) || 0,
            created_at: officer.created_at
          }
        })
      )

      setPnpOfficers(transformedOfficers)
      console.log(`✅ Loaded ${transformedOfficers.length} officers with real-time case counts`)
    } catch (error) {
      console.error('Error fetching PNP officers:', error)
      setPnpOfficers([])
    } finally {
      setIsLoadingOfficers(false)
    }
  }

  // Fetch real client users from Supabase
  const fetchClientUsers = async () => {
    setIsLoadingClients(true)
    setClientError(null)
    
    try {
      console.log('🔄 Fetching client users for User Management view...')
      
      // Fetch all client users with case counts
      const users = await UserService.getAllClientUsers()
      setClientUsers(users)
      console.log('✅ Client users loaded:', users.length)
      
      // Fetch user statistics
      const stats = await UserService.getUserStats()
      setUserStats(stats)
      console.log('✅ User statistics loaded:', stats)
      
    } catch (error) {
      console.error('❌ Error fetching client users:', error)
      setClientError(error instanceof Error ? error.message : 'Failed to load client users')
    } finally {
      setIsLoadingClients(false)
    }
  }

  // Load all data on component mount
  useEffect(() => {
    fetchSuperAdmins()
    fetchPnpOfficers()
    fetchClientUsers()
  }, [])


  const handleSuperAdminCreated = () => {
    console.log('🔄 Super Admin created callback triggered, refreshing data...')
    fetchSuperAdmins()
  }

  const handleSuperAdminUpdated = () => {
    console.log('🔄 Super Admin updated callback triggered, refreshing data...')
    fetchSuperAdmins()
  }

  const handleSuperAdminDeleted = () => {
    console.log('🔄 Super Admin deleted callback triggered, refreshing data...')
    fetchSuperAdmins()
  }

  const handleOfficerCreated = () => {
    // Refresh the officers list after successful creation
    console.log('🔄 Officer created callback triggered, refreshing data...')
    fetchPnpOfficers()
    
    // Also trigger a global refresh event that the PNP Units view can listen to
    window.dispatchEvent(new CustomEvent('officer-created'))
  }

  // Filter super admins based on search term
  const filteredSuperAdmins = superAdmins.filter(admin =>
    admin.full_name.toLowerCase().includes(superAdminSearchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(superAdminSearchTerm.toLowerCase()) ||
    admin.role.toLowerCase().includes(superAdminSearchTerm.toLowerCase()) ||
    admin.status.toLowerCase().includes(superAdminSearchTerm.toLowerCase())
  )

  // Filter officers based on search term (basic fields only)
  const filteredOfficers = pnpOfficers.filter(officer =>
    officer.name.toLowerCase().includes(officerSearchTerm.toLowerCase()) ||
    officer.email.toLowerCase().includes(officerSearchTerm.toLowerCase()) ||
    officer.badge.toLowerCase().includes(officerSearchTerm.toLowerCase()) ||
    officer.unit.toLowerCase().includes(officerSearchTerm.toLowerCase()) ||
    officer.rank.toLowerCase().includes(officerSearchTerm.toLowerCase()) ||
    officer.region.toLowerCase().includes(officerSearchTerm.toLowerCase()) ||
    (officer.status || 'active').toLowerCase().includes(officerSearchTerm.toLowerCase()) ||
    (officer.availabilityStatus || 'available').toLowerCase().includes(officerSearchTerm.toLowerCase()) ||
    (officer.unitCode || '').toLowerCase().includes(officerSearchTerm.toLowerCase()) ||
    (officer.unitCategory || '').toLowerCase().includes(officerSearchTerm.toLowerCase())
  )

  // Filter clients based on search term
  const filteredClients = clientUsers.filter(client =>
    client.full_name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    client.phone_number.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    client.firebase_uid.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    client.user_status.toLowerCase().includes(clientSearchTerm.toLowerCase())
  )

  // Handle Super Admin actions
  const handleEditSuperAdmin = (admin: SuperAdminProfile) => {
    console.log('Edit super admin:', admin)
    setSelectedSuperAdmin(admin)
    setIsEditSuperAdminModalOpen(true)
  }

  const handleDeleteSuperAdmin = (admin: SuperAdminProfile) => {
    console.log('Delete super admin:', admin)
    setSelectedSuperAdmin(admin)
    setIsDeleteSuperAdminModalOpen(true)
  }

  // Handle edit officer
  const handleEditOfficer = (officer: any) => {
    console.log('Edit officer:', officer)
    setSelectedOfficer(officer)
    setIsEditOfficerModalOpen(true)
  }

  // Handle delete officer
  const handleDeleteOfficer = (officer: any) => {
    console.log('Delete officer:', officer)
    setSelectedOfficer(officer)
    setIsDeleteOfficerModalOpen(true)
  }


  // Handle modal success callbacks
  const handleEditSuccess = () => {
    fetchPnpOfficers() // Refresh the list
  }

  const handleDeleteSuccess = () => {
    fetchPnpOfficers() // Refresh the list
  }

  // Handle user modal actions
  const handleViewUserProfile = (user: UserProfile) => {
    console.log('View user profile:', user.firebase_uid)
    setSelectedUser(user)
    setIsUserProfileModalOpen(true)
  }

  const handleEditUser = (user: UserProfile) => {
    console.log('Edit user:', user.firebase_uid)
    setSelectedUser(user)
    setIsUserEditModalOpen(true)
  }

  const handleUserUpdated = () => {
    fetchClientUsers() // Refresh the client users list
  }


  // Use filtered data for display
  const displayOfficers = filteredOfficers

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-lawbot-emerald-600 to-lawbot-blue-600 bg-clip-text text-transparent leading-tight pb-2">
            User Management
          </h2>
          <p className="text-lawbot-slate-600 dark:text-lawbot-slate-400 text-base sm:text-lg mt-2">
            Manage PNP officers and client accounts across the platform
          </p>
        </div>
      </div>

      {/* Enhanced User Stats with Admin and Officer Metrics */}
      <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        
        {/* Administrative Overview - Top Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {/* Super Admins Card */}
          <Card className="stats-card bg-gradient-to-br from-lawbot-purple-50 to-white dark:from-lawbot-purple-900/10 dark:to-lawbot-slate-800 border-lawbot-purple-200 dark:border-lawbot-purple-800">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 p-3 bg-gradient-to-r from-lawbot-purple-500 to-lawbot-purple-600 rounded-xl">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400 mb-1">Super Admins</p>
                  <p className="text-3xl font-bold text-lawbot-purple-600 dark:text-lawbot-purple-400 mb-1">{adminStats?.total_admins || 0}</p>
                  <p className="text-sm text-lawbot-purple-500 dark:text-lawbot-purple-400">System administrators</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Officers Card */}
          <Card className="stats-card bg-gradient-to-br from-lawbot-blue-50 to-white dark:from-lawbot-blue-900/10 dark:to-lawbot-slate-800 border-lawbot-blue-200 dark:border-lawbot-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 p-3 bg-gradient-to-r from-lawbot-blue-500 to-lawbot-blue-600 rounded-xl">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400 mb-1">Total Officers</p>
                  <p className="text-3xl font-bold text-lawbot-blue-600 dark:text-lawbot-blue-400 mb-1">{displayOfficers.length}</p>
                  <p className="text-sm text-lawbot-slate-500 dark:text-lawbot-slate-400">PNP personnel</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Accounts Card */}
          <Card className="stats-card bg-gradient-to-br from-lawbot-emerald-50 to-white dark:from-lawbot-emerald-900/10 dark:to-lawbot-slate-800 border-lawbot-emerald-200 dark:border-lawbot-emerald-800">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 p-3 bg-gradient-to-r from-lawbot-emerald-500 to-lawbot-emerald-600 rounded-xl">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400 mb-1">Client Accounts</p>
                  <p className="text-3xl font-bold text-lawbot-emerald-600 dark:text-lawbot-emerald-400 mb-1">{userStats?.total_users || 0}</p>
                  <p className="text-sm text-lawbot-emerald-500 dark:text-lawbot-emerald-400">Mobile users</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Officer Availability Status - Second Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {/* Available Officers */}
          <Card className="stats-card bg-gradient-to-br from-lawbot-emerald-50 to-white dark:from-lawbot-emerald-900/10 dark:to-lawbot-slate-800 border-lawbot-emerald-200 dark:border-lawbot-emerald-800">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 p-3 bg-gradient-to-r from-lawbot-emerald-500 to-lawbot-emerald-600 rounded-xl">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400 mb-1">Available Officers</p>
                  <p className="text-3xl font-bold text-lawbot-emerald-600 dark:text-lawbot-emerald-400 mb-1">
                    {displayOfficers.filter(officer => (officer.availabilityStatus || 'available') === 'available').length}
                  </p>
                  <p className="text-sm text-lawbot-emerald-500 dark:text-lawbot-emerald-400">Ready for duty</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Busy Officers */}
          <Card className="stats-card bg-gradient-to-br from-lawbot-amber-50 to-white dark:from-lawbot-amber-900/10 dark:to-lawbot-slate-800 border-lawbot-amber-200 dark:border-lawbot-amber-800">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 p-3 bg-gradient-to-r from-lawbot-amber-500 to-lawbot-amber-600 rounded-xl">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400 mb-1">Busy Officers</p>
                  <p className="text-3xl font-bold text-lawbot-amber-600 dark:text-lawbot-amber-400 mb-1">
                    {displayOfficers.filter(officer => (officer.availabilityStatus || 'available') === 'busy').length}
                  </p>
                  <p className="text-sm text-lawbot-amber-500 dark:text-lawbot-amber-400">High workload</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Overloaded Officers */}
          <Card className="stats-card bg-gradient-to-br from-lawbot-red-50 to-white dark:from-lawbot-red-900/10 dark:to-lawbot-slate-800 border-lawbot-red-200 dark:border-lawbot-red-800">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 p-3 bg-gradient-to-r from-lawbot-red-500 to-lawbot-red-600 rounded-xl">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400 mb-1">Overloaded Officers</p>
                  <p className="text-3xl font-bold text-lawbot-red-600 dark:text-lawbot-red-400 mb-1">
                    {displayOfficers.filter(officer => (officer.availabilityStatus || 'available') === 'overloaded').length}
                  </p>
                  <p className="text-sm text-lawbot-red-500 dark:text-lawbot-red-400">At capacity</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Officer Status - Third Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* On Leave Officers */}
          <Card className="stats-card bg-gradient-to-br from-lawbot-slate-50 to-white dark:from-lawbot-slate-900/10 dark:to-lawbot-slate-800 border-lawbot-slate-200 dark:border-lawbot-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 p-3 bg-gradient-to-r from-lawbot-slate-500 to-lawbot-slate-600 rounded-xl">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400 mb-1">Officers On Leave</p>
                  <p className="text-3xl font-bold text-lawbot-slate-600 dark:text-lawbot-slate-400 mb-1">
                    {displayOfficers.filter(officer => (officer.status || 'active') === 'on_leave').length}
                  </p>
                  <p className="text-sm text-lawbot-slate-500 dark:text-lawbot-slate-400">Leave period</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Cases Metric */}
          <Card className="stats-card bg-gradient-to-br from-lawbot-indigo-50 to-white dark:from-lawbot-indigo-900/10 dark:to-lawbot-slate-800 border-lawbot-indigo-200 dark:border-lawbot-indigo-800">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 p-3 bg-gradient-to-r from-lawbot-indigo-500 to-lawbot-indigo-600 rounded-xl">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400 mb-1">Active Cases</p>
                  <p className="text-3xl font-bold text-lawbot-indigo-600 dark:text-lawbot-indigo-400 mb-1">
                    {displayOfficers.reduce((total, officer) => total + (officer.activeCases || 0), 0)}
                  </p>
                  <p className="text-sm text-lawbot-indigo-500 dark:text-lawbot-indigo-400">Total workload</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Success Rate Average */}
          <Card className="stats-card bg-gradient-to-br from-lawbot-teal-50 to-white dark:from-lawbot-teal-900/10 dark:to-lawbot-slate-800 border-lawbot-teal-200 dark:border-lawbot-teal-800">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 p-3 bg-gradient-to-r from-lawbot-teal-500 to-lawbot-teal-600 rounded-xl">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400 mb-1">Average Success Rate</p>
                  <p className="text-3xl font-bold text-lawbot-teal-600 dark:text-lawbot-teal-400 mb-1">
                    {displayOfficers.length > 0 
                      ? Math.round(displayOfficers.reduce((total, officer) => total + (officer.successRate || 0), 0) / displayOfficers.length)
                      : 0}%
                  </p>
                  <p className="text-sm text-lawbot-teal-500 dark:text-lawbot-teal-400">Case resolution</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="admins" className="space-y-6 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <TabsList className="bg-lawbot-slate-100 dark:bg-lawbot-slate-800 p-1 rounded-xl">
          <TabsTrigger value="admins" className="data-[state=active]:bg-white dark:data-[state=active]:bg-lawbot-slate-700 data-[state=active]:text-lawbot-purple-600 font-medium">
            👑 Super Admins
          </TabsTrigger>
          <TabsTrigger value="officers" className="data-[state=active]:bg-white dark:data-[state=active]:bg-lawbot-slate-700 data-[state=active]:text-lawbot-blue-600 font-medium">
            👮 PNP Officers
          </TabsTrigger>
          <TabsTrigger value="clients" className="data-[state=active]:bg-white dark:data-[state=active]:bg-lawbot-slate-700 data-[state=active]:text-lawbot-emerald-600 font-medium">
            👥 Client Accounts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="admins">
          <Card className="card-modern">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-lawbot-slate-900 dark:text-white flex items-center">
                    <Crown className="h-6 w-6 text-lawbot-purple-500 mr-3" />
                    Super Admins
                  </CardTitle>
                  <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400">
                    Manage system administrator accounts and permissions
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-3">
                  <div className="relative flex-1 sm:flex-none">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lawbot-slate-400 h-4 w-4" />
                    <Input 
                      placeholder="Search admins..." 
                      value={superAdminSearchTerm}
                      onChange={(e) => setSuperAdminSearchTerm(e.target.value)}
                      className="pl-10 w-full sm:w-64 border-lawbot-slate-300 dark:border-lawbot-slate-600 focus:border-lawbot-purple-500" 
                    />
                  </div>
                  <div className="flex gap-2 sm:gap-3">
                    <Button 
                      className="btn-gradient flex-1 sm:flex-none"
                      onClick={() => setIsAddSuperAdminModalOpen(true)}
                      disabled={isLoadingSuperAdmins}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Add Admin</span>
                      <span className="sm:hidden">Add</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => fetchSuperAdmins()}
                      disabled={isLoadingSuperAdmins}
                      className="flex-shrink-0"
                    >
                      <RefreshCw className={`h-4 w-4 sm:mr-2 ${isLoadingSuperAdmins ? 'animate-spin' : ''}`} />
                      <span className="hidden sm:inline">Refresh</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="table-modern min-w-[800px]">
                  <TableHeader>
                    <TableRow className="border-lawbot-slate-200 dark:border-lawbot-slate-700">
                      <TableHead className="font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300 min-w-[200px]">Administrator</TableHead>
                      <TableHead className="font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300 min-w-[180px]">Contact Info</TableHead>
                      <TableHead className="font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300 min-w-[150px]">Role & Permissions</TableHead>
                      <TableHead className="font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300 min-w-[140px]">Created</TableHead>
                      <TableHead className="font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300 min-w-[120px]">Status</TableHead>
                      <TableHead className="font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300 min-w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingSuperAdmins ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="flex items-center justify-center space-x-2">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span>Loading super admins...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredSuperAdmins.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="text-gray-500">
                            <Crown className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No super admins found</p>
                            <p className="text-sm">Click "Add Admin" to create the first administrator account</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSuperAdmins.map((admin, index) => (
                        <TableRow 
                          key={admin.id} 
                          className="hover:bg-lawbot-slate-50 dark:hover:bg-lawbot-slate-800/50 transition-colors duration-200 animate-fade-in-up border-lawbot-slate-100 dark:border-lawbot-slate-800"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          {/* Admin Info */}
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-10 w-10 ring-2 ring-lawbot-purple-200 dark:ring-lawbot-purple-800">
                                <AvatarImage src={`/placeholder.svg?height=40&width=40`} />
                                <AvatarFallback className="bg-gradient-to-r from-lawbot-purple-500 to-lawbot-purple-600 text-white font-semibold">
                                  {admin.full_name
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold text-lawbot-slate-900 dark:text-white">{admin.full_name}</p>
                                <p className="text-sm text-lawbot-slate-500 dark:text-lawbot-slate-400 font-mono">
                                  🆔 {admin.firebase_uid.substring(0, 8)}...
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          {/* Contact Info */}
                          <TableCell>
                            <div className="space-y-2">
                              <div className="flex items-center text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400">
                                <Mail className="h-4 w-4 mr-2 text-lawbot-blue-500" />
                                <span className="truncate max-w-[180px]" title={admin.email}>
                                  {admin.email}
                                </span>
                              </div>
                              {admin.phone_number && (
                                <div className="flex items-center text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400">
                                  <Phone className="h-4 w-4 mr-2 text-lawbot-emerald-500" />
                                  {admin.phone_number}
                                </div>
                              )}
                            </div>
                          </TableCell>

                          {/* Role & Permissions */}
                          <TableCell>
                            <Badge className="bg-gradient-to-r from-lawbot-purple-50 to-lawbot-purple-100 text-lawbot-purple-700 border border-lawbot-purple-200 dark:from-lawbot-purple-900/20 dark:to-lawbot-purple-800/20 dark:text-lawbot-purple-300 dark:border-lawbot-purple-800">
                              <Crown className="h-4 w-4 text-purple-600 mr-2" />
                              Super Admin
                            </Badge>
                          </TableCell>

                          {/* Created Date */}
                          <TableCell>
                            <div className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400">
                              {PhilippineTime.formatDatabaseDateShort(admin.created_at)}
                            </div>
                          </TableCell>

                          {/* Status */}
                          <TableCell>
                            {(() => {
                              const statusConfig = {
                                active: {
                                  icon: '✅',
                                  label: 'Active',
                                  classes: 'bg-gradient-to-r from-lawbot-emerald-50 to-lawbot-emerald-100 text-lawbot-emerald-700 border border-lawbot-emerald-200 dark:from-lawbot-emerald-900/20 dark:to-lawbot-emerald-800/20 dark:text-lawbot-emerald-300 dark:border-lawbot-emerald-800'
                                },
                                suspended: {
                                  icon: '⚠️',
                                  label: 'Suspended',
                                  classes: 'bg-gradient-to-r from-lawbot-amber-50 to-lawbot-amber-100 text-lawbot-amber-700 border border-lawbot-amber-200 dark:from-lawbot-amber-900/20 dark:to-lawbot-amber-800/20 dark:text-lawbot-amber-300 dark:border-lawbot-amber-800'
                                },
                                inactive: {
                                  icon: '❌',
                                  label: 'Inactive',
                                  classes: 'bg-gradient-to-r from-lawbot-slate-50 to-lawbot-slate-100 text-lawbot-slate-700 border border-lawbot-slate-200 dark:from-lawbot-slate-900/20 dark:to-lawbot-slate-800/20 dark:text-lawbot-slate-300 dark:border-lawbot-slate-800'
                                }
                              }
                              const config = statusConfig[admin.status as keyof typeof statusConfig] || statusConfig.active
                              
                              return (
                                <Badge className={config.classes}>
                                  {config.icon} {config.label}
                                </Badge>
                              )
                            })()}
                          </TableCell>

                          {/* Actions */}
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="btn-icon hover:bg-lawbot-blue-50 dark:hover:bg-lawbot-blue-900/20"
                                onClick={() => handleEditSuperAdmin(admin)}
                              >
                                <Edit className="h-4 w-4 text-lawbot-blue-500" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="btn-icon hover:bg-lawbot-red-50 dark:hover:bg-lawbot-red-900/20"
                                onClick={() => handleDeleteSuperAdmin(admin)}
                              >
                                <Trash2 className="h-4 w-4 text-lawbot-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="officers">
          <Card className="card-modern">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-lawbot-slate-900 dark:text-white flex items-center">
                    <Shield className="h-6 w-6 text-lawbot-blue-500 mr-3" />
                    PNP Officers
                  </CardTitle>
                  <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400">
                    Manage officer accounts and unit assignments
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-3">
                  <div className="relative flex-1 sm:flex-none">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lawbot-slate-400 h-4 w-4" />
                    <Input 
                      placeholder="Search officers..." 
                      value={officerSearchTerm}
                      onChange={(e) => setOfficerSearchTerm(e.target.value)}
                      className="pl-10 w-full sm:w-64 border-lawbot-slate-300 dark:border-lawbot-slate-600 focus:border-lawbot-blue-500" 
                    />
                  </div>
                  <div className="flex gap-2 sm:gap-3">
                    <Button 
                      className="btn-gradient flex-1 sm:flex-none"
                      onClick={() => setIsAddOfficerModalOpen(true)}
                      disabled={isLoadingOfficers}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Add Officer</span>
                      <span className="sm:hidden">Add</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => fetchPnpOfficers()}
                      disabled={isLoadingOfficers}
                      className="flex-shrink-0"
                    >
                      <RefreshCw className={`h-4 w-4 sm:mr-2 ${isLoadingOfficers ? 'animate-spin' : ''}`} />
                      <span className="hidden sm:inline">Refresh</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="table-modern min-w-[800px]">
                  <TableHeader>
                    <TableRow className="border-lawbot-slate-200 dark:border-lawbot-slate-700">
                      <TableHead className="font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300 min-w-[200px]">Officer</TableHead>
                      <TableHead className="font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300 min-w-[180px]">Contact & Unit</TableHead>
                      <TableHead className="font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300 min-w-[150px]" title="Current workload capacity for case assignments">Work Availability</TableHead>
                      <TableHead className="font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300 min-w-[160px]">Cases & Performance</TableHead>
                      <TableHead className="font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300 min-w-[140px]" title="Officer's employment standing with PNP">Employment Status</TableHead>
                      <TableHead className="font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300 min-w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingOfficers ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="flex items-center justify-center space-x-2">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span>Loading PNP officers...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : displayOfficers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="text-gray-500">
                            <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No PNP officers found</p>
                            <p className="text-sm">Click "Add Officer" to create the first officer account</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      displayOfficers.map((officer, index) => (
                        <TableRow 
                          key={officer.id} 
                          className="hover:bg-lawbot-slate-50 dark:hover:bg-lawbot-slate-800/50 transition-colors duration-200 animate-fade-in-up border-lawbot-slate-100 dark:border-lawbot-slate-800"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          {/* Officer Info */}
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-10 w-10 ring-2 ring-lawbot-blue-200 dark:ring-lawbot-blue-800">
                                <AvatarImage src={`/placeholder.svg?height=40&width=40`} />
                                <AvatarFallback className="bg-gradient-to-r from-lawbot-blue-500 to-lawbot-blue-600 text-white font-semibold">
                                  {officer.name
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold text-lawbot-slate-900 dark:text-white">{officer.name}</p>
                                <p className="text-sm text-lawbot-slate-500 dark:text-lawbot-slate-400">{officer.rank}</p>
                                <Badge className="bg-gradient-to-r from-lawbot-blue-50 to-lawbot-blue-100 text-lawbot-blue-700 border border-lawbot-blue-200 dark:from-lawbot-blue-900/20 dark:to-lawbot-blue-800/20 dark:text-lawbot-blue-300 dark:border-lawbot-blue-800 font-mono text-xs">
                                  {officer.badge}
                                </Badge>
                              </div>
                            </div>
                          </TableCell>

                          {/* Contact & Unit */}
                          <TableCell>
                            <div className="space-y-2">
                              <div className="flex items-center text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400">
                                <Mail className="h-4 w-4 mr-2 text-lawbot-blue-500" />
                                <span className="truncate max-w-[180px]" title={officer.email}>
                                  {officer.email}
                                </span>
                              </div>
                              {officer.phone && officer.phone !== 'N/A' && (
                                <div className="flex items-center text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400">
                                  <Phone className="h-4 w-4 mr-2 text-lawbot-emerald-500" />
                                  {officer.phone}
                                </div>
                              )}
                              <div className="max-w-xs">
                                <p className="font-medium text-lawbot-slate-900 dark:text-white truncate text-sm">{officer.unit}</p>
                                <p className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400">{officer.unitCode} • {officer.region}</p>
                              </div>
                            </div>
                          </TableCell>

                          {/* Availability Status */}
                          <TableCell>
                            <div className="space-y-2">
                              {(() => {
                                const availabilityStatus = officer.availabilityStatus || 'available'
                                const availabilityConfig = {
                                  available: {
                                    icon: '🟢',
                                    label: 'Available',
                                    classes: 'bg-gradient-to-r from-lawbot-emerald-50 to-lawbot-emerald-100 text-lawbot-emerald-700 border border-lawbot-emerald-200 dark:from-lawbot-emerald-900/20 dark:to-lawbot-emerald-800/20 dark:text-lawbot-emerald-300 dark:border-lawbot-emerald-800'
                                  },
                                  busy: {
                                    icon: '🟡',
                                    label: 'Busy',
                                    classes: 'bg-gradient-to-r from-lawbot-amber-50 to-lawbot-amber-100 text-lawbot-amber-700 border border-lawbot-amber-200 dark:from-lawbot-amber-900/20 dark:to-lawbot-amber-800/20 dark:text-lawbot-amber-300 dark:border-lawbot-amber-800'
                                  },
                                  overloaded: {
                                    icon: '🔴',
                                    label: 'Overloaded',
                                    classes: 'bg-gradient-to-r from-lawbot-red-50 to-lawbot-red-100 text-lawbot-red-700 border border-lawbot-red-200 dark:from-lawbot-red-900/20 dark:to-lawbot-red-800/20 dark:text-lawbot-red-300 dark:border-lawbot-red-800'
                                  },
                                  unavailable: {
                                    icon: '⚫',
                                    label: 'Unavailable',
                                    classes: 'bg-gradient-to-r from-lawbot-slate-50 to-lawbot-slate-100 text-lawbot-slate-700 border border-lawbot-slate-200 dark:from-lawbot-slate-900/20 dark:to-lawbot-slate-800/20 dark:text-lawbot-slate-300 dark:border-lawbot-slate-800'
                                  }
                                }
                                const config = availabilityConfig[availabilityStatus as keyof typeof availabilityConfig] || availabilityConfig.available
                                
                                return (
                                  <>
                                    <Badge className={config.classes}>
                                      {config.icon} {config.label}
                                    </Badge>
                                  </>
                                )
                              })()}
                            </div>
                          </TableCell>


                          {/* Cases & Performance */}
                          <TableCell>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-4">
                                <div className="text-center">
                                  <div className="text-lg font-bold text-lawbot-amber-600 dark:text-lawbot-amber-400">
                                    {officer.activeCases || 0}
                                  </div>
                                  <div className="text-xs text-lawbot-slate-500">Active</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-bold text-lawbot-emerald-600 dark:text-lawbot-emerald-400">
                                    {officer.resolved || 0}
                                  </div>
                                  <div className="text-xs text-lawbot-slate-500">Resolved</div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {(() => {
                                  const successRate = officer.successRate || 0
                                  return (
                                    <>
                                      <span className={`text-sm font-bold ${
                                        successRate >= 80 ? 'text-lawbot-emerald-600' :
                                        successRate >= 60 ? 'text-lawbot-amber-600' :
                                        'text-lawbot-red-600'
                                      }`}>
                                        {successRate}%
                                      </span>
                                      <span className="text-xs text-lawbot-slate-500">success</span>
                                    </>
                                  )
                                })()}
                              </div>
                            </div>
                          </TableCell>


                          {/* Status */}
                          <TableCell>
                            {(() => {
                              const status = officer.status || 'active'
                              const statusConfig = {
                                active: {
                                  icon: '✅',
                                  label: 'Active',
                                  classes: 'bg-gradient-to-r from-lawbot-emerald-50 to-lawbot-emerald-100 text-lawbot-emerald-700 border border-lawbot-emerald-200 dark:from-lawbot-emerald-900/20 dark:to-lawbot-emerald-800/20 dark:text-lawbot-emerald-300 dark:border-lawbot-emerald-800'
                                },
                                on_leave: {
                                  icon: '🏖️',
                                  label: 'On Leave',
                                  classes: 'bg-gradient-to-r from-lawbot-blue-50 to-lawbot-blue-100 text-lawbot-blue-700 border border-lawbot-blue-200 dark:from-lawbot-blue-900/20 dark:to-lawbot-blue-800/20 dark:text-lawbot-blue-300 dark:border-lawbot-blue-800'
                                },
                                suspended: {
                                  icon: '⚠️',
                                  label: 'Suspended',
                                  classes: 'bg-gradient-to-r from-lawbot-amber-50 to-lawbot-amber-100 text-lawbot-amber-700 border border-lawbot-amber-200 dark:from-lawbot-amber-900/20 dark:to-lawbot-amber-800/20 dark:text-lawbot-amber-300 dark:border-lawbot-amber-800'
                                },
                                retired: {
                                  icon: '🏆',
                                  label: 'Retired',
                                  classes: 'bg-gradient-to-r from-lawbot-slate-50 to-lawbot-slate-100 text-lawbot-slate-700 border border-lawbot-slate-200 dark:from-lawbot-slate-900/20 dark:to-lawbot-slate-800/20 dark:text-lawbot-slate-300 dark:border-lawbot-slate-800'
                                }
                              }
                              const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active
                              
                              return (
                                <Badge className={config.classes}>
                                  {config.icon} {config.label}
                                </Badge>
                              )
                            })()}
                          </TableCell>

                          {/* Actions */}
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="btn-icon hover:bg-lawbot-blue-50 dark:hover:bg-lawbot-blue-900/20"
                                onClick={() => handleEditOfficer(officer)}
                              >
                                <Edit className="h-4 w-4 text-lawbot-blue-500" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="btn-icon hover:bg-lawbot-red-50 dark:hover:bg-lawbot-red-900/20"
                                onClick={() => handleDeleteOfficer(officer)}
                              >
                                <Trash2 className="h-4 w-4 text-lawbot-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients">
          <Card className="card-modern">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-3">
                <div>
                  <CardTitle className="text-xl font-bold text-lawbot-slate-900 dark:text-white flex items-center">
                    <Users className="h-6 w-6 text-lawbot-purple-500 mr-3" />
                    Client Accounts
                  </CardTitle>
                  <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400">
                    Monitor and manage client accounts from mobile app
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-3">
                  <div className="relative flex-1 sm:flex-none">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lawbot-slate-400 h-4 w-4" />
                    <Input 
                      placeholder="Search clients..." 
                      value={clientSearchTerm}
                      onChange={(e) => setClientSearchTerm(e.target.value)}
                      className="pl-10 w-full sm:w-64 border-lawbot-slate-300 dark:border-lawbot-slate-600 focus:border-lawbot-purple-500" 
                    />
                  </div>
                  <div className="flex gap-2 sm:gap-3">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => fetchClientUsers()}
                      disabled={isLoadingClients}
                      className="flex-1 sm:flex-none"
                    >
                      <RefreshCw className={`h-4 w-4 sm:mr-2 ${isLoadingClients ? 'animate-spin' : ''}`} />
                      <span className="hidden sm:inline">Refresh</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="table-modern min-w-[700px]">
                  <TableHeader>
                    <TableRow className="border-lawbot-slate-200 dark:border-lawbot-slate-700">
                      <TableHead className="font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300">Client</TableHead>
                      <TableHead className="font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300">Contact</TableHead>
                      <TableHead className="font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300">Cases Submitted</TableHead>
                      <TableHead className="font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300">Account Status</TableHead>
                      <TableHead className="font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300">Last Activity</TableHead>
                      <TableHead className="font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingClients ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="flex items-center justify-center space-x-2">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span>Loading client users...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : clientError ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="text-red-500">
                            <AlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>Error loading client users: {clientError}</p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-2"
                              onClick={fetchClientUsers}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Try Again
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredClients.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="text-gray-500">
                            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No client users found</p>
                            <p className="text-sm">Users will appear here once they register via the mobile app</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredClients.map((client, index) => (
                        <TableRow 
                          key={client.firebase_uid} 
                          className="hover:bg-lawbot-slate-50 dark:hover:bg-lawbot-slate-800/50 transition-colors duration-200 animate-fade-in-up border-lawbot-slate-100 dark:border-lawbot-slate-800"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          {/* Client Info */}
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-10 w-10 ring-2 ring-lawbot-purple-200 dark:ring-lawbot-purple-800">
                                <AvatarImage src={client.profile_picture_url || undefined} />
                                <AvatarFallback className="bg-gradient-to-r from-lawbot-purple-500 to-lawbot-purple-600 text-white font-semibold">
                                  {client.full_name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold text-lawbot-slate-900 dark:text-white">{client.full_name}</p>
                                <p className="text-sm text-lawbot-slate-500 dark:text-lawbot-slate-400 font-mono">
                                  🆔 {client.firebase_uid.substring(0, 8)}...
                                </p>
                                {client.fcm_token && (
                                  <Badge className="bg-gradient-to-r from-lawbot-blue-50 to-lawbot-blue-100 text-lawbot-blue-700 border border-lawbot-blue-200 dark:from-lawbot-blue-900/20 dark:to-lawbot-blue-800/20 dark:text-lawbot-blue-300 dark:border-lawbot-blue-800 text-xs">
                                    📱 FCM Ready
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>

                          {/* Contact Info */}
                          <TableCell>
                            <div className="space-y-2">
                              <div className="flex items-center text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400">
                                <Mail className="h-4 w-4 mr-2 text-lawbot-blue-500" />
                                <span className="truncate max-w-[180px]" title={client.email}>
                                  {client.email}
                                </span>
                              </div>
                              <div className="flex items-center text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400">
                                <Phone className="h-4 w-4 mr-2 text-lawbot-emerald-500" />
                                {client.phone_number}
                              </div>
                            </div>
                          </TableCell>

                          {/* Cases Submitted */}
                          <TableCell>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-4">
                                <div className="text-center">
                                  <div className="text-lg font-bold text-lawbot-blue-600 dark:text-lawbot-blue-400">
                                    {client.cases}
                                  </div>
                                  <div className="text-xs text-lawbot-slate-500">Total</div>
                                </div>
                                {client.active_cases > 0 && (
                                  <div className="text-center">
                                    <div className="text-sm font-bold text-lawbot-amber-600 dark:text-lawbot-amber-400">
                                      {client.active_cases}
                                    </div>
                                    <div className="text-xs text-lawbot-slate-500">Active</div>
                                  </div>
                                )}
                                {client.resolved_cases > 0 && (
                                  <div className="text-center">
                                    <div className="text-sm font-bold text-lawbot-emerald-600 dark:text-lawbot-emerald-400">
                                      {client.resolved_cases}
                                    </div>
                                    <div className="text-xs text-lawbot-slate-500">Resolved</div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>

                          {/* Account Status */}
                          <TableCell>
                            <Badge
                              className={
                                client.user_status === "active"
                                  ? "bg-gradient-to-r from-lawbot-emerald-50 to-lawbot-emerald-100 text-lawbot-emerald-700 border border-lawbot-emerald-200 dark:from-lawbot-emerald-900/20 dark:to-lawbot-emerald-800/20 dark:text-lawbot-emerald-300 dark:border-lawbot-emerald-800"
                                  : client.user_status === "suspended"
                                  ? "bg-gradient-to-r from-lawbot-amber-50 to-lawbot-amber-100 text-lawbot-amber-700 border border-lawbot-amber-200 dark:from-lawbot-amber-900/20 dark:to-lawbot-amber-800/20 dark:text-lawbot-amber-300 dark:border-lawbot-amber-800"
                                  : "bg-gradient-to-r from-lawbot-red-50 to-lawbot-red-100 text-lawbot-red-700 border border-lawbot-red-200 dark:from-lawbot-red-900/20 dark:to-lawbot-red-800/20 dark:text-lawbot-red-300 dark:border-lawbot-red-800"
                              }
                            >
                              {client.user_status === "active" ? "✅" : 
                               client.user_status === "suspended" ? "⚠️" : "❌"} 
                              {client.user_status}
                            </Badge>
                          </TableCell>

                          {/* Last Activity */}
                          <TableCell>
                            <div className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400">
                              {(() => {
                                const lastActive = new Date(client.last_active)
                                const now = new Date()
                                const diffTime = Math.abs(now.getTime() - lastActive.getTime())
                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                                
                                if (diffDays === 1) {
                                  return "🕒 1 day ago"
                                } else if (diffDays <= 7) {
                                  return `🕒 ${diffDays} days ago`
                                } else {
                                  return `📅 ${PhilippineTime.formatDatabaseDateShort(client.last_active)}`
                                }
                              })()}
                            </div>
                          </TableCell>

                          {/* Actions */}
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="btn-icon hover:bg-lawbot-blue-50 dark:hover:bg-lawbot-blue-900/20"
                                title="View profile details"
                                onClick={() => handleViewUserProfile(client)}
                              >
                                <User className="h-4 w-4 text-lawbot-blue-500" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="btn-icon hover:bg-lawbot-emerald-50 dark:hover:bg-lawbot-emerald-900/20"
                                title="Edit user information"
                                onClick={() => handleEditUser(client)}
                              >
                                <Edit className="h-4 w-4 text-lawbot-emerald-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions tab content removed as requested */}
      </Tabs>


      {/* Add Super Admin Modal */}
      <AddSuperAdminModal
        isOpen={isAddSuperAdminModalOpen}
        onClose={() => setIsAddSuperAdminModalOpen(false)}
        onSuccess={handleSuperAdminCreated}
      />

      {/* Edit Super Admin Modal */}
      <EditSuperAdminModal
        isOpen={isEditSuperAdminModalOpen}
        onClose={() => {
          setIsEditSuperAdminModalOpen(false)
          setSelectedSuperAdmin(null)
        }}
        onSuccess={handleSuperAdminUpdated}
        admin={selectedSuperAdmin}
      />

      {/* Delete Super Admin Modal */}
      <DeleteSuperAdminModal
        isOpen={isDeleteSuperAdminModalOpen}
        onClose={() => {
          setIsDeleteSuperAdminModalOpen(false)
          setSelectedSuperAdmin(null)
        }}
        onSuccess={handleSuperAdminDeleted}
        admin={selectedSuperAdmin}
      />

      {/* Add Officer Modal */}
      <AddOfficerModal
        isOpen={isAddOfficerModalOpen}
        onClose={() => setIsAddOfficerModalOpen(false)}
        onSuccess={handleOfficerCreated}
      />

      {/* Edit Officer Modal */}
      <EditOfficerModal
        isOpen={isEditOfficerModalOpen}
        onClose={() => {
          setIsEditOfficerModalOpen(false)
          setSelectedOfficer(null)
        }}
        onSuccess={handleEditSuccess}
        officer={selectedOfficer}
      />

      {/* Delete Officer Modal */}
      <DeleteOfficerModal
        isOpen={isDeleteOfficerModalOpen}
        onClose={() => {
          setIsDeleteOfficerModalOpen(false)
          setSelectedOfficer(null)
        }}
        onSuccess={handleDeleteSuccess}
        officer={selectedOfficer}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isUserProfileModalOpen}
        onClose={() => {
          setIsUserProfileModalOpen(false)
          setSelectedUser(null)
        }}
        user={selectedUser}
      />

      {/* User Edit Modal */}
      <UserEditModal
        isOpen={isUserEditModalOpen}
        onClose={() => {
          setIsUserEditModalOpen(false)
          setSelectedUser(null)
        }}
        onUserUpdated={handleUserUpdated}
        user={selectedUser}
      />


    </div>
  )
}
