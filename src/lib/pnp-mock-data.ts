// PNP Officer Mock Data - Tailored for PNP Dashboard Views
// This file provides mock data specifically for PNP officer interfaces

// Mock Officer Dashboard Statistics
export const mockOfficerStats = {
  total_cases: 45,
  active_cases: 8,
  resolved_cases: 37,
  success_rate: 82.2,
  avg_resolution_time: 5.3,
  weekly_activity: [
    { day: 'Mon', cases: 2 },
    { day: 'Tue', cases: 3 },
    { day: 'Wed', cases: 1 },
    { day: 'Thu', cases: 4 },
    { day: 'Fri', cases: 2 },
    { day: 'Sat', cases: 0 },
    { day: 'Sun', cases: 1 }
  ],
  monthly_progress: {
    resolved: 12,
    target: 15,
    percentage: 80
  },
  cases_by_priority: {
    high: 3,
    medium: 4,
    low: 1
  },
  cases_by_status: {
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
    complaint_id: "complaint_001",
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
      // Missing database fields
      assigned_officer: "Officer John Smith",
      assigned_officer_id: "officer_001",
      assigned_unit: "Economic Offenses Wing",
      unit_id: "unit_002",
      platform_website: "Facebook",
      account_reference: "FB_MSG_THREAD_001, CRYPTO_PLATFORM_XYZ",
      ai_priority: "high",
      ai_risk_score: 94,
      ai_confidence_score: 96,
      last_ai_assessment: "2025-01-29T09:30:00+08:00",
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
    complaint_id: "complaint_002",
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
      // Missing database fields
      assigned_officer: "Officer Maria Santos",
      assigned_officer_id: "officer_002",
      assigned_unit: "Cyber Crime Investigation Cell",
      unit_id: "unit_001",
      platform_website: "Corporate Email Server",
      account_reference: "EMAIL_CAMPAIGN_001, PHISH_DOMAIN_techcorp-fake.com",
      ai_priority: "high",
      ai_risk_score: 90,
      ai_confidence_score: 93,
      last_ai_assessment: "2025-01-27T08:30:00+08:00",
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
    complaint_id: "complaint_003", 
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
      // Missing database fields
      assigned_officer: "Officer Carlos Reyes",
      assigned_officer_id: "officer_003",
      assigned_unit: "Economic Offenses Wing",
      unit_id: "unit_002",
      platform_website: "fake-gadgets-store.com",
      account_reference: "ORDER_REF_ABC123, PAYMENT_TXN_XYZ789",
      ai_priority: "medium",
      ai_risk_score: 68,
      ai_confidence_score: 82,
      last_ai_assessment: "2025-01-25T11:00:00+08:00",
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
    complaint_id: "complaint_004",
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
    complaint_id: "complaint_005",
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
    case_id: "CYB-2025-048",
    icon: "🔍"
  },
  {
    id: "activity_002", 
    type: "evidence_uploaded",
    title: "New Evidence Added",
    description: "3 files uploaded to CYB-2025-045",
    timestamp: "2025-01-30T13:45:00+08:00",
    case_id: "CYB-2025-045",
    icon: "📎"
  },
  {
    id: "activity_003",
    type: "case_assigned",
    title: "New Case Assigned", 
    description: "CYB-2025-038 assigned to you",
    timestamp: "2025-01-30T09:15:00+08:00",
    case_id: "CYB-2025-038",
    icon: "📋"
  },
  {
    id: "activity_004",
    type: "case_resolved",
    title: "Case Resolved",
    description: "CYB-2025-035 successfully closed",
    timestamp: "2025-01-29T16:30:00+08:00", 
    case_id: "CYB-2025-035",
    icon: "✅"
  },
  {
    id: "activity_005",
    type: "note_added",
    title: "Case Note Added",
    description: "Investigation notes updated for CYB-2025-042",
    timestamp: "2025-01-29T11:20:00+08:00",
    case_id: "CYB-2025-042", 
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
    // Missing database fields
    assigned_officer: "Officer Diana Lopez",
    assigned_officer_id: "officer_004",
    assigned_unit: "Economic Offenses Wing",
    unit_id: "unit_002",
    platform_website: "fake-crypto-exchange.com",
    account_reference: "CRYPTO_WALLET_ABC123, FRAUD_REPORT_001",
    ai_priority: "high",
    ai_risk_score: 97,
    ai_confidence_score: 98,
    last_ai_assessment: "2025-01-28T15:00:00+08:00",
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
    // Missing database fields
    assigned_officer: "Officer Sofia Reyes",
    assigned_officer_id: "officer_005",
    assigned_unit: "Cyber Security Division",
    unit_id: "unit_003",
    platform_website: "shopnow.ph",
    account_reference: "DB_BREACH_27012025, AFFECTED_USERS_10K",
    ai_priority: "high",
    ai_risk_score: 92,
    ai_confidence_score: 95,
    last_ai_assessment: "2025-01-27T08:45:00+08:00",
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
    // Missing database fields
    assigned_officer: "Officer Roberto Cruz",
    assigned_officer_id: "officer_006",
    assigned_unit: "Economic Offenses Wing",
    unit_id: "unit_002",
    platform_website: "online-banking.com",
    account_reference: "BANK_ACC_****1234, TXN_FRAUD_001",
    ai_priority: "high",
    ai_risk_score: 87,
    ai_confidence_score: 91,
    last_ai_assessment: "2025-01-26T08:00:00+08:00",
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
    complaint_id: "complaint_001", // UUID reference to complaints table
    case_id: "CYB-2025-048", // Keep for compatibility
    case_name: "Investment Scam via Social Media", // Keep for compatibility
    file_name: "facebook_messages.png",
    file_path: "/evidence/complaint_001/facebook_messages.png",
    file_type: "image/png",
    file_size: 2048576,
    download_url: "https://storage.supabase.co/evidence/complaint_001/facebook_messages.png",
    uploaded_at: "2025-01-29T09:30:00+08:00",
    created_at: "2025-01-29T09:30:00+08:00",
    uploaded_by: "Roberto Mendoza",
    description: "Screenshots of Facebook messenger conversation with scammer",
    category: "Communication Records",
    hash: "sha256:a1b2c3d4e5f6...",
    status: "verified"
  },
  {
    id: "evidence_002",
    complaint_id: "complaint_001", // UUID reference to complaints table
    case_id: "CYB-2025-048", // Keep for compatibility
    case_name: "Investment Scam via Social Media", // Keep for compatibility
    file_name: "bank_statement.pdf",
    file_path: "/evidence/complaint_001/bank_statement.pdf",
    file_type: "application/pdf",
    file_size: 1536000,
    download_url: "https://storage.supabase.co/evidence/complaint_001/bank_statement.pdf",
    uploaded_at: "2025-01-29T10:15:00+08:00",
    created_at: "2025-01-29T10:15:00+08:00",
    uploaded_by: "Roberto Mendoza",
    description: "Bank statement showing fraudulent transactions",
    category: "Financial Records",
    hash: "sha256:b2c3d4e5f6g7...",
    status: "verified"
  },
  {
    id: "evidence_003",
    complaint_id: "complaint_002", // UUID reference to complaints table
    case_id: "CYB-2025-045", // Keep for compatibility
    case_name: "Phishing Email Attack", // Keep for compatibility
    file_name: "phishing_email.eml",
    file_path: "/evidence/complaint_002/phishing_email.eml",
    file_type: "message/rfc822",
    file_size: 45000,
    download_url: "https://storage.supabase.co/evidence/complaint_002/phishing_email.eml",
    uploaded_at: "2025-01-27T08:30:00+08:00",
    created_at: "2025-01-27T08:30:00+08:00",
    uploaded_by: "TechCorp Philippines Inc.",
    description: "Original phishing email with headers",
    category: "Digital Evidence",
    hash: "sha256:c3d4e5f6g7h8...",
    status: "verified"
  },
  {
    id: "evidence_004",
    complaint_id: "complaint_002", // UUID reference to complaints table
    case_id: "CYB-2025-045", // Keep for compatibility
    case_name: "Phishing Email Attack", // Keep for compatibility
    file_name: "employee_accounts.xlsx",
    file_path: "/evidence/complaint_002/employee_accounts.xlsx",
    file_type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    file_size: 128000,
    download_url: "https://storage.supabase.co/evidence/complaint_002/employee_accounts.xlsx",
    uploaded_at: "2025-01-27T09:00:00+08:00",
    created_at: "2025-01-27T09:00:00+08:00",
    uploaded_by: "TechCorp Philippines Inc.",
    description: "List of compromised employee accounts",
    category: "System Logs",
    hash: "sha256:d4e5f6g7h8i9...",
    status: "verified"
  },
  {
    id: "evidence_005",
    complaint_id: "complaint_003", // UUID reference to complaints table
    case_id: "CYB-2025-042", // Keep for compatibility
    case_name: "Fake Online Shopping Site", // Keep for compatibility
    file_name: "payment_receipt.jpg",
    file_path: "/evidence/complaint_003/payment_receipt.jpg",
    file_type: "image/jpeg",
    file_size: 892000,
    download_url: "https://storage.supabase.co/evidence/complaint_003/payment_receipt.jpg",
    uploaded_at: "2025-01-25T10:45:00+08:00",
    created_at: "2025-01-25T10:45:00+08:00",
    uploaded_by: "Ana Marie Cruz",
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