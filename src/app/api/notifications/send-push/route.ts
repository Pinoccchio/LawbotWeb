import { NextRequest, NextResponse } from 'next/server';
import { FCMAdminService } from '@/lib/fcm-admin-service';

// Interface for the API request body
interface SendPushNotificationRequest {
  userId: string;
  caseNumber: string;
  oldStatus?: string;
  newStatus: string;
  officerName: string;
  message?: string;
  notificationType?: 'status_update' | 'priority_change' | 'officer_message';
}

// Interface for API response
interface SendPushNotificationResponse {
  success: boolean;
  message: string;
  notificationSent?: boolean;
  error?: string;
}

/**
 * POST /api/notifications/send-push
 * 
 * Sends push notification to a user about case status updates
 * 
 * Request body:
 * {
 *   userId: string - Firebase UID of the user to notify
 *   caseNumber: string - Case number (e.g., "CYB-2025-001")
 *   oldStatus?: string - Previous case status
 *   newStatus: string - New case status
 *   officerName: string - Name of the officer making the update
 *   message?: string - Optional message from officer
 *   notificationType?: string - Type of notification
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse<SendPushNotificationResponse>> {
  const startTime = Date.now();
  
  try {
    console.log('🚀 FCM Push Notification API called');
    
    // Parse request body
    const body: SendPushNotificationRequest = await request.json();
    
    // Validate required fields
    const { userId, caseNumber, newStatus, officerName } = body;
    
    if (!userId || !caseNumber || !newStatus || !officerName) {
      console.error('❌ Missing required fields in request body');
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: userId, caseNumber, newStatus, and officerName are required',
      }, { status: 400 });
    }

    console.log(`📱 Sending push notification for case ${caseNumber} to user ${userId}`);
    console.log(`📝 Status change: ${body.oldStatus || 'Unknown'} → ${newStatus}`);
    console.log(`👮 Officer: ${officerName}`);

    // Test FCM service connectivity first with retry
    let serviceReady = false;
    const maxServiceTests = 2;
    
    for (let testAttempt = 1; testAttempt <= maxServiceTests; testAttempt++) {
      console.log(`🔍 Testing FCM service connectivity (attempt ${testAttempt}/${maxServiceTests})...`);
      serviceReady = await FCMAdminService.testConnection();
      
      if (serviceReady) {
        console.log('✅ FCM service is ready');
        break;
      }
      
      if (testAttempt < maxServiceTests) {
        console.log('⚠️ FCM service test failed, retrying in 1 second...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    if (!serviceReady) {
      console.error('❌ FCM Admin service is not properly configured after retries');
      return NextResponse.json({
        success: false,
        message: 'FCM service is not available after retries',
        error: 'Service configuration error',
      }, { status: 500 });
    }

    // Send the notification
    const notificationSent = await FCMAdminService.sendCaseStatusNotification(
      userId,
      caseNumber,
      body.oldStatus || null,
      newStatus,
      officerName,
      body.message
    );

    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    if (notificationSent) {
      console.log(`✅ Push notification sent successfully to user ${userId} in ${processingTime}ms`);
      console.log(`📊 FCM Success: ${caseNumber} → ${newStatus} (${officerName})`);
      
      return NextResponse.json({
        success: true,
        message: 'Push notification sent successfully',
        notificationSent: true,
        processingTimeMs: processingTime,
      });
    } else {
      console.log(`⚠️ Push notification failed to send to user ${userId} after ${processingTime}ms`);
      console.log(`📊 FCM Failed: ${caseNumber} → ${newStatus} (${officerName})`);
      
      return NextResponse.json({
        success: true,
        message: 'Case updated successfully, but push notification could not be delivered',
        notificationSent: false,
        processingTimeMs: processingTime,
      });
    }

  } catch (error: any) {
    console.error('❌ Error in send-push API:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error while sending push notification',
      error: error.message || 'Unknown error',
      notificationSent: false,
    }, { status: 500 });
  }
}

/**
 * GET /api/notifications/send-push/test
 * 
 * Test endpoint to verify FCM service is working
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('🔍 Testing FCM service connectivity...');
    
    const serviceReady = await FCMAdminService.testConnection();
    
    if (serviceReady) {
      return NextResponse.json({
        success: true,
        message: 'FCM Admin service is properly configured and ready',
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'FCM Admin service configuration error',
        timestamp: new Date().toISOString(),
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('❌ Error testing FCM service:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error testing FCM service',
      error: error.message || 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

// Optional: Handle other HTTP methods
export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      'Allow': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}