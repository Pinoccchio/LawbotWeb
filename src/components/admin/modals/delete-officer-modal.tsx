"use client"

import React, { useState } from "react"
import { X, Trash2, AlertTriangle, Shield, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge as UIBadge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { supabase } from "@/lib/supabase"

interface DeleteOfficerModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  officer: any
}

export function DeleteOfficerModal({ isOpen, onClose, onSuccess, officer }: DeleteOfficerModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState('')

  if (!isOpen) return null

  const handleClose = () => {
    setError('')
    setSuccessMessage('')
    onClose()
  }

  const handleDeleteOfficer = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      console.log('🗑️ Deleting officer:', officer)
      
      // Check if this is real Supabase data or mock data
      if (officer.created_at) {
        // Real Supabase data - delete from database
        const { error: deleteError } = await supabase
          .from('pnp_officer_profiles')
          .delete()
          .eq('id', officer.id)
        
        if (deleteError) {
          console.error('💥 Error deleting officer:', deleteError)
          throw new Error(`Failed to delete officer: ${deleteError.message}`)
        }
        
        console.log('✅ Officer deleted successfully from database')
        
        // Show success message
        setSuccessMessage(`✅ Officer ${officer.name} (${officer.badge}) has been deleted successfully.`)
        
        // Notify parent component of success
        onSuccess()
        
        // Auto close after 2 seconds
        setTimeout(() => {
          setSuccessMessage('')
          handleClose()
        }, 2000)
        
      } else {
        // Mock data - just show success message
        console.log('🔄 Mock data deletion simulation')
        setSuccessMessage(`✅ Officer ${officer.name} (${officer.badge}) deleted (Simulation - Database integration required)`)
        
        // Auto close after 3 seconds for mock data
        setTimeout(() => {
          setSuccessMessage('')
          handleClose()
        }, 3000)
      }
      
    } catch (error: any) {
      console.error('💥 Error deleting officer:', error)
      setError(error.message || 'Failed to delete officer. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white dark:bg-slate-800 shadow-2xl">
        <CardHeader className="relative">
          <Button variant="ghost" size="sm" onClick={handleClose} className="absolute right-2 top-2 h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 rounded-lg bg-red-600">
              <Trash2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl text-red-600 dark:text-red-400">Delete Officer</CardTitle>
              <CardDescription>
                This action cannot be undone
              </CardDescription>
            </div>
          </div>
          <UIBadge variant="destructive" className="w-fit">
            ⚠️ Permanent Action
          </UIBadge>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-red-800 dark:text-red-200 text-sm font-medium">
                ⚠️ {error}
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
              {/* Officer Information Display */}
              <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12 ring-2 ring-red-200 dark:ring-red-800">
                    <AvatarImage src={`/placeholder.svg?height=48&width=48`} />
                    <AvatarFallback className="bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold">
                      {officer?.name
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .join("") || "PO"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white">{officer?.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{officer?.rank}</p>
                    <UIBadge className="bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800 font-mono text-xs mt-1">
                      {officer?.badge}
                    </UIBadge>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-800">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Unit:</span>
                      <p className="font-medium text-slate-700 dark:text-slate-300 truncate">{officer?.unit}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Region:</span>
                      <p className="font-medium text-slate-700 dark:text-slate-300 truncate">{officer?.region}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Cases:</span>
                      <p className="font-medium text-slate-700 dark:text-slate-300">{officer?.cases || 0}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Resolved:</span>
                      <p className="font-medium text-slate-700 dark:text-slate-300">{officer?.resolved || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Warning Message */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                      Are you absolutely sure?
                    </p>
                    <p className="text-amber-700 dark:text-amber-300">
                      This will permanently delete the officer profile and remove all associated data. 
                      This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                  disabled={isLoading}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteOfficer}
                  className="flex-1"
                  disabled={isLoading}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isLoading ? 'Deleting...' : 'Delete Officer'}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}