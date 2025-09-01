import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { PhilippineTime } from "./philippine-time"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getPriorityColor(priority?: string) {
  if (!priority) return "bg-gradient-to-r from-slate-50 to-gray-50 text-slate-800 border-slate-200 dark:from-slate-950/20 dark:to-gray-950/20 dark:text-slate-200 dark:border-slate-800"
  
  switch (priority.toLowerCase()) {
    case "high":
      return "bg-gradient-to-r from-red-50 to-rose-50 text-red-800 border-red-200 dark:from-red-950/20 dark:to-rose-950/20 dark:text-red-200 dark:border-red-800"
    case "medium":
      return "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-800 border-amber-200 dark:from-amber-950/20 dark:to-orange-950/20 dark:text-amber-200 dark:border-amber-800"
    case "low":
      return "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-800 border-emerald-200 dark:from-emerald-950/20 dark:to-green-950/20 dark:text-emerald-200 dark:border-emerald-800"
    default:
      return "bg-gradient-to-r from-slate-50 to-gray-50 text-slate-800 border-slate-200 dark:from-slate-950/20 dark:to-gray-950/20 dark:text-slate-200 dark:border-slate-800"
  }
}

export function getStatusColor(status?: string) {
  if (!status) return "bg-gradient-to-r from-slate-50 to-gray-50 text-slate-800 border-slate-200 dark:from-slate-950/20 dark:to-gray-950/20 dark:text-slate-200 dark:border-slate-800"
  
  switch (status.toLowerCase()) {
    case "to be assigned":
      return "bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-800 border-yellow-200 dark:from-yellow-950/20 dark:to-amber-950/20 dark:text-yellow-200 dark:border-yellow-800"
    case "under investigation":
      return "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 border-blue-200 dark:from-blue-950/20 dark:to-indigo-950/20 dark:text-blue-200 dark:border-blue-800"
    case "requires more info":
    case "requires more information":
      return "bg-gradient-to-r from-orange-50 to-red-50 text-orange-800 border-orange-200 dark:from-orange-950/20 dark:to-red-950/20 dark:text-orange-200 dark:border-orange-800"
    case "resolved":
      return "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-800 border-emerald-200 dark:from-emerald-950/20 dark:to-green-950/20 dark:text-emerald-200 dark:border-emerald-800"
    case "dismissed":
      return "bg-gradient-to-r from-slate-50 to-gray-50 text-slate-800 border-slate-200 dark:from-slate-950/20 dark:to-gray-950/20 dark:text-slate-200 dark:border-slate-800"
    default:
      return "bg-gradient-to-r from-slate-50 to-gray-50 text-slate-800 border-slate-200 dark:from-slate-950/20 dark:to-gray-950/20 dark:text-slate-200 dark:border-slate-800"
  }
}

export function getRiskScoreColor(score: number) {
  if (score >= 80) return "text-red-500"
  if (score >= 50) return "text-amber-500"
  return "text-emerald-500"
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export function formatDate(dateString: string): string {
  // Use Philippine Time utility to convert UTC database time to Philippine time
  return PhilippineTime.formatDatabaseTime(dateString)
}

export function formatDateShort(dateString: string): string {
  // Format date in short format using Philippine time
  return PhilippineTime.formatDatabaseDateShort(dateString)
}

export function formatDateTableDisplay(dateString: string): string {
  // Format date for table display using Philippine time
  return PhilippineTime.formatTableTime(dateString)
}

export function getFileTypeIcon(type: string) {
  switch (type.toLowerCase()) {
    case "document":
    case "pdf":
    case "doc":
    case "docx":
      return "file-document"
    case "image":
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
      return "file-image"
    case "audio":
    case "mp3":
    case "wav":
    case "ogg":
      return "file-audio"
    case "video":
    case "mp4":
    case "avi":
    case "mov":
      return "file-video"
    case "archive":
    case "zip":
    case "rar":
    case "7z":
      return "file-archive"
    default:
      return "file-document"
  }
}

export function generateCaseId(): string {
  // Use Philippine time for case ID generation
  const year = PhilippineTime.now().getFullYear()
  const randomNum = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")
  return `CYB-${year}-${randomNum}`
}

export function calculatePriority(riskScore: number): "high" | "medium" | "low" {
  if (riskScore >= 80) return "high"
  if (riskScore >= 50) return "medium"
  return "low"
}

export function getUnitByCategory(category: string): string {
  const unitMapping: Record<string, string> = {
    financial: "Economic Offenses Wing",
    harassment: "Cyber Crime Against Women and Children",
    phishing: "Cyber Crime Investigation Cell",
    identity: "Cyber Security Division",
    malware: "Cyber Crime Technical Unit",
    content: "Special Investigation Team",
  }

  return unitMapping[category.toLowerCase()] || "Cyber Crime Investigation Cell"
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/\s/g, ""))
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function generateHash(input: string): string {
  // Simple hash function for demo purposes
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return `sha256:${Math.abs(hash).toString(16).padStart(16, "0")}...`
}

/**
 * Extracts complaint ID from case data object with comprehensive fallback logic
 * Handles various data structures from different views (dashboard, cases, modals)
 * @param caseData The case data object (can be selectedCase, complaint data, etc.)
 * @returns The extracted complaint ID or null if not found
 */
export function extractComplaintId(caseData: any): string | null {
  if (!caseData) {
    console.error('❌ extractComplaintId: caseData is null or undefined')
    return null
  }

  console.log('🔍 extractComplaintId: Analyzing caseData structure:', {
    hasComplaint: !!caseData.complaint,
    complaintId: caseData.complaint?.id,
    directComplaintId: caseData.complaint_id,
    directId: caseData.id,
    complaintNumber: caseData.complaint_number,
    nestedComplaintId: caseData.complaint?.complaint_id
  })

  // Try multiple extraction strategies in order of preference:
  // 1. Direct complaint object ID (most common for dashboard views)
  const complaintId = caseData.complaint?.id || 
                     // 2. Direct complaint_id field (alternative structure)
                     caseData.complaint_id || 
                     // 3. Direct id field (simple case data)
                     caseData.id ||
                     // 4. Nested complaint_id within complaint object
                     caseData.complaint?.complaint_id ||
                     // 5. String complaint_number as fallback (ensure it's a string)
                     (typeof caseData.complaint_number === 'string' ? caseData.complaint_number : null)

  if (!complaintId) {
    console.error('❌ extractComplaintId: No valid complaint ID found in caseData')
    console.error('❌ Full caseData structure:', JSON.stringify(caseData, null, 2))
    return null
  }

  console.log('✅ extractComplaintId: Successfully extracted complaint ID:', complaintId)
  return complaintId
}

/**
 * Validates that a complaint ID exists and throws descriptive error if not
 * @param complaintId The complaint ID to validate
 * @param context Context description for error messages
 */
export function validateComplaintId(complaintId: string | null, context: string = 'operation'): string {
  if (!complaintId) {
    const errorMessage = `Complaint ID is required for ${context}. Please select a case first.`
    console.error('❌', errorMessage)
    throw new Error(errorMessage)
  }
  
  console.log('✅ validateComplaintId: Valid complaint ID for', context, ':', complaintId)
  return complaintId
}
