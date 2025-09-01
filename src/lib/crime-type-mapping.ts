// Crime Type Mapping Service
// Handles translation between Flutter camelCase enum names and database display names

export interface CrimeTypeMapping {
  enumName: string      // Flutter enum name (camelCase)
  displayName: string   // Database display name (proper spacing)
  category: string      // Crime category
  unit: string         // Assigned PNP unit
}

// Complete mapping of all 67+ crime types from Flutter to database format
export const CRIME_TYPE_MAPPINGS: CrimeTypeMapping[] = [
  // 📱 COMMUNICATION & SOCIAL MEDIA CRIMES - Cyber Crime Investigation Cell
  {
    enumName: 'phishing',
    displayName: 'Phishing',
    category: 'Communication & Social Media Crimes',
    unit: 'Cyber Crime Investigation Cell'
  },
  {
    enumName: 'socialEngineering',
    displayName: 'Social Engineering',
    category: 'Communication & Social Media Crimes',
    unit: 'Cyber Crime Investigation Cell'
  },
  {
    enumName: 'spamMessages',
    displayName: 'Spam Messages',
    category: 'Communication & Social Media Crimes',
    unit: 'Cyber Crime Investigation Cell'
  },
  {
    enumName: 'fakeSocialMediaProfiles',
    displayName: 'Fake Social Media Profiles',
    category: 'Communication & Social Media Crimes',
    unit: 'Cyber Crime Investigation Cell'
  },
  {
    enumName: 'onlineImpersonation',
    displayName: 'Online Impersonation',
    category: 'Communication & Social Media Crimes',
    unit: 'Cyber Crime Investigation Cell'
  },
  {
    enumName: 'businessEmailCompromise',
    displayName: 'Business Email Compromise',
    category: 'Communication & Social Media Crimes',
    unit: 'Cyber Crime Investigation Cell'
  },
  {
    enumName: 'smsFraud',
    displayName: 'SMS Fraud',
    category: 'Communication & Social Media Crimes',
    unit: 'Cyber Crime Investigation Cell'
  },

  // 💰 FINANCIAL & ECONOMIC CRIMES - Economic Offenses Wing
  {
    enumName: 'onlineBankingFraud',
    displayName: 'Online Banking Fraud',
    category: 'Financial & Economic Crimes',
    unit: 'Economic Offenses Wing'
  },
  {
    enumName: 'creditCardFraud',
    displayName: 'Credit Card Fraud',
    category: 'Financial & Economic Crimes',
    unit: 'Economic Offenses Wing'
  },
  {
    enumName: 'investmentScams',
    displayName: 'Investment Scams',
    category: 'Financial & Economic Crimes',
    unit: 'Economic Offenses Wing'
  },
  {
    enumName: 'cryptocurrencyFraud',
    displayName: 'Cryptocurrency Fraud',
    category: 'Financial & Economic Crimes',
    unit: 'Economic Offenses Wing'
  },
  {
    enumName: 'onlineShoppingScams',
    displayName: 'Online Shopping Scams',
    category: 'Financial & Economic Crimes',
    unit: 'Economic Offenses Wing'
  },
  {
    enumName: 'paymentGatewayFraud',
    displayName: 'Payment Gateway Fraud',
    category: 'Financial & Economic Crimes',
    unit: 'Economic Offenses Wing'
  },
  {
    enumName: 'insuranceFraud',
    displayName: 'Insurance Fraud',
    category: 'Financial & Economic Crimes',
    unit: 'Economic Offenses Wing'
  },
  {
    enumName: 'taxFraud',
    displayName: 'Tax Fraud',
    category: 'Financial & Economic Crimes',
    unit: 'Economic Offenses Wing'
  },
  {
    enumName: 'moneyLaundering',
    displayName: 'Money Laundering',
    category: 'Financial & Economic Crimes',
    unit: 'Economic Offenses Wing'
  },

  // 🔒 DATA & PRIVACY CRIMES - Cyber Security Division
  {
    enumName: 'identityTheft',
    displayName: 'Identity Theft',
    category: 'Data & Privacy Crimes',
    unit: 'Cyber Security Division'
  },
  {
    enumName: 'dataBreach',
    displayName: 'Data Breach',
    category: 'Data & Privacy Crimes',
    unit: 'Cyber Security Division'
  },
  {
    enumName: 'unauthorizedSystemAccess',
    displayName: 'Unauthorized System Access',
    category: 'Data & Privacy Crimes',
    unit: 'Cyber Security Division'
  },
  {
    enumName: 'corporateEspionage',
    displayName: 'Corporate Espionage',
    category: 'Data & Privacy Crimes',
    unit: 'Cyber Security Division'
  },
  {
    enumName: 'governmentDataTheft',
    displayName: 'Government Data Theft',
    category: 'Data & Privacy Crimes',
    unit: 'Cyber Security Division'
  },
  {
    enumName: 'medicalRecordsTheft',
    displayName: 'Medical Records Theft',
    category: 'Data & Privacy Crimes',
    unit: 'Cyber Security Division'
  },
  {
    enumName: 'personalInformationTheft',
    displayName: 'Personal Information Theft',
    category: 'Data & Privacy Crimes',
    unit: 'Cyber Security Division'
  },
  {
    enumName: 'accountTakeover',
    displayName: 'Account Takeover',
    category: 'Data & Privacy Crimes',
    unit: 'Cyber Security Division'
  },

  // 💻 MALWARE & SYSTEM ATTACKS - Cyber Crime Technical Unit
  {
    enumName: 'ransomware',
    displayName: 'Ransomware',
    category: 'Malware & System Attacks',
    unit: 'Cyber Crime Technical Unit'
  },
  {
    enumName: 'virusAttacks',
    displayName: 'Virus Attacks',
    category: 'Malware & System Attacks',
    unit: 'Cyber Crime Technical Unit'
  },
  {
    enumName: 'trojanHorses',
    displayName: 'Trojan Horses',
    category: 'Malware & System Attacks',
    unit: 'Cyber Crime Technical Unit'
  },
  {
    enumName: 'spyware',
    displayName: 'Spyware',
    category: 'Malware & System Attacks',
    unit: 'Cyber Crime Technical Unit'
  },
  {
    enumName: 'adware',
    displayName: 'Adware',
    category: 'Malware & System Attacks',
    unit: 'Cyber Crime Technical Unit'
  },
  {
    enumName: 'worms',
    displayName: 'Worms',
    category: 'Malware & System Attacks',
    unit: 'Cyber Crime Technical Unit'
  },
  {
    enumName: 'keyloggers',
    displayName: 'Keyloggers',
    category: 'Malware & System Attacks',
    unit: 'Cyber Crime Technical Unit'
  },
  {
    enumName: 'rootkits',
    displayName: 'Rootkits',
    category: 'Malware & System Attacks',
    unit: 'Cyber Crime Technical Unit'
  },
  {
    enumName: 'cryptojacking',
    displayName: 'Cryptojacking',
    category: 'Malware & System Attacks',
    unit: 'Cyber Crime Technical Unit'
  },
  {
    enumName: 'botnetAttacks',
    displayName: 'Botnet Attacks',
    category: 'Malware & System Attacks',
    unit: 'Cyber Crime Technical Unit'
  },

  // 👥 HARASSMENT & EXPLOITATION - Cyber Crime Against Women and Children
  {
    enumName: 'cyberstalking',
    displayName: 'Cyberstalking',
    category: 'Harassment & Exploitation',
    unit: 'Cyber Crime Against Women and Children'
  },
  {
    enumName: 'onlineHarassment',
    displayName: 'Online Harassment',
    category: 'Harassment & Exploitation',
    unit: 'Cyber Crime Against Women and Children'
  },
  {
    enumName: 'cyberbullying',
    displayName: 'Cyberbullying',
    category: 'Harassment & Exploitation',
    unit: 'Cyber Crime Against Women and Children'
  },
  {
    enumName: 'revengePorn',
    displayName: 'Revenge Porn',
    category: 'Harassment & Exploitation',
    unit: 'Cyber Crime Against Women and Children'
  },
  {
    enumName: 'sextortion',
    displayName: 'Sextortion',
    category: 'Harassment & Exploitation',
    unit: 'Cyber Crime Against Women and Children'
  },
  {
    enumName: 'onlinePredatoryBehavior',
    displayName: 'Online Predatory Behavior',
    category: 'Harassment & Exploitation',
    unit: 'Cyber Crime Against Women and Children'
  },
  {
    enumName: 'doxxing',
    displayName: 'Doxxing',
    category: 'Harassment & Exploitation',
    unit: 'Cyber Crime Against Women and Children'
  },
  {
    enumName: 'hateSpeech',
    displayName: 'Hate Speech',
    category: 'Harassment & Exploitation',
    unit: 'Cyber Crime Against Women and Children'
  },

  // 🚫 CONTENT-RELATED CRIMES - Special Investigation Team
  {
    enumName: 'childSexualAbuseMaterial',
    displayName: 'Child Sexual Abuse Material',
    category: 'Content-Related Crimes',
    unit: 'Special Investigation Team'
  },
  {
    enumName: 'illegalContentDistribution',
    displayName: 'Illegal Content Distribution',
    category: 'Content-Related Crimes',
    unit: 'Special Investigation Team'
  },
  {
    enumName: 'copyrightInfringement',
    displayName: 'Copyright Infringement',
    category: 'Content-Related Crimes',
    unit: 'Special Investigation Team'
  },
  {
    enumName: 'softwarePiracy',
    displayName: 'Software Piracy',
    category: 'Content-Related Crimes',
    unit: 'Special Investigation Team'
  },
  {
    enumName: 'illegalOnlineGambling',
    displayName: 'Illegal Online Gambling',
    category: 'Content-Related Crimes',
    unit: 'Special Investigation Team'
  },
  {
    enumName: 'onlineDrugTrafficking',
    displayName: 'Online Drug Trafficking',
    category: 'Content-Related Crimes',
    unit: 'Special Investigation Team'
  },
  {
    enumName: 'illegalWeaponsSales',
    displayName: 'Illegal Weapons Sales',
    category: 'Content-Related Crimes',
    unit: 'Special Investigation Team'
  },
  {
    enumName: 'humanTrafficking',
    displayName: 'Human Trafficking',
    category: 'Content-Related Crimes',
    unit: 'Special Investigation Team'
  },

  // ⚡ SYSTEM DISRUPTION & SABOTAGE - Critical Infrastructure Protection Unit
  {
    enumName: 'denialOfServiceAttacks',
    displayName: 'Denial of Service Attacks',
    category: 'System Disruption & Sabotage',
    unit: 'Critical Infrastructure Protection Unit'
  },
  {
    enumName: 'websiteDefacement',
    displayName: 'Website Defacement',
    category: 'System Disruption & Sabotage',
    unit: 'Critical Infrastructure Protection Unit'
  },
  {
    enumName: 'systemSabotage',
    displayName: 'System Sabotage',
    category: 'System Disruption & Sabotage',
    unit: 'Critical Infrastructure Protection Unit'
  },
  {
    enumName: 'networkIntrusion',
    displayName: 'Network Intrusion',
    category: 'System Disruption & Sabotage',
    unit: 'Critical Infrastructure Protection Unit'
  },
  {
    enumName: 'sqlInjection',
    displayName: 'SQL Injection',
    category: 'System Disruption & Sabotage',
    unit: 'Critical Infrastructure Protection Unit'
  },
  {
    enumName: 'crossSiteScripting',
    displayName: 'Cross-Site Scripting',
    category: 'System Disruption & Sabotage',
    unit: 'Critical Infrastructure Protection Unit'
  },
  {
    enumName: 'manInTheMiddleAttacks',
    displayName: 'Man-in-the-Middle Attacks',
    category: 'System Disruption & Sabotage',
    unit: 'Critical Infrastructure Protection Unit'
  },

  // 🏛️ GOVERNMENT & TERRORISM - National Security Cyber Division
  {
    enumName: 'cyberterrorism',
    displayName: 'Cyberterrorism',
    category: 'Government & Terrorism',
    unit: 'National Security Cyber Division'
  },
  {
    enumName: 'cyberWarfare',
    displayName: 'Cyber Warfare',
    category: 'Government & Terrorism',
    unit: 'National Security Cyber Division'
  },
  {
    enumName: 'governmentSystemHacking',
    displayName: 'Government System Hacking',
    category: 'Government & Terrorism',
    unit: 'National Security Cyber Division'
  },
  {
    enumName: 'electionInterference',
    displayName: 'Election Interference',
    category: 'Government & Terrorism',
    unit: 'National Security Cyber Division'
  },
  {
    enumName: 'criticalInfrastructureAttacks',
    displayName: 'Critical Infrastructure Attacks',
    category: 'Government & Terrorism',
    unit: 'National Security Cyber Division'
  },
  {
    enumName: 'propagandaDistribution',
    displayName: 'Propaganda Distribution',
    category: 'Government & Terrorism',
    unit: 'National Security Cyber Division'
  },
  {
    enumName: 'stateSponsoredAttacks',
    displayName: 'State-Sponsored Attacks',
    category: 'Government & Terrorism',
    unit: 'National Security Cyber Division'
  },

  // 🔍 TECHNICAL EXPLOITATION - Advanced Cyber Forensics Unit
  {
    enumName: 'zeroDayExploits',
    displayName: 'Zero-Day Exploits',
    category: 'Technical Exploitation',
    unit: 'Advanced Cyber Forensics Unit'
  },
  {
    enumName: 'vulnerabilityExploitation',
    displayName: 'Vulnerability Exploitation',
    category: 'Technical Exploitation',
    unit: 'Advanced Cyber Forensics Unit'
  },
  {
    enumName: 'backdoorCreation',
    displayName: 'Backdoor Creation',
    category: 'Technical Exploitation',
    unit: 'Advanced Cyber Forensics Unit'
  },
  {
    enumName: 'privilegeEscalation',
    displayName: 'Privilege Escalation',
    category: 'Technical Exploitation',
    unit: 'Advanced Cyber Forensics Unit'
  },
  {
    enumName: 'codeInjection',
    displayName: 'Code Injection',
    category: 'Technical Exploitation',
    unit: 'Advanced Cyber Forensics Unit'
  },
  {
    enumName: 'bufferOverflowAttacks',
    displayName: 'Buffer Overflow Attacks',
    category: 'Technical Exploitation',
    unit: 'Advanced Cyber Forensics Unit'
  },

  // 🎯 TARGETED ATTACKS - Special Cyber Operations Unit
  {
    enumName: 'advancedPersistentThreats',
    displayName: 'Advanced Persistent Threats',
    category: 'Targeted Attacks',
    unit: 'Special Cyber Operations Unit'
  },
  {
    enumName: 'spearPhishing',
    displayName: 'Spear Phishing',
    category: 'Targeted Attacks',
    unit: 'Special Cyber Operations Unit'
  },
  {
    enumName: 'ceoFraud',
    displayName: 'CEO Fraud',
    category: 'Targeted Attacks',
    unit: 'Special Cyber Operations Unit'
  },
  {
    enumName: 'supplyChainAttacks',
    displayName: 'Supply Chain Attacks',
    category: 'Targeted Attacks',
    unit: 'Special Cyber Operations Unit'
  },
  {
    enumName: 'insiderThreats',
    displayName: 'Insider Threats',
    category: 'Targeted Attacks',
    unit: 'Special Cyber Operations Unit'
  }
]

