// PNP Units Mock Data with Crime Types
export const mockPNPUnits = [
  {
    id: "unit_001",
    unitName: "Cyber Crime Investigation Cell",
    unitCode: "PCU-001",
    category: "Communication & Social Media Crimes",
    description: "Handles phishing, social engineering, and communication-related cybercrimes",
    region: "National Capital Region (NCR)",
    maxOfficers: 20,
    currentOfficers: 15,
    activeCases: 34,
    resolvedCases: 128,
    successRate: 87.5,
    status: "active",
    crimeTypes: [
      "Phishing",
      "Social Engineering", 
      "Spam Messages",
      "Fake Social Media Profiles",
      "Online Impersonation",
      "Business Email Compromise",
      "SMS Fraud"
    ]
  },
  {
    id: "unit_002", 
    unitName: "Economic Offenses Wing",
    unitCode: "PCU-002",
    category: "Financial & Economic Crimes",
    description: "Investigates online banking fraud, investment scams, and financial crimes",
    region: "National Capital Region (NCR)",
    maxOfficers: 25,
    currentOfficers: 22,
    activeCases: 45,
    resolvedCases: 156,
    successRate: 82.3,
    status: "active",
    crimeTypes: [
      "Online Banking Fraud",
      "Credit Card Fraud", 
      "Investment Scams",
      "Cryptocurrency Fraud",
      "Online Shopping Scams",
      "Payment Gateway Fraud",
      "Insurance Fraud",
      "Tax Fraud",
      "Money Laundering"
    ]
  },
  {
    id: "unit_003",
    unitName: "Cyber Crime Against Women and Children", 
    unitCode: "PCU-005",
    category: "Harassment & Exploitation",
    description: "Investigates cyberstalking, online harassment, and exploitation",
    region: "National Capital Region (NCR)",
    maxOfficers: 22,
    currentOfficers: 18,
    activeCases: 28,
    resolvedCases: 89,
    successRate: 91.2,
    status: "active",
    crimeTypes: [
      "Cyberstalking",
      "Online Harassment",
      "Cyberbullying", 
      "Revenge Porn",
      "Sextortion",
      "Online Predatory Behavior",
      "Doxxing",
      "Hate Speech"
    ]
  }
];

// Mock PNP Officer Data
export const mockOfficerProfile = {
  id: "officer_001",
  firebase_uid: "firebase_officer_001",
  email: "j.smith@pnp.gov.ph",
  full_name: "John Reynaldo Smith",
  phone_number: "+63 912 345 6789",
  badge_number: "PNP-12345",
  rank: "Police Officer III",
  unit_id: "unit_001",
  unit: mockPNPUnits[0], // Cyber Crime Investigation Cell
  region: "National Capital Region (NCR)",
  status: "active",
  // Performance metrics
  total_cases: 156,
  active_cases: 12,
  resolved_cases: 134,
  success_rate: 86,
  avg_resolution_time: 4.2,
  // Additional profile info
  join_date: "2020-03-15",
  years_of_service: 5,
  specializations: ["Phishing Investigation", "Social Engineering", "Digital Forensics"],
  certifications: [
    {
      name: "Certified Cyber Crime Investigator",
      issuer: "PNP Cybercrime Division",
      valid_until: "2025-12-31",
      status: "active"
    },
    {
      name: "Digital Evidence Specialist", 
      issuer: "International Association of Computer Investigative Specialists",
      valid_until: "2025-06-30",
      status: "active"
    }
  ],
  upcoming_training: [
    {
      name: "Advanced Malware Analysis",
      scheduled_date: "2025-02-15",
      status: "enrolled"
    },
    {
      name: "Cryptocurrency Investigation",
      scheduled_date: "2025-03-10", 
      status: "pending"
    }
  ],
  profile_picture_url: null,
  bio: "Experienced cybercrime investigator specializing in phishing and social engineering cases. 5+ years with PNP Cybercrime Division.",
  last_login: "2025-01-30T08:15:00+08:00",
  login_count: 847,
  created_at: "2020-03-15T09:00:00+08:00",
  updated_at: "2025-01-30T08:15:00+08:00"
};

