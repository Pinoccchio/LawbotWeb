"use client"

import React, { useState } from "react"
import { X, Crown, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import AdminManagementService, { SuperAdminProfile } from "@/lib/admin-management-service"

interface DeleteSuperAdminModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  admin: SuperAdminProfile | null
}

export function DeleteSuperAdminModal({ isOpen, onClose, onSuccess, admin }: DeleteSuperAdminModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleClose = () => {
    setError('')
    onClose()
  }

  const handleConfirmDelete = async () => {
    if (!admin) return
    
    setIsLoading(true)
    setError('')
    
    try {
      await AdminManagementService.deleteSuperAdmin(admin.id)
      onSuccess()
      onClose()
    } catch (error) {
      console.error('❌ Error deleting super admin:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete admin account')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen || !admin) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white dark:bg-slate-800 shadow-2xl border-0">
        <CardHeader className="border-b border-slate-200 dark:border-slate-700 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-red-500 to-red-600 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                  Delete Super Admin
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  This action cannot be undone
                </CardDescription>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-800 dark:text-red-300 mb-2">Warning</p>
                  <p className="text-red-700 dark:text-red-400 text-sm">
                    You are about to permanently delete the administrator account for:
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
              <div className="flex items-center space-x-3 mb-3">
                <Crown className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{admin.full_name}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{admin.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-600 dark:text-slate-400">Role</p>
                  <p className="font-medium text-slate-900 dark:text-white">{admin.role}</p>
                </div>
                <div>
                  <p className="text-slate-600 dark:text-slate-400">Status</p>
                  <div className="flex items-center space-x-2">
                    <div className={`h-2 w-2 rounded-full ${
                      admin.status === 'active' ? 'bg-green-500' : 
                      admin.status === 'suspended' ? 'bg-amber-500' : 
                      'bg-slate-400'
                    }`} />
                    <span className="font-medium text-slate-900 dark:text-white capitalize">{admin.status}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-amber-800 dark:text-amber-300 mb-1">Important Notice</p>
                  <p className="text-amber-700 dark:text-amber-400 text-sm">
                    This will permanently remove the administrator account. All associated data and access permissions will be revoked immediately.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200 dark:border-slate-700 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isLoading}
              className="px-6 bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Deleting...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Delete Admin</span>
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}