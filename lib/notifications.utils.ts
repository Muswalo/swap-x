import { supabase } from './supabase';

export type NotificationType = 
  | 'message_received'
  | 'swap_match'
  | 'swap_interest'
  | 'swap_accepted'
  | 'swap_declined'
  | 'swap_contacted'
  | 'swap_expired'
  | 'profile_view'
  | 'system_alert'
  | 'system_maintenance';

interface NotificationData {
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  priority?: 'low' | 'normal' | 'high';
  swapId?: string;
  fromUserId?: string;
  data?: Record<string, any>;
}

/**
 * Create a notification in the database
 */
export async function createNotification({
  userId,
  title,
  body,
  type,
  priority = 'normal',
  swapId,
  fromUserId,
  data,
}: NotificationData) {
  try {
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        body,
        notification_type: type,
        priority,
        swap_id: swapId,
        from_user_id: fromUserId,
        data,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    // Send push notification
    await sendPushNotification(userId, title, body, { swapId, fromUserId, type, ...data });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

/**
 * Send push notification via Expo Push API
 */
async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, any>
) {
  try {
    // Get user's push tokens
    const { data: tokens, error } = await supabase
      .from('notification_tokens')
      .select('expo_push_token')
      .eq('user_id', userId);

    if (error) throw error;
    if (!tokens || tokens.length === 0) return;

    // Check user's notification preferences
    const { data: settings } = await supabase
      .from('user_settings')
      .select('push_notifications, message_notifications, match_notifications')
      .eq('user_id', userId)
      .single();

    // Check if user has notifications enabled
    if (!settings?.push_notifications) return;

    // Check specific notification type preferences
    if (data?.type === 'message_received' && !settings?.message_notifications) return;
    if (data?.type === 'swap_match' && !settings?.match_notifications) return;

    // Send to all user's devices
    const messages = tokens.map(token => ({
      to: token.expo_push_token,
      sound: 'default',
      title,
      body,
      data,
      priority: 'high',
    }));

    // Send via Expo Push API
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    const result = await response.json();
    console.log('Push notification sent:', result);
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
}

/**
 * Notify user about a new message
 */
export async function notifyNewMessage(
  recipientId: string,
  senderId: string,
  senderName: string,
  messagePreview: string
) {
  return createNotification({
    userId: recipientId,
    title: `New message from ${senderName}`,
    body: messagePreview,
    type: 'message_received',
    priority: 'high',
    fromUserId: senderId,
  });
}

/**
 * Notify user about a potential swap match
 */
export async function notifySwapMatch(
  userId: string,
  swapId: string,
  matchDetails: string
) {
  return createNotification({
    userId,
    title: 'Potential Swap Match!',
    body: matchDetails,
    type: 'swap_match',
    priority: 'high',
    swapId,
  });
}

/**
 * Notify user about interest in their swap
 */
export async function notifySwapInterest(
  swapOwnerId: string,
  interestedUserId: string,
  interestedUserName: string,
  swapId: string
) {
  return createNotification({
    userId: swapOwnerId,
    title: 'Someone is interested in your swap!',
    body: `${interestedUserName} expressed interest in your swap posting`,
    type: 'swap_interest',
    priority: 'high',
    swapId,
    fromUserId: interestedUserId,
  });
}

/**
 * Notify user that their swap interest was accepted
 */
export async function notifySwapAccepted(
  userId: string,
  swapOwnerId: string,
  swapOwnerName: string,
  swapId: string
) {
  return createNotification({
    userId,
    title: 'Swap Interest Accepted!',
    body: `${swapOwnerName} accepted your interest in their swap`,
    type: 'swap_accepted',
    priority: 'high',
    swapId,
    fromUserId: swapOwnerId,
  });
}

/**
 * Notify user that their swap interest was declined
 */
export async function notifySwapDeclined(
  userId: string,
  swapOwnerId: string,
  swapOwnerName: string,
  swapId: string
) {
  return createNotification({
    userId,
    title: 'Swap Interest Update',
    body: `${swapOwnerName} declined your interest in their swap`,
    type: 'swap_declined',
    priority: 'normal',
    swapId,
    fromUserId: swapOwnerId,
  });
}

/**
 * Notify user when someone contacts them about a swap
 */
export async function notifySwapContacted(
  swapOwnerId: string,
  contacterId: string,
  contacterName: string,
  swapId: string
) {
  return createNotification({
    userId: swapOwnerId,
    title: 'New Swap Inquiry',
    body: `${contacterName} wants to discuss your swap`,
    type: 'swap_contacted',
    priority: 'high',
    swapId,
    fromUserId: contacterId,
  });
}

/**
 * Get user's notification preferences
 */
export async function getNotificationPreferences(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('push_notifications, email_notifications, match_notifications, message_notifications, marketing_notifications')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    return null;
  }
}

/**
 * Update user's notification preferences
 */
export async function updateNotificationPreferences(
  userId: string,
  preferences: {
    push_notifications?: boolean;
    email_notifications?: boolean;
    match_notifications?: boolean;
    message_notifications?: boolean;
    marketing_notifications?: boolean;
  }
) {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .update(preferences)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    throw error;
  }
}
