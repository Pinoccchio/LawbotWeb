"use client"

import { Shield, Award, Calendar, Mail, Phone, MapPin, Edit, Save, User, TrendingUp, Lock, Settings, Bell, Eye } from "lucide-react"
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
    <div className="space-y-8 animate-fade-in">
      <div className="animate-fade-in-up">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-lawbot-blue-600 to-lawbot-emerald-600 bg-clip-text text-transparent">
          Officer Profile
        </h2>
        <p className="text-lawbot-slate-600 dark:text-lawbot-slate-400 text-lg mt-2">
          Manage your profile, view performance metrics, and update your settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        {/* Enhanced Profile Overview */}
        <Card className="lg:col-span-1 card-modern bg-gradient-to-br from-lawbot-blue-50 to-white dark:from-lawbot-blue-900/10 dark:to-lawbot-slate-800 border-lawbot-blue-200 dark:border-lawbot-blue-800">
          <CardHeader className="text-center">
            <div className="relative mx-auto mb-4">
              <Avatar className="h-32 w-32 mx-auto shadow-lg ring-4 ring-lawbot-blue-100 dark:ring-lawbot-blue-800">
                <AvatarImage src="/placeholder.svg?height=128&width=128" />
                <AvatarFallback className="text-3xl bg-gradient-to-br from-lawbot-blue-500 to-lawbot-blue-600 text-white font-bold">JS</AvatarFallback>
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
            <Button className="w-full mt-6 btn-gradient">
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
                <div className="text-3xl font-bold text-lawbot-amber-600 dark:text-lawbot-amber-400 mb-2">{officerData.stats.avgResolutionTime}</div>
                <div className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">⏱️ Avg Days</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="details" className="space-y-6 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <TabsList className="bg-lawbot-slate-100 dark:bg-lawbot-slate-800 p-1 rounded-xl grid grid-cols-4">
          <TabsTrigger value="details" className="data-[state=active]:bg-white dark:data-[state=active]:bg-lawbot-slate-700 data-[state=active]:text-lawbot-blue-600 font-medium">
            👤 Personal Details
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
                  <Input id="fullName" defaultValue={officerData.name} className="border-lawbot-slate-300 dark:border-lawbot-slate-600 focus:border-lawbot-blue-500 focus:ring-lawbot-blue-500" />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="badge" className="text-sm font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300">🏷️ Badge Number</Label>
                  <Input id="badge" defaultValue={officerData.badge} disabled className="bg-lawbot-slate-100 dark:bg-lawbot-slate-800 border-lawbot-slate-300 dark:border-lawbot-slate-600" />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="rank" className="text-sm font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300">⭐ Rank</Label>
                  <Input id="rank" defaultValue={officerData.rank} className="border-lawbot-slate-300 dark:border-lawbot-slate-600 focus:border-lawbot-blue-500 focus:ring-lawbot-blue-500" />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="unit" className="text-sm font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300">🛡️ Assigned Unit</Label>
                  <Input id="unit" defaultValue={officerData.unit} disabled className="bg-lawbot-slate-100 dark:bg-lawbot-slate-800 border-lawbot-slate-300 dark:border-lawbot-slate-600" />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300">📧 Email Address</Label>
                  <Input id="email" type="email" defaultValue={officerData.email} className="border-lawbot-slate-300 dark:border-lawbot-slate-600 focus:border-lawbot-blue-500 focus:ring-lawbot-blue-500" />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-sm font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300">📱 Phone Number</Label>
                  <Input id="phone" defaultValue={officerData.phone} className="border-lawbot-slate-300 dark:border-lawbot-slate-600 focus:border-lawbot-blue-500 focus:ring-lawbot-blue-500" />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="location" className="text-sm font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300">📍 Location</Label>
                  <Input id="location" defaultValue={officerData.location} className="border-lawbot-slate-300 dark:border-lawbot-slate-600 focus:border-lawbot-blue-500 focus:ring-lawbot-blue-500" />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="joinDate" className="text-sm font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300">📅 Join Date</Label>
                  <Input id="joinDate" defaultValue={officerData.joinDate} disabled className="bg-lawbot-slate-100 dark:bg-lawbot-slate-800 border-lawbot-slate-300 dark:border-lawbot-slate-600" />
                </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor="bio" className="text-sm font-semibold text-lawbot-slate-700 dark:text-lawbot-slate-300">📝 Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Brief description about yourself and your experience in cybercrime investigation..."
                  className="min-h-24 border-lawbot-slate-300 dark:border-lawbot-slate-600 focus:border-lawbot-blue-500 focus:ring-lawbot-blue-500"
                />
              </div>
              <Button className="btn-gradient">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
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
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-4 text-lawbot-slate-800 dark:text-lawbot-slate-200 flex items-center">
                    <Award className="h-4 w-4 mr-2 text-lawbot-emerald-500" />
                    🎯 Current Specializations
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {officerData.specializations.map((spec, index) => (
                      <Badge key={index} className="bg-gradient-to-r from-lawbot-emerald-50 to-lawbot-emerald-100 text-lawbot-emerald-700 border border-lawbot-emerald-200 dark:from-lawbot-emerald-900/20 dark:to-lawbot-emerald-800/20 dark:text-lawbot-emerald-300 dark:border-lawbot-emerald-800 text-sm font-medium px-3 py-1">
                        🛡️ {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <Card className="card-modern bg-gradient-to-br from-lawbot-blue-50 to-white dark:from-lawbot-blue-900/10 dark:to-lawbot-slate-800 border-lawbot-blue-200 dark:border-lawbot-blue-800">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-lawbot-blue-500 rounded-lg">
                          <TrendingUp className="h-4 w-4 text-white" />
                        </div>
                        <CardTitle className="text-lg text-lawbot-slate-900 dark:text-white">Primary Expertise</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-slate-200 dark:border-lawbot-slate-700">
                          <span className="text-sm font-medium text-lawbot-slate-700 dark:text-lawbot-slate-300">🎣 Phishing Investigation</span>
                          <Badge className="bg-gradient-to-r from-lawbot-emerald-50 to-lawbot-emerald-100 text-lawbot-emerald-700 border border-lawbot-emerald-200 dark:from-lawbot-emerald-900/20 dark:to-lawbot-emerald-800/20 dark:text-lawbot-emerald-300 dark:border-lawbot-emerald-800">✨ Expert</Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-slate-200 dark:border-lawbot-slate-700">
                          <span className="text-sm font-medium text-lawbot-slate-700 dark:text-lawbot-slate-300">🎭 Social Engineering</span>
                          <Badge className="bg-gradient-to-r from-lawbot-blue-50 to-lawbot-blue-100 text-lawbot-blue-700 border border-lawbot-blue-200 dark:from-lawbot-blue-900/20 dark:to-lawbot-blue-800/20 dark:text-lawbot-blue-300 dark:border-lawbot-blue-800">⚡ Advanced</Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-slate-200 dark:border-lawbot-slate-700">
                          <span className="text-sm font-medium text-lawbot-slate-700 dark:text-lawbot-slate-300">🔍 Digital Forensics</span>
                          <Badge className="bg-gradient-to-r from-lawbot-purple-50 to-lawbot-purple-100 text-lawbot-purple-700 border border-lawbot-purple-200 dark:from-lawbot-purple-900/20 dark:to-lawbot-purple-800/20 dark:text-lawbot-purple-300 dark:border-lawbot-purple-800">🔧 Intermediate</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="card-modern bg-gradient-to-br from-lawbot-purple-50 to-white dark:from-lawbot-purple-900/10 dark:to-lawbot-slate-800 border-lawbot-purple-200 dark:border-lawbot-purple-800">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-lawbot-purple-500 rounded-lg">
                          <Award className="h-4 w-4 text-white" />
                        </div>
                        <CardTitle className="text-lg text-lawbot-slate-900 dark:text-white">Training Progress</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-slate-200 dark:border-lawbot-slate-700">
                          <div className="flex justify-between text-sm font-medium mb-2 text-lawbot-slate-700 dark:text-lawbot-slate-300">
                            <span>🦠 Malware Analysis</span>
                            <span className="text-lawbot-blue-600 dark:text-lawbot-blue-400">75%</span>
                          </div>
                          <div className="w-full bg-lawbot-slate-200 dark:bg-lawbot-slate-700 rounded-full h-3">
                            <div className="bg-gradient-to-r from-lawbot-blue-500 to-lawbot-blue-600 h-3 rounded-full shadow-sm" style={{ width: "75%" }}></div>
                          </div>
                        </div>
                        <div className="p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-slate-200 dark:border-lawbot-slate-700">
                          <div className="flex justify-between text-sm font-medium mb-2 text-lawbot-slate-700 dark:text-lawbot-slate-300">
                            <span>💰 Financial Crimes</span>
                            <span className="text-lawbot-emerald-600 dark:text-lawbot-emerald-400">60%</span>
                          </div>
                          <div className="w-full bg-lawbot-slate-200 dark:bg-lawbot-slate-700 rounded-full h-3">
                            <div className="bg-gradient-to-r from-lawbot-emerald-500 to-lawbot-emerald-600 h-3 rounded-full shadow-sm" style={{ width: "60%" }}></div>
                          </div>
                        </div>
                        <div className="p-3 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-slate-200 dark:border-lawbot-slate-700">
                          <div className="flex justify-between text-sm font-medium mb-2 text-lawbot-slate-700 dark:text-lawbot-slate-300">
                            <span>🔒 Network Security</span>
                            <span className="text-lawbot-amber-600 dark:text-lawbot-amber-400">40%</span>
                          </div>
                          <div className="w-full bg-lawbot-slate-200 dark:bg-lawbot-slate-700 rounded-full h-3">
                            <div className="bg-gradient-to-r from-lawbot-amber-500 to-lawbot-amber-600 h-3 rounded-full shadow-sm" style={{ width: "40%" }}></div>
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
              <div className="space-y-8">
                <div>
                  <h4 className="font-semibold mb-5 text-lawbot-slate-800 dark:text-lawbot-slate-200 flex items-center">
                    <Award className="h-4 w-4 mr-2 text-lawbot-purple-500" />
                    🏆 Active Certifications
                  </h4>
                  <div className="space-y-4">
                    {officerData.certifications.map((cert, index) => (
                      <div key={index} className="flex items-center justify-between p-5 bg-gradient-to-r from-white to-lawbot-purple-50/30 dark:from-lawbot-slate-800 dark:to-lawbot-purple-900/10 border border-lawbot-purple-200 dark:border-lawbot-purple-800 rounded-xl hover:shadow-md transition-all duration-300">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-lawbot-amber-500 rounded-lg">
                            <Award className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h5 className="font-semibold text-lawbot-slate-900 dark:text-white">{cert}</h5>
                            <p className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400">📅 Valid until: Dec 2025</p>
                          </div>
                        </div>
                        <Badge className="bg-gradient-to-r from-lawbot-emerald-50 to-lawbot-emerald-100 text-lawbot-emerald-700 border border-lawbot-emerald-200 dark:from-lawbot-emerald-900/20 dark:to-lawbot-emerald-800/20 dark:text-lawbot-emerald-300 dark:border-lawbot-emerald-800">✅ Active</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-5 text-lawbot-slate-800 dark:text-lawbot-slate-200 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-lawbot-blue-500" />
                    📚 Upcoming Training
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-5 bg-gradient-to-r from-white to-lawbot-blue-50/30 dark:from-lawbot-slate-800 dark:to-lawbot-blue-900/10 border-2 border-dashed border-lawbot-blue-300 dark:border-lawbot-blue-700 rounded-xl hover:shadow-md transition-all duration-300">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-lawbot-blue-500 rounded-lg">
                          <Calendar className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h5 className="font-semibold text-lawbot-slate-900 dark:text-white">🦠 Advanced Malware Analysis</h5>
                          <p className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400">📅 Scheduled: Feb 15, 2025</p>
                        </div>
                      </div>
                      <Badge className="bg-gradient-to-r from-lawbot-blue-50 to-lawbot-blue-100 text-lawbot-blue-700 border border-lawbot-blue-200 dark:from-lawbot-blue-900/20 dark:to-lawbot-blue-800/20 dark:text-lawbot-blue-300 dark:border-lawbot-blue-800">📝 Enrolled</Badge>
                    </div>
                    <div className="flex items-center justify-between p-5 bg-gradient-to-r from-white to-lawbot-amber-50/30 dark:from-lawbot-slate-800 dark:to-lawbot-amber-900/10 border-2 border-dashed border-lawbot-amber-300 dark:border-lawbot-amber-700 rounded-xl hover:shadow-md transition-all duration-300">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-lawbot-amber-500 rounded-lg">
                          <Calendar className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h5 className="font-semibold text-lawbot-slate-900 dark:text-white">💰 Cryptocurrency Investigation</h5>
                          <p className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400">📅 Scheduled: Mar 10, 2025</p>
                        </div>
                      </div>
                      <Badge className="bg-gradient-to-r from-lawbot-amber-50 to-lawbot-amber-100 text-lawbot-amber-700 border border-lawbot-amber-200 dark:from-lawbot-amber-900/20 dark:to-lawbot-amber-800/20 dark:text-lawbot-amber-300 dark:border-lawbot-amber-800">⏳ Pending</Badge>
                    </div>
                  </div>
                </div>
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
              <div className="space-y-5">
                <h4 className="font-semibold text-lawbot-slate-800 dark:text-lawbot-slate-200 flex items-center">
                  <Bell className="h-4 w-4 mr-2 text-lawbot-blue-500" />
                  🔔 Notification Preferences
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-slate-200 dark:border-lawbot-slate-700">
                    <div>
                      <p className="font-semibold text-lawbot-slate-900 dark:text-white">📋 Case Assignment Notifications</p>
                      <p className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400">Get notified when new cases are assigned to you</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 text-lawbot-blue-600 bg-lawbot-slate-100 border-lawbot-slate-300 rounded focus:ring-lawbot-blue-500 dark:focus:ring-lawbot-blue-600 dark:ring-offset-lawbot-slate-800 focus:ring-2 dark:bg-lawbot-slate-700 dark:border-lawbot-slate-600" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-slate-200 dark:border-lawbot-slate-700">
                    <div>
                      <p className="font-semibold text-lawbot-slate-900 dark:text-white">📎 Evidence Upload Alerts</p>
                      <p className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400">Notifications for new evidence uploads</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 text-lawbot-blue-600 bg-lawbot-slate-100 border-lawbot-slate-300 rounded focus:ring-lawbot-blue-500 dark:focus:ring-lawbot-blue-600 dark:ring-offset-lawbot-slate-800 focus:ring-2 dark:bg-lawbot-slate-700 dark:border-lawbot-slate-600" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-slate-200 dark:border-lawbot-slate-700">
                    <div>
                      <p className="font-semibold text-lawbot-slate-900 dark:text-white">🔧 System Updates</p>
                      <p className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400">Important system announcements and updates</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 text-lawbot-blue-600 bg-lawbot-slate-100 border-lawbot-slate-300 rounded focus:ring-lawbot-blue-500 dark:focus:ring-lawbot-blue-600 dark:ring-offset-lawbot-slate-800 focus:ring-2 dark:bg-lawbot-slate-700 dark:border-lawbot-slate-600" />
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <h4 className="font-semibold text-lawbot-slate-800 dark:text-lawbot-slate-200 flex items-center">
                  <Lock className="h-4 w-4 mr-2 text-lawbot-red-500" />
                  🔒 Security Settings
                </h4>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start btn-modern border-lawbot-slate-300 text-lawbot-slate-700 hover:bg-lawbot-blue-50 dark:border-lawbot-slate-600 dark:text-lawbot-slate-300 dark:hover:bg-lawbot-blue-900/20">
                    <Lock className="h-4 w-4 mr-3 text-lawbot-blue-500" />
                    🔑 Change Password
                  </Button>
                  <Button variant="outline" className="w-full justify-start btn-modern border-lawbot-slate-300 text-lawbot-slate-700 hover:bg-lawbot-emerald-50 dark:border-lawbot-slate-600 dark:text-lawbot-slate-300 dark:hover:bg-lawbot-emerald-900/20">
                    <Shield className="h-4 w-4 mr-3 text-lawbot-emerald-500" />
                    🛡️ Enable Two-Factor Authentication
                  </Button>
                  <Button variant="outline" className="w-full justify-start btn-modern border-lawbot-slate-300 text-lawbot-slate-700 hover:bg-lawbot-purple-50 dark:border-lawbot-slate-600 dark:text-lawbot-slate-300 dark:hover:bg-lawbot-purple-900/20">
                    <Eye className="h-4 w-4 mr-3 text-lawbot-purple-500" />
                    👁️ View Login History
                  </Button>
                </div>
              </div>

              <div className="space-y-5">
                <h4 className="font-semibold text-lawbot-slate-800 dark:text-lawbot-slate-200 flex items-center">
                  <Eye className="h-4 w-4 mr-2 text-lawbot-emerald-500" />
                  🔐 Privacy Settings
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-slate-200 dark:border-lawbot-slate-700">
                    <div>
                      <p className="font-semibold text-lawbot-slate-900 dark:text-white">👥 Profile Visibility</p>
                      <p className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400">Show profile to other officers in your unit</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 text-lawbot-blue-600 bg-lawbot-slate-100 border-lawbot-slate-300 rounded focus:ring-lawbot-blue-500 dark:focus:ring-lawbot-blue-600 dark:ring-offset-lawbot-slate-800 focus:ring-2 dark:bg-lawbot-slate-700 dark:border-lawbot-slate-600" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white dark:bg-lawbot-slate-800 rounded-lg border border-lawbot-slate-200 dark:border-lawbot-slate-700">
                    <div>
                      <p className="font-semibold text-lawbot-slate-900 dark:text-white">📊 Performance Statistics</p>
                      <p className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400">Share performance data for unit analytics and reports</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 text-lawbot-blue-600 bg-lawbot-slate-100 border-lawbot-slate-300 rounded focus:ring-lawbot-blue-500 dark:focus:ring-lawbot-blue-600 dark:ring-offset-lawbot-slate-800 focus:ring-2 dark:bg-lawbot-slate-700 dark:border-lawbot-slate-600" />
                  </div>
                </div>
              </div>

              <Button className="btn-gradient w-full">
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
