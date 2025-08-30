"use client"

import React, { useState, useEffect } from "react"
import { X, Shield, User, Mail, Phone, Crown, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge as UIBadge } from "@/components/ui/badge"
import AdminManagementService, { SuperAdminProfile, UpdateAdminRequest } from "@/lib/admin-management-service"

interface EditSuperAdminModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  admin: SuperAdminProfile | null
}

export function EditSuperAdminModal({ isOpen, onClose, onSuccess, admin }: EditSuperAdminModalProps) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  
  const [adminForm, setAdminForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    role: "SUPER_ADMIN" as const,
    status: "active" as "active" | "suspended" | "inactive"
  })

  useEffect(() => {
    if (admin && isOpen) {
      const nameParts = admin.full_name?.split(' ') || ['', '']
      
      const adminData = {
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: admin.email || '',
        phoneNumber: admin.phone_number || '',
        role: admin.role,
        status: admin.status
      }
      
      console.log('🔍 Populating edit form with admin data:', adminData)
      setAdminForm(adminData)
    }
  }, [admin, isOpen])

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!adminForm.firstName.trim()) newErrors.firstName = "First name is required"
    if (!adminForm.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!adminForm.email.trim()) newErrors.email = "Email is required"
    if (!/\S+@\S+\.\S+/.test(adminForm.email)) newErrors.email = "Please enter a valid email address"
    if (adminForm.phoneNumber && !/^\+?[\d\s\-\(\)]+$/.test(adminForm.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number"
    }
    if (!adminForm.status) newErrors.status = "Status is required"

    return newErrors
  }

  const resetForm = () => {
    if (admin) {
      const nameParts = admin.full_name?.split(' ') || ['', '']
      setAdminForm({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: admin.email || '',
        phoneNumber: admin.phone_number || '',
        role: admin.role,
        status: admin.status
      })
    }
    setErrors({})
    setSuccessMessage('')
  }

  const handleClose = () => {
    setSuccessMessage('')
    setErrors({})
    resetForm()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!admin) return
    
    const formErrors = validateForm()
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors)
      return
    }
    
    setIsLoading(true)
    setErrors({})
    
    try {
      const fullName = `${adminForm.firstName.trim()} ${adminForm.lastName.trim()}`
      
      const updateRequest: UpdateAdminRequest = {
        full_name: fullName,
        email: adminForm.email.trim(),
        phone_number: adminForm.phoneNumber.trim() || undefined,
        role: adminForm.role,
        status: adminForm.status
      }
      
      console.log('🔄 Updating Super Admin profile...')
      await AdminManagementService.updateSuperAdmin(admin.id, updateRequest)
      
      setSuccessMessage(`✅ Admin ${fullName} updated successfully!`)
      
      onSuccess()
      
      setTimeout(() => {
        setSuccessMessage('')
        handleClose()
      }, 2000)
      
    } catch (error) {
      console.error('❌ Error updating super admin:', error)
      setErrors({ 
        general: error instanceof Error ? error.message : 'Failed to update admin account' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const statusOptions = [
    { value: 'active', label: 'Active', icon: '✅', description: 'Administrator is actively working' },
    { value: 'suspended', label: 'Suspended', icon: '⚠️', description: 'Administrator is temporarily suspended' },
    { value: 'inactive', label: 'Inactive', icon: '❌', description: 'Administrator account is inactive' }
  ]

  if (!isOpen || !admin) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-800 shadow-2xl overflow-hidden">
        <CardHeader className="relative">
          <Button variant="ghost" size="sm" onClick={handleClose} className="absolute right-2 top-2 h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-600">
              <Edit className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Edit Super Admin</CardTitle>
              <CardDescription>
                Update administrator information for {admin.full_name}
              </CardDescription>
            </div>
          </div>
          <UIBadge variant="outline" className="w-fit">
            🔄 Update Admin Profile
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
                      className="pl-10"
                      value={adminForm.phoneNumber}
                      onChange={(e) => {
                        setAdminForm({ ...adminForm, phoneNumber: e.target.value })
                        if (errors.phoneNumber) setErrors({ ...errors, phoneNumber: '' })
                      }}
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

                {/* Account Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">Account Status *</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Select 
                      value={adminForm.status} 
                      onValueChange={(value) => {
                        console.log('🔄 Status changed to:', value)
                        setAdminForm({ ...adminForm, status: value as any })
                        if (errors.status) setErrors({ ...errors, status: '' })
                      }}
                    >
                      <SelectTrigger 
                        data-testid="status-trigger" 
                        className={`pl-10 ${errors.status ? 'border-red-500 focus:border-red-500' : ''}`}
                      >
                        {adminForm.status ? (
                          <span className="flex items-center space-x-2">
                            <span>
                              {adminForm.status === 'active' && '✅'}
                              {adminForm.status === 'suspended' && '⚠️'}
                              {adminForm.status === 'inactive' && '❌'}
                            </span>
                            <span>
                              {adminForm.status === 'active' && 'Active'}
                              {adminForm.status === 'suspended' && 'Suspended'}
                              {adminForm.status === 'inactive' && 'Inactive'}
                            </span>
                          </span>
                        ) : (
                          <SelectValue placeholder="Select account status" />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            <div className="flex items-center space-x-2">
                              <span>{status.icon}</span>
                              <div className="flex flex-col">
                                <span className="font-medium">{status.label}</span>
                                <span className="text-xs text-gray-500">{status.description}</span>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {errors.status && (
                    <p className="text-red-600 text-xs mt-1">{errors.status}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    💼 Administrator's account standing with the system
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  {isLoading ? 'Updating Admin...' : 'Update Admin Profile'}
                </Button>
              </>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}