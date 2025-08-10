import { NextRequest, NextResponse } from 'next/server'
import * as admin from 'firebase-admin'
import { supabase } from '@/lib/supabase'

// Initialize Firebase Admin SDK (if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  })
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const body = await request.json()
    console.log('🔔 [Test Push API] Request received:', JSON.stringify(body, null, 2))

    const { userId, title, body: messageBody, data } = body

    // Input validation
    if (!userId) {
      console.error('❌ [Test Push API] Missing userId')
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      )
    }

    if (!title || !messageBody) {
      console.error('❌ [Test Push API] Missing title or message body')
      return NextResponse.json(
        { success: false, message: 'Title and message body are required' },
        { status: 400 }
      )
    }

    console.log('🔍 [Test Push API] Looking up FCM token for user:', userId)

    // Get FCM token from Supabase
    let fcmToken: string | null = null
    
    try {
      console.log('🔄 [Test Push API] Querying Supabase for FCM token...')
      const { data, error } = await supabase
        .from('user_profiles')
        .select('fcm_token')
        .eq('firebase_uid', userId)
        .single()

      if (error) {
        console.error('❌ [Test Push API] Supabase error:', error)
        throw new Error(`Database error: ${error.message}`)
      }

      fcmToken = data?.fcm_token
      console.log('✅ [Test Push API] FCM token query successful. Token exists:', !!fcmToken)
      
    } catch (dbError) {
      console.error('❌ [Test Push API] Database error fetching FCM token:', dbError)
      return NextResponse.json(
        { success: false, message: 'Failed to fetch user FCM token from database' },
        { status: 500 }
      )
    }

    if (!fcmToken) {
      console.log('⚠️ [Test Push API] No FCM token found for user:', userId)
      return NextResponse.json(
        { success: false, message: 'User does not have a valid FCM token' },
        { status: 404 }
      )
    }

    console.log('📱 [Test Push API] FCM token found:', fcmToken ? fcmToken.substring(0, 20) + '...' : 'null')

    // Prepare notification message
    const message = {
      token: fcmToken,
      notification: {
        title: title,
        body: messageBody,
      },
      data: {
        type: 'test_notification',
        test_id: `test_${Date.now()}`,
        sent_from: 'admin_portal',
        timestamp: new Date().toISOString(),
        ...(data || {})
      },
      android: {
        notification: {
          channelId: 'lawbot_notifications',
          priority: 'high' as const,
        },
      },
      apns: {
        payload: {
          aps: {
            badge: 1,
            sound: 'default',
          },
        },
      },
    }

    console.log('📤 [Test Push API] Sending FCM message:', JSON.stringify(message, null, 2))

    // Send the notification
    const response = await admin.messaging().send(message)
    console.log('✅ [Test Push API] FCM response:', response)

    const processingTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      message: 'Test push notification sent successfully!',
      data: {
        messageId: response,
        userId: userId,
        title: title,
        body: messageBody,
        fcmTokenPreview: fcmToken.substring(0, 20) + '...',
        sentAt: new Date().toISOString(),
        processingTimeMs: processingTime
      }
    })

  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('❌ [Test Push API] Error sending test notification:', error)
    
    // Handle specific FCM errors
    let errorMessage = 'Failed to send test push notification'
    
    if (error instanceof Error) {
      if (error.message.includes('invalid-registration-token')) {
        errorMessage = 'Invalid or expired FCM token'
      } else if (error.message.includes('not-found')) {
        errorMessage = 'FCM token not found or app uninstalled'
      } else if (error.message.includes('message-rate-exceeded')) {
        errorMessage = 'Message rate exceeded, please try again later'
      } else {
        errorMessage = `FCM Error: ${error.message}`
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        message: errorMessage,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTimeMs: processingTime
      },
      { status: 500 }
    )
  }
}