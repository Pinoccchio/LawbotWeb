// PNP Officer Mock Data - Tailored for PNP Dashboard Views
// This file provides mock data specifically for PNP officer interfaces

// Mock Officer Dashboard Statistics
export const mockOfficerStats = {
  totalCases: 45,
  activeCases: 8,
  resolvedCases: 37,
  successRate: 82.2,
  avgResolutionTime: 5.3,
  weeklyActivity: [
    { day: 'Mon', cases: 2 },
    { day: 'Tue', cases: 3 },
    { day: 'Wed', cases: 1 },
    { day: 'Thu', cases: 4 },
    { day: 'Fri', cases: 2 },
    { day: 'Sat', cases: 0 },
    { day: 'Sun', cases: 1 }
  ],
  monthlyProgress: {
    resolved: 12,
    target: 15,
    percentage: 80
  },
  casesByPriority: {
    high: 3,
    medium: 4,
    low: 1
  },
  casesByStatus: {
    pending: 2,
    investigating: 5,
    needsInfo: 1,
    resolved: 12,
    dismissed: 1
  }
}

// Mock Cases Assigned to Current Officer
export const mockOfficerCases = [
  {
    id: "case_001",
    complaintId: "complaint_001",
    complaint: {
      id: "CYB-2025-048",
      complaint_number: "CYB-2025-048",
      title: "Investment Scam via Social Media",
      description: "Victim was approached via Facebook messenger with fake investment opportunity. Lost ₱85,000 through fraudulent cryptocurrency trading platform.",
      crime_type: "Investment Scams",
      status: "Under Investigation",
      priority: "high",
      risk_score: 92,
      estimated_loss: 85000,
      incident_date_time: "2025-01-28T15:30:00+08:00",
      incident_location: "Online - Facebook Messenger",
      created_at: "2025-01-29T09:15:00+08:00",
      updated_at: "2025-01-30T14:22:00+08:00",
      user_profiles: {
        full_name: "Roberto Mendoza",
        email: "roberto.mendoza@gmail.com",
        phone_number: "+63 917 555 0123"
      }
    },
    assignment_type: "primary",
    status: "active",
    notes: "High priority case due to significant financial loss. Coordinating with bank fraud department.",
    created_at: "2025-01-29T10:30:00+08:00"
  },
  {
    id: "case_002", 
    complaintId: "complaint_002",
    complaint: {
      id: "CYB-2025-045",
      complaint_number: "CYB-2025-045",
      title: "Phishing Email Attack",
      description: "Company employees received sophisticated phishing emails mimicking official communications. Multiple accounts compromised.",
      crime_type: "Phishing",
      status: "Under Investigation",
      priority: "high",
      risk_score: 88,
      estimated_loss: 25000,
      incident_date_time: "2025-01-26T11:45:00+08:00",
      incident_location: "Corporate Email Systems",
      created_at: "2025-01-27T08:00:00+08:00",
      updated_at: "2025-01-30T16:15:00+08:00",
      user_profiles: {
        full_name: "TechCorp Philippines Inc.",
        email: "security@techcorp.ph",
        phone_number: "+63 2 8123 4567"
      }
    },
    assignment_type: "primary",
    status: "active", 
    notes: "Corporate case affecting multiple employees. Email forensics in progress.",
    created_at: "2025-01-27T09:45:00+08:00"
  },
  {
    id: "case_003",
    complaintId: "complaint_003", 
    complaint: {
      id: "CYB-2025-042",
      complaint_number: "CYB-2025-042",
      title: "Fake Online Shopping Site",
      description: "Victim purchased electronic items from fake e-commerce website. Payment made but goods never delivered.",
      crime_type: "Online Shopping Scams",
      status: "Requires More Information",
      priority: "medium",
      risk_score: 65,
      estimated_loss: 15500,
      incident_date_time: "2025-01-24T19:20:00+08:00",
      incident_location: "Online Shopping Platform",
      created_at: "2025-01-25T10:30:00+08:00",
      updated_at: "2025-01-30T11:45:00+08:00",
      user_profiles: {
        full_name: "Ana Marie Cruz",
        email: "anamarie.cruz@yahoo.com",
        phone_number: "+63 918 777 8888"
      }
    },
    assignment_type: "primary",
    status: "active",
    notes: "Waiting for additional payment receipts and communication records from complainant.",
    created_at: "2025-01-25T11:15:00+08:00"
  },
  {
    id: "case_004",
    complaintId: "complaint_004",
    complaint: {
      id: "CYB-2025-040",
      complaint_number: "CYB-2025-040", 
      title: "SMS Fraud Scheme",
      description: "Multiple victims reported receiving SMS messages claiming prize winnings. Victims asked to send processing fees.",
      crime_type: "SMS Fraud",
      status: "Under Investigation", 
      priority: "medium",
      risk_score: 72,
      estimated_loss: 5000,
      incident_date_time: "2025-01-22T14:15:00+08:00",
      incident_location: "Mobile SMS Network",
      created_at: "2025-01-23T09:00:00+08:00", 
      updated_at: "2025-01-30T13:30:00+08:00",
      user_profiles: {
        full_name: "Multiple Complainants",
        email: "pnp.report@complaints.ph",
        phone_number: "+63 2 8117 7777"
      }
    },
    assignment_type: "secondary",
    status: "active",
    notes: "Part of larger SMS fraud investigation. Tracking phone numbers and money transfer patterns.",
    created_at: "2025-01-23T10:30:00+08:00"
  },
  {
    id: "case_005",
    complaintId: "complaint_005",
    complaint: {
      id: "CYB-2025-038",
      complaint_number: "CYB-2025-038",
      title: "Social Engineering Attack", 
      description: "Elderly victim received phone call from someone claiming to be from bank. Shared OTP and account details.",
      crime_type: "Social Engineering",
      status: "Pending",
      priority: "medium",
      risk_score: 70,
      estimated_loss: 35000,
      incident_date_time: "2025-01-20T16:45:00+08:00",
      incident_location: "Phone Call - Remote",
      created_at: "2025-01-21T08:15:00+08:00",
      updated_at: "2025-01-30T09:00:00+08:00",
      user_profiles: {
        full_name: "Esperanza Santos",
        email: "esperanza.santos@email.com", 
        phone_number: "+63 919 123 4567"
      }
    },
    assignment_type: "primary",
    status: "active",
    notes: "New case assigned. Initial assessment completed, ready for active investigation.",
    created_at: "2025-01-30T09:15:00+08:00"
  }
]

