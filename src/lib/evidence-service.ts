// Evidence Service - Real Supabase Database Implementation
// This service provides real database operations for evidence file management

import { supabase } from './supabase'

// Define types for evidence files (matching database schema)
export interface EvidenceFile {
  id: string
  complaint_id: string
  file_name: string
  file_path: string
  file_type: string
  file_size: number
  download_url?: string
  uploaded_at: string
  created_at: string
  uploaded_by?: string
  is_valid?: boolean
  validation_notes?: string
  // Joined complaint data
  complaint?: {
    complaint_number: string
    title?: string
    crime_type: string
    status: string
    priority: string
    assigned_officer?: string
    assigned_unit?: string
  }
}

export interface EvidenceFilters {
  searchTerm?: string
  fileType?: 'all' | 'image' | 'document' | 'video' | 'audio'
  caseId?: string
  uploadDateFrom?: string
  uploadDateTo?: string
  status?: 'all' | 'valid' | 'invalid'
  limit?: number
  offset?: number
  sortBy?: 'date' | 'name' | 'size' | 'type'
  sortOrder?: 'asc' | 'desc'
}

export interface EvidenceStats {
  totalFiles: number
  totalSize: number
  filesByType: {
    images: number
    documents: number
    videos: number
    audio: number
    other: number
  }
  filesByStatus: {
    valid: number
    invalid: number
    pending: number
  }
}

export class EvidenceService {
  // Get evidence files with optional filters
  static async getEvidenceFiles(filters: EvidenceFilters = {}): Promise<EvidenceFile[]> {
    try {
      console.log('🔄 Fetching evidence files with filters:', filters)
      
      // First try without join to avoid potential foreign key issues
      let query = supabase
        .from('evidence_files')
        .select('*')
      
      // Apply search filter (without complaint join)
      if (filters.searchTerm) {
        query = query.ilike('file_name', `%${filters.searchTerm}%`)
      }
      
      // Apply file type filter
      if (filters.fileType && filters.fileType !== 'all') {
        const typePatterns: Record<string, string[]> = {
          image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
          document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
          video: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'],
          audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4']
        }
        
        if (typePatterns[filters.fileType]) {
          query = query.in('file_type', typePatterns[filters.fileType])
        }
      }
      
      // Apply case ID filter
      if (filters.caseId) {
        query = query.eq('complaint_id', filters.caseId)
      }
      
      // Apply date range filters
      if (filters.uploadDateFrom) {
        query = query.gte('uploaded_at', filters.uploadDateFrom)
      }
      if (filters.uploadDateTo) {
        query = query.lte('uploaded_at', filters.uploadDateTo)
      }
      
      // Apply validation status filter
      if (filters.status && filters.status !== 'all') {
        query = query.eq('is_valid', filters.status === 'valid')
      }
      
      // Apply sorting
      const sortColumn = filters.sortBy === 'date' ? 'uploaded_at' :
                        filters.sortBy === 'name' ? 'file_name' :
                        filters.sortBy === 'size' ? 'file_size' :
                        filters.sortBy === 'type' ? 'file_type' : 'uploaded_at'
      
      query = query.order(sortColumn, { ascending: filters.sortOrder === 'asc' })
      
      // Apply pagination
      if (filters.limit) {
        query = query.limit(filters.limit)
      }
      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1)
      }
      
      const { data, error } = await query
      
