"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Edit, Trash2, Shield, User, Mail, Phone, Activity, Users, Settings, AlertTriangle, RefreshCw } from "lucide-react"
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
import { supabase } from "@/lib/supabase"

export function UserManagementView() {
  const [isAddOfficerModalOpen, setIsAddOfficerModalOpen] = useState(false)
  const [isEditOfficerModalOpen, setIsEditOfficerModalOpen] = useState(false)
  const [isDeleteOfficerModalOpen, setIsDeleteOfficerModalOpen] = useState(false)
  const [selectedOfficer, setSelectedOfficer] = useState<any>(null)
  const [pnpOfficers, setPnpOfficers] = useState<any[]>([])
  const [isLoadingOfficers, setIsLoadingOfficers] = useState(false)
  const [officerSearchTerm, setOfficerSearchTerm] = useState("")
  const [clientSearchTerm, setClientSearchTerm] = useState("")
  
  const mockClients = [
    { id: 1, name: "John Doe", email: "john.doe@email.com", phone: "+63 912 345 6789", cases: 2, status: "active" },
    {
      id: 2,
      name: "Maria Santos",
      email: "maria.santos@email.com",
      phone: "+63 923 456 7890",
      cases: 1,
      status: "active",
    },
    {
      id: 3,
      name: "Robert Chen",
      email: "robert.chen@email.com",
      phone: "+63 934 567 8901",
      cases: 3,
      status: "inactive",
    },
    {
      id: 4,
      name: "Lisa Garcia",
      email: "lisa.garcia@email.com",
      phone: "+63 945 678 9012",
      cases: 1,
      status: "active",
    },
  ]

  // Fetch PNP officers from Supabase
  const fetchPnpOfficers = async () => {
    setIsLoadingOfficers(true)
    try {
      const { data, error } = await supabase
        .from('pnp_officer_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching PNP officers:', error)
        // No fallback data - use empty array
        setPnpOfficers([])
      } else {
        // Transform Supabase data to match expected format
        const transformedOfficers = data.map((officer: any) => ({
          id: officer.id,
          name: officer.full_name,
          email: officer.email,
          phone: officer.phone_number || 'N/A',
          badge: officer.badge_number,
          rank: officer.rank,
          unit: officer.unit,
          region: officer.region,
          status: officer.status,
          cases: officer.total_cases || 0,
          resolved: officer.resolved_cases || 0,
          created_at: officer.created_at
        }))
        setPnpOfficers(transformedOfficers)
      }
    } catch (error) {
      console.error('Error fetching PNP officers:', error)
      setPnpOfficers([])
    } finally {
      setIsLoadingOfficers(false)
    }
  }

  // Load officers on component mount
  useEffect(() => {
    fetchPnpOfficers()
  }, [])

  const handleOfficerCreated = () => {
    // Refresh the officers list after successful creation
    fetchPnpOfficers()
  }

  // Filter officers based on search term
  const filteredOfficers = pnpOfficers.filter(officer =>
    officer.name.toLowerCase().includes(officerSearchTerm.toLowerCase()) ||
    officer.email.toLowerCase().includes(officerSearchTerm.toLowerCase()) ||
    officer.badge.toLowerCase().includes(officerSearchTerm.toLowerCase()) ||
    officer.unit.toLowerCase().includes(officerSearchTerm.toLowerCase()) ||
    officer.rank.toLowerCase().includes(officerSearchTerm.toLowerCase()) ||
    officer.region.toLowerCase().includes(officerSearchTerm.toLowerCase())
  )

  // Filter clients based on search term
  const filteredClients = mockClients.filter(client =>
    client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(clientSearchTerm.toLowerCase())
  )

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

  // Use filtered data for display
  const displayOfficers = filteredOfficers

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-lawbot-emerald-600 to-lawbot-blue-600 bg-clip-text text-transparent">
            User Management
          </h2>
          <p className="text-lawbot-slate-600 dark:text-lawbot-slate-400 text-lg mt-2">
            Manage PNP officers and client accounts across the platform
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="btn-modern">
            <Settings className="h-4 w-4 mr-2" />
            Bulk Actions
          </Button>
          <Button 
            className="btn-gradient"
            onClick={() => setIsAddOfficerModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add PNP Officer
          </Button>
        </div>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <Card className="stats-card bg-gradient-to-br from-lawbot-blue-50 to-white dark:from-lawbot-blue-900/10 dark:to-lawbot-slate-800 border-lawbot-blue-200 dark:border-lawbot-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">Total Officers</p>
                <p className="text-3xl font-bold text-lawbot-blue-600 dark:text-lawbot-blue-400">{displayOfficers.length}</p>
              </div>
              <div className="p-3 bg-lawbot-blue-500 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="stats-card bg-gradient-to-br from-lawbot-emerald-50 to-white dark:from-lawbot-emerald-900/10 dark:to-lawbot-slate-800 border-lawbot-emerald-200 dark:border-lawbot-emerald-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">Active Officers</p>
                <p className="text-3xl font-bold text-lawbot-emerald-600 dark:text-lawbot-emerald-400">
                  {displayOfficers.filter(officer => officer.status === 'active').length}
                </p>
              </div>
              <div className="p-3 bg-lawbot-emerald-500 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="stats-card bg-gradient-to-br from-lawbot-purple-50 to-white dark:from-lawbot-purple-900/10 dark:to-lawbot-slate-800 border-lawbot-purple-200 dark:border-lawbot-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">Client Accounts</p>
                <p className="text-3xl font-bold text-lawbot-purple-600 dark:text-lawbot-purple-400">{mockClients.length}</p>
              </div>
              <div className="p-3 bg-lawbot-purple-500 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="stats-card bg-gradient-to-br from-lawbot-amber-50 to-white dark:from-lawbot-amber-900/10 dark:to-lawbot-slate-800 border-lawbot-amber-200 dark:border-lawbot-amber-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">Pending Reviews</p>
                <p className="text-3xl font-bold text-lawbot-amber-600 dark:text-lawbot-amber-400">3</p>
              </div>
              <div className="p-3 bg-lawbot-amber-500 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="officers" className="space-y-6 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <TabsList className="bg-lawbot-slate-100 dark:bg-lawbot-slate-800 p-1 rounded-xl">
          <TabsTrigger value="officers" className="data-[state=active]:bg-white dark:data-[state=active]:bg-lawbot-slate-700 data-[state=active]:text-lawbot-blue-600 font-medium">
            👮 PNP Officers
          </TabsTrigger>
          <TabsTrigger value="clients" className="data-[state=active]:bg-white dark:data-[state=active]:bg-lawbot-slate-700 data-[state=active]:text-lawbot-purple-600 font-medium">
            👥 Client Accounts
          </TabsTrigger>
          <TabsTrigger value="permissions" className="data-[state=active]:bg-white dark:data-[state=active]:bg-lawbot-slate-700 data-[state=active]:text-lawbot-emerald-600 font-medium">
            🔐 Permissions
          </TabsTrigger>
        </TabsList>

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
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lawbot-slate-400 h-4 w-4" />
                    <Input 
                      placeholder="Search officers..." 
                      value={officerSearchTerm}
                      onChange={(e) => setOfficerSearchTerm(e.target.value)}
                      className="pl-10 w-64 border-lawbot-slate-300 dark:border-lawbot-slate-600 focus:border-lawbot-blue-500" 
                    />
                  </div>
                  <Button 
                    className="btn-gradient"
                    onClick={() => setIsAddOfficerModalOpen(true)}
                    disabled={isLoadingOfficers}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Officer
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => fetchPnpOfficers()}
                    disabled={isLoadingOfficers}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingOfficers ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="table-modern">
                  <TableHeader>
                    <TableRow className="border-lawbot-slate-200 dark:border-lawbot-slate-700">
                      <TableHead className="font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300">Officer</TableHead>
                      <TableHead className="font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300">Email & Contact</TableHead>
                      <TableHead className="font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300">Badge Number</TableHead>
                      <TableHead className="font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300">Specialized Unit</TableHead>
                      <TableHead className="font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300">Active Cases</TableHead>
                      <TableHead className="font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300">Resolved Cases</TableHead>
                      <TableHead className="font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300">Success Rate</TableHead>
                      <TableHead className="font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300">Status</TableHead>
                      <TableHead className="font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingOfficers ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          <div className="flex items-center justify-center space-x-2">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span>Loading PNP officers...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : displayOfficers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
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
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-10 w-10 ring-2 ring-lawbot-blue-200 dark:ring-lawbot-blue-800">
                                <AvatarImage src={`/placeholder.svg?height=40&width=40`} />
                                <AvatarFallback className="bg-gradient-to-r from-lawbot-blue-500 to-lawbot-blue-600 text-white font-semibold">
                                  {officer.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold text-lawbot-slate-900 dark:text-white">{officer.name}</p>
                                <p className="text-sm text-lawbot-slate-500 dark:text-lawbot-slate-400">{officer.rank}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <div className="flex items-center text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400">
                                <Mail className="h-4 w-4 mr-2 text-lawbot-blue-500" />
                                <span className="truncate max-w-[200px]" title={officer.email}>
                                  {officer.email}
                                </span>
                              </div>
                              {officer.phone && officer.phone !== 'N/A' && (
                                <div className="flex items-center text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400">
                                  <Phone className="h-4 w-4 mr-2 text-lawbot-emerald-500" />
                                  {officer.phone}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-gradient-to-r from-lawbot-blue-50 to-lawbot-blue-100 text-lawbot-blue-700 border border-lawbot-blue-200 dark:from-lawbot-blue-900/20 dark:to-lawbot-blue-800/20 dark:text-lawbot-blue-300 dark:border-lawbot-blue-800 font-mono">
                              {officer.badge}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              <p className="font-medium text-lawbot-slate-900 dark:text-white truncate">{officer.unit}</p>
                              <p className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400">{officer.region}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span className="text-lg font-bold text-lawbot-amber-600 dark:text-lawbot-amber-400">
                                {officer.cases - officer.resolved}
                              </span>
                              <div className="w-2 h-2 bg-lawbot-amber-500 rounded-full animate-pulse" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span className="text-lg font-bold text-lawbot-emerald-600 dark:text-lawbot-emerald-400">
                                {officer.resolved}
                              </span>
                              <div className="w-2 h-2 bg-lawbot-emerald-500 rounded-full" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {(() => {
                                const successRate = officer.cases > 0 ? Math.round((officer.resolved / officer.cases) * 100) : 0
                                return (
                                  <>
                                    <span className={`text-lg font-bold ${
                                      successRate >= 80 ? 'text-lawbot-emerald-600' :
                                      successRate >= 60 ? 'text-lawbot-amber-600' :
                                      'text-lawbot-red-600'
                                    }`}>
                                      {successRate}%
                                    </span>
                                    <div className={`w-2 h-2 rounded-full ${
                                      successRate >= 80 ? 'bg-lawbot-emerald-500' :
                                      successRate >= 60 ? 'bg-lawbot-amber-500' :
                                      'bg-lawbot-red-500'
                                    }`} />
                                  </>
                                )
                              })()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-gradient-to-r from-lawbot-emerald-50 to-lawbot-emerald-100 text-lawbot-emerald-700 border border-lawbot-emerald-200 dark:from-lawbot-emerald-900/20 dark:to-lawbot-emerald-800/20 dark:text-lawbot-emerald-300 dark:border-lawbot-emerald-800">
                              ✅ Active
                            </Badge>
                          </TableCell>
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-lawbot-slate-900 dark:text-white flex items-center">
                    <Users className="h-6 w-6 text-lawbot-purple-500 mr-3" />
                    Client Accounts
                  </CardTitle>
                  <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400">
                    Monitor and manage client accounts from mobile app
                  </CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lawbot-slate-400 h-4 w-4" />
                  <Input 
                    placeholder="Search clients..." 
                    value={clientSearchTerm}
                    onChange={(e) => setClientSearchTerm(e.target.value)}
                    className="pl-10 w-64 border-lawbot-slate-300 dark:border-lawbot-slate-600 focus:border-lawbot-purple-500" 
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="table-modern">
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
                    {filteredClients.map((client, index) => (
                      <TableRow 
                        key={client.id} 
                        className="hover:bg-lawbot-slate-50 dark:hover:bg-lawbot-slate-800/50 transition-colors duration-200 animate-fade-in-up border-lawbot-slate-100 dark:border-lawbot-slate-800"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10 ring-2 ring-lawbot-purple-200 dark:ring-lawbot-purple-800">
                              <AvatarFallback className="bg-gradient-to-r from-lawbot-purple-500 to-lawbot-purple-600 text-white font-semibold">
                                {client.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-lawbot-slate-900 dark:text-white">{client.name}</p>
                              <p className="text-sm text-lawbot-slate-500 dark:text-lawbot-slate-400">
                                👤 CLI-{client.id.toString().padStart(3, "0")}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400">
                              <Mail className="h-4 w-4 mr-2 text-lawbot-blue-500" />
                              {client.email}
                            </div>
                            <div className="flex items-center text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400">
                              <Phone className="h-4 w-4 mr-2 text-lawbot-emerald-500" />
                              {client.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-lawbot-blue-600 dark:text-lawbot-blue-400">
                              {client.cases}
                            </span>
                            <span className="text-xs text-lawbot-slate-500">reports</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              client.status === "active"
                                ? "bg-gradient-to-r from-lawbot-emerald-50 to-lawbot-emerald-100 text-lawbot-emerald-700 border border-lawbot-emerald-200 dark:from-lawbot-emerald-900/20 dark:to-lawbot-emerald-800/20 dark:text-lawbot-emerald-300 dark:border-lawbot-emerald-800"
                                : "bg-gradient-to-r from-lawbot-slate-50 to-lawbot-slate-100 text-lawbot-slate-700 border border-lawbot-slate-200 dark:from-lawbot-slate-900/20 dark:to-lawbot-slate-800/20 dark:text-lawbot-slate-300 dark:border-lawbot-slate-800"
                            }
                          >
                            {client.status === "active" ? "✅" : "💤"} {client.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400">
                            🕒 2 days ago
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" className="btn-icon hover:bg-lawbot-blue-50 dark:hover:bg-lawbot-blue-900/20">
                              <User className="h-4 w-4 text-lawbot-blue-500" />
                            </Button>
                            <Button variant="ghost" size="sm" className="btn-icon hover:bg-lawbot-emerald-50 dark:hover:bg-lawbot-emerald-900/20">
                              <Edit className="h-4 w-4 text-lawbot-emerald-500" />
                            </Button>
                            <Button variant="ghost" size="sm" className="btn-icon hover:bg-lawbot-red-50 dark:hover:bg-lawbot-red-900/20">
                              <Trash2 className="h-4 w-4 text-lawbot-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="card-modern bg-gradient-to-br from-lawbot-blue-50 to-white dark:from-lawbot-blue-900/10 dark:to-lawbot-slate-800 border-lawbot-blue-200 dark:border-lawbot-blue-800">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-lawbot-blue-500 rounded-lg">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lawbot-slate-900 dark:text-white">Admin Permissions</CardTitle>
                    <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400">System administrator access levels</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white dark:bg-lawbot-slate-800 border border-lawbot-slate-200 dark:border-lawbot-slate-700 rounded-xl hover:shadow-md transition-all duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-lawbot-blue-500 rounded-lg">
                        <Shield className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-lawbot-slate-900 dark:text-white">Full System Access</p>
                        <p className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400">Complete administrative control</p>
                      </div>
                    </div>
                    <Badge className="bg-gradient-to-r from-lawbot-blue-50 to-lawbot-blue-100 text-lawbot-blue-700 border border-lawbot-blue-200 dark:from-lawbot-blue-900/20 dark:to-lawbot-blue-800/20 dark:text-lawbot-blue-300 dark:border-lawbot-blue-800">
                      ✅ Enabled
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white dark:bg-lawbot-slate-800 border border-lawbot-slate-200 dark:border-lawbot-slate-700 rounded-xl hover:shadow-md transition-all duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-lawbot-emerald-500 rounded-lg">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-lawbot-slate-900 dark:text-white">User Management</p>
                        <p className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400">Create, edit, delete users</p>
                      </div>
                    </div>
                    <Badge className="bg-gradient-to-r from-lawbot-emerald-50 to-lawbot-emerald-100 text-lawbot-emerald-700 border border-lawbot-emerald-200 dark:from-lawbot-emerald-900/20 dark:to-lawbot-emerald-800/20 dark:text-lawbot-emerald-300 dark:border-lawbot-emerald-800">
                      ✅ Enabled
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white dark:bg-lawbot-slate-800 border border-lawbot-slate-200 dark:border-lawbot-slate-700 rounded-xl hover:shadow-md transition-all duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-lawbot-purple-500 rounded-lg">
                        <Settings className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-lawbot-slate-900 dark:text-white">System Configuration</p>
                        <p className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400">Modify system settings and preferences</p>
                      </div>
                    </div>
                    <Badge className="bg-gradient-to-r from-lawbot-purple-50 to-lawbot-purple-100 text-lawbot-purple-700 border border-lawbot-purple-200 dark:from-lawbot-purple-900/20 dark:to-lawbot-purple-800/20 dark:text-lawbot-purple-300 dark:border-lawbot-purple-800">
                      ✅ Enabled
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-modern bg-gradient-to-br from-lawbot-emerald-50 to-white dark:from-lawbot-emerald-900/10 dark:to-lawbot-slate-800 border-lawbot-emerald-200 dark:border-lawbot-emerald-800">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-lawbot-emerald-500 rounded-lg">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lawbot-slate-900 dark:text-white">Officer Permissions</CardTitle>
                    <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400">PNP officer access levels</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white dark:bg-lawbot-slate-800 border border-lawbot-slate-200 dark:border-lawbot-slate-700 rounded-xl hover:shadow-md transition-all duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-lawbot-amber-500 rounded-lg">
                        <Shield className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-lawbot-slate-900 dark:text-white">Case Access</p>
                        <p className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400">View and manage assigned cases</p>
                      </div>
                    </div>
                    <Badge className="bg-gradient-to-r from-lawbot-amber-50 to-lawbot-amber-100 text-lawbot-amber-700 border border-lawbot-amber-200 dark:from-lawbot-amber-900/20 dark:to-lawbot-amber-800/20 dark:text-lawbot-amber-300 dark:border-lawbot-amber-800">
                      ⚠️ Limited
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white dark:bg-lawbot-slate-800 border border-lawbot-slate-200 dark:border-lawbot-slate-700 rounded-xl hover:shadow-md transition-all duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-lawbot-blue-500 rounded-lg">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-lawbot-slate-900 dark:text-white">Evidence Management</p>
                        <p className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400">View and analyze evidence files</p>
                      </div>
                    </div>
                    <Badge className="bg-gradient-to-r from-lawbot-emerald-50 to-lawbot-emerald-100 text-lawbot-emerald-700 border border-lawbot-emerald-200 dark:from-lawbot-emerald-900/20 dark:to-lawbot-emerald-800/20 dark:text-lawbot-emerald-300 dark:border-lawbot-emerald-800">
                      ✅ Enabled
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white dark:bg-lawbot-slate-800 border border-lawbot-slate-200 dark:border-lawbot-slate-700 rounded-xl hover:shadow-md transition-all duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-lawbot-purple-500 rounded-lg">
                        <Activity className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-lawbot-slate-900 dark:text-white">Status Updates</p>
                        <p className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400">Update case status and add notes</p>
                      </div>
                    </div>
                    <Badge className="bg-gradient-to-r from-lawbot-emerald-50 to-lawbot-emerald-100 text-lawbot-emerald-700 border border-lawbot-emerald-200 dark:from-lawbot-emerald-900/20 dark:to-lawbot-emerald-800/20 dark:text-lawbot-emerald-300 dark:border-lawbot-emerald-800">
                      ✅ Enabled
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

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
    </div>
  )
}
