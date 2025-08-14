"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
  onLogin: () => void
  authError?: string | null
  isValidating?: boolean
}

export function LoginModal({ isOpen, onClose, onLogin, authError, isValidating = false }: LoginModalProps) {
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

  // Reset loading state when parent passes authError
  useEffect(() => {
    if (authError && isLoading) {
      console.log('🔄 Parent passed authError, resetting modal loading state')
      setIsLoading(false)
    }
  }, [authError, isLoading])

  if (!isOpen) return null

  // Clear success message when modal is closed
  const handleClose = () => {
    // Don't allow closing if loading/validating
    if (isLoading || isValidating) {
      console.log('⚠️ Cannot close modal while operation is in progress')
      return
    }
    
    console.log('🔒 Closing auth modal')
    // Reset form state
    setSuccessMessage('')
    setErrors({})
    
    // Call parent's onClose handler
    onClose()
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault() // This stops the form from causing a page refresh
    setErrors({})
    setIsLoading(true)
    
    try {
      // Validate required fields
      if (!loginForm.email || !loginForm.password) {
        setErrors({ general: 'Please fill in all required fields' })
        setIsLoading(false)
        return
      }

      console.log('🔑 Attempting login with:', { email: loginForm.email })
      
      try {
        // Use actual Firebase authentication
        const user = await signIn(loginForm.email, loginForm.password)
        
        // Log authentication result
        console.log('✅ Firebase auth successful, user:', user?.uid)
        
        // Wait a moment for auth state to update
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Call onLogin callback - the parent component will handle role detection and navigation
        // IMPORTANT: This is where we trigger the parent component to start its role detection process
        // The parent component will handle redirection and closing the modal after validation succeeds
        onLogin()
        
        // IMPORTANT: Don't set isLoading to false here immediately
        // But we need to handle the case where validation might fail
        // The parent will pass authError if validation fails
      } catch (error: any) {
        // Keep this modal open and show error
        console.error('❌ Login failed:', error)
        
        // Format error message for display
        let errorMessage = error.toString().replace('Error: ', '')
        
        // Friendly error messages for common errors
        if (errorMessage.includes('invalid-credential') || 
            errorMessage.includes('wrong-password') || 
            errorMessage.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please try again.'
        } else if (errorMessage.includes('user-not-found')) {
          errorMessage = 'No account found with this email. Please check your email or sign up.'
        } else if (errorMessage.includes('too-many-requests')) {
          errorMessage = 'Too many failed login attempts. Please try again later or reset your password.'
        }
        
        setErrors({ general: errorMessage })
        setIsLoading(false)
        
        // Ensure modal stays open
        return
      }
    } catch (error: any) {
      console.error('❌ Login handler error:', error)
      // Format error message for display
      const errorMessage = error.toString().replace('Error: ', '')
      setErrors({ general: errorMessage })
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault() // This prevents the form from causing a page refresh
    setErrors({})
    setIsLoading(true)
    
    try {
      // Basic validation for all users
      const newErrors: { [key: string]: string } = {}
      
      if (!signupForm.firstName.trim()) newErrors.firstName = 'First name is required'
      if (!signupForm.lastName.trim()) newErrors.lastName = 'Last name is required'
      if (!signupForm.email.trim()) newErrors.email = 'Email is required'
      if (!signupForm.password) newErrors.password = 'Password is required'
      if (!signupForm.confirmPassword) newErrors.confirmPassword = 'Please confirm your password'
      
      if (signupForm.password !== signupForm.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
      
      if (signupForm.password && signupForm.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters'
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        setIsLoading(false) // Make sure to set loading to false on validation error
        return
      }

      const fullName = `${signupForm.firstName.trim()} ${signupForm.lastName.trim()}`
      
      // Note: Signup functionality temporarily disabled for single login system
      // Users should be created by administrators, not through self-registration
      throw new Error('Account registration is currently disabled. Please contact your administrator for account setup.')
      
      try {
        // Create user account and profile
        // Note: This code is unreachable due to the error above, but keeping for reference
        await signUp(signupForm.email, signupForm.password, fullName, 'PNP_OFFICER', {
          phoneNumber: signupForm.phone,
          badgeNumber: signupForm.badgeNumber,
          unitId: signupForm.unit,  // FIX: Map form field to correct metadata field
          rank: signupForm.rank,
          region: signupForm.region
        })
        
        console.log('✅ Account created successfully!')
        
        // Clear any previous errors
        setErrors({})
        
        // Show success message
        setSuccessMessage('✅ Account created successfully! Redirecting to dashboard...')
        
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
        
        // Wait a moment for auth state to update, then redirect to dashboard
        setTimeout(() => {
          console.log('🔄 Redirecting to dashboard after successful signup...')
          // Call onLogin callback to trigger dashboard redirect
          onLogin()
          // Close modal after successful signup and redirect
          onClose()
        }, 2000) // Increased timeout to ensure user sees success message
      } catch (error: any) {
        // Keep this modal open and show error
        console.error('❌ Signup failed:', error)
        
        // Format error message for display
        let errorMessage = error.toString().replace('Error: ', '')
        
        // Friendly error messages for common errors
        if (errorMessage.includes('email-already-in-use')) {
          errorMessage = 'This email is already registered. Please use a different email or sign in.'
        } else if (errorMessage.includes('invalid-email')) {
          errorMessage = 'Please enter a valid email address.'
        } else if (errorMessage.includes('weak-password')) {
          errorMessage = 'Password is too weak. Please use a stronger password.'
        }
        
        setErrors({ general: errorMessage })
        setIsLoading(false)
        
        // Ensure modal stays open
        return
      }
    } catch (error: any) {
      console.error('❌ Signup handler error:', error)
      // Format and display error message
      const errorMessage = error.toString().replace('Error: ', '')
      setErrors({ general: errorMessage })
      setIsLoading(false)
    } finally {
      // This ensures loading state is reset even if there's an unexpected error
      if (isLoading) setIsLoading(false)
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <Card className="w-full max-w-md sm:max-w-lg max-h-[95vh] sm:max-h-[90vh] bg-white dark:bg-slate-800 shadow-2xl overflow-hidden">
        <CardHeader className="relative">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => {
              e.preventDefault(); // Prevent any default action
              e.stopPropagation(); // Stop event propagation
              handleClose();
            }} 
            className="absolute right-2 top-2 h-8 w-8 p-0"
            disabled={isLoading || isValidating}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">
                LawBot Portal Access
              </CardTitle>
              <CardDescription>
                Secure access for authorized personnel
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="w-fit">
            🔒 Secure Authentication
          </Badge>
        </CardHeader>

        <CardContent className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <Tabs defaultValue="login" className="w-full">
            <TabsContent value="login" className="space-y-4 mt-0">
              <form onSubmit={handleLogin} className="space-y-4">
                {(errors.general || authError) && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 animate-pulse">
                    <div className="flex items-start space-x-2">
                      <div className="text-red-600 dark:text-red-400 mt-0.5">⚠️</div>
                      <div>
                        <p className="text-red-800 dark:text-red-200 text-sm font-medium">
                          {authError || errors.general}
                        </p>
                        <p className="text-red-600 dark:text-red-300 text-xs mt-1">
                          Please check your credentials and try again.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@domain.com"
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
                      className="absolute right-0 top-0 h-full px-3 min-w-[44px] touch-manipulation"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>


                <Button
                  type="submit"
                  disabled={isLoading || isValidating}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white min-h-[48px] touch-manipulation disabled:opacity-50"
                >
                  {isLoading || isValidating ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {isLoading ? 'Signing in...' : isValidating ? 'Determining access...' : 'Loading...'}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <Shield className="mr-2 h-4 w-4" />
                      Access Portal
                    </span>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
