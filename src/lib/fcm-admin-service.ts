import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getMessaging, Message, BatchResponse } from 'firebase-admin/messaging';
import { supabase } from './supabase';

// Firebase Admin SDK configuration
const firebaseAdminConfig: ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID!,
  privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
};

// Initialize Firebase Admin SDK (server-side only)
function getFirebaseAdmin() {
  const apps = getApps();
  const adminApp = apps.find(app => app.name === 'admin-fcm');
  
  if (adminApp) {
    return adminApp;
  }
  
  try {
    return initializeApp({
      credential: cert(firebaseAdminConfig),
      projectId: process.env.FIREBASE_PROJECT_ID,
    }, 'admin-fcm');
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error);
    throw new Error(`Failed to initialize Firebase Admin: ${error}`);
  }
}

// Get Firebase Messaging instance
function getMessagingInstance() {
  const app = getFirebaseAdmin();
  return getMessaging(app);
}

// Notification templates for different case status changes
export const NotificationTemplates = {
  CASE_ASSIGNED: (caseNumber: string, officerName: string) => ({
    title: 'Case Under Investigation',
    body: `Officer ${officerName} has been assigned to your cybercrime case ${caseNumber}`,
    data: {
      type: 'case_status_update',
      case_number: caseNumber,
      status: 'Under Investigation',
      notification_category: 'case_update',
    },
  }),
  
  STATUS_UPDATE: (caseNumber: string, oldStatus: string, newStatus: string, officerName: string) => ({
    title: 'Case Status Updated',
    body: `Your case ${caseNumber} status changed from "${oldStatus}" to "${newStatus}" by Officer ${officerName}`,
    data: {
      type: 'case_status_update', 
      case_number: caseNumber,
      status: newStatus,
      notification_category: 'case_update',
    },
  }),

  MORE_INFO_REQUIRED: (caseNumber: string, officerName: string, message?: string) => ({
    title: 'Additional Information Required',
    body: `Officer ${officerName} needs more information for case ${caseNumber}${message ? ': ' + message : ''}`,
    data: {
      type: 'more_info_required',
      case_number: caseNumber,
      status: 'Requires More Info',
      notification_category: 'case_update',
    },
  }),

  CASE_RESOLVED: (caseNumber: string, officerName: string) => ({
    title: 'Case Resolved!',
    body: `Great news! Your cybercrime case ${caseNumber} has been resolved by Officer ${officerName}`,
    data: {
      type: 'case_resolved',
      case_number: caseNumber,
      status: 'Resolved',
      notification_category: 'case_update',
    },
  }),

  CASE_DISMISSED: (caseNumber: string, officerName: string, reason?: string) => ({
    title: 'Case Status Update',
    body: `Your case ${caseNumber} has been dismissed by Officer ${officerName}${reason ? ': ' + reason : ''}`,
    data: {
      type: 'case_dismissed',
      case_number: caseNumber, 
      status: 'Dismissed',
      notification_category: 'case_update',
    },
  }),

  PRIORITY_CHANGED: (caseNumber: string, newPriority: string, officerName: string) => ({
    title: 'Case Priority Updated',
    body: `Your case ${caseNumber} priority has been updated to ${newPriority} by Officer ${officerName}`,
    data: {
      type: 'priority_changed',
      case_number: caseNumber,
      priority: newPriority,
      notification_category: 'case_update',
    },
  }),
};

// Interface for notification payload
export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

// Interface for notification options  
export interface NotificationOptions {
  priority?: 'high' | 'normal';
  sound?: string;
  badge?: number;
  clickAction?: string;
  timeToLive?: number; // TTL in seconds
}

// FCM Admin Service class
export class FCMAdminService {
  private static messaging = getMessagingInstance();

  /**
   * Get FCM token for a specific user from database
   */
  static async getUserFCMToken(userId: string): Promise<string | null> {
    try {
      console.log(`🔍 Getting FCM token for user: ${userId}`);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('fcm_token')
        .eq('firebase_uid', userId)
        .single();

      if (error) {
        console.error(`❌ Error getting FCM token for user ${userId}:`, error);
        return null;
      }

      const token = data?.fcm_token;
      if (!token) {
        console.log(`⚠️ No FCM token found for user: ${userId}`);
        return null;
      }

      console.log(`✅ FCM token found for user: ${userId}`);
      return token;
    } catch (error) {
      console.error(`❌ Exception getting FCM token for user ${userId}:`, error);
      return null;
    }
  }

