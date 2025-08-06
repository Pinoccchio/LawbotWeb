"use client"

import { useState, useEffect } from "react"
import { FileText, ImageIcon, Video, Download, Eye, Search, Filter, Archive, Music, Shield, Clock, Database, Loader2, AlertCircle, CheckCircle, XCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { EvidenceViewerModal } from "@/components/modals/evidence-viewer-modal"
import EvidenceService, { EvidenceFile, EvidenceFilters, EvidenceStats } from "@/lib/evidence-service"
import { getPriorityColor, getStatusColor } from "@/lib/utils"
import { PNPOfficerService } from "@/lib/pnp-officer-service"

export function EvidenceViewerView() {
  // State for evidence data
  const [evidenceFiles, setEvidenceFiles] = useState<EvidenceFile[]>([])
  const [stats, setStats] = useState<EvidenceStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter state
  const [filters, setFilters] = useState<EvidenceFilters>({
    searchTerm: '',
    fileType: 'all',
    sortBy: 'date',
    sortOrder: 'desc'
  })
  
  // Modal state
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceFile | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Fetch evidence files
  const fetchEvidenceFiles = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      console.log('🔄 Fetching evidence files...')
      
      // Try multiple strategies to ensure we always show evidence
      let evidenceLoaded = false
      let loadedFiles: EvidenceFile[] = []
      
      // Strategy 1: Try to get officer-specific evidence
      try {
        const officerProfile = await PNPOfficerService.getCurrentOfficerProfile()
        
        if (officerProfile) {
          console.log('📋 Found officer profile:', officerProfile.full_name)
          const files = await EvidenceService.getOfficerEvidenceFiles(officerProfile.id)
          
          if (files.length > 0) {
            loadedFiles = files
            evidenceLoaded = true
            console.log(`✅ Loaded ${files.length} evidence files for officer`)
          } else {
            console.log('⚠️ No evidence files found for officer')
          }
        } else {
          console.log('⚠️ No officer profile found')
        }
      } catch (officerError) {
        console.log('⚠️ Error fetching officer evidence:', officerError)
      }
      
      // Strategy 2: If no officer evidence, try all evidence with filters
      if (!evidenceLoaded) {
        try {
          console.log('🔄 Attempting to fetch all evidence files...')
          const allFiles = await EvidenceService.getEvidenceFiles(filters)
          
          if (allFiles.length > 0) {
            loadedFiles = allFiles
            evidenceLoaded = true
            console.log(`✅ Loaded ${allFiles.length} evidence files (all cases)`)
          } else {
            console.log('⚠️ No evidence files found with current filters')
          }
        } catch (allError) {
          console.log('⚠️ Error fetching all evidence:', allError)
        }
      }
      
      // Strategy 3: If still no evidence, try without filters
      if (!evidenceLoaded) {
        try {
          console.log('🔄 Attempting to fetch evidence without filters...')
          const unfilteredFiles = await EvidenceService.getEvidenceFiles({})
          
          if (unfilteredFiles.length > 0) {
            loadedFiles = unfilteredFiles
            evidenceLoaded = true
            console.log(`✅ Loaded ${unfilteredFiles.length} evidence files (unfiltered)`)
          }
        } catch (unfilteredError) {
          console.log('⚠️ Error fetching unfiltered evidence:', unfilteredError)
        }
      }
      
      // Set the evidence files (even if empty)
      setEvidenceFiles(loadedFiles)
      
      // Try to fetch statistics (non-critical)
      try {
        const evidenceStats = await EvidenceService.getEvidenceStats()
        setStats(evidenceStats)
      } catch (statsError) {
        console.log('⚠️ Could not fetch statistics:', statsError)
        // Set default stats if fetch fails
        setStats({
          totalFiles: loadedFiles.length,
          totalSize: loadedFiles.reduce((sum, file) => sum + file.file_size, 0),
          filesByType: {
            images: loadedFiles.filter(f => f.file_type?.startsWith('image/')).length,
            documents: loadedFiles.filter(f => f.file_type?.includes('pdf') || f.file_type?.includes('document')).length,
            videos: loadedFiles.filter(f => f.file_type?.startsWith('video/')).length,
            audio: loadedFiles.filter(f => f.file_type?.startsWith('audio/')).length,
            other: 0
          },
          filesByStatus: {
            valid: loadedFiles.filter(f => f.is_valid === true).length,
            invalid: loadedFiles.filter(f => f.is_valid === false).length,
            pending: loadedFiles.filter(f => f.is_valid === undefined).length
          }
        })
      }
      
      // Only show error if we couldn't load ANY evidence
      if (!evidenceLoaded && loadedFiles.length === 0) {
        console.log('ℹ️ No evidence files available in the system')
      }
      
    } catch (error) {
      console.error('❌ Unexpected error fetching evidence:', error)
      setError('Unable to load evidence files. Please try refreshing the page.')
      // Still set empty array to prevent crashes
      setEvidenceFiles([])
    } finally {
      setIsLoading(false)
    }
  }

  // Load evidence on mount and filter changes
  useEffect(() => {
    fetchEvidenceFiles()
  }, [filters.fileType, filters.sortBy, filters.sortOrder])

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (filters.searchTerm !== '') {
        fetchEvidenceFiles()
      }
    }, 500)
    
    return () => clearTimeout(timer)
  }, [filters.searchTerm])

  const handleViewEvidence = (file: EvidenceFile) => {
    setSelectedEvidence(file)
    setIsModalOpen(true)
  }

  const handleDownloadEvidence = async (file: EvidenceFile) => {
    try {
      const downloadUrl = await EvidenceService.downloadEvidence(file.id)
      
      if (downloadUrl) {
        // Open download URL in new tab
        window.open(downloadUrl, '_blank')
      } else {
        alert('Failed to generate download link. Please try again.')
      }
    } catch (error) {
      console.error('❌ Error downloading evidence:', error)
      alert('Error downloading evidence file. Please try again.')
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedEvidence(null)
  }

  // Helper function to get file icon and color
  const getFileDisplay = (file: EvidenceFile) => {
    const isImage = file.file_type?.startsWith('image/')
    const isPdf = file.file_type?.includes('pdf')
    const isDoc = file.file_type?.includes('document') || file.file_type?.includes('msword')
    const isVideo = file.file_type?.startsWith('video/')
    const isAudio = file.file_type?.startsWith('audio/')
    
    let icon = <FileText className="h-5 w-5" />
    let color = 'text-gray-600'
    let type = 'document'
    
    if (isImage) {
      icon = <ImageIcon className="h-5 w-5" />
      color = 'text-blue-600'
      type = 'image'
    } else if (isVideo) {
      icon = <Video className="h-5 w-5" />
      color = 'text-green-600'
      type = 'video'
    } else if (isAudio) {
      icon = <Music className="h-5 w-5" />
      color = 'text-purple-600'
      type = 'audio'
    } else if (isPdf || isDoc) {
      icon = <FileText className="h-5 w-5" />
      color = 'text-red-600'
      type = 'document'
    }
    
    return { icon, color, type }
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-lawbot-emerald-500" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50 dark:bg-red-900/10">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-600">
          {error}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="animate-fade-in-up">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-lawbot-emerald-600 to-lawbot-blue-600 bg-clip-text text-transparent">
          Evidence Viewer
        </h2>
        <p className="text-lawbot-slate-600 dark:text-lawbot-slate-400 text-lg mt-2">
          Secure viewing and management of evidence files across all cases
        </p>
      </div>

      {/* Enhanced Search and Filter */}
      <Card className="card-modern bg-gradient-to-r from-lawbot-emerald-50/50 to-white dark:from-lawbot-emerald-900/10 dark:to-lawbot-slate-800 border-lawbot-emerald-200 dark:border-lawbot-emerald-800 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-lawbot-emerald-500 rounded-lg">
              <Search className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lawbot-slate-900 dark:text-white">Evidence Search & Filter</CardTitle>
              <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400">Find specific evidence files across your cases with advanced filtering</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lawbot-slate-400 h-4 w-4" />
                <Input 
                  placeholder="Search by filename or case number..." 
                  className="pl-10 border-lawbot-slate-300 dark:border-lawbot-slate-600 focus:border-lawbot-emerald-500"
                  value={filters.searchTerm}
                  onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                />
              </div>
            </div>
            <Select value={filters.fileType} onValueChange={(value) => setFilters({ ...filters, fileType: value as any })}>
              <SelectTrigger className="border-lawbot-slate-300 dark:border-lawbot-slate-600 focus:border-lawbot-emerald-500">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="image">🖼️ Images</SelectItem>
                <SelectItem value="document">📄 Documents</SelectItem>
                <SelectItem value="video">🎥 Video</SelectItem>
                <SelectItem value="audio">🎧 Audio</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.sortBy} onValueChange={(value) => setFilters({ ...filters, sortBy: value as any })}>
              <SelectTrigger className="border-lawbot-slate-300 dark:border-lawbot-slate-600 focus:border-lawbot-emerald-500">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">📅 Upload Date</SelectItem>
                <SelectItem value="name">🔤 File Name</SelectItem>
                <SelectItem value="size">💾 File Size</SelectItem>
                <SelectItem value="type">📁 File Type</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              className="btn-modern border-lawbot-emerald-300 text-lawbot-emerald-600 hover:bg-lawbot-emerald-50"
              onClick={() => fetchEvidenceFiles()}
            >
              <Filter className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="grid" className="space-y-6 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <TabsList className="bg-lawbot-slate-100 dark:bg-lawbot-slate-800 p-1 rounded-xl grid grid-cols-2">
          <TabsTrigger value="grid" className="data-[state=active]:bg-white dark:data-[state=active]:bg-lawbot-slate-700 data-[state=active]:text-lawbot-emerald-600 font-medium">
            📊 Grid View
          </TabsTrigger>
          <TabsTrigger value="list" className="data-[state=active]:bg-white dark:data-[state=active]:bg-lawbot-slate-700 data-[state=active]:text-lawbot-blue-600 font-medium">
            📄 List View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="grid">
          {evidenceFiles.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No evidence files found. Files will appear here when uploaded to your assigned cases.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {evidenceFiles.map((file, index) => {
                const display = getFileDisplay(file)
                return (
                  <Card key={file.id} className="card-modern hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`${display.color} p-3 bg-gradient-to-r from-lawbot-slate-100 to-lawbot-slate-200 dark:from-lawbot-slate-700 dark:to-lawbot-slate-800 rounded-xl shadow-sm`}>
                            {display.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lawbot-slate-900 dark:text-white truncate">{file.file_name}</h3>
                            <p className="text-sm text-lawbot-slate-500 dark:text-lawbot-slate-400 font-medium">💾 {formatFileSize(file.file_size)}</p>
                          </div>
                        </div>
                        {file.is_valid !== undefined && (
                          <Badge variant={file.is_valid ? "outline" : "destructive"} className="flex items-center gap-1">
                            {file.is_valid ? (
                              <>
                                <CheckCircle className="h-3 w-3" />
                                Valid
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3" />
                                Invalid
                              </>
                            )}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {file.complaint && (
                          <div className="space-y-2">
                            <Badge className="bg-gradient-to-r from-lawbot-blue-50 to-lawbot-blue-100 text-lawbot-blue-700 border border-lawbot-blue-200 dark:from-lawbot-blue-900/20 dark:to-lawbot-blue-800/20 dark:text-lawbot-blue-300 dark:border-lawbot-blue-800">
                              📁 {file.complaint.complaint_number}
                            </Badge>
                            <p className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400 font-medium truncate">
                              {file.complaint.title || file.complaint.crime_type}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge className={getPriorityColor(file.complaint.priority)} variant="outline">
                                {file.complaint.priority}
                              </Badge>
                              <Badge className={getStatusColor(file.complaint.status)} variant="outline">
                                {file.complaint.status}
                              </Badge>
                            </div>
                          </div>
                        )}
                        {file.validation_notes && (
                          <p className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400 italic">
                            {file.validation_notes}
                          </p>
                        )}
                        <div className="flex items-center text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400 p-2 bg-lawbot-slate-50 dark:bg-lawbot-slate-800 rounded-lg">
                          <Clock className="h-3 w-3 mr-1" />
                          Uploaded: {formatDate(file.uploaded_at)}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" className="flex-1 btn-gradient" onClick={() => handleViewEvidence(file)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button size="sm" variant="outline" className="btn-modern border-lawbot-emerald-300 text-lawbot-emerald-600 hover:bg-lawbot-emerald-50" onClick={() => handleDownloadEvidence(file)}>
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="list">
          <Card className="card-modern">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-lawbot-blue-500 rounded-lg">
                  <Database className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lawbot-slate-900 dark:text-white">Evidence Files</CardTitle>
                  <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400">Detailed list view of all evidence files</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {evidenceFiles.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No evidence files found. Files will appear here when uploaded to your assigned cases.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {evidenceFiles.map((file) => {
                    const display = getFileDisplay(file)
                    return (
                      <div
                        key={file.id}
                        className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800"
                      >
                        <div className={`${display.color} p-2 bg-gray-100 dark:bg-slate-800 rounded-lg`}>{display.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium truncate">{file.file_name}</h3>
                            {file.complaint && (
                              <Badge variant="outline">{file.complaint.complaint_number}</Badge>
                            )}
                            {file.is_valid !== undefined && (
                              <Badge variant={file.is_valid ? "outline" : "destructive"}>
                                {file.is_valid ? "Valid" : "Invalid"}
                              </Badge>
                            )}
                          </div>
                          {file.complaint && (
                            <p className="text-sm text-gray-600 dark:text-slate-400 mb-1">
                              {file.complaint.title || file.complaint.crime_type}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Size: {formatFileSize(file.file_size)}</span>
                            <span>Uploaded: {formatDate(file.uploaded_at)}</span>
                            <span>Type: {display.type}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleViewEvidence(file)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDownloadEvidence(file)}>
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Simple Evidence Statistics */}
      {evidenceFiles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
          <Card className="stats-card bg-gradient-to-br from-lawbot-blue-50 to-white dark:from-lawbot-blue-900/10 dark:to-lawbot-slate-800 border-lawbot-blue-200 dark:border-lawbot-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">Total Files</p>
                  <p className="text-3xl font-bold text-lawbot-blue-600 dark:text-lawbot-blue-400">{evidenceFiles.length}</p>
                  <p className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400 mt-1">📎 Evidence files</p>
                </div>
                <div className="p-3 bg-lawbot-blue-500 rounded-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stats-card bg-gradient-to-br from-lawbot-emerald-50 to-white dark:from-lawbot-emerald-900/10 dark:to-lawbot-slate-800 border-lawbot-emerald-200 dark:border-lawbot-emerald-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">Valid Files</p>
                  <p className="text-3xl font-bold text-lawbot-emerald-600 dark:text-lawbot-emerald-400">
                    {evidenceFiles.filter(f => f.is_valid === true).length}
                  </p>
                  <p className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400 mt-1">✅ Validated</p>
                </div>
                <div className="p-3 bg-lawbot-emerald-500 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stats-card bg-gradient-to-br from-lawbot-amber-50 to-white dark:from-lawbot-amber-900/10 dark:to-lawbot-slate-800 border-lawbot-amber-200 dark:border-lawbot-amber-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">Total Size</p>
                  <p className="text-3xl font-bold text-lawbot-amber-600 dark:text-lawbot-amber-400">
                    {formatFileSize(evidenceFiles.reduce((sum, file) => sum + file.file_size, 0))}
                  </p>
                  <p className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400 mt-1">💾 Storage used</p>
                </div>
                <div className="p-3 bg-lawbot-amber-500 rounded-lg">
                  <Database className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Evidence Viewer Modal */}
      <EvidenceViewerModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        caseData={{ 
          id: selectedEvidence?.complaint?.complaint_number || "Unknown", 
          title: `Evidence: ${selectedEvidence?.file_name || "Unknown"}`,
          evidenceFile: selectedEvidence
        }}
      />
    </div>
  )
}