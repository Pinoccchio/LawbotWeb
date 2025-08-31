// API route for assigning officers - uses service role key for elevated permissions
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create Supabase client with service role key for elevated permissions
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { complaintId, officerId, adminId, notes } = body
    
    console.log('👮 [API] Assigning officer...', { complaintId, officerId, adminId })
    
    // Validate required parameters
    if (!complaintId || !officerId || !adminId) {
      return NextResponse.json(
        { 
          error: 'Missing required parameters', 
          required: ['complaintId', 'officerId', 'adminId'] 
        }, 
        { status: 400 }
      )
    }
    
    // Call RPC function with admin client
    const { data, error } = await supabaseAdmin.rpc('assign_case_to_officer', {
      p_complaint_id: complaintId,
      p_officer_id: officerId,
      p_admin_id: adminId,
      p_reason: notes || 'Case assigned via web interface'
    })
    
    if (error) {
      console.error('❌ [API] Assignment RPC error:', error)
      return NextResponse.json(
        { 
          error: 'Failed to assign officer', 
          details: error.message,
          code: error.code 
        }, 
        { status: 500 }
      )
    }
    
    // Parse result if it's a string
    const result = typeof data === 'string' ? JSON.parse(data) : data
    
    if (!result.success) {
      console.error('❌ [API] Assignment failed:', result.error)
      return NextResponse.json(
        { 
          error: result.error || 'Assignment failed',
          success: false 
        }, 
        { status: 400 }
      )
    }
    
    console.log('✅ [API] Assignment successful:', result)
    return NextResponse.json({
      success: true,
      assignment_id: result.assignment_id,
      officer_name: result.officer_name,
      message: result.message,
      complaint_number: result.complaint_number
    })
    
  } catch (error: any) {
    console.error('❌ [API] Exception:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error.message 
      }, 
      { status: 500 }
    )
  }
}