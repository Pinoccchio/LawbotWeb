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
import { useAuth } from "@/contexts/AuthContext"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  userType: "admin" | "pnp"
  onLogin: (userType: "admin" | "pnp") => void
}

export function LoginModal({ isOpen, onClose, userType, onLogin }: LoginModalProps) {
  const { signIn, signUp, signOut } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showSignupPassword, setShowSignupPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
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

  // Clear success message when modal is closed
  const handleClose = () => {
    setSuccessMessage('')
    setErrors({})
    onClose()
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsLoading(true)
    
    try {
      // Validate required fields
      if (!loginForm.email || !loginForm.password) {
        setErrors({ general: 'Please fill in all required fields' })
        return
      }

      // Use actual Firebase authentication
      await signIn(loginForm.email, loginForm.password)
      
      // Check user type and permissions here if needed
      onLogin(userType)
      onClose()
    } catch (error: any) {
      console.error('Login failed:', error)
      setErrors({ general: error.toString().replace('Error: ', '') })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsLoading(true)
    
    try {
      // Validate required fields
      const newErrors: { [key: string]: string } = {}
      
      if (!signupForm.firstName.trim()) newErrors.firstName = 'First name is required'
      if (!signupForm.lastName.trim()) newErrors.lastName = 'Last name is required'
      if (!signupForm.email.trim()) newErrors.email = 'Email is required'
      if (!signupForm.password) newErrors.password = 'Password is required'
      if (!signupForm.confirmPassword) newErrors.confirmPassword = 'Please confirm your password'
      
      // PNP-specific validation
      if (userType === 'pnp') {
        if (!signupForm.badgeNumber.trim()) newErrors.badgeNumber = 'Badge number is required'
        if (!signupForm.rank) newErrors.rank = 'Rank is required'
        if (!signupForm.unit) newErrors.unit = 'Unit is required'
        if (!signupForm.region) newErrors.region = 'Region is required'
      }
      
      if (signupForm.password !== signupForm.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
      
      if (signupForm.password && signupForm.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters'
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        return
      }

      const fullName = `${signupForm.firstName.trim()} ${signupForm.lastName.trim()}`
      
      // Create account with appropriate user type
      const userTypeForDB = userType === 'admin' ? 'ADMIN' : 'PNP_OFFICER'
      
      await signUp(signupForm.email, signupForm.password, fullName, userTypeForDB, {
        phoneNumber: signupForm.phone,
        badgeNumber: signupForm.badgeNumber,
        unit: signupForm.unit,
        rank: signupForm.rank,
        region: signupForm.region
      })
      
      // Clear any previous errors
      setErrors({})
      
      // Show success message
      setSuccessMessage(`✅ ${userType === 'admin' ? 'Admin' : 'PNP Officer'} account created successfully! Please log in with your new credentials.`)
      
      // Clear the form
      setSignupForm({
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
      
      // Force logout to require login with new credentials
      await signOut()
      
      // Auto close after 3 seconds or wait for user to manually close
      setTimeout(() => {
        setSuccessMessage('')
        onClose()
      }, 3000)
    } catch (error: any) {
      console.error('Signup failed:', error)
      setErrors({ general: error.toString().replace('Error: ', '') })
    } finally {
      setIsLoading(false)
    }
  }

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
      <Card className="w-full max-w-lg max-h-[90vh] bg-white dark:bg-slate-800 shadow-2xl overflow-hidden">
        <CardHeader className="relative">
          <Button variant="ghost" size="sm" onClick={handleClose} className="absolute right-2 top-2 h-8 w-8 p-0">
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

        <CardContent className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4 mt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                {errors.general && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <p className="text-red-800 dark:text-red-200 text-sm font-medium">
                      ⚠️ {errors.general}
                    </p>
                  </div>
                )}
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


                <Button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full text-white ${userType === "admin" ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"} disabled:opacity-50`}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  {isLoading ? 'Signing in...' : `Login to ${userType === "admin" ? "Admin" : "PNP"} Portal`}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-3 mt-4">
              <form onSubmit={handleSignup} className="space-y-3">
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
                      This modal will close automatically in a few seconds...
                    </p>
                  </div>
                )}
                
                {!successMessage && (
                  <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="Juan"
                      value={signupForm.firstName}
                      onChange={(e) => {
                        setSignupForm({ ...signupForm, firstName: e.target.value })
                        if (errors.firstName) setErrors({ ...errors, firstName: '' })
                      }}
                      className={errors.firstName ? 'border-red-500 focus:border-red-500' : ''}
                    />
                    {errors.firstName && (
                      <p className="text-red-600 text-xs mt-1">{errors.firstName}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Dela Cruz"
                      value={signupForm.lastName}
                      onChange={(e) => setSignupForm({ ...signupForm, lastName: e.target.value })}
                      className={errors.lastName ? 'border-red-500 focus:border-red-500' : ''}
                    />
                    {errors.lastName && (
                      <p className="text-red-600 text-xs mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="signupEmail">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signupEmail"
                      type="email"
                      placeholder={userType === "admin" ? "admin@lawbot.gov.ph" : "officer@pnp.gov.ph"}
                      className={`pl-10 ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                      value={signupForm.email}
                      onChange={(e) => {
                        setSignupForm({ ...signupForm, email: e.target.value })
                        if (errors.email) setErrors({ ...errors, email: '' })
                      }}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-600 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-1">
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
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="badgeNumber">Badge Number</Label>
                        <Input
                          id="badgeNumber"
                          placeholder="PNP-12345"
                          value={signupForm.badgeNumber}
                          onChange={(e) => setSignupForm({ ...signupForm, badgeNumber: e.target.value })}
                          className={errors.badgeNumber ? 'border-red-500 focus:border-red-500' : ''}
                            />
                        {errors.badgeNumber && (
                          <p className="text-red-600 text-xs mt-1">{errors.badgeNumber}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="rank">Rank</Label>
                        <Select onValueChange={(value) => setSignupForm({ ...signupForm, rank: value })}>
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

                    <div className="space-y-1">
                      <Label htmlFor="unit">PNP Unit</Label>
                      <Select onValueChange={(value) => setSignupForm({ ...signupForm, unit: value })}>
                        <SelectTrigger className={errors.unit ? 'border-red-500 focus:border-red-500' : ''}>
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
                      {errors.unit && (
                        <p className="text-red-600 text-xs mt-1">{errors.unit}</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="region">Region</Label>
                      <Select onValueChange={(value) => setSignupForm({ ...signupForm, region: value })}>
                        <SelectTrigger className={errors.region ? 'border-red-500 focus:border-red-500' : ''}>
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
                      {errors.region && (
                        <p className="text-red-600 text-xs mt-1">{errors.region}</p>
                      )}
                    </div>
                  </>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="signupPassword">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signupPassword"
                        type={showSignupPassword ? "text" : "password"}
                        placeholder="Password"
                        className={`pl-10 pr-10 ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                        value={signupForm.password}
                        onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                        />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                      >
                        {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {errors.password && (
                      <p className="text-red-600 text-xs mt-1">{errors.password}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm"
                        className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''}`}
                        value={signupForm.confirmPassword}
                        onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
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
                  className={`w-full text-white ${userType === "admin" ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"} disabled:opacity-50`}
                >
                  <User className="mr-2 h-4 w-4" />
                  {isLoading ? 'Creating Account...' : `Create ${userType === "admin" ? "Admin" : "PNP"} Account`}
                </Button>
                </>
                )}
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
