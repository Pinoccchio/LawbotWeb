// Status Update Templates - Comprehensive collection of professional templates
// for all status transitions in the PNP cybercrime case management system

export interface StatusTemplate {
  id: string
  title: string
  content: string
  fromStatus?: string[] // Optional: specific statuses this template is best used from
  toStatus: string // Target status this template is for
  urgencyLevel: 'low' | 'normal' | 'high' | 'urgent'
  recommendedFollowUpDays?: number // Suggested follow-up timeframe
  category: 'transition' | 'standard' | 'escalation' | 'closure'
  icon: string // Emoji or icon identifier
}

export const STATUS_TEMPLATES: StatusTemplate[] = [
  // ===== PENDING STATUS TEMPLATES =====
  {
    id: 'pending-initial',
    title: 'Case Received & Queued',
    content: 'Case has been received and logged into the system. Currently queued for initial review and resource allocation. All required documentation has been verified and case has been assigned a priority level based on initial assessment.',
    toStatus: 'Pending',
    urgencyLevel: 'normal',
    recommendedFollowUpDays: 2,
    category: 'standard',
    icon: '📋'
  },
  {
    id: 'pending-return-investigation',
    title: 'Returned from Investigation',
    content: 'Case has been returned from active investigation status. Requires additional supervisory review or resource reallocation before proceeding. All investigation progress has been documented and preserved.',
    fromStatus: ['Under Investigation'],
    toStatus: 'Pending',
    urgencyLevel: 'normal',
    recommendedFollowUpDays: 3,
    category: 'transition',
    icon: '⏸️'
  },
  {
    id: 'pending-escalation',
    title: 'Escalated for Review',
    content: 'Case has been escalated back to pending status for supervisory review. Complex nature of the case requires additional assessment before proceeding with investigation. Supervisor consultation scheduled.',
    fromStatus: ['Under Investigation', 'Requires More Information'],
    toStatus: 'Pending',
    urgencyLevel: 'high',
    recommendedFollowUpDays: 1,
    category: 'escalation',
    icon: '🔺'
  },
  {
    id: 'pending-resource-wait',
    title: 'Awaiting Resources',
    content: 'Case is pending due to resource constraints. Specialized unit assignment or technical resources required. Case will proceed once appropriate resources become available.',
    toStatus: 'Pending',
    urgencyLevel: 'normal',
    recommendedFollowUpDays: 5,
    category: 'standard',
    icon: '⏳'
  },

  // ===== UNDER INVESTIGATION TEMPLATES =====
  {
    id: 'investigation-commenced',
    title: 'Investigation Officially Started',
    content: 'Investigation has officially commenced. Primary investigating officer assigned and initial case assessment completed. Evidence collection plan established and investigation timeline set.',
    fromStatus: ['Pending'],
    toStatus: 'Under Investigation',
    urgencyLevel: 'normal',
    recommendedFollowUpDays: 7,
    category: 'transition',
    icon: '🔍'
  },
  {
    id: 'investigation-evidence-phase',
    title: 'Evidence Collection Initiated',
    content: 'Active evidence collection phase has begun. Digital forensics team engaged and preliminary evidence secured. Chain of custody procedures implemented. Technical analysis in progress.',
    fromStatus: ['Pending', 'Requires More Information'],
    toStatus: 'Under Investigation',
    urgencyLevel: 'high',
    recommendedFollowUpDays: 5,
    category: 'standard',
    icon: '🔬'
  },
  {
    id: 'investigation-witness-phase',
    title: 'Witness Interview Stage',
    content: 'Investigation has entered witness interview phase. Key witnesses identified and interview schedule established. Witness statements being collected and documented according to protocol.',
    toStatus: 'Under Investigation',
    urgencyLevel: 'normal',
    recommendedFollowUpDays: 10,
    category: 'standard',
    icon: '👥'
  },
  {
    id: 'investigation-suspect-identified',
    title: 'Suspect Identification Phase',
    content: 'Investigation has progressed to suspect identification stage. Preliminary analysis of evidence points to potential suspects. Background verification and additional evidence collection ongoing.',
    toStatus: 'Under Investigation',
    urgencyLevel: 'high',
    recommendedFollowUpDays: 3,
    category: 'standard',
    icon: '🎯'
  },
  {
    id: 'investigation-technical-analysis',
    title: 'Technical Analysis in Progress',
    content: 'Comprehensive technical analysis of digital evidence underway. Cybercrime technical unit conducting detailed examination of digital artifacts, network logs, and system forensics.',
    toStatus: 'Under Investigation',
    urgencyLevel: 'normal',
    recommendedFollowUpDays: 14,
    category: 'standard',
    icon: '💻'
  },
  {
    id: 'investigation-multi-agency',
    title: 'Multi-Agency Coordination',
    content: 'Investigation requires coordination with external agencies. Inter-agency cooperation protocols activated. Collaborative investigation approach implemented for comprehensive case resolution.',
    toStatus: 'Under Investigation',
    urgencyLevel: 'high',
    recommendedFollowUpDays: 7,
    category: 'escalation',
    icon: '🤝'
  },

  // ===== REQUIRES MORE INFORMATION TEMPLATES =====
  {
    id: 'info-complainant-details',
    title: 'Additional Complainant Information',
    content: 'Investigation requires additional information from the complainant. Specific details needed to proceed with case resolution. Complainant has been contacted and follow-up scheduled.',
    toStatus: 'Requires More Information',
    urgencyLevel: 'normal',
    recommendedFollowUpDays: 5,
    category: 'transition',
    icon: '📞'
  },
  {
    id: 'info-evidence-gap',
    title: 'Evidence Gap Identified',
    content: 'Critical evidence gap identified during investigation. Additional technical evidence or documentation required to proceed. Evidence collection plan revised to address identified gaps.',
    toStatus: 'Requires More Information',
    urgencyLevel: 'high',
    recommendedFollowUpDays: 3,
    category: 'standard',
    icon: '🔍'
  },
  {
    id: 'info-witness-statements',
    title: 'Missing Witness Information',
    content: 'Additional witness statements or documentation required. Key witnesses need to be contacted or additional testimony needed. Witness coordination in progress.',
    toStatus: 'Requires More Information',
    urgencyLevel: 'normal',
    recommendedFollowUpDays: 7,
    category: 'standard',
    icon: '👥'
  },
  {
    id: 'info-technical-insufficient',
    title: 'Technical Evidence Insufficient',
    content: 'Current technical evidence insufficient for case progression. Additional digital forensics analysis required. Specialized technical resources needed for comprehensive examination.',
    toStatus: 'Requires More Information',
    urgencyLevel: 'high',
    recommendedFollowUpDays: 10,
    category: 'standard',
    icon: '🔧'
  },
  {
    id: 'info-expert-analysis',
    title: 'Awaiting Expert Analysis',
    content: 'Case requires expert analysis or specialized consultation. External expert engagement initiated. Waiting for professional analysis results before proceeding with investigation.',
    toStatus: 'Requires More Information',
    urgencyLevel: 'normal',
    recommendedFollowUpDays: 14,
    category: 'standard',
    icon: '🎓'
  },
  {
    id: 'info-legal-clarification',
    title: 'Legal Clarification Required',
    content: 'Legal aspects of the case require clarification. Consultation with legal team initiated to ensure proper procedural compliance. Legal guidance needed for case progression.',
    toStatus: 'Requires More Information',
    urgencyLevel: 'normal',
    recommendedFollowUpDays: 5,
    category: 'escalation',
    icon: '⚖️'
  },
  {
    id: 'info-initial-incomplete',
    title: 'Initial Report Incomplete',
    content: 'Initial complaint submission lacks sufficient detail for proper processing. Additional information required from complainant to begin investigation. Contact has been initiated to gather missing details.',
    fromStatus: ['Pending'],
    toStatus: 'Requires More Information',
    urgencyLevel: 'normal',
    recommendedFollowUpDays: 3,
    category: 'standard',
    icon: '📋'
  },

  // ===== RESOLVED TEMPLATES =====
  {
    id: 'resolved-suspect-apprehended',
    title: 'Suspect Successfully Apprehended',
    content: 'Case successfully resolved with suspect apprehension. All evidence secured and documented. Suspect in custody and proper legal procedures initiated. Complainant notified of successful resolution.',
    toStatus: 'Resolved',
    urgencyLevel: 'low',
    category: 'closure',
    icon: '🚔'
  },
  {
    id: 'resolved-mediation',
    title: 'Resolved Through Mediation',
    content: 'Case successfully resolved through mediation process. All parties reached satisfactory agreement. Mediation documentation completed and filed. Follow-up monitoring established.',
    toStatus: 'Resolved',
    urgencyLevel: 'low',
    category: 'closure',
    icon: '🤝'
  },
  {
    id: 'resolved-recovery',
    title: 'Full Recovery Achieved',
    content: 'Case resolved with full recovery of stolen assets/data. Evidence recovered and returned to complainant. All documentation completed and case files archived.',
    toStatus: 'Resolved',
    urgencyLevel: 'low',
    category: 'closure',
    icon: '💰'
  },
  {
    id: 'resolved-prevention',
    title: 'Preventive Measures Implemented',
    content: 'Case resolved through implementation of preventive measures. Security vulnerabilities addressed and protective protocols established. Ongoing monitoring system activated.',
    toStatus: 'Resolved',
    urgencyLevel: 'low',
    category: 'closure',
    icon: '🛡️'
  },
  {
    id: 'resolved-prosecution',
    title: 'Case Prepared for Prosecution',
    content: 'Investigation completed with case prepared for prosecution. All evidence compiled and organized. Case file transferred to prosecutor\'s office with complete documentation.',
    toStatus: 'Resolved',
    urgencyLevel: 'low',
    category: 'closure',
    icon: '⚖️'
  },
  {
    id: 'resolved-self-resolved',
    title: 'Issue Self-Resolved by Complainant',
    content: 'Complainant reported that the issue has been resolved independently. No further PNP action required. Case documentation completed and filed for reference.',
    toStatus: 'Resolved',
    urgencyLevel: 'low',
    category: 'closure',
    icon: '✅'
  },

  // ===== DISMISSED TEMPLATES =====
  {
    id: 'dismissed-insufficient-evidence',
    title: 'Insufficient Evidence',
    content: 'Case dismissed due to insufficient evidence to proceed with investigation. All available evidence thoroughly examined. No viable leads or actionable information discovered.',
    toStatus: 'Dismissed',
    urgencyLevel: 'low',
    category: 'closure',
    icon: '📋'
  },
  {
    id: 'dismissed-complainant-withdrawal',
    title: 'Complainant Withdrew Cooperation',
    content: 'Case dismissed due to complainant withdrawal of cooperation. Despite multiple attempts to engage, complainant chose to discontinue case proceedings. Case closed per complainant request.',
    toStatus: 'Dismissed',
    urgencyLevel: 'low',
    category: 'closure',
    icon: '🚪'
  },
  {
    id: 'dismissed-jurisdiction',
    title: 'Outside PNP Jurisdiction',
    content: 'Case dismissed as it falls outside PNP jurisdiction. Appropriate referral made to competent authority. Complainant advised of proper channels for case resolution.',
    toStatus: 'Dismissed',
    urgencyLevel: 'low',
    category: 'closure',
    icon: '🏛️'
  },
  {
    id: 'dismissed-duplicate',
    title: 'Duplicate Case Already Handled',
    content: 'Case dismissed as duplicate of previously handled complaint. Cross-reference with existing case confirmed. Complainant advised of previous case resolution.',
    toStatus: 'Dismissed',
    urgencyLevel: 'low',
    category: 'closure',
    icon: '📄'
  },
  {
    id: 'dismissed-no-crime',
    title: 'No Criminal Activity Identified',
    content: 'Case dismissed after thorough review revealed no criminal activity. Matter determined to be civil in nature or within normal business practices. Complainant advised accordingly.',
    toStatus: 'Dismissed',
    urgencyLevel: 'low',
    category: 'closure',
    icon: '❌'
  },
  {
    id: 'dismissed-technical-limitations',
    title: 'Technical Limitations Prevent Progress',
    content: 'Case dismissed due to technical limitations that prevent further investigation. Current technology or resources insufficient to pursue case effectively. Complainant advised of limitations.',
    toStatus: 'Dismissed',
    urgencyLevel: 'low',
    category: 'closure',
    icon: '🔧'
  }
]

