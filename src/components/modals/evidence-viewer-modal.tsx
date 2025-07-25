"use client"

import type React from "react"

import { useState } from "react"
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

interface EvidenceViewerModalProps {
  isOpen: boolean
  onClose: () => void
  caseData: any
}

export function EvidenceViewerModal({ isOpen, onClose, caseData }: EvidenceViewerModalProps) {
  const [selectedFile, setSelectedFile] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [newEvidenceNote, setNewEvidenceNote] = useState("")

  if (!isOpen || !caseData) return null

  const evidenceFiles = [
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
      case "document":
        return <FileText className="h-5 w-5 text-red-600" />
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

  const filteredFiles = evidenceFiles.filter((file) => {
    const matchesSearch =
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "all" || file.type === filterType
    return matchesSearch && matchesFilter
  })

  const handleFileUpload = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle file upload logic here
    console.log("Uploading new evidence...")
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-7xl max-h-[90vh] overflow-hidden bg-white dark:bg-slate-800 shadow-2xl">
        <CardHeader className="relative border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <Button variant="ghost" size="sm" onClick={onClose} className="absolute right-4 top-4 h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Evidence Management</CardTitle>
          <CardDescription>Case #{caseData.id} - Digital Evidence Repository</CardDescription>
        </CardHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <Tabs defaultValue="files" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-slate-700 m-4">
              <TabsTrigger value="files">Evidence Files</TabsTrigger>
              <TabsTrigger value="upload">Upload Evidence</TabsTrigger>
              <TabsTrigger value="analysis">Forensic Analysis</TabsTrigger>
              <TabsTrigger value="chain">Chain of Custody</TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="files" className="space-y-6">
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search evidence files..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-48">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="image">Images</SelectItem>
                      <SelectItem value="document">Documents</SelectItem>
                      <SelectItem value="audio">Audio</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="archive">Archives</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Evidence Files Grid */}
                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Evidence Files ({filteredFiles.length})</h3>
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
                                <div className="p-2 bg-gray-100 dark:bg-slate-700 rounded">
                                  {getFileIcon(file.type)}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{file.name}</p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{file.description}</p>
                                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                    <span>{file.size}</span>
                                    <span>ID: {file.id}</span>
                                    <span>{file.uploadDate}</span>
                                  </div>
                                </div>
                              </div>
                              <Badge className={getStatusColor(file.status)}>{file.status}</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* File Details Panel */}
                  <div className="space-y-4">
                    {selectedFile ? (
                      <>
                        <h3 className="text-lg font-semibold">File Details</h3>
                        <Card>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">{selectedFile.name}</CardTitle>
                              <Badge className={getStatusColor(selectedFile.status)}>{selectedFile.status}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <Label className="text-gray-600 dark:text-gray-400">File ID</Label>
                                <p className="font-medium">{selectedFile.id}</p>
                              </div>
                              <div>
                                <Label className="text-gray-600 dark:text-gray-400">File Size</Label>
                                <p className="font-medium">{selectedFile.size}</p>
                              </div>
                              <div>
                                <Label className="text-gray-600 dark:text-gray-400">Uploaded By</Label>
                                <p className="font-medium">{selectedFile.uploadedBy}</p>
                              </div>
                              <div>
                                <Label className="text-gray-600 dark:text-gray-400">Upload Date</Label>
                                <p className="font-medium">{selectedFile.uploadDate}</p>
                              </div>
                            </div>

                            <Separator />

                            <div>
                              <Label className="text-gray-600 dark:text-gray-400">Description</Label>
                              <p className="mt-1 text-sm">{selectedFile.description}</p>
                            </div>

                            <div>
                              <Label className="text-gray-600 dark:text-gray-400">File Hash (SHA-256)</Label>
                              <div className="flex items-center space-x-2 mt-1">
                                <code className="text-xs bg-gray-100 dark:bg-slate-700 p-1 rounded font-mono">
                                  {selectedFile.hash}
                                </code>
                                <Button size="sm" variant="outline">
                                  <Hash className="h-3 w-3 mr-1" />
                                  Verify
                                </Button>
                              </div>
                            </div>

                            <div className="flex space-x-2">
                              <Button size="sm" className="flex-1">
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                              </Button>
                              <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Chain of Custody */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center space-x-2">
                              <Shield className="h-5 w-5" />
                              <span>Chain of Custody</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {selectedFile.chainOfCustody.map((entry, index) => (
                                <div key={index} className="flex items-start space-x-3">
                                  <div className="p-1 bg-blue-100 dark:bg-blue-900 rounded-full">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">{entry.action}</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                      {entry.officer} • {entry.date}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Select a file to view details</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="upload" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Upload className="h-5 w-5" />
                      <span>Upload New Evidence</span>
                    </CardTitle>
                    <CardDescription>
                      Add new digital evidence to this case. All uploads are automatically hashed and logged.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleFileUpload} className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                        <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg font-medium mb-2">Drop files here or click to browse</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          Supported formats: Images, Documents, Audio, Video, Archives
                        </p>
                        <Button type="button" variant="outline">
                          Select Files
                        </Button>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="evidenceType">Evidence Type</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select evidence type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="digital-communication">Digital Communication</SelectItem>
                              <SelectItem value="financial-records">Financial Records</SelectItem>
                              <SelectItem value="system-logs">System Logs</SelectItem>
                              <SelectItem value="multimedia">Multimedia Evidence</SelectItem>
                              <SelectItem value="forensic-image">Forensic Image</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="priority">Priority Level</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="critical">Critical</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Evidence Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Provide a detailed description of this evidence..."
                          value={newEvidenceNote}
                          onChange={(e) => setNewEvidenceNote(e.target.value)}
                          rows={3}
                        />
                      </div>

                      <div className="flex justify-end space-x-3">
                        <Button type="button" variant="outline">
                          Cancel
                        </Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Evidence
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analysis" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5" />
                      <span>Forensic Analysis Summary</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-2">5</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Verified Files</div>
                        <Progress value={100} className="mt-2 h-2 [&>div]:bg-green-500" />
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-2">2</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Under Analysis</div>
                        <Progress value={40} className="mt-2 h-2 [&>div]:bg-blue-500" />
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-yellow-600 mb-2">1</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Pending Review</div>
                        <Progress value={20} className="mt-2 h-2 [&>div]:bg-yellow-500" />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-semibold">Key Findings</h4>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-green-800 dark:text-green-200">
                              Digital signatures verified
                            </p>
                            <p className="text-sm text-green-700 dark:text-green-300">
                              All submitted evidence files have been cryptographically verified and show no signs of
                              tampering.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-blue-800 dark:text-blue-200">Metadata analysis complete</p>
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                              Extracted creation timestamps, device information, and location data from multimedia
                              files.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                          <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-yellow-800 dark:text-yellow-200">
                              Network analysis in progress
                            </p>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300">
                              Processing network logs to identify suspicious traffic patterns and connection attempts.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="chain" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="h-5 w-5" />
                      <span>Complete Chain of Custody</span>
                    </CardTitle>
                    <CardDescription>Comprehensive audit trail for all evidence in this case</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {evidenceFiles.map((file) => (
                        <div key={file.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              {getFileIcon(file.type)}
                              <span className="font-medium">{file.name}</span>
                            </div>
                            <Badge className={getStatusColor(file.status)}>{file.status}</Badge>
                          </div>
                          <div className="space-y-2">
                            {file.chainOfCustody.map((entry, index) => (
                              <div key={index} className="flex items-center space-x-3 text-sm">
                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                <span className="font-medium">{entry.action}</span>
                                <span className="text-gray-600 dark:text-gray-400">by {entry.officer}</span>
                                <span className="text-gray-500">{entry.date}</span>
                              </div>
                            ))}
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
