// API route for getting available officers - uses service role key for elevated permissions
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create Supabase client with service role key for elevated permissions
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const unitId = searchParams.get('unitId')
    const crimeType = searchParams.get('crimeType')
    
    console.log('🔍 [API] Getting available officers...', { unitId, crimeType })
    
    // Call RPC function with admin client
    const { data, error } = await supabaseAdmin.rpc('get_available_officers_for_assignment', {
      p_unit_id: unitId || null,
      p_crime_type: crimeType || null
    })
    
    if (error) {
      console.error('❌ [API] RPC error:', error)
      return NextResponse.json(
        { 
          error: 'Failed to fetch officers', 
          details: error.message,
          code: error.code 
        }, 
        { status: 500 }
      )
    }
    
    console.log(`✅ [API] Found ${data?.length || 0} officers`)
    return NextResponse.json({ officers: data || [] })
    
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