// Helper functions for template filtering and management
export const getTemplatesForStatus = (targetStatus: string, currentStatus?: string): StatusTemplate[] => {
  return STATUS_TEMPLATES.filter(template => {
    // Must match target status
    if (template.toStatus !== targetStatus) return false
    
    // If no current status specified, return all templates for target status
    if (!currentStatus) return true
    
    // If template has fromStatus restriction, check if current status is allowed
    if (template.fromStatus && template.fromStatus.length > 0) {
      return template.fromStatus.includes(currentStatus)
    }
    
    // No restriction, template is available
    return true
  })
}

export const getTemplatesByCategory = (templates: StatusTemplate[]): Record<string, StatusTemplate[]> => {
  return templates.reduce((acc, template) => {
    const category = template.category
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(template)
    return acc
  }, {} as Record<string, StatusTemplate[]>)
}

export const getRecommendedTemplate = (fromStatus: string, toStatus: string): StatusTemplate | null => {
  const availableTemplates = getTemplatesForStatus(toStatus, fromStatus)
  
  // Prefer transition templates first
  const transitionTemplates = availableTemplates.filter(t => t.category === 'transition')
  if (transitionTemplates.length > 0) {
    return transitionTemplates[0]
  }
  
  // Fall back to standard templates
  const standardTemplates = availableTemplates.filter(t => t.category === 'standard')
  if (standardTemplates.length > 0) {
    return standardTemplates[0]
  }
  
  // Return any available template
  return availableTemplates.length > 0 ? availableTemplates[0] : null
}

export const getCategoryDisplayName = (category: string): string => {
  const categoryNames: Record<string, string> = {
    'transition': '🔄 Status Transitions',
    'standard': '📋 Standard Updates', 
    'escalation': '🔺 Escalations',
    'closure': '✅ Case Closures'
  }
  return categoryNames[category] || category
}

export const getCategoryColor = (category: string): string => {
  const categoryColors: Record<string, string> = {
    'transition': 'bg-blue-500',
    'standard': 'bg-green-500',
    'escalation': 'bg-orange-500', 
    'closure': 'bg-purple-500'
  }
  return categoryColors[category] || 'bg-gray-500'
}