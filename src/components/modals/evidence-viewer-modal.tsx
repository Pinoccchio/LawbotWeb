"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  X,
  Download,
  Eye,
  FileText,
  ImageIcon,
  Music,
  Video,
  Archive,
  Clock,
  Search,
  Filter,
  Loader2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Move,
  Shield,
  BarChart3
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PhilippineTime } from "@/lib/philippine-time"
import EvidenceService, { EvidenceFile } from "@/lib/evidence-service"

interface EvidenceViewerModalProps {
  isOpen: boolean
  onClose: () => void
  mode?: 'single-case' | 'multi-case'  // Context for interface complexity
  caseData: {
    id: string
    title: string
    evidenceFile?: EvidenceFile | null
    complaint_id?: string
  } | null
}

export function EvidenceViewerModal({ isOpen, onClose, mode = 'single-case', caseData }: EvidenceViewerModalProps) {
  const [selectedFile, setSelectedFile] = useState<EvidenceFile | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [sortBy, setSortBy] = useState("date")
  const [sortOrder, setSortOrder] = useState("desc")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [evidenceFiles, setEvidenceFiles] = useState<EvidenceFile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Fetch evidence files when modal opens
  useEffect(() => {
    if (isOpen && caseData) {
      fetchEvidenceFiles()
    }
  }, [isOpen, caseData])

  // Refetch when sorting changes
  useEffect(() => {
    if (isOpen && caseData && evidenceFiles.length > 0) {
      fetchEvidenceFiles()
    }
  }, [sortBy, sortOrder])

  const fetchEvidenceFiles = async () => {
    // If we have a specific evidence file, use it
    if (caseData?.evidenceFile) {
      setEvidenceFiles([caseData.evidenceFile])
      setSelectedFile(caseData.evidenceFile)
      return
    }
    
    // Otherwise fetch all evidence for the complaint
    if (!caseData?.id && !caseData?.complaint_id) {
      console.log('⚠️ No case ID provided to fetch evidence')
      return
    }
    
    setIsLoading(true)
    try {
      const complaintId = caseData.complaint_id || caseData.id
      console.log('🔄 Fetching evidence files for complaint:', complaintId)
      console.log('📋 Case data received:', caseData)
      
      const files = await EvidenceService.getEvidenceFiles({ 
        caseId: complaintId,
        sortBy: sortBy as 'date' | 'name' | 'size' | 'type',
        sortOrder: sortOrder as 'asc' | 'desc'
      })
      setEvidenceFiles(files)
      console.log('✅ Evidence files loaded:', files.length)
      
      // Debug: Log file details
      if (files.length > 0) {
        console.log('📁 First file details:', {
          name: files[0].file_name,
          type: files[0].file_type,
          download_url: files[0].download_url,
          size: files[0].file_size
        })
      }
      
      // Select first file by default
      if (files.length > 0) {
        setSelectedFile(files[0])
      }
    } catch (error) {
      console.error('❌ Error fetching evidence files:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen || !caseData) return null

  // Filter evidence files - only apply filters in multi-case mode
  const filteredFiles = mode === 'multi-case' ? evidenceFiles.filter((file) => {
    const matchesSearch = searchTerm === "" || file.file_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Enhanced type matching logic
    let matchesType = false
    const fileType = file.file_type?.toLowerCase() || ''
    const fileName = file.file_name?.toLowerCase() || ''
    
    if (filterType === "all") {
      matchesType = true
    } else if (filterType === "image") {
      // Check both MIME type and file extension for images
      matchesType = fileType.startsWith('image/') || 
                   fileName.endsWith('.jpg') || 
                   fileName.endsWith('.jpeg') || 
                   fileName.endsWith('.png') || 
                   fileName.endsWith('.gif') || 
                   fileName.endsWith('.webp') || 
                   fileName.endsWith('.bmp')
    } else if (filterType === "video") {
      // Check both MIME type and file extension for videos
      matchesType = fileType.startsWith('video/') || 
                   fileName.endsWith('.mp4') || 
                   fileName.endsWith('.mov') || 
                   fileName.endsWith('.avi') || 
                   fileName.endsWith('.mkv') || 
                   fileName.endsWith('.webm')
    }
    
    // Debug logging for multi-case filtering
    if (filterType !== "all") {
      console.log('🔍 Multi-case filter check:', {
        fileName: file.file_name,
        fileType: file.file_type,
        filterType,
        matchesType,
        matchesSearch,
        willShow: matchesSearch && matchesType
      })
    }
    
    return matchesSearch && matchesType
  }) : evidenceFiles  // Single-case mode: show all files without filtering

  const getFileIcon = (fileType: string) => {
    if (fileType?.startsWith('image/')) {
      return <ImageIcon className="h-5 w-5 text-blue-600" />
    } else if (fileType?.includes('pdf') || fileType?.includes('document')) {
      return <FileText className="h-5 w-5 text-red-600" />
    } else if (fileType?.startsWith('audio/')) {
      return <Music className="h-5 w-5 text-green-600" />
    } else if (fileType?.startsWith('video/')) {
      return <Video className="h-5 w-5 text-purple-600" />
    } else if (fileType?.includes('zip') || fileType?.includes('rar') || fileType?.includes('7z')) {
      return <Archive className="h-5 w-5 text-orange-600" />
    } else {
      return <FileText className="h-5 w-5 text-gray-600" />
    }
  }

  const getValidationStatus = (isValid?: boolean) => {
    if (isValid === undefined) return { text: "Not Validated", color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200", icon: null }
    if (isValid) return { text: "Valid", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", icon: <CheckCircle className="h-3 w-3" /> }
    return { text: "Invalid", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", icon: <XCircle className="h-3 w-3" /> }
  }

  // Get file category for preview
  const getFileCategory = (fileType: string): 'image' | 'video' | 'pdf' | 'audio' | 'document' | 'other' => {
    if (!fileType) {
      console.log('🔍 getFileCategory: Empty fileType provided')
      return 'other'
    }
    
    const lowercaseType = fileType.toLowerCase()
    console.log('🔍 getFileCategory: Processing fileType:', fileType, '-> lowercase:', lowercaseType)
    
    // Image types
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff']
    if (fileType.startsWith('image/') || imageExtensions.some(ext => lowercaseType === ext || lowercaseType.endsWith(`.${ext}`))) {
      console.log('✅ getFileCategory: Identified as image')
      return 'image'
    }
    
    // Video types - Enhanced detection for MP4 and video MIME types
    const videoExtensions = ['mp4', 'webm', 'mov', 'avi', 'mkv', 'm4v', 'mpg', 'mpeg', 'wmv', '3gp']
    const isVideoMime = fileType.startsWith('video/')
    const isVideoExtension = videoExtensions.some(ext => lowercaseType === ext || lowercaseType.endsWith(`.${ext}`))
    
    console.log('🔍 getFileCategory: Video detection -', {
      fileType,
      isVideoMime,
      isVideoExtension,
      videoExtensions
    })
    
    if (isVideoMime || isVideoExtension) {
      console.log('✅ getFileCategory: Identified as video')
      return 'video'
    }
    
    // PDF
    if (fileType === 'application/pdf' || lowercaseType === 'pdf' || lowercaseType.endsWith('.pdf')) {
      return 'pdf'
    }
    
    // Audio types
    const audioExtensions = ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'wma', 'flac']
    if (fileType.startsWith('audio/') || audioExtensions.some(ext => lowercaseType === ext || lowercaseType.endsWith(`.${ext}`))) {
      return 'audio'
    }
    
    // Document types
    const docExtensions = ['doc', 'docx', 'txt', 'rtf', 'odt', 'xls', 'xlsx', 'ppt', 'pptx']
    if (fileType.includes('document') || fileType.includes('msword') || fileType.includes('spreadsheet') || 
        fileType.includes('presentation') || docExtensions.some(ext => lowercaseType === ext || lowercaseType.endsWith(`.${ext}`))) {
      return 'document'
    }
    
    console.log('⚠️ getFileCategory: Could not categorize fileType:', fileType, '-> defaulting to "other"')
    return 'other'
  }
  
  // Check if file can be previewed
  const isPreviewable = (fileType: string) => {
    const category = getFileCategory(fileType)
    return category === 'image' || category === 'video' || category === 'pdf'
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }
  
  const handleDownload = async (file: EvidenceFile) => {
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden bg-white dark:bg-lawbot-slate-800 shadow-2xl card-modern animate-scale-in">
        <CardHeader className="relative border-b bg-gradient-to-r from-lawbot-blue-50 to-lawbot-emerald-50 dark:from-lawbot-blue-900/20 dark:to-lawbot-emerald-900/20 border-lawbot-blue-200 dark:border-lawbot-blue-800">
          <Button variant="ghost" size="sm" onClick={onClose} className="absolute right-4 top-4 h-8 w-8 p-0 hover:bg-lawbot-red-50 dark:hover:bg-lawbot-red-900/20 hover:text-lawbot-red-600">
            <X className="h-4 w-4" />
          </Button>
          <div className="animate-fade-in-up">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-lawbot-blue-600 to-lawbot-emerald-600 bg-clip-text text-transparent">
              🗂️ Evidence Files
            </CardTitle>
            <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400 mt-2 font-medium">
              {caseData ? `Case #${caseData.id} - ${caseData.title}` : 'No case selected'}
            </CardDescription>
          </div>
        </CardHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6 space-y-6">
            {mode === 'multi-case' ? (
              // Full-featured interface for multi-case evidence viewing
              <Card className="card-modern bg-gradient-to-r from-lawbot-blue-50/50 to-white dark:from-lawbot-blue-900/10 dark:to-lawbot-slate-800 border-lawbot-blue-200 dark:border-lawbot-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-bold text-lawbot-slate-900 dark:text-white">
                    📊 Evidence Search & Filter
                  </CardTitle>
                  <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400">
                    Find specific evidence files across your cases with advanced filtering
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <div className="flex flex-col sm:flex-row flex-wrap gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-lawbot-slate-400" />
                      <Input
                        placeholder="Search by filename or case number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 border-lawbot-slate-300 dark:border-lawbot-slate-600 focus:border-lawbot-blue-500 rounded-xl h-12"
                      />
                    </div>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-48 border-lawbot-slate-300 dark:border-lawbot-slate-600 focus:border-lawbot-blue-500 rounded-xl h-12">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">📋 All Types</SelectItem>
                        <SelectItem value="image">🖼️ Photos</SelectItem>
                        <SelectItem value="video">🎬 Videos</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-48 border-lawbot-slate-300 dark:border-lawbot-slate-600 focus:border-lawbot-blue-500 rounded-xl h-12">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">📅 Upload Date</SelectItem>
                        <SelectItem value="name">🔤 File Name</SelectItem>
                        <SelectItem value="size">💾 File Size</SelectItem>
                        <SelectItem value="type">🏷️ File Type</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="h-12 px-4 border-lawbot-slate-300 dark:border-lawbot-slate-600 hover:border-lawbot-blue-500 rounded-xl"
                      title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                    >
                      {sortOrder === 'asc' ? '⬆️' : '⬇️'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => fetchEvidenceFiles()}
                      className="h-12 px-4 border-lawbot-slate-300 dark:border-lawbot-slate-600 hover:border-lawbot-blue-500 rounded-xl"
                      title="Refresh"
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : '🔄'}
                      <span className="ml-1 hidden sm:inline">Refresh</span>
                    </Button>
                    <div className="flex border border-lawbot-slate-300 dark:border-lawbot-slate-600 rounded-xl overflow-hidden">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        onClick={() => setViewMode('grid')}
                        className="h-12 px-4 rounded-none border-r border-lawbot-slate-300 dark:border-lawbot-slate-600"
                        title="Grid View"
                      >
                        📊 <span className="ml-1 hidden sm:inline">Grid View</span>
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        onClick={() => setViewMode('list')}
                        className="h-12 px-4 rounded-none"
                        title="List View"
                      >
                        📄 <span className="ml-1 hidden sm:inline">List View</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              // Simplified interface for single-case evidence viewing
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-lawbot-slate-900 dark:text-white">
                    📁 Evidence Files
                  </h3>
                  <p className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400">
                    {caseData ? `Case #${caseData.id} - ${caseData.title}` : 'Evidence files for this case'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => fetchEvidenceFiles()}
                  className="h-10 px-4 border-lawbot-slate-300 dark:border-lawbot-slate-600 hover:border-lawbot-blue-500 rounded-xl"
                  title="Refresh"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : '🔄'}
                  <span className="ml-1">Refresh</span>
                </Button>
              </div>
            )}

            {/* Evidence Files Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-lawbot-blue-500 rounded-lg">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-lawbot-slate-900 dark:text-white">
                    📁 Evidence Files ({filteredFiles.length})
                  </h3>
                </div>
                
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-lawbot-blue-600" />
                  </div>
                ) : filteredFiles.length === 0 ? (
                  <Alert className="border-lawbot-amber-200 bg-lawbot-amber-50 dark:border-lawbot-amber-800 dark:bg-lawbot-amber-900/20">
                    <AlertTriangle className="h-4 w-4 text-lawbot-amber-600" />
                    <AlertDescription className="text-lawbot-amber-700 dark:text-lawbot-amber-300">
                      No evidence files found for this case.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-3">
                    {filteredFiles.map((file) => {
                      const validationStatus = getValidationStatus(file.is_valid)
                      return (
                        <Card
                          key={file.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedFile?.id === file.id ? "ring-2 ring-blue-500" : ""
                          }`}
                          onClick={() => {
                            setSelectedFile(file)
                            console.log('📸 Selected file:', {
                              name: file.file_name,
                              type: file.file_type,
                              category: getFileCategory(file.file_type),
                              download_url: file.download_url,
                              isPreviewable: isPreviewable(file.file_type),
                              hasDownloadUrl: !!file.download_url
                            })
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3">
                                <div className="p-3 bg-gradient-to-r from-lawbot-slate-100 to-lawbot-slate-200 dark:from-lawbot-slate-700 dark:to-lawbot-slate-800 rounded-xl shadow-sm">
                                  {getFileIcon(file.file_type)}
                                </div>
                                <div className="flex-1">
                                  <p className="font-bold text-sm text-lawbot-slate-900 dark:text-white">{file.file_name}</p>
                                  {file.validation_notes && (
                                    <p className="text-xs text-lawbot-slate-600 dark:text-lawbot-slate-400 mt-1 leading-relaxed">
                                      {file.validation_notes}
                                    </p>
                                  )}
                                  <div className="flex items-center space-x-4 mt-2 text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400">
                                    <span>💾 {formatFileSize(file.file_size)}</span>
                                    <span>📅 {PhilippineTime.formatDatabaseDateShort(file.uploaded_at)}</span>
                                  </div>
                                </div>
                              </div>
                              <Badge className={`${validationStatus.color} flex items-center gap-1`}>
                                {validationStatus.icon}
                                {validationStatus.text}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* File Details Panel */}
              <div className="space-y-4">
                {selectedFile ? (
                  <>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-lawbot-emerald-500 rounded-lg">
                        <Eye className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-lawbot-slate-900 dark:text-white">
                        📄 File Details
                      </h3>
                    </div>
                    <Card className="card-modern bg-gradient-to-r from-lawbot-emerald-50/50 to-white dark:from-lawbot-emerald-900/10 dark:to-lawbot-slate-800 border-lawbot-emerald-200 dark:border-lawbot-emerald-800">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl font-bold text-lawbot-slate-900 dark:text-white">{selectedFile.file_name}</CardTitle>
                          <Badge className={`${getValidationStatus(selectedFile.is_valid).color} flex items-center gap-1 px-4 py-2 font-medium`}>
                            {getValidationStatus(selectedFile.is_valid).icon}
                            {getValidationStatus(selectedFile.is_valid).text}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-white dark:bg-lawbot-slate-700 rounded-xl border border-lawbot-slate-200 dark:border-lawbot-slate-600">
                            <Label className="text-lawbot-slate-600 dark:text-lawbot-slate-400 font-semibold">🏷️ File Type</Label>
                            <p className="font-bold text-lawbot-slate-900 dark:text-white mt-1">{selectedFile.file_type}</p>
                          </div>
                          <div className="p-4 bg-white dark:bg-lawbot-slate-700 rounded-xl border border-lawbot-slate-200 dark:border-lawbot-slate-600">
                            <Label className="text-lawbot-slate-600 dark:text-lawbot-slate-400 font-semibold">💾 File Size</Label>
                            <p className="font-bold text-lawbot-slate-900 dark:text-white mt-1">{formatFileSize(selectedFile.file_size)}</p>
                          </div>
                          <div className="p-4 bg-white dark:bg-lawbot-slate-700 rounded-xl border border-lawbot-slate-200 dark:border-lawbot-slate-600">
                            <Label className="text-lawbot-slate-600 dark:text-lawbot-slate-400 font-semibold">👮 Uploaded By</Label>
                            <p className="font-bold text-lawbot-slate-900 dark:text-white mt-1">{(selectedFile as any).uploaded_by_name || selectedFile.uploaded_by || 'System'}</p>
                          </div>
                          <div className="p-4 bg-white dark:bg-lawbot-slate-700 rounded-xl border border-lawbot-slate-200 dark:border-lawbot-slate-600">
                            <Label className="text-lawbot-slate-600 dark:text-lawbot-slate-400 font-semibold">📅 Upload Date</Label>
                            <p className="font-bold text-lawbot-slate-900 dark:text-white mt-1">{PhilippineTime.formatDatabaseTime(selectedFile.uploaded_at)}</p>
                          </div>
                        </div>

                        {selectedFile.validation_notes && (
                          <div className="p-4 bg-gradient-to-r from-lawbot-blue-50 to-lawbot-emerald-50 dark:from-lawbot-blue-900/20 dark:to-lawbot-emerald-900/20 rounded-xl border border-lawbot-blue-200 dark:border-lawbot-blue-800">
                            <Label className="text-lawbot-slate-700 dark:text-lawbot-slate-300 font-bold mb-2 block">📝 Validation Notes</Label>
                            <p className="text-lawbot-slate-800 dark:text-lawbot-slate-200 leading-relaxed">
                              {selectedFile.validation_notes}
                            </p>
                          </div>
                        )}

                        {/* File Preview */}
                        {(() => {
                          const fileCategory = getFileCategory(selectedFile.file_type)
                          const showPreview = isPreviewable(selectedFile.file_type) && selectedFile.download_url
                          
                          console.log('📁 File preview check:', {
                            fileType: selectedFile.file_type,
                            category: fileCategory,
                            isPreviewable: isPreviewable(selectedFile.file_type),
                            hasDownloadUrl: !!selectedFile.download_url,
                            downloadUrl: selectedFile.download_url,
                            showPreview
                          })
                          
                          if (!showPreview) return null
                          
                          return (
                            <div className="p-4 bg-gradient-to-r from-lawbot-purple-50 to-lawbot-blue-50 dark:from-lawbot-purple-900/20 dark:to-lawbot-blue-900/20 rounded-xl border border-lawbot-purple-200 dark:border-lawbot-purple-800">
                              <div className="flex items-center justify-between mb-3">
                                <Label className="text-lawbot-purple-700 dark:text-lawbot-purple-300 font-bold">
                                  {fileCategory === 'image' ? '🖼️ Image' : 
                                   fileCategory === 'video' ? '🎬 Video' : 
                                   fileCategory === 'pdf' ? '📄 PDF' : '📁 File'} Preview
                                </Label>
                                {fileCategory === 'image' && (
                                  <div className="flex items-center space-x-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
                                      className="h-8 w-8 p-0"
                                    >
                                      <ZoomOut className="h-4 w-4" />
                                    </Button>
                                    <span className="text-sm font-medium px-2">{Math.round(zoomLevel * 100)}%</span>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.25))}
                                      className="h-8 w-8 p-0"
                                    >
                                      <ZoomIn className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setZoomLevel(1)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Move className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                              <div 
                                className="relative bg-white dark:bg-lawbot-slate-800 rounded-lg overflow-auto shadow-inner"
                                style={{ maxHeight: isFullscreen ? '80vh' : '400px' }}
                                onContextMenu={(e) => {
                                  e.preventDefault()
                                  return false
                                }}
                              >
                                {fileCategory === 'image' ? (
                                  <div className="flex items-center justify-center min-h-[200px] p-4">
                                    <img 
                                      src={selectedFile.download_url} 
                                      alt={selectedFile.file_name}
                                      className="select-none"
                                      style={{
                                        maxWidth: '100%',
                                        maxHeight: '100%',
                                        transform: `scale(${zoomLevel})`,
                                        transformOrigin: 'center',
                                        transition: 'transform 0.2s',
                                        userSelect: 'none',
                                        WebkitUserSelect: 'none',
                                        MozUserSelect: 'none',
                                        msUserSelect: 'none',
                                        pointerEvents: 'none'
                                      }}
                                      draggable={false}
                                      onError={(e) => {
                                        console.error('❌ Failed to load image preview from URL:', selectedFile.download_url)
                                        e.currentTarget.style.display = 'none'
                                        e.currentTarget.parentElement?.insertAdjacentHTML('afterbegin', 
                                          '<div class="text-center py-8 text-gray-500">😞 Unable to preview image</div>'
                                        )
                                      }}
                                      onLoad={() => {
                                        console.log('✅ Image preview loaded successfully')
                                      }}
                                    />
                                  </div>
                                ) : fileCategory === 'video' ? (
                                  <video
                                    src={selectedFile.download_url}
                                    controls
                                    controlsList="nodownload"
                                    className="w-full h-auto max-h-[400px]"
                                    onContextMenu={(e) => {
                                      e.preventDefault()
                                      return false
                                    }}
                                    onError={(e) => {
                                      console.error('❌ Failed to load video preview from URL:', selectedFile.download_url)
                                      e.currentTarget.style.display = 'none'
                                      e.currentTarget.parentElement?.insertAdjacentHTML('afterbegin', 
                                        '<div class="text-center py-8 text-gray-500">😞 Unable to preview video</div>'
                                      )
                                    }}
                                    onLoadedData={() => {
                                      console.log('✅ Video preview loaded successfully')
                                    }}
                                  >
                                    Your browser does not support the video tag.
                                  </video>
                                ) : fileCategory === 'pdf' ? (
                                  <iframe
                                    src={`${selectedFile.download_url}#toolbar=0&navpanes=0&scrollbar=0`}
                                    className="w-full h-[400px]"
                                    title={selectedFile.file_name}
                                    sandbox="allow-same-origin allow-scripts"
                                    onError={() => {
                                      console.error('❌ Failed to load PDF preview')
                                    }}
                                    onLoad={() => {
                                      console.log('✅ PDF preview loaded successfully')
                                    }}
                                  />
                                ) : null}
                              </div>
                            </div>
                          )
                        })()}

                        <div className="space-y-4">
                          <Alert className="border-lawbot-blue-200 bg-lawbot-blue-50 dark:border-lawbot-blue-800 dark:bg-lawbot-blue-900/20">
                            <Shield className="h-4 w-4 text-lawbot-blue-600" />
                            <AlertDescription className="text-lawbot-blue-700 dark:text-lawbot-blue-300">
                              <strong>Secure Preview Mode:</strong> Evidence files are displayed securely within the application. URLs are not exposed and downloads are tracked.
                            </AlertDescription>
                          </Alert>
                          
                          <div className="flex justify-center">
                            <Button 
                              size="lg" 
                              className="btn-gradient bg-gradient-to-r from-lawbot-blue-600 to-lawbot-emerald-600 hover:from-lawbot-blue-700 hover:to-lawbot-emerald-700 text-white font-semibold py-3 px-8" 
                              onClick={() => handleDownload(selectedFile)}
                            >
                              <Download className="h-5 w-5 mr-2" />
                              📥 Download Evidence
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <div className="text-center py-16 animate-fade-in">
                    <div className="p-6 bg-lawbot-slate-100 dark:bg-lawbot-slate-800 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                      <FileText className="h-12 w-12 text-lawbot-slate-400 dark:text-lawbot-slate-500" />
                    </div>
                    <h3 className="text-xl font-bold text-lawbot-slate-900 dark:text-white mb-2">📁 No File Selected</h3>
                    <p className="text-lawbot-slate-600 dark:text-lawbot-slate-400">Select a file from the list to view details</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}