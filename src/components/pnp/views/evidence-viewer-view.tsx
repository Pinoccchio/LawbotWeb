"use client"

import { useState } from "react"
import { FileText, ImageIcon, Video, Download, Eye, Search, Filter, Archive, Music, Shield, Clock, Database } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EvidenceViewerModal } from "@/components/modals/evidence-viewer-modal"

export function EvidenceViewerView() {
  const [selectedEvidence, setSelectedEvidence] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleViewEvidence = (file: any) => {
    setSelectedEvidence(file)
    setIsModalOpen(true)
  }

  const handleDownloadEvidence = (file: any) => {
    alert(`Downloading evidence: ${file.name}\nThis would normally trigger a secure download process.`)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedEvidence(null)
  }
  const evidenceFiles = [
    {
      id: 1,
      name: "Screenshot_Banking_Fraud.png",
      type: "image",
      size: "2.4 MB",
      caseId: "CYB-2025-001",
      uploadDate: "2025-01-20",
      description: "Screenshot of fraudulent banking transaction",
      icon: <ImageIcon className="h-5 w-5" />,
      color: "text-blue-600",
    },
    {
      id: 2,
      name: "Email_Evidence.pdf",
      type: "document",
      size: "1.2 MB",
      caseId: "CYB-2025-002",
      uploadDate: "2025-01-19",
      description: "Email correspondence with suspect",
      icon: <FileText className="h-5 w-5" />,
      color: "text-red-600",
    },
    {
      id: 3,
      name: "Phone_Recording.mp3",
      type: "audio",
      size: "5.8 MB",
      caseId: "CYB-2025-003",
      uploadDate: "2025-01-18",
      description: "Audio recording of threatening phone call",
      icon: <Video className="h-5 w-5" />,
      color: "text-green-600",
    },
    {
      id: 4,
      name: "Network_Logs.txt",
      type: "document",
      size: "892 KB",
      caseId: "CYB-2025-004",
      uploadDate: "2025-01-17",
      description: "Network access logs showing unauthorized access",
      icon: <FileText className="h-5 w-5" />,
      color: "text-purple-600",
    },
    {
      id: 5,
      name: "Malware_Sample.zip",
      type: "archive",
      size: "3.1 MB",
      caseId: "CYB-2025-005",
      uploadDate: "2025-01-16",
      description: "Encrypted malware sample for analysis",
      icon: <FileText className="h-5 w-5" />,
      color: "text-orange-600",
    },
    {
      id: 6,
      name: "Social_Media_Posts.pdf",
      type: "document",
      size: "4.2 MB",
      caseId: "CYB-2025-006",
      uploadDate: "2025-01-15",
      description: "Screenshots of harassing social media posts",
      icon: <FileText className="h-5 w-5" />,
      color: "text-indigo-600",
    },
  ]

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
                <Input placeholder="Search by filename, case ID, or description..." className="pl-10 border-lawbot-slate-300 dark:border-lawbot-slate-600 focus:border-lawbot-emerald-500" />
              </div>
            </div>
            <Select>
              <SelectTrigger className="border-lawbot-slate-300 dark:border-lawbot-slate-600 focus:border-lawbot-emerald-500">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="image">🖼️ Images</SelectItem>
                <SelectItem value="document">📄 Documents</SelectItem>
                <SelectItem value="audio">🎧 Audio</SelectItem>
                <SelectItem value="video">🎥 Video</SelectItem>
                <SelectItem value="archive">🗄 Archives</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="border-lawbot-slate-300 dark:border-lawbot-slate-600 focus:border-lawbot-emerald-500">
                <SelectValue placeholder="Filter by case" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cases</SelectItem>
                <SelectItem value="CYB-2025-001">📁 CYB-2025-001</SelectItem>
                <SelectItem value="CYB-2025-002">📁 CYB-2025-002</SelectItem>
                <SelectItem value="CYB-2025-003">📁 CYB-2025-003</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="btn-modern border-lawbot-emerald-300 text-lawbot-emerald-600 hover:bg-lawbot-emerald-50">
              <Filter className="h-4 w-4 mr-2" />
              Advanced
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="grid" className="space-y-6 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <TabsList className="bg-lawbot-slate-100 dark:bg-lawbot-slate-800 p-1 rounded-xl grid grid-cols-3">
          <TabsTrigger value="grid" className="data-[state=active]:bg-white dark:data-[state=active]:bg-lawbot-slate-700 data-[state=active]:text-lawbot-emerald-600 font-medium">
            📊 Grid View
          </TabsTrigger>
          <TabsTrigger value="list" className="data-[state=active]:bg-white dark:data-[state=active]:bg-lawbot-slate-700 data-[state=active]:text-lawbot-blue-600 font-medium">
            📄 List View
          </TabsTrigger>
          <TabsTrigger value="timeline" className="data-[state=active]:bg-white dark:data-[state=active]:bg-lawbot-slate-700 data-[state=active]:text-lawbot-purple-600 font-medium">
            🕰️ Timeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="grid">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {evidenceFiles.map((file, index) => (
              <Card key={file.id} className="card-modern hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`${file.color} p-3 bg-gradient-to-r from-lawbot-slate-100 to-lawbot-slate-200 dark:from-lawbot-slate-700 dark:to-lawbot-slate-800 rounded-xl shadow-sm`}>
                        {file.type === 'image' && <ImageIcon className="h-6 w-6" />}
                        {file.type === 'document' && <FileText className="h-6 w-6" />}
                        {file.type === 'audio' && <Music className="h-6 w-6" />}
                        {file.type === 'archive' && <Archive className="h-6 w-6" />}
                        {!['image', 'document', 'audio', 'archive'].includes(file.type) && file.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lawbot-slate-900 dark:text-white truncate">{file.name}</h3>
                        <p className="text-sm text-lawbot-slate-500 dark:text-lawbot-slate-400 font-medium">💾 {file.size}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Badge className="bg-gradient-to-r from-lawbot-blue-50 to-lawbot-blue-100 text-lawbot-blue-700 border border-lawbot-blue-200 dark:from-lawbot-blue-900/20 dark:to-lawbot-blue-800/20 dark:text-lawbot-blue-300 dark:border-lawbot-blue-800">
                        📁 {file.caseId}
                      </Badge>
                    </div>
                    <p className="text-sm text-lawbot-slate-600 dark:text-lawbot-slate-400 leading-relaxed">{file.description}</p>
                    <div className="flex items-center text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400 p-2 bg-lawbot-slate-50 dark:bg-lawbot-slate-800 rounded-lg">
                      <Clock className="h-3 w-3 mr-1" />
                      Uploaded: {file.uploadDate}
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
            ))}
          </div>
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
              <div className="space-y-4">
                {evidenceFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800"
                  >
                    <div className={`${file.color} p-2 bg-gray-100 dark:bg-slate-800 rounded-lg`}>{file.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium truncate">{file.name}</h3>
                        <Badge variant="outline">{file.caseId}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-slate-400 mb-1">{file.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Size: {file.size}</span>
                        <span>Uploaded: {file.uploadDate}</span>
                        <span>Type: {file.type}</span>
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
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card className="card-modern">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-lawbot-purple-500 rounded-lg">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lawbot-slate-900 dark:text-white">Evidence Timeline</CardTitle>
                  <CardDescription className="text-lawbot-slate-600 dark:text-lawbot-slate-400">Chronological view of evidence submissions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {evidenceFiles
                  .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
                  .map((file, index) => (
                    <div key={file.id} className="flex items-start space-x-4">
                      <div className="flex flex-col items-center">
                        <div className={`${file.color} p-2 bg-gray-100 dark:bg-slate-800 rounded-lg`}>{file.icon}</div>
                        {index < evidenceFiles.length - 1 && (
                          <div className="w-px h-16 bg-gray-200 dark:bg-slate-700 mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium">{file.name}</h3>
                          <Badge variant="outline">{file.caseId}</Badge>
                          <span className="text-sm text-gray-500">{file.uploadDate}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">{file.description}</p>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleViewEvidence(file)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDownloadEvidence(file)}>
                            <Download className="h-4 w-4" />
                          </Button>
                          <span className="text-xs text-gray-500">{file.size}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Enhanced Evidence Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
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
                <p className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">Images</p>
                <p className="text-3xl font-bold text-lawbot-emerald-600 dark:text-lawbot-emerald-400">
                  {evidenceFiles.filter((f) => f.type === "image").length}
                </p>
                <p className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400 mt-1">🖼️ Image files</p>
              </div>
              <div className="p-3 bg-lawbot-emerald-500 rounded-lg">
                <ImageIcon className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card bg-gradient-to-br from-lawbot-purple-50 to-white dark:from-lawbot-purple-900/10 dark:to-lawbot-slate-800 border-lawbot-purple-200 dark:border-lawbot-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">Documents</p>
                <p className="text-3xl font-bold text-lawbot-purple-600 dark:text-lawbot-purple-400">
                  {evidenceFiles.filter((f) => f.type === "document").length}
                </p>
                <p className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400 mt-1">📄 Document files</p>
              </div>
              <div className="p-3 bg-lawbot-purple-500 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card bg-gradient-to-br from-lawbot-amber-50 to-white dark:from-lawbot-amber-900/10 dark:to-lawbot-slate-800 border-lawbot-amber-200 dark:border-lawbot-amber-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-lawbot-slate-600 dark:text-lawbot-slate-400">Total Size</p>
                <p className="text-3xl font-bold text-lawbot-amber-600 dark:text-lawbot-amber-400">18.5 MB</p>
                <p className="text-xs text-lawbot-slate-500 dark:text-lawbot-slate-400 mt-1">💾 Storage used</p>
              </div>
              <div className="p-3 bg-lawbot-amber-500 rounded-lg">
                <Database className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Evidence Viewer Modal */}
      <EvidenceViewerModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        caseData={{ id: selectedEvidence?.caseId || "Unknown", title: `Evidence: ${selectedEvidence?.name || "Unknown"}` }}
      />
    </div>
  )
}
