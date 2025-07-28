import { NextRequest, NextResponse } from 'next/server'
import { createUserWithAdmin, verifyIdToken } from '@/lib/firebase-admin'
import { supabase } from '@/lib/supabase'

// Interface for the request body
interface CreateOfficerRequest {
  email: string
  password: string
  fullName: string
  phoneNumber?: string
  badgeNumber: string
  rank: string
  unit: string
  region: string
}

// Interface for the response
interface CreateOfficerResponse {
  success: boolean
  message: string
  officerId?: string
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<CreateOfficerResponse>> {
  try {
    console.log('🚀 API: Creating PNP officer account...')
    
    // Get authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Missing or invalid authorization header')
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Missing or invalid token', error: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const idToken = authHeader.split('Bearer ')[1]

    // Verify the admin's ID token
    try {
      const decodedToken = await verifyIdToken(idToken)
      console.log('✅ Admin token verified:', decodedToken.uid)
      
      // Additional check: verify the user is actually an admin in our database
      const { data: adminProfile, error: adminError } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('firebase_uid', decodedToken.uid)
        .single()

      if (adminError || !adminProfile) {
        console.log('❌ User is not an admin:', decodedToken.uid)
        return NextResponse.json(
          { success: false, message: 'Unauthorized: Admin access required', error: 'NOT_ADMIN' },
          { status: 403 }
        )
      }

      console.log('✅ Admin verification successful:', adminProfile.full_name)
    } catch (error) {
      console.log('❌ Token verification failed:', error)
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Invalid token', error: 'INVALID_TOKEN' },
        { status: 401 }
      )
    }

    // Parse request body
    const body: CreateOfficerRequest = await request.json()
    
    // Validate required fields
    const { email, password, fullName, phoneNumber, badgeNumber, rank, unit, region } = body
    
    if (!email || !password || !fullName || !badgeNumber || !rank || !unit || !region) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields', error: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }

    // Validate badge number format (PNP-XXXXX)
    const badgeRegex = /^PNP-\d{5}$/
    if (!badgeRegex.test(badgeNumber)) {
      return NextResponse.json(
        { success: false, message: 'Invalid badge number format. Use PNP-XXXXX', error: 'INVALID_BADGE' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format', error: 'INVALID_EMAIL' },
        { status: 400 }
      )
    }

    // Check if badge number already exists
    const { data: existingOfficer, error: checkError } = await supabase
      .from('pnp_officer_profiles')
      .select('badge_number')
      .eq('badge_number', badgeNumber)
      .single()

    if (existingOfficer) {
      return NextResponse.json(
        { success: false, message: 'Badge number already exists', error: 'BADGE_EXISTS' },
        { status: 409 }
      )
    }

    console.log('👤 Creating Firebase user with Admin SDK...')
    
    // Create user with Firebase Admin SDK (server-side, no client auth affected)
    const firebaseUser = await createUserWithAdmin(email, password, fullName)
    
    console.log('📝 Creating PNP officer profile in Supabase...')
    
    // Create PNP officer profile in Supabase
    const now = new Date().toISOString()
    const { data: officerProfile, error: supabaseError } = await supabase
      .from('pnp_officer_profiles')
      .insert({
        firebase_uid: firebaseUser.uid,
        email: firebaseUser.email,
        full_name: fullName,
        phone_number: phoneNumber || '',
        badge_number: badgeNumber,
        rank: rank,
        unit: unit,
        region: region,
        status: 'active',
        total_cases: 0,
        active_cases: 0,
        resolved_cases: 0,
        success_rate: 0.00,
        created_at: now,
        updated_at: now
      })
      .select()
      .single()

    if (supabaseError) {
      console.error('💥 Supabase error:', supabaseError)
      
      // If Supabase fails, we should clean up the Firebase user
      try {
        const { deleteUser } = await import('@/lib/firebase-admin')
        await deleteUser(firebaseUser.uid)
        console.log('🧹 Cleaned up Firebase user after Supabase error')
      } catch (cleanupError) {
        console.error('💥 Cleanup error:', cleanupError)
      }
      
      return NextResponse.json(
        { success: false, message: 'Failed to create officer profile in database', error: 'DATABASE_ERROR' },
        { status: 500 }
      )
    }

    console.log('✅ PNP officer created successfully:', {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      badge: badgeNumber,
      profileId: officerProfile.id
    })

    return NextResponse.json({
      success: true,
      message: `PNP Officer created successfully! Badge: ${badgeNumber}`,
      officerId: firebaseUser.uid
    })

  } catch (error: any) {
    console.error('💥 API Error creating officer:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error', 
        error: error.message || 'UNKNOWN_ERROR' 
      },
      { status: 500 }
    )
  }
}

// GET method to test the endpoint
export async function GET() {
  return NextResponse.json({
    message: 'PNP Officer Creation API',
    method: 'POST',
    description: 'Use POST method to create a new PNP officer account',
    requiredHeaders: {
      'Authorization': 'Bearer <admin_id_token>',
      'Content-Type': 'application/json'
    },
    requiredBody: {
      email: 'string',
      password: 'string',
      fullName: 'string',
      phoneNumber: 'string (optional)',
      badgeNumber: 'string (PNP-XXXXX format)',
      rank: 'string',
      unit: 'string',
      region: 'string'
    }
  })
}