// AI Service for generating case summaries using Google Gemini
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '')

// Get the generative model
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

export interface CaseDataForSummary {
  // Core fields (always present)
  complaint_number: string
  crime_type: string
  description: string
  incident_date_time: string
  status: string
  priority: string
  
  // Location and platform fields
  incident_location?: string
  platform_website?: string
  account_reference?: string
  
  // Financial fields
  estimated_loss?: number
  
  // Suspect information
  suspect_name?: string
  suspect_relationship?: string
  suspect_contact?: string
  suspect_details?: string
  
  // Technical fields
  system_details?: string
  technical_info?: string
  vulnerability_details?: string
  attack_vector?: string
  
  // Security and impact fields
  security_level?: string
  target_info?: string
  content_description?: string
  impact_assessment?: string
  
  // Metadata
  risk_score?: number
  evidence_count?: number
  assigned_unit?: string
  assigned_officer?: string
  status_history?: any[]
  full_name?: string
}

// Crime category mapping
export enum CrimeCategory {
  COMMUNICATION_SOCIAL_MEDIA = 'Communication & Social Media Crimes',
  FINANCIAL_ECONOMIC = 'Financial & Economic Crimes',
  DATA_PRIVACY = 'Data & Privacy Crimes',
  MALWARE_SYSTEM = 'Malware & System Attacks',
  HARASSMENT_EXPLOITATION = 'Harassment & Exploitation',
  CONTENT_RELATED = 'Content-Related Crimes',
  SYSTEM_DISRUPTION = 'System Disruption & Sabotage',
  GOVERNMENT_TERRORISM = 'Government & Terrorism',
  TECHNICAL_EXPLOITATION = 'Technical Exploitation',
  TARGETED_ATTACKS = 'Targeted Attacks'
}

export class AIService {
  // Detect crime category from crime type
  private static detectCrimeCategory(crimeType: string): CrimeCategory {
    const lowerCrimeType = crimeType.toLowerCase()
    
    // Communication & Social Media
    if (lowerCrimeType.includes('phishing') || lowerCrimeType.includes('social engineering') || 
        lowerCrimeType.includes('spam') || lowerCrimeType.includes('fake social') || 
        lowerCrimeType.includes('impersonation') || lowerCrimeType.includes('email compromise') ||
        lowerCrimeType.includes('sms fraud')) {
      return CrimeCategory.COMMUNICATION_SOCIAL_MEDIA
    }
    
    // Financial & Economic
    if (lowerCrimeType.includes('banking') || lowerCrimeType.includes('credit card') || 
        lowerCrimeType.includes('investment') || lowerCrimeType.includes('cryptocurrency') || 
        lowerCrimeType.includes('shopping scam') || lowerCrimeType.includes('payment') ||
        lowerCrimeType.includes('insurance fraud') || lowerCrimeType.includes('tax fraud') ||
        lowerCrimeType.includes('money laundering')) {
      return CrimeCategory.FINANCIAL_ECONOMIC
    }
    
    // Data & Privacy
    if (lowerCrimeType.includes('identity theft') || lowerCrimeType.includes('data breach') || 
        lowerCrimeType.includes('unauthorized') || lowerCrimeType.includes('espionage') || 
        lowerCrimeType.includes('records theft') || lowerCrimeType.includes('information theft') ||
        lowerCrimeType.includes('account takeover')) {
      return CrimeCategory.DATA_PRIVACY
    }
    
    // Malware & System Attacks
    if (lowerCrimeType.includes('ransomware') || lowerCrimeType.includes('virus') || 
        lowerCrimeType.includes('trojan') || lowerCrimeType.includes('spyware') || 
        lowerCrimeType.includes('adware') || lowerCrimeType.includes('worm') ||
        lowerCrimeType.includes('keylogger') || lowerCrimeType.includes('rootkit') ||
        lowerCrimeType.includes('cryptojacking') || lowerCrimeType.includes('botnet')) {
      return CrimeCategory.MALWARE_SYSTEM
    }
    
    // Harassment & Exploitation
    if (lowerCrimeType.includes('stalking') || lowerCrimeType.includes('harassment') || 
        lowerCrimeType.includes('bullying') || lowerCrimeType.includes('revenge porn') || 
        lowerCrimeType.includes('sextortion') || lowerCrimeType.includes('predatory') ||
        lowerCrimeType.includes('doxxing') || lowerCrimeType.includes('hate speech')) {
      return CrimeCategory.HARASSMENT_EXPLOITATION
    }
    
    // Content-Related
    if (lowerCrimeType.includes('child') || lowerCrimeType.includes('illegal content') || 
        lowerCrimeType.includes('copyright') || lowerCrimeType.includes('piracy') || 
        lowerCrimeType.includes('gambling') || lowerCrimeType.includes('drug trafficking') ||
        lowerCrimeType.includes('weapons') || lowerCrimeType.includes('human trafficking')) {
      return CrimeCategory.CONTENT_RELATED
    }
    
    // System Disruption
    if (lowerCrimeType.includes('denial of service') || lowerCrimeType.includes('defacement') || 
        lowerCrimeType.includes('sabotage') || lowerCrimeType.includes('intrusion') || 
        lowerCrimeType.includes('sql injection') || lowerCrimeType.includes('cross-site') ||
        lowerCrimeType.includes('man-in-the-middle')) {
      return CrimeCategory.SYSTEM_DISRUPTION
    }
    
    // Government & Terrorism
    if (lowerCrimeType.includes('terrorism') || lowerCrimeType.includes('warfare') || 
        lowerCrimeType.includes('government') || lowerCrimeType.includes('election') || 
        lowerCrimeType.includes('infrastructure attack') || lowerCrimeType.includes('propaganda')) {
      return CrimeCategory.GOVERNMENT_TERRORISM
    }
    
    // Technical Exploitation
    if (lowerCrimeType.includes('zero-day') || lowerCrimeType.includes('persistent threat') || 
        lowerCrimeType.includes('exploit kit') || lowerCrimeType.includes('supply chain') || 
        lowerCrimeType.includes('iot')) {
      return CrimeCategory.TECHNICAL_EXPLOITATION
    }
    
    // Targeted Attacks
    if (lowerCrimeType.includes('spear phishing') || lowerCrimeType.includes('watering hole') || 
        lowerCrimeType.includes('whale phishing') || lowerCrimeType.includes('intelligence theft') || 
        lowerCrimeType.includes('insider threat')) {
      return CrimeCategory.TARGETED_ATTACKS
    }
    
    // Default to communication crimes
    return CrimeCategory.COMMUNICATION_SOCIAL_MEDIA
  }

