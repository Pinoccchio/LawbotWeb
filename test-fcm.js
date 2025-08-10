/**
 * FCM Push Notification Test Script
 * 
 * This script tests the end-to-end FCM push notification flow:
 * 1. Tests FCM service connectivity
 * 2. Sends a test push notification
 * 
 * Usage:
 * node test-fcm.js
 */

const BASE_URL = 'http://localhost:3000'; // Update if needed

async function testFCMService() {
  console.log('🧪 Testing FCM Push Notification Service...\n');

  // Test 1: Check FCM service connectivity
  console.log('📋 Test 1: FCM Service Connectivity');
  try {
    const response = await fetch(`${BASE_URL}/api/notifications/send-push`, {
      method: 'GET'
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ FCM Service endpoint is accessible');
      console.log('📝 Response:', result);
    } else {
      console.log('❌ FCM Service endpoint error:', response.status);
    }
  } catch (error) {
    console.log('❌ Error testing FCM service:', error.message);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 2: Send test push notification
  console.log('📋 Test 2: Send Test Push Notification');
  
  // Sample test data (replace with actual values)
  const testNotification = {
    userId: 'T0DOIxDuLHMyifzwUNX9i5BfrJs2', // Replace with actual Firebase UID
    caseNumber: 'CYB-2025-TEST',
    oldStatus: 'Pending',
    newStatus: 'Under Investigation',
    officerName: 'Test Officer',
    message: 'This is a test notification from the FCM integration test',
    notificationType: 'status_update'
  };

  try {
    console.log('📤 Sending test notification with payload:');
    console.log(JSON.stringify(testNotification, null, 2));
    
    const response = await fetch(`${BASE_URL}/api/notifications/send-push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testNotification)
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('\n✅ Test notification sent successfully!');
      console.log('📝 Response:', result);
      
      if (result.notificationSent) {
        console.log('🎉 FCM push notification was delivered!');
      } else {
        console.log('⚠️ Case updated but push notification failed');
      }
      
      if (result.processingTimeMs) {
        console.log(`⚡ Processing time: ${result.processingTimeMs}ms`);
      }
    } else {
      console.log('\n❌ Test notification failed');
      console.log('📝 Error:', result);
    }
  } catch (error) {
    console.log('\n❌ Error sending test notification:', error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('🏁 FCM Test completed!');
  console.log('\nNote: For successful testing, ensure:');
  console.log('1. Next.js dev server is running (npm run dev)');
  console.log('2. Firebase Admin SDK is properly configured');
  console.log('3. Test user has a valid FCM token in database');
  console.log('4. Mobile app is installed and FCM token registered');
}

// Run the test
if (typeof module !== 'undefined' && require.main === module) {
  testFCMService().catch(console.error);
}

module.exports = { testFCMService };