// Create lookup maps for O(1) access
const enumToDisplayMap = new Map<string, CrimeTypeMapping>()
const displayToEnumMap = new Map<string, CrimeTypeMapping>()

// Populate maps
CRIME_TYPE_MAPPINGS.forEach(mapping => {
  enumToDisplayMap.set(mapping.enumName.toLowerCase(), mapping)
  displayToEnumMap.set(mapping.displayName.toLowerCase(), mapping)
})

/**
 * Crime Type Translation Service
 */
export class CrimeTypeMapper {
  /**
   * Convert Flutter enum name to database display name
   * @param enumName - Flutter camelCase enum name (e.g., 'onlinePredatoryBehavior')
   * @returns Database display name (e.g., 'Online Predatory Behavior')
   */
  static enumToDisplayName(enumName: string): string | null {
    if (!enumName) return null
    
    const mapping = enumToDisplayMap.get(enumName.toLowerCase())
    return mapping?.displayName || null
  }

  /**
   * Convert database display name to Flutter enum name
   * @param displayName - Database display name (e.g., 'Online Predatory Behavior')
   * @returns Flutter enum name (e.g., 'onlinePredatoryBehavior')
   */
  static displayNameToEnum(displayName: string): string | null {
    if (!displayName) return null
    
    const mapping = displayToEnumMap.get(displayName.toLowerCase())
    return mapping?.enumName || null
  }

