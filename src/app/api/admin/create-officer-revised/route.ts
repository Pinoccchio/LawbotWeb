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
  unitId: string  // Now using unit_id directly instead of unit name
  region: string
}

// Interface for the response
interface CreateOfficerResponse {
  success: boolean
  message: string
  officerId?: string
  error?: string
  debug?: any
}

export async function POST(request: NextRequest): Promise<NextResponse<CreateOfficerResponse>> {
  try {
    console.log('🚀 API: Creating PNP officer account with revised schema...')
    
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
    const { 
      email, password, fullName, phoneNumber, badgeNumber, rank, unitId, region
    } = body
    
    if (!email || !password || !fullName || !badgeNumber || !rank || !unitId || !region) {
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

    // Verify the unit exists and is active
    const { data: unitData, error: unitError } = await supabase
      .from('pnp_units')
      .select('id, unit_name, status, current_officers, max_officers')
      .eq('id', unitId)
      .single()

    if (unitError || !unitData) {
      console.error('💥 Unit verification failed:', unitError)
      return NextResponse.json(
        { success: false, message: 'Invalid unit selected. Please choose a valid unit.', error: 'INVALID_UNIT' },
        { status: 400 }
      )
    }

    if (unitData.status !== 'active') {
      return NextResponse.json(
        { success: false, message: `Unit "${unitData.unit_name}" is not active and cannot accept new officers.`, error: 'INACTIVE_UNIT' },
        { status: 400 }
      )
    }

    // Check if unit has capacity (optional check)
    if (unitData.current_officers >= unitData.max_officers) {
      return NextResponse.json(
        { success: false, message: `Unit "${unitData.unit_name}" is at maximum capacity (${unitData.max_officers} officers).`, error: 'UNIT_FULL' },
        { status: 400 }
      )
    }

    console.log('✅ Unit verified:', {
      unitId: unitData.id,
      unitName: unitData.unit_name,
      currentOfficers: unitData.current_officers,
      maxOfficers: unitData.max_officers
    })

    console.log('👤 Creating Firebase user with Admin SDK...')
    
    // Create user with Firebase Admin SDK (server-side, no client auth affected)
    const firebaseUser = await createUserWithAdmin(email, password, fullName)
    
    console.log('📝 Creating PNP officer profile in Supabase...')
    
    // Create PNP officer profile in Supabase with enhanced availability fields
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
        unit_id: unitId,  // Direct foreign key reference - no lookup needed!
        region: region,
        status: 'active',
        // Simple availability status - default to available for new officers
        availability_status: 'available',
        // Performance metrics
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
      profileId: officerProfile.id,
      unitId: unitId
    })

    // Wait a moment for trigger to execute
    await new Promise(resolve => setTimeout(resolve, 500))

    // Verify the trigger worked by checking updated unit count
    const { data: updatedUnit, error: verifyError } = await supabase
      .from('pnp_units')
      .select('id, unit_name, current_officers')
      .eq('id', unitId)
      .single()

    console.log('🔍 Unit after officer creation:', updatedUnit)

    // Also manually count to verify
    const { data: officersInUnit, error: countError } = await supabase
      .from('pnp_officer_profiles')
      .select('id')
      .eq('unit_id', unitId)
      .eq('status', 'active')
    
    const manualCount = officersInUnit?.length || 0
    console.log('🔍 Manual count of active officers in unit:', manualCount)

    return NextResponse.json({
      success: true,
      message: `PNP Officer created successfully! Badge: ${badgeNumber} assigned to ${unitData.unit_name}`,
      officerId: firebaseUser.uid,
      debug: {
        unitBeforeCreation: {
          id: unitData.id,
          name: unitData.unit_name,
          officersBefore: unitData.current_officers
        },
        unitAfterCreation: {
          id: updatedUnit?.id,
          name: updatedUnit?.unit_name,
          officersAfter: updatedUnit?.current_officers
        },
        manualCount: manualCount,
        triggerWorked: updatedUnit?.current_officers === manualCount
      }
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
    message: 'PNP Officer Creation API (Revised Schema)',
    method: 'POST',
    description: 'Use POST method to create a new PNP officer account with revised database schema',
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
      unitId: 'string (UUID of the PNP unit)',
      region: 'string'
    },
    changes: {
      schema: 'Updated to use unit_id directly instead of unit name lookup',
      triggers: 'Enhanced with logging and active officer filtering',
      validation: 'Added unit capacity and status checks'
    }
  })
}