// Mock Recent Activity Feed
export const mockRecentActivity = [
  {
    id: "activity_001",
    type: "case_update",
    title: "Case Status Updated",
    description: "CYB-2025-048 moved to Under Investigation",
    timestamp: "2025-01-30T14:22:00+08:00",
    caseId: "CYB-2025-048",
    icon: "🔍"
  },
  {
    id: "activity_002", 
    type: "evidence_uploaded",
    title: "New Evidence Added",
    description: "3 files uploaded to CYB-2025-045",
    timestamp: "2025-01-30T13:45:00+08:00",
    caseId: "CYB-2025-045",
    icon: "📎"
  },
  {
    id: "activity_003",
    type: "case_assigned",
    title: "New Case Assigned", 
    description: "CYB-2025-038 assigned to you",
    timestamp: "2025-01-30T09:15:00+08:00",
    caseId: "CYB-2025-038",
    icon: "📋"
  },
  {
    id: "activity_004",
    type: "case_resolved",
    title: "Case Resolved",
    description: "CYB-2025-035 successfully closed",
    timestamp: "2025-01-29T16:30:00+08:00", 
    caseId: "CYB-2025-035",
    icon: "✅"
  },
  {
    id: "activity_005",
    type: "note_added",
    title: "Case Note Added",
    description: "Investigation notes updated for CYB-2025-042",
    timestamp: "2025-01-29T11:20:00+08:00",
    caseId: "CYB-2025-042", 
    icon: "📝"
  }
]

// Mock All Cases for Search View (broader dataset)
export const mockAllCases = [
  ...mockOfficerCases.map(oc => oc.complaint),
  {
    id: "CYB-2025-047",
    complaint_number: "CYB-2025-047",
    title: "Cryptocurrency Fraud",
    description: "Fake cryptocurrency exchange platform. Multiple investors lost funds totaling over ₱500,000.",
    crime_type: "Cryptocurrency Fraud",
    status: "Under Investigation",
    priority: "high",
    risk_score: 95,
    estimated_loss: 500000,
    incident_date_time: "2025-01-28T10:00:00+08:00",
    incident_location: "Online Cryptocurrency Platform",
    created_at: "2025-01-28T14:30:00+08:00",
    updated_at: "2025-01-30T15:45:00+08:00",
    user_profiles: {
      full_name: "Investment Group Representative",
      email: "legal@investmentgroup.ph",
      phone_number: "+63 2 8555 0123"
    }
  },
  {
    id: "CYB-2025-046",
    complaint_number: "CYB-2025-046", 
    title: "Data Breach Investigation",
    description: "Personal data of 10,000+ customers compromised in e-commerce platform breach.",
    crime_type: "Data Breach",
    status: "Under Investigation",
    priority: "high",
    risk_score: 90,
    estimated_loss: 0,
    incident_date_time: "2025-01-27T02:30:00+08:00",
    incident_location: "E-commerce Database Server",
    created_at: "2025-01-27T08:15:00+08:00",
    updated_at: "2025-01-30T12:00:00+08:00",
    user_profiles: {
      full_name: "ShopNow Philippines",
      email: "security@shopnow.ph", 
      phone_number: "+63 2 8999 1234"
    }
  },
  {
    id: "CYB-2025-044",
    complaint_number: "CYB-2025-044",
    title: "Online Banking Fraud",
    description: "Unauthorized transactions through compromised online banking credentials.",
    crime_type: "Online Banking Fraud", 
    status: "Resolved",
    priority: "high",
    risk_score: 85,
    estimated_loss: 75000,
    incident_date_time: "2025-01-25T20:15:00+08:00",
    incident_location: "Online Banking Portal",
    created_at: "2025-01-26T07:45:00+08:00",
    updated_at: "2025-01-29T17:30:00+08:00",
    user_profiles: {
      full_name: "Michael Reyes",
      email: "michael.reyes@email.com",
      phone_number: "+63 917 888 9999"
    }
  }
]

