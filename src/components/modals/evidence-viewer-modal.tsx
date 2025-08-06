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
  Shield,
  Clock,
  Hash,
  CheckCircle,
  AlertTriangle,
  Upload,
  Search,
  Filter,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import PNPOfficerService, { EvidenceFile } from "@/lib/pnp-officer-service"

interface EvidenceViewerModalProps {
  isOpen: boolean
  onClose: () => void
  caseData: any
}

export function EvidenceViewerModal({ isOpen, onClose, caseData }: EvidenceViewerModalProps) {
  const [selectedFile, setSelectedFile] = useState<EvidenceFile | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [newEvidenceNote, setNewEvidenceNote] = useState("")
  const [evidenceFiles, setEvidenceFiles] = useState<EvidenceFile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  // Fetch evidence files when modal opens
  useEffect(() => {
    if (isOpen && caseData) {
      fetchEvidenceFiles()
    }
  }, [isOpen, caseData])

  const fetchEvidenceFiles = async () => {
    if (!caseData?.id && !caseData?.complaint_id) return
    
    setIsLoading(true)
    try {
      const complaintId = caseData.id || caseData.complaint_id
      console.log('🔄 Fetching evidence files for complaint:', complaintId)
      
      const files = await PNPOfficerService.getEvidenceFiles(complaintId)
      setEvidenceFiles(files)
      console.log('✅ Evidence files loaded:', files.length)
    } catch (error) {
      console.error('❌ Error fetching evidence files:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen || !caseData) return null

  // Filter evidence files based on search and filter
  const filteredFiles = evidenceFiles.filter(file => {
    const matchesSearch = file.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (file.description && file.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesFilter = filterType === "all" || file.category === filterType
    return matchesSearch && matchesFilter
  })

  // Mock evidence files for demonstration when no real data
  const mockEvidenceFiles = [
    {
      id: "EV001",
      name: "screenshot_scam_message.png",
      type: "image",
      size: "2.4 MB",
      hash: "a1b2c3d4e5f67890abcdef1234567890",
      uploadedBy: "Officer Maria Santos",
      uploadDate: "2025-01-25 14:30",
      status: "verified",
      description: "Screenshot of fraudulent message received by victim",
      chainOfCustody: [
        { officer: "Maria Santos", action: "Collected", date: "2025-01-25 14:30" },
        { officer: "Tech Analyst", action: "Verified", date: "2025-01-25 15:45" },
      ],
    },
    {
      id: "EV002",
      name: "bank_transaction_log.pdf",
      type: "document",
      size: "1.2 MB",
      hash: "f6e5d4c3b2a1098765432109876543210",
      uploadedBy: "Officer John Rodriguez",
      uploadDate: "2025-01-25 16:15",
      status: "pending",
      description: "Bank transaction records showing unauthorized transfers",
      chainOfCustody: [{ officer: "John Rodriguez", action: "Collected", date: "2025-01-25 16:15" }],
    },
    {
      id: "EV003",
      name: "phone_call_recording.mp3",
      type: "audio",
      size: "5.8 MB",
      hash: "1a2b3c4d5e6f7890abcdef1234567890",
      uploadedBy: "Officer Ana Reyes",
      uploadDate: "2025-01-26 09:00",
      status: "verified",
      description: "Recorded conversation between victim and suspect",
      chainOfCustody: [
        { officer: "Ana Reyes", action: "Collected", date: "2025-01-26 09:00" },
        { officer: "Audio Specialist", action: "Enhanced", date: "2025-01-26 10:30" },
        { officer: "Tech Analyst", action: "Verified", date: "2025-01-26 11:00" },
      ],
    },
    {
      id: "EV004",
      name: "email_headers.txt",
      type: "text",
      size: "0.3 MB",
      hash: "6f5e4d3c2b1a098765432109876543210",
      uploadedBy: "Officer Carlos Mendoza",
      uploadDate: "2025-01-26 13:20",
      status: "analyzing",
      description: "Email header analysis from suspicious communications",
      chainOfCustody: [
        { officer: "Carlos Mendoza", action: "Collected", date: "2025-01-26 13:20" },
        { officer: "Forensic Analyst", action: "Analyzing", date: "2025-01-26 14:00" },
      ],
    },
    {
      id: "EV005",
      name: "network_logs.zip",
      type: "archive",
      size: "12.5 MB",
      hash: "9876543210abcdef1234567890abcdef",
      uploadedBy: "Officer Lisa Garcia",
      uploadDate: "2025-01-26 15:45",
      status: "verified",
      description: "Network traffic logs during incident timeframe",
      chainOfCustody: [
        { officer: "Lisa Garcia", action: "Collected", date: "2025-01-26 15:45" },
        { officer: "Network Analyst", action: "Processed", date: "2025-01-26 16:30" },
        { officer: "Tech Analyst", action: "Verified", date: "2025-01-26 17:00" },
      ],
    },
  ]

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-5 w-5 text-blue-600" />
      case "pdf":
        return <FileText className="h-5 w-5 text-red-600" />
      case "document":
        return <FileText className="h-5 w-5 text-gray-600" />
      case "audio":
        return <Music className="h-5 w-5 text-green-600" />
      case "video":
        return <Video className="h-5 w-5 text-purple-600" />
      case "archive":
        return <Archive className="h-5 w-5 text-orange-600" />
      default:
        return <FileText className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "analyzing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    const fileInput = document.getElementById('evidence-file') as HTMLInputElement
    if (!fileInput?.files?.length) return
    
    const file = fileInput.files[0]
    const complaintId = caseData.id || caseData.complaint_id
    
    setIsUploading(true)
    setUploadProgress(0)
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)
      
      const success = await PNPOfficerService.uploadEvidenceFile(
        complaintId,
        file,
        newEvidenceNote
      )
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      if (success) {
        console.log('✅ Evidence uploaded successfully')
        await fetchEvidenceFiles()
        setNewEvidenceNote('')
        fileInput.value = ''
      }
    } catch (error) {
      console.error('❌ Upload failed:', error)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }
  
  const handleDownload = (file: EvidenceFile) => {
    window.open(file.file_url, '_blank')
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-7xl max-h-[90vh] overflow-hidden bg-white dark:bg-lawbot-slate-800 shadow-2xl card-modern animate-scale-in">
        <CardHeader className="relative border-b bg-gradient-to-r from-lawbot-blue-50 to-lawbot-emerald-50 dark:from-lawbot-blue-900/20 dark:to-lawbot-emerald-900/20 border-lawbot-blue-200 dark:border-lawbot-blue-800">
          <Button variant="ghost" size="sm" onClick={onClose} className="absolute right-4 top-4 h-8 w-8 p-0 hover:bg-lawbot-red-50 dark:hover:bg-lawbot-red-900/20 hover:text-lawbot-red-600">
            <X className="h-4 w-4" />
          </Button>
          <div className="animate-fade-in-up">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-lawbot-blue-600 to-lawbot-emerald-600 bg-clip-text text-transparent">
              🗂️ Evidence Management
            </CardTitle>
            <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400 mt-2 font-medium">
              Case #{caseData?.complaint_number || caseData?.id} - Digital Evidence Repository
            </CardDescription>
          </div>
        </CardHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <Tabs defaultValue="files" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-lawbot-slate-100 dark:bg-lawbot-slate-800 p-1 rounded-xl m-4">
              <TabsTrigger value="files" className="data-[state=active]:bg-white dark:data-[state=active]:bg-lawbot-slate-700 data-[state=active]:text-lawbot-blue-600 font-medium">
                📁 Evidence Files
              </TabsTrigger>
              <TabsTrigger value="upload" className="data-[state=active]:bg-white dark:data-[state=active]:bg-lawbot-slate-700 data-[state=active]:text-lawbot-emerald-600 font-medium">
                📤 Upload Evidence
              </TabsTrigger>
              <TabsTrigger value="analysis" className="data-[state=active]:bg-white dark:data-[state=active]:bg-lawbot-slate-700 data-[state=active]:text-lawbot-purple-600 font-medium">
                🔬 Forensic Analysis
              </TabsTrigger>
              <TabsTrigger value="chain" className="data-[state=active]:bg-white dark:data-[state=active]:bg-lawbot-slate-700 data-[state=active]:text-lawbot-amber-600 font-medium">
                🔗 Chain of Custody
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="files" className="space-y-6">
                {/* Enhanced Search and Filter */}
                <Card className="card-modern bg-gradient-to-r from-lawbot-blue-50/50 to-white dark:from-lawbot-blue-900/10 dark:to-lawbot-slate-800 border-lawbot-blue-200 dark:border-lawbot-blue-800 animate-fade-in-up">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-lawbot-slate-400" />
                        <Input
                          placeholder="🔍 Search evidence files..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-12 border-lawbot-slate-300 dark:border-lawbot-slate-600 focus:border-lawbot-blue-500 rounded-xl h-12"
                        />
                      </div>
                      <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-56 border-lawbot-slate-300 dark:border-lawbot-slate-600 focus:border-lawbot-blue-500 rounded-xl h-12">
                          <Filter className="mr-2 h-4 w-4" />
                          <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">📋 All Types</SelectItem>
                          <SelectItem value="image">🖼️ Images</SelectItem>
                          <SelectItem value="document">📄 Documents</SelectItem>
                          <SelectItem value="audio">🎵 Audio</SelectItem>
                          <SelectItem value="video">🎬 Video</SelectItem>
                          <SelectItem value="archive">📦 Archives</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

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
                        {filteredFiles.map((file) => (
                          <Card
                            key={file.id}
                            className={`cursor-pointer transition-all hover:shadow-md ${
                              selectedFile?.id === file.id ? "ring-2 ring-blue-500" : ""
                            }`}
                            onClick={() => setSelectedFile(file)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3">
                                  <div className="p-3 bg-gradient-to-r from-lawbot-slate-100 to-lawbot-slate-200 dark:from-lawbot-slate-700 dark:to-lawbot-slate-800 rounded-xl shadow-sm">
                                    {getFileIcon(file.category)}
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-bold text-sm text-lawbot-slate-900 dark:text-white">{file.file_name}</p>
                                    <p className="text-xs text-lawbot-slate-600 dark:text-lawbot-slate-400 mt-1 leading-relaxed">
                                      {file.description || 'No description provided'}
                                    </p>
                                    <div className="flex items-center space-x-4 mt-2 text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400 p-2 bg-lawbot-slate-50 dark:bg-lawbot-slate-800 rounded-lg">
                                      <span>{formatFileSize(file.file_size)}</span>
                                      <span>Type: {file.file_type}</span>
                                      <span>{new Date(file.uploaded_at).toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                </div>
                                <Badge className={file.is_verified ? 
                                  "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : 
                                  "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"}>
                                  {file.is_verified ? 'Verified' : 'Pending'}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
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
                              <Badge className={`${selectedFile.is_verified ? 
                                "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : 
                                "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"} px-4 py-2 font-medium`}>
                                {selectedFile.is_verified ? 'Verified' : 'Pending'}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
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
                                <p className="font-bold text-lawbot-slate-900 dark:text-white mt-1">{selectedFile.uploaded_by}</p>
                              </div>
                              <div className="p-4 bg-white dark:bg-lawbot-slate-700 rounded-xl border border-lawbot-slate-200 dark:border-lawbot-slate-600">
                                <Label className="text-lawbot-slate-600 dark:text-lawbot-slate-400 font-semibold">📅 Upload Date</Label>
                                <p className="font-bold text-lawbot-slate-900 dark:text-white mt-1">{new Date(selectedFile.uploaded_at).toLocaleString()}</p>
                              </div>
                            </div>

                            <div className="w-full h-px bg-gradient-to-r from-transparent via-lawbot-slate-300 dark:via-lawbot-slate-600 to-transparent"></div>

                            <div className="p-4 bg-gradient-to-r from-lawbot-blue-50 to-lawbot-emerald-50 dark:from-lawbot-blue-900/20 dark:to-lawbot-emerald-900/20 rounded-xl border border-lawbot-blue-200 dark:border-lawbot-blue-800">
                              <Label className="text-lawbot-slate-700 dark:text-lawbot-slate-300 font-bold mb-2 block">📝 Description</Label>
                              <p className="text-lawbot-slate-800 dark:text-lawbot-slate-200 leading-relaxed">
                                {selectedFile.description || 'No description provided'}
                              </p>
                            </div>

                            <div className="p-4 bg-gradient-to-r from-lawbot-purple-50 to-lawbot-blue-50 dark:from-lawbot-purple-900/20 dark:to-lawbot-blue-900/20 rounded-xl border border-lawbot-purple-200 dark:border-lawbot-purple-800">
                              <Label className="text-lawbot-purple-700 dark:text-lawbot-purple-300 font-bold mb-3 block">🔐 File Hash (SHA-256)</Label>
                              <div className="flex items-center space-x-3">
                                <code className="flex-1 text-xs bg-white dark:bg-lawbot-slate-700 p-3 rounded-lg font-mono border border-lawbot-slate-200 dark:border-lawbot-slate-600">
                                  {selectedFile.hash}
                                </code>
                                <Button size="sm" className="btn-modern border-lawbot-purple-300 text-lawbot-purple-600 hover:bg-lawbot-purple-50" variant="outline">
                                  <Hash className="h-4 w-4 mr-2" />
                                  ✅ Verify
                                </Button>
                              </div>
                            </div>

                            <div className="flex space-x-4">
                              <Button size="lg" className="flex-1 btn-gradient bg-gradient-to-r from-lawbot-blue-600 to-lawbot-emerald-600 hover:from-lawbot-blue-700 hover:to-lawbot-emerald-700 text-white font-semibold py-3">
                                <Eye className="h-5 w-5 mr-2" />
                                👁️ Preview
                              </Button>
                              <Button size="lg" variant="outline" className="flex-1 btn-modern border-lawbot-emerald-300 text-lawbot-emerald-600 hover:bg-lawbot-emerald-50 font-semibold py-3">
                                <Download className="h-5 w-5 mr-2" />
                                📥 Download
                              </Button>
                            </div>
                          </CardContent>
                        </Card>

                        {/* File Metadata */}
                        {selectedFile.is_verified && (
                          <Card className="card-modern bg-gradient-to-r from-lawbot-amber-50/50 to-white dark:from-lawbot-amber-900/10 dark:to-lawbot-slate-800 border-lawbot-amber-200 dark:border-lawbot-amber-800">
                            <CardHeader>
                              <CardTitle className="text-xl font-bold text-lawbot-slate-900 dark:text-white flex items-center space-x-3">
                                <div className="p-2 bg-lawbot-amber-500 rounded-lg">
                                  <Shield className="h-5 w-5 text-white" />
                                </div>
                                <span>🔍 Verification Details</span>
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <div className="p-3 bg-white dark:bg-lawbot-slate-700 rounded-lg">
                                  <p className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400">Verified By</p>
                                  <p className="font-bold text-lawbot-slate-900 dark:text-white">
                                    {selectedFile.verified_by || 'System'}
                                  </p>
                                </div>
                                {selectedFile.verification_date && (
                                  <div className="p-3 bg-white dark:bg-lawbot-slate-700 rounded-lg">
                                    <p className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400">Verification Date</p>
                                    <p className="font-bold text-lawbot-slate-900 dark:text-white">
                                      {new Date(selectedFile.verification_date).toLocaleString()}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-16 animate-fade-in">
                        <div className="p-6 bg-lawbot-slate-100 dark:bg-lawbot-slate-800 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                          <FileText className="h-12 w-12 text-lawbot-slate-400 dark:text-lawbot-slate-500" />
                        </div>
                        <h3 className="text-xl font-bold text-lawbot-slate-900 dark:text-white mb-2">📁 No File Selected</h3>
                        <p className="text-lawbot-slate-600 dark:text-lawbot-slate-400">Select a file from the list to view detailed information and chain of custody</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="upload" className="space-y-6 animate-fade-in-up">
                <Card className="card-modern bg-gradient-to-r from-lawbot-emerald-50/50 to-white dark:from-lawbot-emerald-900/10 dark:to-lawbot-slate-800 border-lawbot-emerald-200 dark:border-lawbot-emerald-800">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-lawbot-slate-900 dark:text-white flex items-center space-x-3">
                      <div className="p-2 bg-lawbot-emerald-500 rounded-lg">
                        <Upload className="h-5 w-5 text-white" />
                      </div>
                      <span>📤 Upload New Evidence</span>
                    </CardTitle>
                    <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400 font-medium mt-2">
                      Add new digital evidence to this case. All uploads are automatically hashed and logged for chain of custody.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleFileUpload} className="space-y-4">
                      <div className="border-2 border-dashed border-lawbot-emerald-300 dark:border-lawbot-emerald-600 rounded-xl p-12 text-center bg-gradient-to-br from-lawbot-emerald-50 to-white dark:from-lawbot-emerald-900/10 dark:to-lawbot-slate-800 hover:border-lawbot-emerald-400 transition-all duration-300">
                        <div className="p-4 bg-lawbot-emerald-100 dark:bg-lawbot-emerald-900/30 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                          <Upload className="h-10 w-10 text-lawbot-emerald-600" />
                        </div>
                        <h3 className="text-xl font-bold text-lawbot-slate-900 dark:text-white mb-2">📤 Drop files here or click to browse</h3>
                        <p className="text-lawbot-slate-600 dark:text-lawbot-slate-400 mb-6 text-base">
                          🖼️ Images • 📄 Documents • 🎵 Audio • 🎬 Video • 📦 Archives
                        </p>
                        <Button type="button" className="btn-gradient bg-gradient-to-r from-lawbot-emerald-600 to-lawbot-blue-600 hover:from-lawbot-emerald-700 hover:to-lawbot-blue-700 text-white font-semibold px-8 py-3">
                          📂 Select Files
                        </Button>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <div className="p-1 bg-lawbot-blue-500 rounded">
                              <FileText className="h-3 w-3 text-white" />
                            </div>
                            <Label htmlFor="evidenceType" className="font-bold text-lawbot-slate-900 dark:text-white">📂 Evidence Type</Label>
                          </div>
                          <Select>
                            <SelectTrigger className="border-lawbot-slate-300 dark:border-lawbot-slate-600 focus:border-lawbot-blue-500 rounded-xl h-12">
                              <SelectValue placeholder="Select evidence type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="digital-communication">📱 Digital Communication</SelectItem>
                              <SelectItem value="financial-records">💰 Financial Records</SelectItem>
                              <SelectItem value="system-logs">📊 System Logs</SelectItem>
                              <SelectItem value="multimedia">🎥 Multimedia Evidence</SelectItem>
                              <SelectItem value="forensic-image">🔍 Forensic Image</SelectItem>
                              <SelectItem value="other">📁 Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <div className="p-1 bg-lawbot-amber-500 rounded">
                              <AlertTriangle className="h-3 w-3 text-white" />
                            </div>
                            <Label htmlFor="priority" className="font-bold text-lawbot-slate-900 dark:text-white">⚡ Priority Level</Label>
                          </div>
                          <Select>
                            <SelectTrigger className="border-lawbot-slate-300 dark:border-lawbot-slate-600 focus:border-lawbot-blue-500 rounded-xl h-12">
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">�︢ Low</SelectItem>
                              <SelectItem value="medium">😐 Medium</SelectItem>
                              <SelectItem value="high">😨 High</SelectItem>
                              <SelectItem value="critical">🆘 Critical</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <div className="p-1 bg-lawbot-purple-500 rounded">
                            <FileText className="h-3 w-3 text-white" />
                          </div>
                          <Label htmlFor="description" className="font-bold text-lawbot-slate-900 dark:text-white">📝 Evidence Description</Label>
                        </div>
                        <Textarea
                          id="description"
                          placeholder="Provide a detailed description of this evidence..."
                          value={newEvidenceNote}
                          onChange={(e) => setNewEvidenceNote(e.target.value)}
                          rows={4}
                          className="border-lawbot-slate-300 dark:border-lawbot-slate-600 focus:border-lawbot-blue-500 rounded-xl resize-none"
                        />
                      </div>

                      <div className="flex justify-end space-x-4">
                        <Button type="button" variant="outline" className="btn-modern border-lawbot-slate-300 text-lawbot-slate-600 hover:bg-lawbot-slate-50 px-6 py-3">
                          ❌ Cancel
                        </Button>
                        <Button type="submit" className="btn-gradient bg-gradient-to-r from-lawbot-emerald-600 to-lawbot-blue-600 hover:from-lawbot-emerald-700 hover:to-lawbot-blue-700 text-white font-semibold px-8 py-3">
                          <Upload className="mr-2 h-5 w-5" />
                          📤 Upload Evidence
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analysis" className="space-y-6 animate-fade-in-up">
                <Card className="card-modern bg-gradient-to-r from-lawbot-purple-50/50 to-white dark:from-lawbot-purple-900/10 dark:to-lawbot-slate-800 border-lawbot-purple-200 dark:border-lawbot-purple-800">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-lawbot-slate-900 dark:text-white flex items-center space-x-3">
                      <div className="p-2 bg-lawbot-purple-500 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-white" />
                      </div>
                      <span>🔬 Forensic Analysis Summary</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="text-center p-6 bg-gradient-to-br from-lawbot-emerald-50 to-white dark:from-lawbot-emerald-900/10 dark:to-lawbot-slate-800 border border-lawbot-emerald-200 dark:border-lawbot-emerald-800 rounded-xl card-modern">
                        <div className="text-3xl font-bold text-lawbot-emerald-600 dark:text-lawbot-emerald-400 mb-2">5</div>
                        <div className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">✅ Verified Files</div>
                        <Progress value={100} className="mt-2 h-2 [&>div]:bg-lawbot-emerald-500" />
                      </div>
                      <div className="text-center p-6 bg-gradient-to-br from-lawbot-blue-50 to-white dark:from-lawbot-blue-900/10 dark:to-lawbot-slate-800 border border-lawbot-blue-200 dark:border-lawbot-blue-800 rounded-xl card-modern">
                        <div className="text-3xl font-bold text-lawbot-blue-600 dark:text-lawbot-blue-400 mb-2">2</div>
                        <div className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">🔍 Under Analysis</div>
                        <Progress value={40} className="mt-2 h-2 [&>div]:bg-lawbot-blue-500" />
                      </div>
                      <div className="text-center p-6 bg-gradient-to-br from-lawbot-amber-50 to-white dark:from-lawbot-amber-900/10 dark:to-lawbot-slate-800 border border-lawbot-amber-200 dark:border-lawbot-amber-800 rounded-xl card-modern">
                        <div className="text-3xl font-bold text-lawbot-amber-600 dark:text-lawbot-amber-400 mb-2">1</div>
                        <div className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">⏳ Pending Review</div>
                        <Progress value={20} className="mt-2 h-2 [&>div]:bg-lawbot-amber-500" />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-lawbot-emerald-500 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-white" />
                        </div>
                        <h4 className="text-lg font-bold text-lawbot-slate-900 dark:text-white">🔍 Key Findings</h4>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-4 p-6 bg-gradient-to-r from-lawbot-emerald-50 to-white dark:from-lawbot-emerald-900/20 dark:to-lawbot-slate-800 rounded-xl border border-lawbot-emerald-200 dark:border-lawbot-emerald-800 card-modern">
                          <div className="p-2 bg-lawbot-emerald-500 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-lawbot-emerald-800 dark:text-lawbot-emerald-200 mb-2">
                              ✅ Digital signatures verified
                            </p>
                            <p className="text-sm text-lawbot-emerald-700 dark:text-lawbot-emerald-300 leading-relaxed">
                              All submitted evidence files have been cryptographically verified and show no signs of tampering.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-4 p-6 bg-gradient-to-r from-lawbot-blue-50 to-white dark:from-lawbot-blue-900/20 dark:to-lawbot-slate-800 rounded-xl border border-lawbot-blue-200 dark:border-lawbot-blue-800 card-modern">
                          <div className="p-2 bg-lawbot-blue-500 rounded-lg">
                            <AlertTriangle className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-lawbot-blue-800 dark:text-lawbot-blue-200 mb-2">📊 Metadata analysis complete</p>
                            <p className="text-sm text-lawbot-blue-700 dark:text-lawbot-blue-300 leading-relaxed">
                              Extracted creation timestamps, device information, and location data from multimedia files.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-4 p-6 bg-gradient-to-r from-lawbot-amber-50 to-white dark:from-lawbot-amber-900/20 dark:to-lawbot-slate-800 rounded-xl border border-lawbot-amber-200 dark:border-lawbot-amber-800 card-modern">
                          <div className="p-2 bg-lawbot-amber-500 rounded-lg">
                            <Clock className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-lawbot-amber-800 dark:text-lawbot-amber-200 mb-2">
                              ⏳ Network analysis in progress
                            </p>
                            <p className="text-sm text-lawbot-amber-700 dark:text-lawbot-amber-300 leading-relaxed">
                              Processing network logs to identify suspicious traffic patterns and connection attempts.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="chain" className="space-y-6 animate-fade-in-up">
                <Card className="card-modern bg-gradient-to-r from-lawbot-amber-50/50 to-white dark:from-lawbot-amber-900/10 dark:to-lawbot-slate-800 border-lawbot-amber-200 dark:border-lawbot-amber-800">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-lawbot-slate-900 dark:text-white flex items-center space-x-3">
                      <div className="p-2 bg-lawbot-amber-500 rounded-lg">
                        <Shield className="h-5 w-5 text-white" />
                      </div>
                      <span>🔗 Complete Chain of Custody</span>
                    </CardTitle>
                    <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400 font-medium mt-2">
                      📋 Comprehensive audit trail for all evidence in this case
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {evidenceFiles.map((file, index) => (
                        <div key={file.id} className="border border-lawbot-amber-200 dark:border-lawbot-amber-800 rounded-xl p-6 bg-gradient-to-r from-white to-lawbot-amber-50/30 dark:from-lawbot-slate-800 dark:to-lawbot-amber-900/10 card-modern animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-4">
                              <div className="p-3 bg-gradient-to-r from-lawbot-slate-100 to-lawbot-slate-200 dark:from-lawbot-slate-700 dark:to-lawbot-slate-800 rounded-xl shadow-sm">
                                {getFileIcon(file.category)}
                              </div>
                              <span className="font-bold text-lawbot-slate-900 dark:text-white text-lg">{file.file_name}</span>
                            </div>
                            <Badge className={`${file.is_verified ? 
                              "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : 
                              "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"} px-4 py-2 font-semibold`}>
                              {file.is_verified ? 'Verified' : 'Pending'}
                            </Badge>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-start space-x-4 p-4 bg-white dark:bg-lawbot-slate-700 rounded-xl border border-lawbot-amber-200 dark:border-lawbot-amber-800">
                              <div className="p-2 bg-lawbot-amber-100 dark:bg-lawbot-amber-900/30 rounded-full">
                                <div className="w-3 h-3 bg-lawbot-amber-600 rounded-full"></div>
                              </div>
                              <div className="flex-1">
                                <p className="font-bold text-lawbot-slate-900 dark:text-white mb-1">📋 Uploaded</p>
                                <div className="flex items-center space-x-4 text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400">
                                  <span className="flex items-center">👮 <strong className="ml-1">{file.uploaded_by}</strong></span>
                                  <span className="flex items-center">📅 {new Date(file.uploaded_at).toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </Card>
    </div>
  )
}
