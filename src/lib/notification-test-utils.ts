import { supabase } from './supabase'
import { PhilippineTime } from './philippine-time'

/**
 * Test utilities for creating sample notifications for PNP officers
 * These match the notification system used in the Flutter mobile app
 */

// Sample notification templates matching Flutter app
const notificationTemplates = [
  {
    title: 'New Case Assigned',
    message: 'You have been assigned to investigate cybercrime case CYB-2025-001. Priority: High',
    type: 'case_assignment' as const,
    priority: 'high' as const,
    notification_category: 'officer_assignment' as const,
    sender_name: 'Case Management System'
  },
  {
    title: 'Case Update Required',
    message: 'Case CYB-2025-002 has been updated by the citizen. Please review the additional information provided.',
    type: 'case_update' as const,
    priority: 'normal' as const,
    notification_category: 'complaint_status' as const,
    sender_name: 'System'
  },
  {
    title: 'Evidence Submitted',
    message: 'New evidence has been uploaded for case CYB-2025-003. Please review the submitted files.',
    type: 'case_update' as const,
    priority: 'normal' as const,
    notification_category: 'complaint_status' as const,
    sender_name: 'Citizen Reporter'
  },
  {
    title: 'Urgent Investigation Required',
    message: 'High-priority case CYB-2025-004 requires immediate attention. Financial fraud reported with ongoing losses.',
    type: 'case_assignment' as const,
    priority: 'urgent' as const,
    notification_category: 'officer_assignment' as const,
    sender_name: 'Duty Officer'
  },
  {
    title: 'Case Status Update',
    message: 'Case CYB-2025-005 status changed to "Under Investigation". Please update your case notes.',
    type: 'case_update' as const,
    priority: 'low' as const,
    notification_category: 'complaint_status' as const,
    sender_name: 'Case Management System'
  }
]

/**
 * Create a sample notification for testing purposes
 * @param officerId - The PNP officer's firebase_uid
 * @param templateIndex - Index of the notification template (0-4)
 * @returns Promise<boolean> - Success status
 */
export async function createSampleNotification(
  officerId: string, 
  templateIndex = 0
): Promise<boolean> {
  try {
    const template = notificationTemplates[templateIndex % notificationTemplates.length]
    
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: officerId,
        ...template,
        created_at: PhilippineTime.toUtc(PhilippineTime.now()).toISOString()
      })

    if (error) {
      console.error('❌ Error creating sample notification:', error)
      return false
    }

    console.log('✅ Sample notification created successfully:', template.title)
    return true
  } catch (error) {
    console.error('❌ Error in createSampleNotification:', error)
    return false
  }
}

/**
 * Create multiple sample notifications for testing
 * @param officerId - The PNP officer's firebase_uid
 * @param count - Number of notifications to create (default: 3)
 * @returns Promise<number> - Number of successfully created notifications
 */
export async function createMultipleSampleNotifications(
  officerId: string,
  count = 3
): Promise<number> {
  let successCount = 0
  
  for (let i = 0; i < count; i++) {
    const success = await createSampleNotification(officerId, i)
    if (success) {
      successCount++
    }
    
    // Small delay between notifications
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  console.log(`✅ Created ${successCount}/${count} sample notifications`)
  return successCount
}

/**
 * Clean up test notifications for an officer
 * @param officerId - The PNP officer's firebase_uid
 * @returns Promise<boolean> - Success status
 */
export async function cleanupTestNotifications(officerId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', officerId)
      .eq('sender_name', 'Case Management System')

    if (error) {
      console.error('❌ Error cleaning up test notifications:', error)
      return false
    }

    console.log('✅ Test notifications cleaned up successfully')
    return true
  } catch (error) {
    console.error('❌ Error in cleanupTestNotifications:', error)
    return false
  }
}

/**
 * Create a notification for case assignment (matches Flutter workflow)
 * @param officerId - The PNP officer's firebase_uid
 * @param caseNumber - The complaint/case number
 * @param priority - Case priority level
 * @returns Promise<boolean> - Success status
 */
export async function createCaseAssignmentNotification(
  officerId: string,
  caseNumber: string,
  priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'
): Promise<boolean> {
  try {
    const priorityEmoji = {
      low: '🟢',
      normal: '🟡', 
      high: '🔴',
      urgent: '🚨'
    }

    const notification = {
      user_id: officerId,
      title: 'New Case Assigned',
      message: `You have been assigned to investigate cybercrime case ${caseNumber}. Priority: ${priority.charAt(0).toUpperCase() + priority.slice(1)} ${priorityEmoji[priority]}`,
      type: 'case_assignment' as const,
      priority,
      notification_category: 'officer_assignment' as const,
      sender_name: 'Case Management System',
      action_url: `/cases/${caseNumber}`,
      created_at: PhilippineTime.toUtc(PhilippineTime.now()).toISOString()
    }

    const { error } = await supabase
      .from('notifications')
      .insert(notification)

    if (error) {
      console.error('❌ Error creating case assignment notification:', error)
      return false
    }

    console.log(`✅ Case assignment notification created for ${caseNumber}`)
    return true
  } catch (error) {
    console.error('❌ Error in createCaseAssignmentNotification:', error)
    return false
  }
}

export default {
  createSampleNotification,
  createMultipleSampleNotifications,
  cleanupTestNotifications,
  createCaseAssignmentNotification
}