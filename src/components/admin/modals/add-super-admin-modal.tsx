"use client"

import React, { useState } from "react"
import { X, Shield, User, Lock, Mail, Phone, Eye, EyeOff, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge as UIBadge } from "@/components/ui/badge"
import AdminManagementService, { CreateAdminRequest } from "@/lib/admin-management-service"

interface AddSuperAdminModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddSuperAdminModal({ isOpen, onClose, onSuccess }: AddSuperAdminModalProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  
  const [adminForm, setAdminForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    role: "SUPER_ADMIN" as const
  })

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!adminForm.firstName.trim()) newErrors.firstName = "First name is required"
    if (!adminForm.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!adminForm.email.trim()) newErrors.email = "Email is required"
    if (!/\S+@\S+\.\S+/.test(adminForm.email)) newErrors.email = "Please enter a valid email address"
    if (adminForm.password.length < 6) newErrors.password = "Password must be at least 6 characters"
    if (adminForm.password !== adminForm.confirmPassword) newErrors.confirmPassword = "Passwords do not match"
    if (adminForm.phoneNumber && !/^\+?[\d\s\-\(\)]+$/.test(adminForm.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number"
    }
    if (!adminForm.role) newErrors.role = "Role is required"

    return newErrors
  }

  const resetForm = () => {
    setAdminForm({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
      role: "SUPER_ADMIN"
    })
    setErrors({})
    setSuccessMessage('')
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const formErrors = validateForm()
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors)
      return
    }
    
    setIsLoading(true)
    setErrors({})
    
    try {
      const createRequest: CreateAdminRequest = {
        email: adminForm.email.trim(),
        password: adminForm.password,
        full_name: `${adminForm.firstName.trim()} ${adminForm.lastName.trim()}`,
        phone_number: adminForm.phoneNumber.trim() || undefined,
        role: adminForm.role
      }
      
      await AdminManagementService.createSuperAdmin(createRequest)
      
      setSuccessMessage(`Super Admin ${createRequest.full_name} created successfully!`)
      
      setTimeout(() => {
        resetForm()
        onSuccess()
        onClose()
      }, 2000)
      
    } catch (error) {
      console.error('❌ Error creating super admin:', error)
      setErrors({ 
        general: error instanceof Error ? error.message : 'Failed to create admin account' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-800 shadow-2xl overflow-hidden">
        <CardHeader className="relative">
          <Button variant="ghost" size="sm" onClick={handleClose} className="absolute right-2 top-2 h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-600">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Add Super Admin</CardTitle>
              <CardDescription>
                Create a new super administrator account with full system access
              </CardDescription>
            </div>
          </div>
          <UIBadge variant="outline" className="w-fit">
            👑 Create Admin Profile
          </UIBadge>
        </CardHeader>

        <CardContent className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  This modal will close automatically...
                </p>
              </div>
            )}

            {!successMessage && (
              <>
                {/* Personal Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      placeholder="Juan"
                      value={adminForm.firstName}
                      onChange={(e) => {
                        setAdminForm({ ...adminForm, firstName: e.target.value })
                        if (errors.firstName) setErrors({ ...errors, firstName: '' })
                      }}
                      className={errors.firstName ? 'border-red-500 focus:border-red-500' : ''}
                      disabled={isLoading}
                    />
                    {errors.firstName && (
                      <p className="text-red-600 text-xs mt-1">{errors.firstName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      placeholder="Dela Cruz"
                      value={adminForm.lastName}
                      onChange={(e) => {
                        setAdminForm({ ...adminForm, lastName: e.target.value })
                        if (errors.lastName) setErrors({ ...errors, lastName: '' })
                      }}
                      className={errors.lastName ? 'border-red-500 focus:border-red-500' : ''}
                      disabled={isLoading}
                    />
                    {errors.lastName && (
                      <p className="text-red-600 text-xs mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@lawbot.gov.ph"
                      className={`pl-10 ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                      value={adminForm.email}
                      onChange={(e) => {
                        setAdminForm({ ...adminForm, email: e.target.value })
                        if (errors.email) setErrors({ ...errors, email: '' })
                      }}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-600 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phoneNumber"
                      placeholder="+63 9XX XXX XXXX"
                      className={`pl-10 ${errors.phoneNumber ? 'border-red-500 focus:border-red-500' : ''}`}
                      value={adminForm.phoneNumber}
                      onChange={(e) => {
                        setAdminForm({ ...adminForm, phoneNumber: e.target.value })
                        if (errors.phoneNumber) setErrors({ ...errors, phoneNumber: '' })
                      }}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className="text-red-600 text-xs mt-1">{errors.phoneNumber}</p>
                  )}
                </div>

                {/* Role Information */}
                <div className="space-y-2">
                  <Label htmlFor="role">Administrator Role</Label>
                  <div className="relative">
                    <Crown className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <div className="pl-10 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Crown className="h-4 w-4 text-purple-600" />
                        <span className="font-medium text-purple-700 dark:text-purple-300">Super Admin</span>
                        <UIBadge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">Full Access</UIBadge>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    👑 Complete system access and administrative privileges
                  </p>
                </div>

                {/* Password Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter secure password"
                        className={`pl-10 pr-10 ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                        value={adminForm.password}
                        onChange={(e) => {
                          setAdminForm({ ...adminForm, password: e.target.value })
                          if (errors.password) setErrors({ ...errors, password: '' })
                        }}
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                    {errors.password && (
                      <p className="text-red-600 text-xs mt-1">{errors.password}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm password"
                        className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''}`}
                        value={adminForm.confirmPassword}
                        onChange={(e) => {
                          setAdminForm({ ...adminForm, confirmPassword: e.target.value })
                          if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' })
                        }}
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
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
                  className="w-full text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                >
                  <Crown className="mr-2 h-4 w-4" />
                  {isLoading ? 'Creating Admin...' : 'Create Super Admin'}
                </Button>
              </>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}