export const mockCases = [
  {
    id: "CYB-2025-001",
    title: "Online Banking Fraud",
    description: "Unauthorized access to online banking account resulting in fraudulent transactions totaling ₱50,000",
    priority: "high",
    status: "Under Investigation",
    officer: "Maria Santos",
    unit: "Economic Offenses Wing",
    date: "2025-01-20",
    riskScore: 85,
    evidence: 3,
    crime_type: "Online Banking Fraud",
    complainant: "Juan Dela Cruz",
    estimated_loss: 50000,
    // Database schema fields
    user_id: "user_123456789",
    full_name: "Juan Dela Cruz",
    email: "juan.delacruz@email.com",
    phone_number: "+63 917 123 4567",
    incident_date_time: "2025-01-19T14:30:00+08:00",
    incident_location: "BPI Branch, Makati City",
    complaint_number: "CYB-2025-001",
    assigned_officer: "Maria Santos",
    assigned_officer_id: "officer_002",
    assigned_unit: "Economic Offenses Wing",
    unit_id: "unit_002",
    // Dynamic fields (category-specific)
    platform_website: "BPI Online",
    account_reference: "ACC-789012345",
    // AI Enhancement fields
    ai_priority: "high",
    ai_risk_score: 88,
    ai_confidence_score: 92,
    last_ai_assessment: "2025-01-20T09:30:00+08:00",
    remarks: "Case assigned to Economic Offenses Wing for financial fraud investigation",
    created_at: "2025-01-20T09:15:00+08:00",
    updated_at: "2025-01-20T16:45:00+08:00",
    evidence_files: [
      {
        id: "ev_001",
        file_name: "banking_screenshot.png",
        file_type: "image/png",
        file_size: 2048576,
        uploaded_at: "2025-01-20T09:20:00+08:00"
      },
      {
        id: "ev_002",
        file_name: "transaction_receipt.pdf",
        file_type: "application/pdf",
        file_size: 1024000,
        uploaded_at: "2025-01-20T09:22:00+08:00"
      },
      {
        id: "ev_003",
        file_name: "email_notification.png",
        file_type: "image/png",
        file_size: 856432,
        uploaded_at: "2025-01-20T09:25:00+08:00"
      }
    ]
  },
  {
    id: "CYB-2025-002",
    title: "Social Media Harassment",
    description: "Continuous harassment and threats received through social media platforms over the past month",
    priority: "medium",
    status: "Pending",
    officer: "Diana Lopez",
    unit: "Cyber Crime Against Women and Children",
    date: "2025-01-19",
    riskScore: 65,
    evidence: 5,
    crime_type: "Online Harassment",
    complainant: "Maria Santos",
    estimated_loss: 0,
    // Database schema fields
    user_id: "user_987654321",
    full_name: "Maria Santos",
    email: "maria.santos@email.com",
    phone_number: "+63 916 987 6543",
    incident_date_time: "2025-01-18T20:15:00+08:00",
    incident_location: "Online - Social Media Platforms",
    complaint_number: "CYB-2025-002",
    assigned_officer: "Diana Lopez",
    assigned_officer_id: "officer_004",
    assigned_unit: "Cyber Crime Against Women and Children",
    unit_id: "unit_003",
    // Dynamic fields (category-specific)
    platform_website: "Facebook, Instagram, Twitter",
    account_reference: "@mariasantos123, harassment_thread_001",
    // AI Enhancement fields
    ai_priority: "medium",
    ai_risk_score: 68,
    ai_confidence_score: 85,
    last_ai_assessment: "2025-01-19T08:45:00+08:00",
    remarks: "Case assigned to Cyber Crime Against Women and Children unit",
    created_at: "2025-01-19T08:30:00+08:00",
    updated_at: "2025-01-19T08:30:00+08:00",
    evidence_files: [
      {
        id: "ev_004",
        file_name: "facebook_threats.png",
        file_type: "image/png",
        file_size: 1234567,
        uploaded_at: "2025-01-19T08:35:00+08:00"
      },
      {
        id: "ev_005",
        file_name: "instagram_messages.png",
        file_type: "image/png",
        file_size: 987654,
        uploaded_at: "2025-01-19T08:37:00+08:00"
      },
      {
        id: "ev_006",
        file_name: "twitter_screenshots.png",
        file_type: "image/png",
        file_size: 1567890,
        uploaded_at: "2025-01-19T08:40:00+08:00"
      },
      {
        id: "ev_007",
        file_name: "messenger_conversation.pdf",
        file_type: "application/pdf",
        file_size: 2100000,
        uploaded_at: "2025-01-19T08:42:00+08:00"
      },
      {
        id: "ev_008",
        file_name: "profile_screenshots.png",
        file_type: "image/png",
        file_size: 789456,
        uploaded_at: "2025-01-19T08:45:00+08:00"
      }
    ]
  },
  {
    id: "CYB-2025-003",
    title: "Phishing Email Campaign",
    description: "Large-scale phishing campaign targeting bank customers with fake login pages",
    priority: "high",
    status: "Requires More Info",
    officer: "Carlos Mendoza",
    unit: "Cyber Crime Investigation Cell",
    date: "2025-01-18",
    riskScore: 92,
    evidence: 2,
    crime_type: "Phishing",
    complainant: "BPI Bank",
    estimated_loss: 250000,
    // Database schema fields
    user_id: "user_bpi_security",
    full_name: "BPI Security Team",
    email: "security@bpi.com.ph",
    phone_number: "+63 2 8840 4000",
    incident_date_time: "2025-01-17T10:00:00+08:00",
    incident_location: "Online - Email and Website",
    complaint_number: "CYB-2025-003",
    assigned_officer: "Carlos Mendoza",
    assigned_officer_id: "officer_003",
    assigned_unit: "Cyber Crime Investigation Cell",
    unit_id: "unit_001",
    // Dynamic fields (category-specific)
    platform_website: "fake-bpi-login.com",
    account_reference: "PHISH-CAM-001, affected_customers_batch_17",
    // AI Enhancement fields
    ai_priority: "high",
    ai_risk_score: 94,
    ai_confidence_score: 96,
    last_ai_assessment: "2025-01-18T14:35:00+08:00",
    remarks: "Requires additional server logs and affected customer list",
    // Complaint editing fields
    last_citizen_update: "2025-01-20T14:45:00+08:00",
    total_updates: 2,
    update_request_message: "Please provide more specific details about the attack scope, affected customer count, and any cryptocurrency wallet addresses used by the attackers for money laundering.",
    created_at: "2025-01-18T14:20:00+08:00",
    updated_at: "2025-01-18T18:30:00+08:00",
    evidence_files: [
      {
        id: "ev_009",
        file_name: "phishing_email_sample.eml",
        file_type: "message/rfc822",
        file_size: 45632,
        uploaded_at: "2025-01-18T14:25:00+08:00"
      },
      {
        id: "ev_010",
        file_name: "fake_website_screenshot.png",
        file_type: "image/png",
        file_size: 3456789,
        uploaded_at: "2025-01-18T14:28:00+08:00"
      }
    ]
  },
  {
    id: "CYB-2025-004",
    title: "Identity Theft",
    description: "Personal information stolen and used to open fraudulent credit accounts",
    priority: "medium",
    status: "Under Investigation",
    officer: "Carlos Mendoza",
    unit: "Cyber Security Division",
    date: "2025-01-17",
    riskScore: 73,
    evidence: 4,
    crime_type: "Identity Theft",
    complainant: "Ana Reyes",
    estimated_loss: 75000,
    // Database schema fields
    assigned_officer_id: "officer_005",
    assigned_unit: "Cyber Security Division",
    unit_id: "unit_003",
    platform_website: "Various online services",
    account_reference: "SSS-123456789, PHILHEALTH-987654",
    ai_priority: "medium",
    ai_risk_score: 76,
    ai_confidence_score: 88,
    last_ai_assessment: "2025-01-17T14:20:00+08:00",
  },
  {
    id: "CYB-2025-005",
    title: "Ransomware Attack",
    description: "Company systems encrypted by ransomware with demand for ₱500,000 payment",
    priority: "high",
    status: "Resolved",
    officer: "Roberto Cruz",
    unit: "Cyber Crime Technical Unit",
    date: "2025-01-16",
    riskScore: 95,
    evidence: 7,
    crime_type: "Ransomware",
    complainant: "TechCorp Philippines",
    estimated_loss: 500000,
    // Database schema fields
    assigned_officer_id: "officer_006",
    assigned_unit: "Cyber Crime Technical Unit",
    unit_id: "unit_004",
    platform_website: "Corporate Network",
    account_reference: "RANSOM-DEMAND-XYZ789, SERVER-CLUSTER-01",
    ai_priority: "high",
    ai_risk_score: 98,
    ai_confidence_score: 99,
    last_ai_assessment: "2025-01-16T15:30:00+08:00",
  },
  {
    id: "CYB-2025-006",
    title: "Credit Card Fraud",
    description: "Unauthorized credit card transactions detected in multiple online purchases",
    priority: "medium",
    status: "Under Investigation",
    officer: "John Rodriguez",
    unit: "Economic Offenses Wing",
    date: "2025-01-15",
    riskScore: 68,
    evidence: 3,
    crime_type: "Credit Card Fraud",
    complainant: "Pedro Garcia",
    estimated_loss: 25000,
    // Database schema fields
    assigned_officer_id: "officer_002",
    assigned_unit: "Economic Offenses Wing",
    unit_id: "unit_002",
    platform_website: "Shopee, Lazada",
    account_reference: "CC-1234-****-5678, TXN-REF-998877",
    ai_priority: "medium",
    ai_risk_score: 71,
    ai_confidence_score: 84,
    last_ai_assessment: "2025-01-15T16:45:00+08:00",
  },
  {
    id: "CYB-2025-007",
    title: "Cyberbullying Case",
    description: "Student experiencing cyberbullying through various social media platforms and messaging apps",
    priority: "low",
    status: "Pending",
    officer: "Diana Lopez",
    unit: "Cyber Crime Against Women and Children",
    date: "2025-01-14",
    riskScore: 45,
    evidence: 2,
    crime_type: "Cyberbullying",
    complainant: "Rosa Mendoza",
    estimated_loss: 0,
    // Database schema fields
    assigned_officer_id: "officer_004",
    assigned_unit: "Cyber Crime Against Women and Children",
    unit_id: "unit_003",
    platform_website: "TikTok, Discord",
    account_reference: "@rosam_student, bullying_group_chat_445",
    ai_priority: "low",
    ai_risk_score: 48,
    ai_confidence_score: 78,
    last_ai_assessment: "2025-01-14T11:20:00+08:00",
  },
  {
    id: "CYB-2025-008",
    title: "Data Breach Investigation",
    description: "Personal data of 10,000 customers leaked from company database",
    priority: "high",
    status: "Under Investigation",
    officer: "Carlos Mendoza",
    unit: "Cyber Security Division",
    date: "2025-01-13",
    riskScore: 88,
    evidence: 6,
    crime_type: "Data Breach",
    complainant: "DataSecure Inc",
    estimated_loss: 100000,
    // Database schema fields
    assigned_officer_id: "officer_005",
    assigned_unit: "Cyber Security Division",
    unit_id: "unit_003",
    platform_website: "Company Database Server",
    account_reference: "DB-SERVER-001, BREACH-LOG-13012025",
    ai_priority: "high",
    ai_risk_score: 91,
    ai_confidence_score: 94,
    last_ai_assessment: "2025-01-13T16:30:00+08:00",
  },
  {
    id: "CYB-2025-009",
    title: "Sextortion Case",
    description: "Victim being blackmailed with intimate images shared through social media",
    priority: "high",
    status: "Requires More Info",
    officer: "Diana Lopez",
    unit: "Cyber Crime Against Women and Children",
    date: "2025-01-12",
    riskScore: 90,
    evidence: 3,
    crime_type: "Sextortion",
    complainant: "Confidential",
    estimated_loss: 0,
    // Database schema fields
    assigned_officer_id: "officer_004",
    assigned_unit: "Cyber Crime Against Women and Children",
    unit_id: "unit_003",
    platform_website: "Instagram, Telegram",
    account_reference: "CONFIDENTIAL_CASE_009",
    ai_priority: "high",
    ai_risk_score: 93,
    ai_confidence_score: 91,
    last_ai_assessment: "2025-01-12T10:45:00+08:00",
    // Complaint editing fields
    last_citizen_update: "2025-01-18T11:15:00+08:00",
    total_updates: 2,
    update_request_message: "Please provide detailed suspect contact information, escalation timeline, and any financial impact. Include all platform accounts used by the suspect.",
  },
  {
    id: "CYB-2025-010",
    title: "Government System Hacking",
    description: "Unauthorized access attempt detected on local government database system",
    priority: "high",
    status: "Under Investigation",
    officer: "Sofia Reyes",
    unit: "National Security Cyber Division",
    date: "2025-01-11",
    riskScore: 95,
    evidence: 4,
    crime_type: "Government System Hacking",
    complainant: "City Government of Manila",
    estimated_loss: 0,
    // Database schema fields
    assigned_officer_id: "officer_007",
    assigned_unit: "National Security Cyber Division",
    unit_id: "unit_008",
    platform_website: "manila.gov.ph",
    account_reference: "GOV-SYS-BREACH-001, FIREWALL-LOG-110125",
    ai_priority: "high",
    ai_risk_score: 97,
    ai_confidence_score: 98,
    last_ai_assessment: "2025-01-11T13:15:00+08:00",
  },
]