  /**
   * Get complete mapping info for Flutter enum name
   * @param enumName - Flutter camelCase enum name
   * @returns Complete mapping object or null
   */
  static getMappingByEnum(enumName: string): CrimeTypeMapping | null {
    if (!enumName) return null
    
    return enumToDisplayMap.get(enumName.toLowerCase()) || null
  }

  /**
   * Get complete mapping info for database display name
   * @param displayName - Database display name
   * @returns Complete mapping object or null
   */
  static getMappingByDisplayName(displayName: string): CrimeTypeMapping | null {
    if (!displayName) return null
    
    return displayToEnumMap.get(displayName.toLowerCase()) || null
  }

  /**
   * Get assigned PNP unit for a crime type (from either enum or display name)
   * @param crimeType - Either enum name or display name
   * @returns PNP unit name or null
   */
  static getAssignedUnit(crimeType: string): string | null {
    if (!crimeType) return null
    
    // Try as enum name first
    let mapping = enumToDisplayMap.get(crimeType.toLowerCase())
    
    // Try as display name if not found
    if (!mapping) {
      mapping = displayToEnumMap.get(crimeType.toLowerCase())
    }
    
    return mapping?.unit || null
  }

  /**
   * Get category for a crime type (from either enum or display name)
   * @param crimeType - Either enum name or display name
   * @returns Crime category or null
   */
  static getCategory(crimeType: string): string | null {
    if (!crimeType) return null
    
    // Try as enum name first
    let mapping = enumToDisplayMap.get(crimeType.toLowerCase())
    
    // Try as display name if not found
    if (!mapping) {
      mapping = displayToEnumMap.get(crimeType.toLowerCase())
    }
    
    return mapping?.category || null
  }

