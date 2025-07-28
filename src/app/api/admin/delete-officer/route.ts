import { NextRequest, NextResponse } from 'next/server'
import { verifyIdToken, deleteUser } from '@/lib/firebase-admin'
import { supabase } from '@/lib/supabase'

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ DELETE /api/admin/delete-officer called')
    
    // Get authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ Missing or invalid authorization header')
      return NextResponse.json(
        { success: false, error: 'Authorization header required' },
        { status: 401 }
      )
    }

    // Extract and verify admin token
    const idToken = authHeader.replace('Bearer ', '')
    console.log('🔐 Verifying admin token...')
    
    let adminUser
    try {
      adminUser = await verifyIdToken(idToken)
      console.log('✅ Admin token verified:', adminUser.uid)
    } catch (error) {
      console.error('❌ Invalid admin token:', error)
      return NextResponse.json(
        { success: false, error: 'Invalid admin token' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { officerId } = body

    if (!officerId) {
      console.error('❌ Missing officerId in request body')
      return NextResponse.json(
        { success: false, error: 'Officer ID is required' },
        { status: 400 }
      )
    }

    console.log('🔍 Deleting officer with ID:', officerId)

    // First, get the officer data to retrieve firebase_uid
    console.log('📋 Fetching officer data from Supabase...')
    const { data: officer, error: fetchError } = await supabase
      .from('pnp_officer_profiles')
      .select('*')
      .eq('id', officerId)
      .single()

    if (fetchError) {
      console.error('❌ Error fetching officer data:', fetchError)
      return NextResponse.json(
        { success: false, error: `Failed to fetch officer data: ${fetchError.message}` },
        { status: 404 }
      )
    }

    if (!officer) {
      console.error('❌ Officer not found with ID:', officerId)
      return NextResponse.json(
        { success: false, error: 'Officer not found' },
        { status: 404 }
      )
    }

    console.log('✅ Officer found:', officer.full_name, `(${officer.badge_number})`)

    // Step 1: Delete from Firebase Auth (if firebase_uid exists)
    if (officer.firebase_uid) {
      try {
        console.log('🔥 Deleting Firebase Auth user:', officer.firebase_uid)
        await deleteUser(officer.firebase_uid)
        console.log('✅ Firebase Auth user deleted successfully')
      } catch (firebaseError: any) {
        console.error('⚠️ Warning: Firebase Auth deletion failed:', firebaseError.message)
        // Continue with Supabase deletion even if Firebase deletion fails
        // This handles cases where the Firebase user might already be deleted
      }
    } else {
      console.log('⚠️ No firebase_uid found for officer, skipping Firebase Auth deletion')
    }

    // Step 2: Delete from Supabase
    console.log('🗄️ Deleting officer from Supabase database...')
    const { error: deleteError } = await supabase
      .from('pnp_officer_profiles')
      .delete()
      .eq('id', officerId)

    if (deleteError) {
      console.error('❌ Error deleting officer from Supabase:', deleteError)
      return NextResponse.json(
        { success: false, error: `Failed to delete officer: ${deleteError.message}` },
        { status: 500 }
      )
    }

    console.log('✅ Officer deleted successfully from all systems')

    return NextResponse.json({
      success: true,
      message: `Officer ${officer.full_name} (${officer.badge_number}) deleted successfully from both Firebase Auth and database`,
      deletedOfficer: {
        id: officer.id,
        name: officer.full_name,
        badge: officer.badge_number,
        email: officer.email
      }
    })

  } catch (error: any) {
    console.error('💥 Error in delete officer API:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}