      if (error) {
        console.error('❌ Error fetching evidence files:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        // Return empty array instead of throwing
        return []
      }
      
      if (!data || data.length === 0) {
        console.log('ℹ️ No evidence files found')
        return []
      }
      
      console.log(`✅ Fetched ${data.length} evidence files`)
      
      // Enrich with complaint data separately
      const enrichedFiles = await Promise.all(
        data.map(async (file) => {
          let complaintData = undefined
          
          // Try to fetch complaint data if we have a complaint_id
          if (file.complaint_id) {
            try {
              const { data: complaint } = await supabase
                .from('complaints')
                .select('complaint_number, title, crime_type, status, priority, assigned_officer, assigned_unit')
                .eq('id', file.complaint_id)
                .single()
              
              if (complaint) {
                complaintData = complaint
              }
            } catch (err) {
              // Ignore errors for individual complaint fetches
              console.log(`⚠️ Could not fetch complaint data for ${file.complaint_id}`)
            }
          }
          
          return {
            id: file.id,
            complaint_id: file.complaint_id,
            file_name: file.file_name,
            file_path: file.file_path,
            file_type: file.file_type,
            file_size: file.file_size,
            download_url: file.download_url,
            uploaded_at: file.uploaded_at,
            created_at: file.created_at,
            uploaded_by: file.uploaded_by,
            is_valid: file.is_valid,
            validation_notes: file.validation_notes,
            complaint: complaintData
          }
        })
      )
      
      return enrichedFiles
    } catch (error) {
      console.error('❌ Unexpected error in getEvidenceFiles:', error)
      // Return empty array instead of throwing to prevent UI crashes
      return []
    }
  }
  
  // Get single evidence file details
  static async getEvidenceFileDetails(fileId: string): Promise<EvidenceFile | null> {
    try {
      console.log('🔄 Fetching evidence file details:', fileId)
      
      const { data, error } = await supabase
        .from('evidence_files')
        .select(`
          *,
          complaints (
            complaint_number,
            title,
            crime_type,
            status,
            priority,
            assigned_officer,
            assigned_unit
          )
        `)
        .eq('id', fileId)
        .single()
      
      if (error) {
        console.error('❌ Error fetching evidence file details:', error)
        return null
      }
      
      if (!data) {
        return null
      }
      
      console.log('✅ Evidence file details fetched')
      
      return {
        id: data.id,
        complaint_id: data.complaint_id,
        file_name: data.file_name,
        file_path: data.file_path,
        file_type: data.file_type,
        file_size: data.file_size,
        download_url: data.download_url,
        uploaded_at: data.uploaded_at,
        created_at: data.created_at,
        uploaded_by: data.uploaded_by,
        is_valid: data.is_valid,
        validation_notes: data.validation_notes,
        complaint: data.complaints ? {
          complaint_number: data.complaints.complaint_number,
          title: data.complaints.title,
          crime_type: data.complaints.crime_type,
          status: data.complaints.status,
          priority: data.complaints.priority,
          assigned_officer: data.complaints.assigned_officer,
          assigned_unit: data.complaints.assigned_unit
        } : undefined
      }
    } catch (error) {
      console.error('❌ Error in getEvidenceFileDetails:', error)
      return null
    }
  }
  
  // Generate secure download URL for evidence file
  static async downloadEvidence(fileId: string): Promise<string | null> {
    try {
      console.log('🔄 Generating download URL for evidence:', fileId)
      
      // First get the file details to get the file path
      const fileDetails = await this.getEvidenceFileDetails(fileId)
      
      if (!fileDetails) {
        console.error('❌ Evidence file not found')
        return null
      }
      
      // If download URL is already stored, return it
      if (fileDetails.download_url) {
        console.log('✅ Using existing download URL')
        return fileDetails.download_url
      }
      
      // Generate a new download URL from Supabase storage
      // Assuming file_path contains the storage path
      const { data, error } = supabase.storage
        .from('evidence-files')
        .createSignedUrl(fileDetails.file_path, 3600) // 1 hour expiry
      
      if (error) {
        console.error('❌ Error generating download URL:', error)
        return null
      }
      
      console.log('✅ Download URL generated')
      return data?.signedUrl || null
    } catch (error) {
      console.error('❌ Error in downloadEvidence:', error)
      return null
    }
  }
  
  // Get evidence statistics
  static async getEvidenceStats(): Promise<EvidenceStats> {
    try {
      console.log('🔄 Fetching evidence statistics...')
      
      const { data, error } = await supabase
        .from('evidence_files')
        .select('file_type, file_size, is_valid')
      
      if (error) {
        console.error('❌ Error fetching evidence stats:', error)
        throw error
      }
      
      const files = data || []
      
      // Calculate statistics
      const stats: EvidenceStats = {
        totalFiles: files.length,
        totalSize: files.reduce((sum, file) => sum + (file.file_size || 0), 0),
        filesByType: {
          images: 0,
          documents: 0,
          videos: 0,
          audio: 0,
          other: 0
        },
        filesByStatus: {
          valid: 0,
          invalid: 0,
          pending: 0
        }
      }
      
      // Count files by type and status
      files.forEach(file => {
        // Count by type
        if (file.file_type?.startsWith('image/')) {
          stats.filesByType.images++
        } else if (file.file_type?.includes('pdf') || file.file_type?.includes('document') || file.file_type?.includes('msword')) {
          stats.filesByType.documents++
        } else if (file.file_type?.startsWith('video/')) {
          stats.filesByType.videos++
        } else if (file.file_type?.startsWith('audio/')) {
          stats.filesByType.audio++
        } else {
          stats.filesByType.other++
        }
        
        // Count by status
        if (file.is_valid === true) {
          stats.filesByStatus.valid++
        } else if (file.is_valid === false) {
          stats.filesByStatus.invalid++
        } else {
          stats.filesByStatus.pending++
        }
      })
      
      console.log('✅ Evidence statistics calculated:', stats)
      return stats
    } catch (error) {
      console.error('❌ Error in getEvidenceStats:', error)
      throw error
    }
  }
  
  // Get evidence files for a specific officer's cases
  static async getOfficerEvidenceFiles(officerId: string): Promise<EvidenceFile[]> {
    try {
      console.log('🔄 Fetching evidence files for officer:', officerId)
      
      // First get all complaints assigned to this officer
      const { data: complaints, error: complaintsError } = await supabase
        .from('complaints')
        .select('id')
        .eq('assigned_officer_id', officerId)
      
      if (complaintsError) {
        console.error('❌ Error fetching officer complaints:', {
          message: complaintsError.message,
          details: complaintsError.details,
          hint: complaintsError.hint,
          code: complaintsError.code
        })
        throw new Error(`Failed to fetch officer complaints: ${complaintsError.message}`)
      }
      
      if (!complaints || complaints.length === 0) {
        console.log('ℹ️ No complaints found for officer:', officerId)
        return []
      }
      
      const complaintIds = complaints.map(c => c.id)
      console.log(`📋 Found ${complaintIds.length} complaints for officer`)
      
      // Now get all evidence files for these complaints
      // First try without join to avoid foreign key issues
      const { data: evidenceFiles, error } = await supabase
        .from('evidence_files')
        .select('*')
        .in('complaint_id', complaintIds)
        .order('uploaded_at', { ascending: false })
      
      if (error) {
        console.error('❌ Error fetching officer evidence files:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          complaintIds: complaintIds
        })
        
        // If the query fails, return empty array instead of throwing
        console.log('⚠️ Falling back to empty array due to error')
        return []
      }
      
      if (!evidenceFiles || evidenceFiles.length === 0) {
        console.log('ℹ️ No evidence files found for officer complaints')
        return []
      }
      
      console.log(`✅ Fetched ${evidenceFiles.length} evidence files for officer`)
      
      // Enrich with complaint data separately to avoid join issues
      const enrichedFiles = await Promise.all(
        evidenceFiles.map(async (file) => {
          let complaintData = undefined
          
          try {
            // Try to fetch complaint data separately
            const { data: complaint } = await supabase
              .from('complaints')
              .select('complaint_number, title, crime_type, status, priority, assigned_officer, assigned_unit')
              .eq('id', file.complaint_id)
              .single()
            
            if (complaint) {
              complaintData = complaint
            }
          } catch (err) {
            // Ignore errors for individual complaint fetches
            console.log(`⚠️ Could not fetch complaint data for ${file.complaint_id}`)
          }
          
          return {
            id: file.id,
            complaint_id: file.complaint_id,
            file_name: file.file_name,
            file_path: file.file_path,
            file_type: file.file_type,
            file_size: file.file_size,
            download_url: file.download_url,
            uploaded_at: file.uploaded_at,
            created_at: file.created_at,
            uploaded_by: file.uploaded_by,
            is_valid: file.is_valid,
            validation_notes: file.validation_notes,
            complaint: complaintData
          }
        })
      )
      
      return enrichedFiles
    } catch (error) {
      console.error('❌ Error in getOfficerEvidenceFiles:', {
        error: error instanceof Error ? error.message : error,
        officerId: officerId
      })
      // Return empty array instead of throwing to prevent UI crashes
      return []
    }
  }
}

export default EvidenceService