  // Build dynamic prompt based on crime category and available fields
  private static buildDynamicPrompt(caseData: CaseDataForSummary, category: CrimeCategory): string {
    let dynamicFields = ''
    
    // Add fields based on what's available and relevant to the category
    
    // Location and Platform fields
    if (caseData.incident_location) {
      dynamicFields += `Location: ${caseData.incident_location}\n`
    }
    if (caseData.platform_website) {
      dynamicFields += `Platform/Website: ${caseData.platform_website}\n`
    }
    if (caseData.account_reference) {
      dynamicFields += `Account/Reference: ${caseData.account_reference}\n`
    }
    
    // Financial fields (especially for Financial crimes)
    if (caseData.estimated_loss) {
      dynamicFields += `Financial Loss: ₱${caseData.estimated_loss.toLocaleString()}\n`
    }
    
    // Suspect information (especially for Harassment crimes)
    if (caseData.suspect_name) {
      dynamicFields += `Suspect Name/Alias: ${caseData.suspect_name}\n`
    }
    if (caseData.suspect_relationship) {
      dynamicFields += `Relationship to Suspect: ${caseData.suspect_relationship}\n`
    }
    if (caseData.suspect_contact) {
      dynamicFields += `Suspect Contact: ${caseData.suspect_contact}\n`
    }
    if (caseData.suspect_details) {
      dynamicFields += `Suspect Details: ${caseData.suspect_details}\n`
    }
    
    // Technical fields (for technical crimes)
    if (caseData.system_details) {
      dynamicFields += `System Details: ${caseData.system_details}\n`
    }
    if (caseData.technical_info) {
      dynamicFields += `Technical Information: ${caseData.technical_info}\n`
    }
    if (caseData.vulnerability_details) {
      dynamicFields += `Vulnerability Details: ${caseData.vulnerability_details}\n`
    }
    if (caseData.attack_vector) {
      dynamicFields += `Attack Vector: ${caseData.attack_vector}\n`
    }
    
    // Security and impact fields
    if (caseData.security_level) {
      dynamicFields += `Security Level: ${caseData.security_level}\n`
    }
    if (caseData.target_info) {
      dynamicFields += `Target Information: ${caseData.target_info}\n`
    }
    if (caseData.content_description) {
      dynamicFields += `Content Description: ${caseData.content_description}\n`
    }
    if (caseData.impact_assessment) {
      dynamicFields += `Impact Assessment: ${caseData.impact_assessment}\n`
    }
    
    // Add metadata
    if (caseData.evidence_count) {
      dynamicFields += `Evidence Files: ${caseData.evidence_count}\n`
    }
    
    // Build category-specific focus
    let categoryFocus = ''
    switch (category) {
      case CrimeCategory.FINANCIAL_ECONOMIC:
        categoryFocus = 'Focus on financial impact, recovery possibilities, and transaction tracing.'
        break
      case CrimeCategory.HARASSMENT_EXPLOITATION:
        categoryFocus = 'Prioritize victim safety, evidence preservation, and suspect identification.'
        break
      case CrimeCategory.MALWARE_SYSTEM:
      case CrimeCategory.SYSTEM_DISRUPTION:
      case CrimeCategory.TECHNICAL_EXPLOITATION:
        categoryFocus = 'Emphasize technical analysis, system isolation, and vulnerability assessment.'
        break
      case CrimeCategory.GOVERNMENT_TERRORISM:
        categoryFocus = 'Consider national security implications and coordinate with appropriate agencies.'
        break
      case CrimeCategory.DATA_PRIVACY:
        categoryFocus = 'Focus on data breach scope, affected individuals, and compliance requirements.'
        break
      case CrimeCategory.CONTENT_RELATED:
        categoryFocus = 'Handle with sensitivity, preserve evidence chain, and consider victim protection.'
        break
      default:
        categoryFocus = 'Provide comprehensive analysis based on available evidence.'
    }
    
    return `
You are an AI assistant helping Philippine National Police officers investigate cybercrime cases. 
Crime Category: ${category}

CASE DETAILS:
Case Number: ${caseData.complaint_number}
Crime Type: ${caseData.crime_type}
Priority: ${caseData.priority}
Status: ${caseData.status}
Date/Time: ${new Date(caseData.incident_date_time).toLocaleString()}
Risk Score: ${caseData.risk_score || 'Not assessed'}
${dynamicFields}
Incident Description:
${caseData.description}

ANALYSIS REQUIREMENTS:
${categoryFocus}

Please provide:
1. Executive Summary (2-3 sentences) - Focus on the most critical aspects based on available information
2. Key Risk Factors - Based on the specific crime type and provided details
3. Investigation Priorities - Actionable steps considering the available evidence and fields

Note: Base your analysis only on the information provided. If critical fields are missing, mention what additional information would be helpful.
`
  }

