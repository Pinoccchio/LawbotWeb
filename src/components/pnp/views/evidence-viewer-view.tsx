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
import { PhilippineTime } from "@/lib/philippine-time"

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
        // Use blob download approach to bypass CORS restrictions
        try {
          // Fetch the file as a blob
          const response = await fetch(downloadUrl)
          if (!response.ok) throw new Error('Failed to fetch file')
          
          const blob = await response.blob()
          
          // Create a blob URL
          const blobUrl = URL.createObjectURL(blob)
          
          // Create temporary anchor element to force download
          const link = document.createElement('a')
          link.href = blobUrl
          link.download = file.file_name // Force download with original filename
          document.body.appendChild(link)
          link.click()
          
          // Cleanup
          document.body.removeChild(link)
          URL.revokeObjectURL(blobUrl)
          
          console.log('✅ File downloaded successfully:', file.file_name)
        } catch (fetchError) {
          console.error('❌ Blob download failed, trying direct download:', fetchError)
          
          // Fallback to direct download
          const link = document.createElement('a')
          link.href = downloadUrl
          link.download = file.file_name
          link.target = '_blank'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
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

  // Client-side filtering for immediate response
  const filteredFiles = evidenceFiles.filter(file => {
    // Search filter - check file name and case number
    const matchesSearch = !filters.searchTerm || 
      file.file_name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      file.complaint?.complaint_number?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      file.complaint?.title?.toLowerCase().includes(filters.searchTerm.toLowerCase())
    
    // File type filter - enhanced matching
    let matchesType = true
    if (filters.fileType !== 'all') {
      const fileType = file.file_type?.toLowerCase() || ''
      const fileName = file.file_name?.toLowerCase() || ''
      
      switch (filters.fileType) {
        case 'image':
          matchesType = fileType.startsWith('image/') || 
                      fileName.endsWith('.jpg') || 
                      fileName.endsWith('.jpeg') || 
                      fileName.endsWith('.png') || 
                      fileName.endsWith('.gif') || 
                      fileName.endsWith('.webp') || 
                      fileName.endsWith('.bmp')
          break
        case 'video':
          matchesType = fileType.startsWith('video/') || 
                      fileName.endsWith('.mp4') || 
                      fileName.endsWith('.mov') || 
                      fileName.endsWith('.avi') || 
                      fileName.endsWith('.mkv') || 
                      fileName.endsWith('.webm')
          break
        case 'document':
          matchesType = fileType.includes('pdf') || 
                      fileType.includes('document') || 
                      fileType.includes('msword') ||
                      fileName.endsWith('.pdf') || 
                      fileName.endsWith('.doc') || 
                      fileName.endsWith('.docx')
          break
        case 'audio':
          matchesType = fileType.startsWith('audio/') || 
                      fileName.endsWith('.mp3') || 
                      fileName.endsWith('.wav') || 
                      fileName.endsWith('.ogg')
          break
        default:
          matchesType = true
      }
    }
    
    return matchesSearch && matchesType
  })

  // Client-side sorting if needed (server should handle this, but fallback)
  const sortedFilteredFiles = [...filteredFiles].sort((a, b) => {
    let comparison = 0
    
    switch (filters.sortBy) {
      case 'name':
        comparison = a.file_name.localeCompare(b.file_name)
        break
      case 'size':
        comparison = a.file_size - b.file_size
        break
      case 'type':
        comparison = (a.file_type || '').localeCompare(b.file_type || '')
        break
      case 'date':
      default:
        comparison = new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()
        break
    }
    
    return filters.sortOrder === 'asc' ? comparison : -comparison
  })

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
    return PhilippineTime.formatDatabaseTime(dateString)
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
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-lawbot-emerald-600 to-lawbot-blue-600 bg-clip-text text-transparent">
          Evidence Viewer
        </h2>
        <p className="text-lawbot-slate-600 dark:text-lawbot-slate-400 text-sm sm:text-base lg:text-lg mt-2">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
            <div className="sm:col-span-2 lg:col-span-1 xl:col-span-2">
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
                <SelectItem value="image">📷 Photos</SelectItem>
                <SelectItem value="video">🎥 Videos</SelectItem>
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
              className="btn-modern border-lawbot-emerald-300 text-lawbot-emerald-600 hover:bg-lawbot-emerald-50 w-full sm:w-auto"
              onClick={() => fetchEvidenceFiles()}
            >
              <Filter className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Refresh</span>
              <span className="sm:hidden">Refresh</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="grid" className="space-y-6 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        {/* Improved Evidence Viewer Tab Design */}
        <div className="w-full overflow-x-auto scrollbar-hide pb-2">
          <TabsList className="inline-flex bg-lawbot-slate-100 dark:bg-lawbot-slate-800 p-1.5 sm:p-2 rounded-xl w-full justify-start">
            <TabsTrigger 
              value="grid" 
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-lawbot-slate-700 data-[state=active]:text-lawbot-emerald-600 font-medium px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg whitespace-nowrap flex items-center gap-2 sm:gap-3 flex-1 min-w-fit transition-all duration-200 text-sm sm:text-base"
            >
              <span>📊</span>
              <span className="font-semibold">Grid View</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="list" 
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-lawbot-slate-700 data-[state=active]:text-lawbot-blue-600 font-medium px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg whitespace-nowrap flex items-center gap-2 sm:gap-3 flex-1 min-w-fit transition-all duration-200 text-sm sm:text-base"
            >
              <span>📄</span>
              <span className="font-semibold">List View</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="grid">
          {sortedFilteredFiles.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {evidenceFiles.length === 0 
                  ? "No evidence files found. Files will appear here when uploaded to your assigned cases."
                  : "No evidence files match your current search and filter criteria."}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {sortedFilteredFiles.map((file, index) => {
                const display = getFileDisplay(file)
                return (
                  <Card key={file.id} className="card-modern hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                    <CardHeader className="p-3 sm:p-6">
                      <div className="flex items-center space-x-3">
                        <div className={`${display.color} p-2 sm:p-3 bg-gradient-to-r from-lawbot-slate-100 to-lawbot-slate-200 dark:from-lawbot-slate-700 dark:to-lawbot-slate-800 rounded-xl shadow-sm flex-shrink-0`}>
                          {display.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm sm:text-base text-lawbot-slate-900 dark:text-white truncate">{file.file_name}</h3>
                          <p className="text-xs sm:text-sm text-lawbot-slate-500 dark:text-lawbot-slate-400 font-medium">💾 {formatFileSize(file.file_size)}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-6">
                      <div className="space-y-3 sm:space-y-4">
                        {file.complaint && (
                          <div className="space-y-2">
                            <Badge className="bg-gradient-to-r from-lawbot-blue-50 to-lawbot-blue-100 text-lawbot-blue-700 border border-lawbot-blue-200 dark:from-lawbot-blue-900/20 dark:to-lawbot-blue-800/20 dark:text-lawbot-blue-300 dark:border-lawbot-blue-800 text-xs">
                              📁 {file.complaint.complaint_number}
                            </Badge>
                            <p className="text-xs sm:text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400 font-medium truncate">
                              {file.complaint.title || file.complaint.crime_type}
                            </p>
                            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                              <Badge className={`${getPriorityColor(file.complaint.priority)} text-xs`} variant="outline">
                                <span className="hidden sm:inline">{file.complaint.priority}</span>
                                <span className="sm:hidden">{file.complaint.priority === 'high' ? '🔴' : file.complaint.priority === 'medium' ? '🟡' : '🟢'}</span>
                              </Badge>
                              <Badge className={`${getStatusColor(file.complaint.status)} text-xs`} variant="outline">
                                <span className="hidden lg:inline">{file.complaint.status}</span>
                                <span className="lg:hidden">
                                  {file.complaint.status === 'Pending' ? '📋' : 
                                   file.complaint.status === 'Under Investigation' ? '🔍' :
                                   file.complaint.status === 'Requires More Information' ? '❓' :
                                   file.complaint.status === 'Resolved' ? '✅' : '❌'}
                                </span>
                              </Badge>
                            </div>
                          </div>
                        )}
                        {file.validation_notes && (
                          <p className="text-xs sm:text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400 italic">
                            {file.validation_notes}
                          </p>
                        )}
                        <div className="flex items-center text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400 p-2 bg-lawbot-slate-50 dark:bg-lawbot-slate-800 rounded-lg">
                          <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">Uploaded: {formatDate(file.uploaded_at)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" className="flex-1 btn-gradient text-xs sm:text-sm" onClick={() => handleViewEvidence(file)}>
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                            <span className="hidden sm:inline">View</span>
                          </Button>
                          <Button size="sm" variant="outline" className="btn-modern border-lawbot-emerald-300 text-lawbot-emerald-600 hover:bg-lawbot-emerald-50 px-2 sm:px-4" onClick={() => handleDownloadEvidence(file)}>
                            <Download className="h-3 w-3 sm:h-4 sm:w-4" />
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
              {sortedFilteredFiles.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {evidenceFiles.length === 0 
                      ? "No evidence files found. Files will appear here when uploaded to your assigned cases."
                      : "No evidence files match your current search and filter criteria."}
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {sortedFilteredFiles.map((file) => {
                    const display = getFileDisplay(file)
                    return (
                      <div
                        key={file.id}
                        className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 p-3 sm:p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800"
                      >
                        <div className={`${display.color} p-2 bg-gray-100 dark:bg-slate-800 rounded-lg self-start sm:self-center flex-shrink-0`}>{display.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-2">
                            <h3 className="font-medium truncate text-sm sm:text-base">{file.file_name}</h3>
                            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                              {file.complaint && (
                                <Badge variant="outline" className="text-xs">{file.complaint.complaint_number}</Badge>
                              )}
                            </div>
                          </div>
                          {file.complaint && (
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400 mb-2 truncate">
                              {file.complaint.title || file.complaint.crime_type}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-500">
                            <span>Size: {formatFileSize(file.file_size)}</span>
                            <span className="hidden sm:inline">Uploaded: {formatDate(file.uploaded_at)}</span>
                            <span className="sm:hidden">📅 {formatDate(file.uploaded_at).split(' ')[0]}</span>
                            <span className="hidden lg:inline">Type: {display.type}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 self-end sm:self-center">
                          <Button size="sm" variant="outline" className="flex-1 sm:flex-none text-xs" onClick={() => handleViewEvidence(file)}>
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                            <span className="hidden sm:inline">View</span>
                          </Button>
                          <Button size="sm" variant="outline" className="px-2 sm:px-4" onClick={() => handleDownloadEvidence(file)}>
                            <Download className="h-3 w-3 sm:h-4 sm:w-4" />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
          <Card className="stats-card bg-gradient-to-br from-lawbot-blue-50 to-white dark:from-lawbot-blue-900/10 dark:to-lawbot-slate-800 border-lawbot-blue-200 dark:border-lawbot-blue-800">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">Total Files</p>
                  <p className="text-2xl sm:text-3xl font-bold text-lawbot-blue-600 dark:text-lawbot-blue-400">{evidenceFiles.length}</p>
                  <p className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400 mt-1">📎 Evidence files</p>
                </div>
                <div className="p-2 sm:p-3 bg-lawbot-blue-500 rounded-lg flex-shrink-0">
                  <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>


          <Card className="stats-card bg-gradient-to-br from-lawbot-amber-50 to-white dark:from-lawbot-amber-900/10 dark:to-lawbot-slate-800 border-lawbot-amber-200 dark:border-lawbot-amber-800">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">Total Size</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-lawbot-amber-600 dark:text-lawbot-amber-400">
                    {formatFileSize(evidenceFiles.reduce((sum, file) => sum + file.file_size, 0))}
                  </p>
                  <p className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400 mt-1">💾 Storage used</p>
                </div>
                <div className="p-2 sm:p-3 bg-lawbot-amber-500 rounded-lg flex-shrink-0">
                  <Database className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
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
        mode="single-case"
        caseData={{ 
          id: selectedEvidence?.complaint?.complaint_number || "Unknown", 
          title: `Evidence: ${selectedEvidence?.file_name || "Unknown"}`,
          evidenceFile: selectedEvidence
        }}
      />
    </div>
  )
}