// Mock Evidence Files for Evidence Viewer
export const mockEvidenceFiles = [
  {
    id: "evidence_001",
    caseId: "CYB-2025-048",
    caseName: "Investment Scam via Social Media",
    fileName: "facebook_messages.png",
    fileType: "image/png",
    fileSize: 2048576,
    uploadedAt: "2025-01-29T09:30:00+08:00",
    uploadedBy: "Roberto Mendoza",
    description: "Screenshots of Facebook messenger conversation with scammer",
    category: "Communication Records",
    hash: "sha256:a1b2c3d4e5f6...",
    status: "verified"
  },
  {
    id: "evidence_002",
    caseId: "CYB-2025-048", 
    caseName: "Investment Scam via Social Media",
    fileName: "bank_statement.pdf",
    fileType: "application/pdf",
    fileSize: 1536000,
    uploadedAt: "2025-01-29T10:15:00+08:00",
    uploadedBy: "Roberto Mendoza",
    description: "Bank statement showing fraudulent transactions",
    category: "Financial Records",
    hash: "sha256:b2c3d4e5f6g7...",
    status: "verified"
  },
  {
    id: "evidence_003",
    caseId: "CYB-2025-045",
    caseName: "Phishing Email Attack",
    fileName: "phishing_email.eml",
    fileType: "message/rfc822",
    fileSize: 45000,
    uploadedAt: "2025-01-27T08:30:00+08:00",
    uploadedBy: "TechCorp Philippines Inc.",
    description: "Original phishing email with headers",
    category: "Digital Evidence",
    hash: "sha256:c3d4e5f6g7h8...",
    status: "verified"
  },
  {
    id: "evidence_004",
    caseId: "CYB-2025-045",
    caseName: "Phishing Email Attack", 
    fileName: "employee_accounts.xlsx",
    fileType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    fileSize: 128000,
    uploadedAt: "2025-01-27T09:00:00+08:00",
    uploadedBy: "TechCorp Philippines Inc.",
    description: "List of compromised employee accounts",
    category: "System Logs",
    hash: "sha256:d4e5f6g7h8i9...",
    status: "verified"
  },
  {
    id: "evidence_005",
    caseId: "CYB-2025-042",
    caseName: "Fake Online Shopping Site",
    fileName: "payment_receipt.jpg",
    fileType: "image/jpeg",
    fileSize: 892000,
    uploadedAt: "2025-01-25T10:45:00+08:00",
    uploadedBy: "Ana Marie Cruz",
    description: "Payment receipt from fraudulent website",
    category: "Financial Records",
    hash: "sha256:e5f6g7h8i9j0...",
    status: "pending_verification"
  }
]

// Mock Dashboard Metrics
export const mockDashboardMetrics = {
  todaysAssignments: 2,
  pendingReviews: 3,
  overdueInvestigations: 1,
  recentResolutions: 5,
  notifications: {
    unread: 4,
    urgent: 1,
    total: 12
  },
  workload: {
    capacity: 15,
    assigned: 8,
    utilization: 53.3
  },
  performance: {
    thisMonth: {
      resolved: 12,
      target: 15,
      percentage: 80
    },
    thisQuarter: {
      resolved: 35,
      target: 45,
      percentage: 77.8
    }
  }
}

// Helper function to get cases by status for current officer
export function getMockCasesByStatus(status: string) {
  return mockOfficerCases.filter(oc => 
    oc.complaint.status.toLowerCase().replace(/\s+/g, '_') === status.toLowerCase()
  )
}

// Helper function to get cases by priority
export function getMockCasesByPriority(priority: string) {
  return mockOfficerCases.filter(oc => 
    oc.complaint.priority.toLowerCase() === priority.toLowerCase()
  )
}

// Helper function to get recent cases (last 7 days)
export function getMockRecentCases() {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  return mockOfficerCases.filter(oc => 
    new Date(oc.complaint.created_at) >= sevenDaysAgo
  )
}

export default {
  mockOfficerStats,
  mockOfficerCases,
  mockRecentActivity,
  mockAllCases,
  mockEvidenceFiles,
  mockDashboardMetrics,
  getMockCasesByStatus,
  getMockCasesByPriority,
  getMockRecentCases
}