  // Generate a comprehensive case summary
  static async generateCaseSummary(caseData: CaseDataForSummary): Promise<string> {
    try {
      console.log('🤖 Generating AI case summary for:', caseData.complaint_number)
      
      // Detect crime category
      const category = this.detectCrimeCategory(caseData.crime_type)
      console.log('📁 Detected category:', category)
      
      // Build dynamic prompt
      const prompt = this.buildDynamicPrompt(caseData, category)

      // Generate the summary
      const result = await model.generateContent(prompt)
      const response = await result.response
      const summary = response.text()
      
      console.log('✅ AI summary generated successfully')
      return summary
      
    } catch (error) {
      console.error('❌ Error generating AI summary:', error)
      
      // Generate dynamic fallback summary based on available fields
      const category = this.detectCrimeCategory(caseData.crime_type)
      let fallbackSummary = `This ${caseData.priority} priority case involves ${caseData.crime_type} reported on ${new Date(caseData.incident_date_time).toLocaleDateString()}.`
      
      // Add location info if available
      if (caseData.incident_location) {
        fallbackSummary += ` The incident occurred in ${caseData.incident_location}.`
      }
      
      // Add platform info for relevant crimes
      if (caseData.platform_website) {
        fallbackSummary += ` The crime involved ${caseData.platform_website} platform.`
      }
      
      // Add financial info for economic crimes
      if (caseData.estimated_loss) {
        fallbackSummary += ` Financial loss amounts to ₱${caseData.estimated_loss.toLocaleString()}.`
      }
      
      // Add suspect info if available
      if (caseData.suspect_name) {
        fallbackSummary += ` A suspect has been identified${caseData.suspect_relationship ? ` (${caseData.suspect_relationship})` : ''}.`
      }
      
      // Add technical info for technical crimes
      if (caseData.system_details || caseData.technical_info) {
        fallbackSummary += ` Technical systems were compromised.`
      }
      
      // Add status and evidence
      fallbackSummary += ` The case is currently ${caseData.status.toLowerCase()}.`
      if (caseData.evidence_count) {
        fallbackSummary += ` ${caseData.evidence_count} evidence files have been submitted.`
      }
      
      // Add category-specific recommendations
      switch (category) {
        case CrimeCategory.FINANCIAL_ECONOMIC:
          fallbackSummary += ' Immediate action required to freeze accounts and trace transactions.'
          break
        case CrimeCategory.HARASSMENT_EXPLOITATION:
          fallbackSummary += ' Priority on victim protection and evidence preservation.'
          break
        case CrimeCategory.MALWARE_SYSTEM:
        case CrimeCategory.TECHNICAL_EXPLOITATION:
          fallbackSummary += ' Technical forensics and system isolation recommended.'
          break
        default:
          fallbackSummary += ' Immediate investigation and evidence collection are recommended.'
      }
      
      return fallbackSummary
    }
  }