  /**
   * Get FCM tokens for multiple users
   */
  static async getUsersFCMTokens(userIds: string[]): Promise<{ userId: string; token: string }[]> {
    try {
      console.log(`🔍 Getting FCM tokens for ${userIds.length} users`);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('firebase_uid, fcm_token')
        .in('firebase_uid', userIds);

      if (error) {
        console.error('❌ Error getting multiple FCM tokens:', error);
        return [];
      }

      const tokens = data
        ?.filter(row => row.fcm_token)
        .map(row => ({ userId: row.firebase_uid, token: row.fcm_token })) || [];

      console.log(`✅ Found ${tokens.length} FCM tokens out of ${userIds.length} users`);
      return tokens;
    } catch (error) {
      console.error('❌ Exception getting multiple FCM tokens:', error);
      return [];
    }
  }

  /**
   * Send notification to a single user with retry logic
   */
  static async sendNotificationToUser(
    userId: string,
    notification: NotificationPayload,
    options: NotificationOptions = {}
  ): Promise<boolean> {
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`📱 Sending notification to user: ${userId} (attempt ${attempt}/${maxRetries})`);
        console.log(`📝 Notification: ${notification.title} - ${notification.body}`);

        // Get user's FCM token
        const fcmToken = await this.getUserFCMToken(userId);
        if (!fcmToken) {
          console.log(`⚠️ Cannot send notification - no FCM token for user: ${userId}`);
          return false;
        }

        // Build FCM message
        const message: Message = {
          token: fcmToken,
          notification: {
            title: notification.title,
            body: notification.body,
            imageUrl: notification.imageUrl,
          },
          data: notification.data || {},
          android: {
            priority: options.priority || 'high',
            notification: {
              sound: options.sound || 'default',
              clickAction: options.clickAction,
              channelId: 'lawbot_notifications',
            },
            ttl: options.timeToLive ? options.timeToLive * 1000 : undefined,
          },
          apns: {
            payload: {
              aps: {
                badge: options.badge,
                sound: options.sound || 'default',
              },
            },
          },
        };

        // Send the message
        const response = await this.messaging.send(message);
        console.log(`✅ Successfully sent message to user ${userId}:`, response);
        
