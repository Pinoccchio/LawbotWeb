"use client"

import { Shield, Award, Calendar, Mail, Phone, MapPin, Edit, Save } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

export function ProfileView() {
  const officerData = {
    name: "Officer John Smith",
    badge: "PNP-001",
    rank: "Police Officer III",
    unit: "Cyber Crime Investigation Cell",
    email: "j.smith@pnp.gov.ph",
    phone: "+63 912 345 6789",
    location: "Manila, NCR",
    joinDate: "2020-03-15",
    specializations: ["Phishing Investigation", "Social Engineering", "Digital Forensics"],
    certifications: ["Certified Cyber Crime Investigator", "Digital Evidence Specialist"],
    stats: {
      totalCases: 156,
      resolvedCases: 134,
      successRate: 86,
      avgResolutionTime: 4.2,
    },
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Officer Profile</h2>
        <p className="text-gray-600 dark:text-slate-400">Manage your profile and view performance metrics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <Avatar className="h-24 w-24 mx-auto mb-4">
              <AvatarImage src="/placeholder.svg?height=96&width=96" />
              <AvatarFallback className="text-2xl">JS</AvatarFallback>
            </Avatar>
            <CardTitle>{officerData.name}</CardTitle>
            <CardDescription>{officerData.rank}</CardDescription>
            <Badge className="mt-2">{officerData.badge}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="text-sm">{officerData.unit}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{officerData.email}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{officerData.phone}</span>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{officerData.location}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Joined {officerData.joinDate}</span>
            </div>
            <Button className="w-full mt-4">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </CardContent>
        </Card>

        {/* Performance Stats */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>Your investigation performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{officerData.stats.totalCases}</div>
                <div className="text-sm text-gray-500">Total Cases</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{officerData.stats.resolvedCases}</div>
                <div className="text-sm text-gray-500">Resolved</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{officerData.stats.successRate}%</div>
                <div className="text-sm text-gray-500">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">{officerData.stats.avgResolutionTime}</div>
                <div className="text-sm text-gray-500">Avg Days</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Personal Details</TabsTrigger>
          <TabsTrigger value="specializations">Specializations</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" defaultValue={officerData.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="badge">Badge Number</Label>
                  <Input id="badge" defaultValue={officerData.badge} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rank">Rank</Label>
                  <Input id="rank" defaultValue={officerData.rank} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Assigned Unit</Label>
                  <Input id="unit" defaultValue={officerData.unit} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" defaultValue={officerData.email} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" defaultValue={officerData.phone} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" defaultValue={officerData.location} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="joinDate">Join Date</Label>
                  <Input id="joinDate" defaultValue={officerData.joinDate} disabled />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Brief description about yourself and your experience..."
                  className="min-h-20"
                />
              </div>
              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specializations">
          <Card>
            <CardHeader>
              <CardTitle>Areas of Specialization</CardTitle>
              <CardDescription>Your expertise in different cybercrime categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-3">Current Specializations</h4>
                  <div className="flex flex-wrap gap-2">
                    {officerData.specializations.map((spec, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Primary Expertise</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Phishing Investigation</span>
                          <Badge className="bg-green-100 text-green-800">Expert</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Social Engineering</span>
                          <Badge className="bg-blue-100 text-blue-800">Advanced</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Digital Forensics</span>
                          <Badge className="bg-purple-100 text-purple-800">Intermediate</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Training Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Malware Analysis</span>
                            <span>75%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: "75%" }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Financial Crimes</span>
                            <span>60%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-600 h-2 rounded-full" style={{ width: "60%" }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Network Security</span>
                            <span>40%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-orange-600 h-2 rounded-full" style={{ width: "40%" }}></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certifications">
          <Card>
            <CardHeader>
              <CardTitle>Certifications & Training</CardTitle>
              <CardDescription>Your professional certifications and completed training</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-4">Active Certifications</h4>
                  <div className="space-y-4">
                    {officerData.certifications.map((cert, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Award className="h-5 w-5 text-yellow-600" />
                          <div>
                            <h5 className="font-medium">{cert}</h5>
                            <p className="text-sm text-gray-500">Valid until: Dec 2025</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-4">Upcoming Training</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg border-dashed">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        <div>
                          <h5 className="font-medium">Advanced Malware Analysis</h5>
                          <p className="text-sm text-gray-500">Scheduled: Feb 15, 2025</p>
                        </div>
                      </div>
                      <Badge variant="outline">Enrolled</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg border-dashed">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-purple-600" />
                        <div>
                          <h5 className="font-medium">Cryptocurrency Investigation</h5>
                          <p className="text-sm text-gray-500">Scheduled: Mar 10, 2025</p>
                        </div>
                      </div>
                      <Badge variant="outline">Pending</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account preferences and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Notification Preferences</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Case Assignment Notifications</p>
                      <p className="text-sm text-gray-500">Get notified when new cases are assigned</p>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Evidence Upload Alerts</p>
                      <p className="text-sm text-gray-500">Notifications for new evidence uploads</p>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">System Updates</p>
                      <p className="text-sm text-gray-500">Important system announcements</p>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Security Settings</h4>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    Change Password
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    Enable Two-Factor Authentication
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    View Login History
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Privacy Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Profile Visibility</p>
                      <p className="text-sm text-gray-500">Show profile to other officers</p>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Performance Statistics</p>
                      <p className="text-sm text-gray-500">Share performance data for unit analytics</p>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                </div>
              </div>

              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