  // Get category-specific action focus
  private static getCategoryActionFocus(category: CrimeCategory): string {
    switch (category) {
      case CrimeCategory.FINANCIAL_ECONOMIC:
        return `- Freeze bank accounts and digital wallets
- Contact financial institutions immediately
- Trace money flow and transactions
- Coordinate with BSP and banks
- Preserve transaction records`
        
      case CrimeCategory.HARASSMENT_EXPLOITATION:
        return `- Ensure victim safety and support
- Preserve all communications/messages
- Document harassment patterns
- Identify and locate suspect
- Coordinate with WCPD if needed`
        
      case CrimeCategory.MALWARE_SYSTEM:
      case CrimeCategory.TECHNICAL_EXPLOITATION:
      case CrimeCategory.SYSTEM_DISRUPTION:
        return `- Isolate affected systems immediately
- Capture system logs and memory
- Identify malware/exploit type
- Prevent further spread
- Conduct technical forensics`
        
      case CrimeCategory.DATA_PRIVACY:
        return `- Identify scope of data breach
- Notify affected individuals
- Secure remaining data
- Comply with Data Privacy Act
- Coordinate with NPC`
        
      case CrimeCategory.GOVERNMENT_TERRORISM:
        return `- Alert national security agencies
- Secure critical infrastructure
- Assess threat level
- Coordinate with intelligence units
- Implement emergency protocols`
        
      case CrimeCategory.CONTENT_RELATED:
        return `- Preserve evidence with chain of custody
- Remove illegal content if possible
- Identify victims if applicable
- Track distribution networks
- Handle with sensitivity`
        
      case CrimeCategory.TARGETED_ATTACKS:
        return `- Identify specific targets
- Assess attacker sophistication
- Check for persistence mechanisms
- Review security protocols
- Coordinate with target organization`
        
      default:
        return `- Secure and preserve evidence
- Contact involved parties
- Document incident thoroughly
- Follow standard procedures
- Coordinate with specialized units`
    }
  }

