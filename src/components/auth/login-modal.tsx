"use client"

import type React from "react"

import { useState } from "react"
import { X, Shield, User, Lock, Mail, Phone, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  userType: "admin" | "pnp"
  onLogin: (userType: "admin" | "pnp") => void
}

export function LoginModal({ isOpen, onClose, userType, onLogin }: LoginModalProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  })
  const [signupForm, setSignupForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    badgeNumber: "",
    unit: "",
    region: "",
    rank: "",
  })

  if (!isOpen) return null

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Debug mode - bypass validation
    onLogin(userType)
    onClose()
  }

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    // Debug mode - bypass validation
    onLogin(userType)
    onClose()
  }

  const pnpUnits = [
    "Anti-Cybercrime Group (ACG)",
    "Criminal Investigation and Detection Group (CIDG)",
    "Special Action Force (SAF)",
    "Highway Patrol Group (HPG)",
    "Aviation Security Group (AVSEGROUP)",
    "Maritime Group (MG)",
    "Civil Security Group (CSG)",
  ]

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

  const regions = [
    "National Capital Region (NCR)",
    "Region I - Ilocos Region",
    "Region II - Cagayan Valley",
    "Region III - Central Luzon",
    "Region IV-A - CALABARZON",
    "Region IV-B - MIMAROPA",
    "Region V - Bicol Region",
    "Region VI - Western Visayas",
    "Region VII - Central Visayas",
    "Region VIII - Eastern Visayas",
    "Region IX - Zamboanga Peninsula",
    "Region X - Northern Mindanao",
    "Region XI - Davao Region",
    "Region XII - SOCCSKSARGEN",
    "Region XIII - Caraga",
    "BARMM - Bangsamoro Autonomous Region",
  ]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white dark:bg-slate-800 shadow-2xl">
        <CardHeader className="relative">
          <Button variant="ghost" size="sm" onClick={onClose} className="absolute right-2 top-2 h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-3 mb-2">
            <div className={`p-2 rounded-lg ${userType === "admin" ? "bg-blue-600" : "bg-green-600"}`}>
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">
                {userType === "admin" ? "System Administrator" : "PNP Officer"} Access
              </CardTitle>
              <CardDescription>
                {userType === "admin" ? "Secure access to system administration" : "Philippine National Police Portal"}
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="w-fit">
            🔒 Secure Authentication
          </Badge>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4 mt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder={userType === "admin" ? "admin@lawbot.gov.ph" : "officer@pnp.gov.ph"}
                      className="pl-10"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="pl-10 pr-10"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
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
                </div>

                <div className="bg-gray-50 dark:bg-slate-700 p-3 rounded-lg text-sm">
                  <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Demo Credentials:</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Email: {userType === "admin" ? "admin@lawbot.gov.ph" : "officer@pnp.gov.ph"}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">Password: demo123</p>
                </div>

                <Button
                  type="submit"
                  className={`w-full ${userType === "admin" ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"}`}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Login to {userType === "admin" ? "Admin" : "PNP"} Portal
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4 mt-6">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="Juan"
                      value={signupForm.firstName}
                      onChange={(e) => setSignupForm({ ...signupForm, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Dela Cruz"
                      value={signupForm.lastName}
                      onChange={(e) => setSignupForm({ ...signupForm, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signupEmail">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signupEmail"
                      type="email"
                      placeholder={userType === "admin" ? "admin@lawbot.gov.ph" : "officer@pnp.gov.ph"}
                      className="pl-10"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      placeholder="+63 9XX XXX XXXX"
                      className="pl-10"
                      value={signupForm.phone}
                      onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                    />
                  </div>
                </div>

                {userType === "pnp" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="badgeNumber">Badge Number</Label>
                        <Input
                          id="badgeNumber"
                          placeholder="PNP-12345"
                          value={signupForm.badgeNumber}
                          onChange={(e) => setSignupForm({ ...signupForm, badgeNumber: e.target.value })}
                            />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rank">Rank</Label>
                        <Select onValueChange={(value) => setSignupForm({ ...signupForm, rank: value })}>
                          <SelectTrigger>
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
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="unit">PNP Unit</Label>
                      <Select onValueChange={(value) => setSignupForm({ ...signupForm, unit: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your unit" />
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

                    <div className="space-y-2">
                      <Label htmlFor="region">Region</Label>
                      <Select onValueChange={(value) => setSignupForm({ ...signupForm, region: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                        <SelectContent>
                          {regions.map((region) => (
                            <SelectItem key={region} value={region}>
                              {region}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="signupPassword">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signupPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        className="pl-10"
                        value={signupForm.password}
                        onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                        />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm"
                        className="pl-10"
                        value={signupForm.confirmPassword}
                        onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                        />
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-sm">
                  <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">⚠️ Debug Mode</p>
                  <p className="text-yellow-700 dark:text-yellow-300">
                    This signup is for testing purposes. In production, account creation would require admin approval.
                  </p>
                </div>

                <Button
                  type="submit"
                  className={`w-full ${userType === "admin" ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"}`}
                >
                  <User className="mr-2 h-4 w-4" />
                  Create {userType === "admin" ? "Admin" : "PNP"} Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