        return true;
      } catch (error: any) {
        console.error(`❌ Error sending notification to user ${userId} (attempt ${attempt}):`, error);
        
        // Handle specific FCM errors that don't need retry
        if (error.code === 'messaging/registration-token-not-registered') {
          console.log(`🧹 Cleaning invalid FCM token for user: ${userId}`);
          await this.clearInvalidToken(userId);
          return false; // Don't retry for invalid tokens
        }

        if (error.code === 'messaging/invalid-argument') {
          console.log(`⚠️ Invalid FCM message format for user: ${userId}`);
          return false; // Don't retry for invalid message format
        }

        // Retry for transient errors
        if (attempt < maxRetries && this.isRetryableError(error)) {
          console.log(`🔄 Retrying FCM notification in ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }
        
        return false;
      }
    }

    console.error(`❌ Failed to send FCM notification after ${maxRetries} attempts`);
    return false;
  }

  /**
   * Check if error is retryable (network, rate limit, server errors)
   */
  private static isRetryableError(error: any): boolean {
    const retryableCodes = [
      'messaging/internal-error',
      'messaging/server-unavailable', 
      'messaging/quota-exceeded',
      'messaging/sender-id-mismatch',
    ];

    return retryableCodes.includes(error.code) || 
           error.message?.includes('network') ||
           error.message?.includes('timeout') ||
           (error.status && error.status >= 500);
  }

  /**
   * Send notifications to multiple users
   */
  static async sendNotificationToMultipleUsers(
    userIds: string[],
    notification: NotificationPayload,
    options: NotificationOptions = {}
  ): Promise<{ success: number; failed: number; results: any[] }> {
    try {
      console.log(`📱 Sending notification to ${userIds.length} users`);
      console.log(`📝 Notification: ${notification.title} - ${notification.body}`);

      // Get FCM tokens for all users
      const userTokens = await this.getUsersFCMTokens(userIds);
      if (userTokens.length === 0) {
        console.log('⚠️ No FCM tokens found for any users');
        return { success: 0, failed: userIds.length, results: [] };
      }

      // Build messages for all tokens
      const messages: Message[] = userTokens.map(({ token }) => ({
        token,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl,
        },
        data: notification.data || {},
        android: {
          priority: options.priority || 'high',
          notification: {
            sound: options.sound || 'default',
            clickAction: options.clickAction,
            channelId: 'lawbot_notifications',
          },
          ttl: options.timeToLive ? options.timeToLive * 1000 : undefined,
        },
        apns: {
          payload: {
            aps: {
              badge: options.badge,
              sound: options.sound || 'default',
            },
          },
        },
      }));

      // Send batch messages
      const response: BatchResponse = await this.messaging.sendEach(messages);
      
      console.log(`✅ Batch notification results: ${response.successCount} success, ${response.failureCount} failed`);
      
      // Handle failed messages
      if (response.failureCount > 0) {
        response.responses.forEach((result, index) => {
          if (!result.success) {
            const userId = userTokens[index]?.userId;
            console.error(`❌ Failed to send to user ${userId}:`, result.error);
            
            // Clean invalid tokens
            if (result.error?.code === 'messaging/registration-token-not-registered') {
              this.clearInvalidToken(userId);
            }
          }
        });
      }

      return {
        success: response.successCount,
        failed: response.failureCount,
        results: response.responses,
      };
    } catch (error) {
      console.error('❌ Error sending batch notifications:', error);
      return { success: 0, failed: userIds.length, results: [] };
    }
  }

  /**
   * Send case status update notification
   */
  static async sendCaseStatusNotification(
    userId: string,
    caseNumber: string,
    oldStatus: string | null,
    newStatus: string,
    officerName: string,
    message?: string
  ): Promise<boolean> {
    try {
      let notification: NotificationPayload;

      // Choose appropriate template based on status change
      switch (newStatus) {
        case 'Under Investigation':
          if (oldStatus === 'Pending') {
            notification = NotificationTemplates.CASE_ASSIGNED(caseNumber, officerName);
          } else {
            notification = NotificationTemplates.STATUS_UPDATE(caseNumber, oldStatus || 'Unknown', newStatus, officerName);
          }
          break;
          
        case 'Requires More Info':
          notification = NotificationTemplates.MORE_INFO_REQUIRED(caseNumber, officerName, message);
          break;
          
        case 'Resolved':
          notification = NotificationTemplates.CASE_RESOLVED(caseNumber, officerName);
          break;
          
        case 'Dismissed':
          notification = NotificationTemplates.CASE_DISMISSED(caseNumber, officerName, message);
          break;
          
        default:
          notification = NotificationTemplates.STATUS_UPDATE(caseNumber, oldStatus || 'Unknown', newStatus, officerName);
          break;
      }

      return await this.sendNotificationToUser(userId, notification, { priority: 'high' });
    } catch (error) {
      console.error('❌ Error sending case status notification:', error);
      return false;
    }
  }

  /**
   * Clear invalid FCM token from database
   */
  private static async clearInvalidToken(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ fcm_token: null })
        .eq('firebase_uid', userId);

      if (error) {
        console.error(`❌ Error clearing invalid token for user ${userId}:`, error);
      } else {
        console.log(`🧹 Cleared invalid FCM token for user: ${userId}`);
      }
    } catch (error) {
      console.error(`❌ Exception clearing token for user ${userId}:`, error);
    }
  }

  /**
   * Test FCM service connectivity
   */
  static async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 Testing FCM Admin service connectivity...');
      
      // Try to get the messaging instance
      const messaging = getMessagingInstance();
      
      // This will throw an error if Firebase Admin is not properly configured
      if (messaging) {
        console.log('✅ FCM Admin service is properly configured');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ FCM Admin service test failed:', error);
      return false;
    }
  }
}

export default FCMAdminService;