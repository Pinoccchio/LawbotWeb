"use client"

import { Plus, Search, Edit, Trash2, Shield, User, Mail, Phone } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockOfficers } from "@/lib/mock-data"

export function UserManagementView() {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h2>
          <p className="text-gray-600 dark:text-slate-400">Manage PNP officers and client accounts</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <Tabs defaultValue="officers" className="space-y-6">
        <TabsList>
          <TabsTrigger value="officers">PNP Officers</TabsTrigger>
          <TabsTrigger value="clients">Client Accounts</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="officers">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>PNP Officers</CardTitle>
                  <CardDescription>Manage officer accounts and unit assignments</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input placeholder="Search officers..." className="pl-10 w-64" />
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Officer
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Officer</TableHead>
                    <TableHead>Badge Number</TableHead>
                    <TableHead>Specialized Unit</TableHead>
                    <TableHead>Active Cases</TableHead>
                    <TableHead>Resolved Cases</TableHead>
                    <TableHead>Success Rate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockOfficers.map((officer) => (
                    <TableRow key={officer.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={`/placeholder.svg?height=32&width=32`} />
                            <AvatarFallback>
                              {officer.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{officer.name}</p>
                            <p className="text-sm text-gray-500">officer@pnp.gov.ph</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{officer.badge}</TableCell>
                      <TableCell className="max-w-xs truncate">{officer.unit}</TableCell>
                      <TableCell>{officer.cases - officer.resolved}</TableCell>
                      <TableCell>{officer.resolved}</TableCell>
                      <TableCell>
                        <span className="text-green-600 font-medium">
                          {Math.round((officer.resolved / officer.cases) * 100)}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Client Accounts</CardTitle>
                  <CardDescription>Monitor and manage client accounts from mobile app</CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input placeholder="Search clients..." className="pl-10 w-64" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Cases Submitted</TableHead>
                    <TableHead>Account Status</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {client.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{client.name}</p>
                            <p className="text-sm text-gray-500">
                              Client ID: CLI-{client.id.toString().padStart(3, "0")}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-2 text-gray-400" />
                            {client.email}
                          </div>
                          <div className="flex items-center text-sm">
                            <Phone className="h-3 w-3 mr-2 text-gray-400" />
                            {client.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{client.cases}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            client.status === "active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                          }
                        >
                          {client.status}
                        </Badge>
                      </TableCell>
                      <TableCell>2 days ago</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <User className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Admin Permissions</CardTitle>
                <CardDescription>System administrator access levels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Full System Access</p>
                        <p className="text-sm text-gray-500">Complete administrative control</p>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">User Management</p>
                        <p className="text-sm text-gray-500">Create, edit, delete users</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Officer Permissions</CardTitle>
                <CardDescription>PNP officer access levels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5 text-amber-600" />
                      <div>
                        <p className="font-medium">Case Access</p>
                        <p className="text-sm text-gray-500">View and manage assigned cases</p>
                      </div>
                    </div>
                    <Badge className="bg-amber-100 text-amber-800">Limited</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium">Evidence Management</p>
                        <p className="text-sm text-gray-500">View and analyze evidence files</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
