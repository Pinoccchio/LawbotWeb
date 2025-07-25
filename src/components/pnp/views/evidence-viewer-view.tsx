"use client"

import { FileText, ImageIcon, Video, Download, Eye, Search, Filter } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function EvidenceViewerView() {
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
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Evidence Viewer</h2>
        <p className="text-gray-600 dark:text-slate-400">View and manage evidence files for your cases</p>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Search Evidence</CardTitle>
          <CardDescription>Find specific evidence files across your cases</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input placeholder="Search by filename, case ID, or description..." className="pl-10" />
              </div>
            </div>
            <Select>
              <SelectTrigger className="w-48">
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
            <Select>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by case" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cases</SelectItem>
                <SelectItem value="CYB-2025-001">CYB-2025-001</SelectItem>
                <SelectItem value="CYB-2025-002">CYB-2025-002</SelectItem>
                <SelectItem value="CYB-2025-003">CYB-2025-003</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Advanced
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="grid" className="space-y-6">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="grid">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {evidenceFiles.map((file) => (
              <Card key={file.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`${file.color} p-2 bg-gray-100 dark:bg-slate-800 rounded-lg`}>{file.icon}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{file.name}</h3>
                        <p className="text-sm text-gray-500">{file.size}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Badge variant="outline">{file.caseId}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-slate-400">{file.description}</p>
                    <div className="text-xs text-gray-500">Uploaded: {file.uploadDate}</div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
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
          <Card>
            <CardHeader>
              <CardTitle>Evidence Files</CardTitle>
              <CardDescription>Detailed list view of all evidence files</CardDescription>
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
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
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
          <Card>
            <CardHeader>
              <CardTitle>Evidence Timeline</CardTitle>
              <CardDescription>Chronological view of evidence submissions</CardDescription>
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
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button size="sm" variant="outline">
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

      {/* Evidence Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{evidenceFiles.length}</div>
            <p className="text-xs text-muted-foreground">Evidence files</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Images</CardTitle>
            <ImageIcon className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {evidenceFiles.filter((f) => f.type === "image").length}
            </div>
            <p className="text-xs text-muted-foreground">Image files</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {evidenceFiles.filter((f) => f.type === "document").length}
            </div>
            <p className="text-xs text-muted-foreground">Document files</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Size</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18.5 MB</div>
            <p className="text-xs text-muted-foreground">Storage used</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