// Mock Complaint Update History Data
export const mockComplaintUpdateHistory = [
  // Updates for CYB-2025-003 (Phishing Email Campaign) - Requires More Info
  {
    id: "update_001",
    complaint_id: "CYB-2025-003",
    updated_by: "user_bpi_security",
    updater_name: "BPI Security Team",
    update_type: "citizen_update",
    fields_updated: ["description", "platform_website", "estimated_loss", "incident_location"],
    old_values: {
      description: "Large-scale phishing campaign targeting bank customers with fake login pages",
      platform_website: "Fake BPI Website",
      estimated_loss: 250000,
      incident_location: "Online - Email and Website"
    },
    new_values: {
      description: "Large-scale phishing campaign targeting BPI customers with fake login pages. Additional investigation revealed the campaign also targeted Union Bank and Security Bank customers. The attackers used sophisticated domain spoofing techniques with URLs like bpi-secure-login.ph and unionbank-verify.com to steal credentials.",
      platform_website: "bpi-secure-login.ph, unionbank-verify.com, securitybank-online.net",
      estimated_loss: 850000,
      incident_location: "Online - Multiple fake banking websites and phishing emails sent to 15,000+ customers across Metro Manila and Cebu"
    },
    update_reason: "Officer requested additional details about attack scope and financial impact",
    update_notes: "Updated via mobile app",
    device_info: {
      platform: "mobile",
      app_version: "1.2.0",
      timestamp: "2025-01-19T10:30:00+08:00"
    },
    requires_ai_reassessment: true,
    ai_reassessment_completed: true,
    created_at: "2025-01-19T10:30:00+08:00"
  },
  {
    id: "update_002", 
    complaint_id: "CYB-2025-003",
    updated_by: "user_bpi_security",
    updater_name: "BPI Security Team",
    update_type: "citizen_update",
    fields_updated: ["suspect_details", "evidence_files"],
    old_values: {
      suspect_details: "Unknown attackers using multiple fake domains"
    },
    new_values: {
      suspect_details: "Investigation revealed attackers are using bulletproof hosting services in Eastern Europe. Traced to hosting provider 'SecureNetUA' with servers in Ukraine. Additional evidence includes cryptocurrency wallet addresses used for money laundering: 1A2B3C4D5E6F7G8H9I0J (Bitcoin) and 0x123456789abcdef (Ethereum). Victims reported receiving text messages claiming to be from bank security asking them to verify accounts on fake websites."
    },
    update_reason: "Provided additional suspect information and cryptocurrency evidence as requested",
    update_notes: "Added 3 new evidence files: cryptocurrency transaction logs, fake domain registration details, and victim communication screenshots",
    device_info: {
      platform: "web", 
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      timestamp: "2025-01-20T14:45:00+08:00"
    },
    requires_ai_reassessment: true,
    ai_reassessment_completed: true,
    created_at: "2025-01-20T14:45:00+08:00"
  },

  // Updates for CYB-2025-009 (Sextortion Case) - Requires More Info
  {
    id: "update_003",
    complaint_id: "CYB-2025-009",
    updated_by: "user_confidential_009",
    updater_name: "Maria Santos (Pseudonym)",
    update_type: "citizen_update",
    fields_updated: ["suspect_contact", "platform_website", "description", "incident_date_time"],
    old_values: {
      suspect_contact: "Unknown Instagram user",
      platform_website: "Instagram, Telegram",
      description: "Victim being blackmailed with intimate images shared through social media",
      incident_date_time: "2025-01-12T08:00:00+08:00"
    },
    new_values: {
      suspect_contact: "Instagram: @blackmail_master2025, Telegram: @darknet_collector, Phone number that contacted victim: +63 917 XXX XXXX (number partially withheld for safety)",
      platform_website: "Instagram, Telegram, WhatsApp, Facebook Messenger",
      description: "Victim being blackmailed with intimate images after initially connecting through Instagram dating scam. Suspect convinced victim to share personal photos, then demanded ₱50,000 payment threatening to share images with family and colleagues. Suspect has been escalating threats and has created fake social media accounts impersonating the victim. Recent development: suspect has started contacting victim's workplace colleagues.",
      incident_date_time: "2025-01-10T19:30:00+08:00"
    },
    update_reason: "Officer requested specific contact information and escalation details",
    update_notes: "Updated via mobile app - added additional platform details and timeline",
    device_info: {
      platform: "mobile",
      app_version: "1.2.0", 
      timestamp: "2025-01-15T16:20:00+08:00"
    },
    requires_ai_reassessment: true,
    ai_reassessment_completed: true,
    created_at: "2025-01-15T16:20:00+08:00"
  },
  {
    id: "update_004",
    complaint_id: "CYB-2025-009", 
    updated_by: "user_confidential_009",
    updater_name: "Maria Santos (Pseudonym)",
    update_type: "citizen_update",
    fields_updated: ["estimated_loss", "suspect_details", "content_description"],
    old_values: {
      estimated_loss: 0,
      suspect_details: "Unknown social media user",
      content_description: null
    },
    new_values: {
      estimated_loss: 25000,
      suspect_details: "Suspect appears to be operating from Metro Manila area based on local slang usage and knowledge of victim's workplace location. Uses multiple fake profiles with stolen photos of attractive men to lure victims. Has threatened to post images on 'revenge porn' websites and send to victim's professional network on LinkedIn. Suspect demonstrated knowledge of victim's daily routine, suggesting possible surveillance or gathering of personal information from social media.",
      content_description: "Suspect has 15+ compromising images and 3 video recordings obtained through manipulation and false promises of relationship. Content was obtained over 2-week period starting January 5, 2025. Suspect has already created fake social media profiles using victim's photos and personal information."
    },
    update_reason: "Provided financial impact assessment and detailed suspect behavior analysis as requested by investigating officer",
    update_notes: "Updated via mobile app - victim has now paid partial amount under duress",
    device_info: {
      platform: "mobile",
      app_version: "1.2.0",
      timestamp: "2025-01-18T11:15:00+08:00"
    },
    requires_ai_reassessment: true,
    ai_reassessment_completed: false,
    created_at: "2025-01-18T11:15:00+08:00"
  }
]