  // Generate action items based on case data
  static async generateActionItems(caseData: CaseDataForSummary): Promise<{
    high: string[]
    medium: string[]
    low: string[]
  }> {
    try {
      console.log('🤖 Generating AI action items for:', caseData.complaint_number)
      
      // Detect crime category
      const category = this.detectCrimeCategory(caseData.crime_type)
      
      // Build dynamic fields list for prompt
      let availableInfo = ''
      if (caseData.platform_website) availableInfo += `Platform: ${caseData.platform_website}\n`
      if (caseData.estimated_loss) availableInfo += `Financial Loss: ₱${caseData.estimated_loss.toLocaleString()}\n`
      if (caseData.suspect_name) availableInfo += `Suspect Identified: Yes\n`
      if (caseData.incident_location) availableInfo += `Location: ${caseData.incident_location}\n`
      if (caseData.technical_info || caseData.system_details) availableInfo += `Technical Details: Available\n`
      if (caseData.evidence_count) availableInfo += `Evidence Files: ${caseData.evidence_count}\n`
      
      const prompt = `
You are generating action items for a Philippine National Police cybercrime investigation.

CASE INFORMATION:
Crime Type: ${caseData.crime_type}
Category: ${category}
Priority: ${caseData.priority}
Status: ${caseData.status}
${availableInfo}

Based on the specific crime type and available information, provide investigation action items.

For ${category}, focus on:
${this.getCategoryActionFocus(category)}

Generate 3 HIGH priority, 3 MEDIUM priority, and 3 LOW priority actions.
Format as JSON: { "high": [], "medium": [], "low": [] }
Each action should be:
- Specific to this crime type
- Under 10 words
- Actionable by PNP officers
- Based on available case information

Example format:
{
  "high": ["Contact victim immediately", "Preserve digital evidence", "Secure crime scene"],
  "medium": ["Interview witnesses", "Check CCTV footage", "Analyze phone records"],
  "low": ["File detailed report", "Update case database", "Schedule follow-up"]
}
`

      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const actionItems = JSON.parse(jsonMatch[0])
        console.log('✅ AI action items generated successfully')
        return actionItems
      }
      
      throw new Error('Could not parse AI response')
      
    } catch (error) {
      console.error('❌ Error generating AI action items:', error)
      
      // Generate category-specific fallback action items
      const category = this.detectCrimeCategory(caseData.crime_type)
      
      switch (category) {
        case CrimeCategory.FINANCIAL_ECONOMIC:
          return {
            high: [
              'Contact banks immediately',
              'Freeze suspect accounts',
              'Trace transaction history'
            ],
            medium: [
              'Gather financial records',
              'Interview bank staff',
              'Check for related accounts'
            ],
            low: [
              'Document losses',
              'Review bank policies',
              'Prepare recovery plan'
            ]
          }
          
        case CrimeCategory.HARASSMENT_EXPLOITATION:
          return {
            high: [
              'Contact victim immediately',
              'Ensure victim safety',
              'Preserve all messages'
            ],
            medium: [
              'Document harassment timeline',
              'Identify suspect location',
              'Collect witness statements'
            ],
            low: [
              'Review protection orders',
              'Update victim regularly',
              'Coordinate with counselors'
            ]
          }
          
        case CrimeCategory.MALWARE_SYSTEM:
        case CrimeCategory.TECHNICAL_EXPLOITATION:
          return {
            high: [
              'Isolate infected systems',
              'Capture system state',
              'Stop active attacks'
            ],
            medium: [
              'Analyze malware samples',
              'Check network logs',
              'Identify entry points'
            ],
            low: [
              'Update security patches',
              'Review system configs',
              'Document vulnerabilities'
            ]
          }
          
        default:
          return {
            high: [
              'Contact victim within 24 hours',
              'Preserve digital evidence',
              'Secure crime scene'
            ],
            medium: [
              'Analyze evidence patterns',
              'Coordinate with units',
              'Interview witnesses'
            ],
            low: [
              'Update documentation',
              'Review procedures',
              'Prepare reports'
            ]
          }
      }
    }
  }

  // Generate intelligent key details for case overview
  static async generateKeyDetails(caseData: CaseDataForSummary): Promise<{
    financialImpact: string
    victimProfile: string
    evidenceAssessment: string
    riskFactors: string
    complexity: string
  }> {
    try {
      console.log('🤖 Generating AI key details for:', caseData.complaint_number)
      
      // Detect crime category
      const category = this.detectCrimeCategory(caseData.crime_type)
      
      // Build available information
      let availableInfo = ''
      if (caseData.estimated_loss) availableInfo += `Financial Loss: ₱${caseData.estimated_loss.toLocaleString()}\n`
      if (caseData.platform_website) availableInfo += `Platform: ${caseData.platform_website}\n`
      if (caseData.suspect_name) availableInfo += `Suspect Known: Yes\n`
      if (caseData.suspect_relationship) availableInfo += `Relationship: ${caseData.suspect_relationship}\n`
      if (caseData.incident_location) availableInfo += `Location: ${caseData.incident_location}\n`
      if (caseData.evidence_count) availableInfo += `Evidence Files: ${caseData.evidence_count}\n`
      if (caseData.system_details || caseData.technical_info) availableInfo += `Technical Details: Available\n`

      const prompt = `
Generate key case details for a Philippine National Police cybercrime investigation.

CASE INFORMATION:
Crime Type: ${caseData.crime_type}
Category: ${category}
Priority: ${caseData.priority}
Description: ${caseData.description.substring(0, 200)}...
${availableInfo}

Generate 5 key insights as brief, professional assessments (under 8 words each):

1. FINANCIAL IMPACT: Assess monetary risk/damage potential
2. VICTIM PROFILE: Analyze victim vulnerability/characteristics  
3. EVIDENCE QUALITY: Evaluate strength of evidence package
4. RISK FACTORS: Identify escalation/safety concerns
5. CASE COMPLEXITY: Assess investigation difficulty

Format as JSON:
{
  "financialImpact": "💰 Brief assessment here",
  "victimProfile": "👥 Brief assessment here", 
  "evidenceAssessment": "📎 Brief assessment here",
  "riskFactors": "🚨 Brief assessment here",
  "complexity": "⚖️ Brief assessment here"
}

Make assessments specific to the crime type and available information.
`

      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const keyDetails = JSON.parse(jsonMatch[0])
        console.log('✅ AI key details generated successfully')
        return keyDetails
      }
      
      throw new Error('Could not parse AI response')
      
    } catch (error) {
      console.error('❌ Error generating AI key details:', error)
      
      // Generate intelligent fallback based on category and available data
      const category = this.detectCrimeCategory(caseData.crime_type)
      
      let financialImpact = '💰 Financial impact to be assessed'
      let victimProfile = '👥 Single victim case'  
      let evidenceAssessment = `📎 ${caseData.evidence_count || 0} evidence files submitted`
      let riskFactors = '🚨 Standard risk assessment needed'
      let complexity = '⚖️ Moderate complexity investigation'
      
      // Category-specific intelligent fallbacks
      switch (category) {
        case CrimeCategory.FINANCIAL_ECONOMIC:
          if (caseData.estimated_loss) {
            financialImpact = `💰 Direct loss: ₱${caseData.estimated_loss.toLocaleString()}`
          } else {
            financialImpact = '💰 High financial risk potential'
          }
          riskFactors = '🚨 Account security compromise risk'
          complexity = '⚖️ Complex financial investigation'
          break
          
        case CrimeCategory.HARASSMENT_EXPLOITATION:
          victimProfile = caseData.suspect_relationship 
            ? `👥 Known suspect: ${caseData.suspect_relationship}`
            : '👥 Vulnerable victim - safety priority'
          riskFactors = '🚨 High escalation risk - victim safety'
          if (caseData.platform_website) {
            evidenceAssessment = `📎 ${caseData.platform_website} evidence collected`
          }
          break
          
        case CrimeCategory.MALWARE_SYSTEM:
        case CrimeCategory.TECHNICAL_EXPLOITATION:
          financialImpact = '💰 System damage and downtime costs'
          riskFactors = '🚨 Ongoing security threat active'
          complexity = '⚖️ High-tech investigation required'
          if (caseData.system_details) {
            evidenceAssessment = '📎 Technical forensics evidence ready'
          }
          break
          
        case CrimeCategory.DATA_PRIVACY:
          victimProfile = '👥 Data breach affecting multiple parties'
          riskFactors = '🚨 Privacy compliance violations'
          complexity = '⚖️ Complex data protection case'
          break
          
        default:
          if (caseData.estimated_loss && caseData.estimated_loss > 0) {
            financialImpact = `💰 Loss reported: ₱${caseData.estimated_loss.toLocaleString()}`
          }
          if (caseData.suspect_name) {
            victimProfile = '👥 Suspect identified - targeted attack'
          }
          if (caseData.evidence_count && caseData.evidence_count > 3) {
            evidenceAssessment = '📎 Strong evidence package available'
          }
      }
      
      return {
        financialImpact,
        victimProfile,
        evidenceAssessment,
        riskFactors,
        complexity
      }
    }
  }

  // Analyze case patterns and connections
  static async analyzeCasePatterns(caseData: CaseDataForSummary): Promise<string> {
    try {
      const prompt = `
Analyze this cybercrime case for patterns and potential connections:

Crime Type: ${caseData.crime_type}
Description: ${caseData.description}
${caseData.platform_website ? `Platform: ${caseData.platform_website}` : ''}
${caseData.suspect_name ? `Suspect: ${caseData.suspect_name}` : ''}

Identify:
1. Common modus operandi patterns
2. Potential links to organized crime
3. Similar case indicators

Keep response brief and focused on investigative value.
`

      const result = await model.generateContent(prompt)
      const response = await result.response
      return response.text()
      
    } catch (error) {
      console.error('❌ Error analyzing patterns:', error)
      return 'Pattern analysis unavailable. Please review case details manually.'
    }
  }
}

export default AIService