  /**
   * Get all crime types for a specific category
   * @param category - Crime category name
   * @returns Array of mappings for that category
   */
  static getCrimeTypesByCategory(category: string): CrimeTypeMapping[] {
    if (!category) return []
    
    return CRIME_TYPE_MAPPINGS.filter(
      mapping => mapping.category.toLowerCase() === category.toLowerCase()
    )
  }

  /**
   * Get all crime types for a specific PNP unit
   * @param unit - PNP unit name
   * @returns Array of mappings for that unit
   */
  static getCrimeTypesByUnit(unit: string): CrimeTypeMapping[] {
    if (!unit) return []
    
    return CRIME_TYPE_MAPPINGS.filter(
      mapping => mapping.unit.toLowerCase() === unit.toLowerCase()
    )
  }

  /**
   * Validate if a crime type exists (either as enum or display name)
   * @param crimeType - Crime type to validate
   * @returns boolean indicating if valid
   */
  static isValidCrimeType(crimeType: string): boolean {
    if (!crimeType) return false
    
    return enumToDisplayMap.has(crimeType.toLowerCase()) || 
           displayToEnumMap.has(crimeType.toLowerCase())
  }

  /**
   * Normalize crime type to display name format (for database queries)
   * @param crimeType - Either enum name or display name
   * @returns Normalized display name for database queries
   */
  static normalizeForDatabase(crimeType: string): string | null {
    if (!crimeType) return null
    
    // Try to get display name if it's an enum
    const displayName = CrimeTypeMapper.enumToDisplayName(crimeType)
    if (displayName) return displayName
    
    // Check if it's already a display name
    if (CrimeTypeMapper.getMappingByDisplayName(crimeType)) {
      return crimeType
    }
    
    // Return null if not found
    return null
  }

  /**
   * Get all available crime types
   * @returns Array of all crime type mappings
   */
  static getAllMappings(): CrimeTypeMapping[] {
    return [...CRIME_TYPE_MAPPINGS]
  }

  /**
   * Debug helper: Find potential matches for a crime type
   * @param crimeType - Crime type to search for
   * @returns Array of potential matches
   */
  static findPotentialMatches(crimeType: string): CrimeTypeMapping[] {
    if (!crimeType) return []
    
    const searchTerm = crimeType.toLowerCase()
    
    return CRIME_TYPE_MAPPINGS.filter(mapping => 
      mapping.enumName.toLowerCase().includes(searchTerm) ||
      mapping.displayName.toLowerCase().includes(searchTerm)
    )
  }
}

export default CrimeTypeMapper