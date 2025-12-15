// Messaging utility functions for conversation and message management
import type {
    Conversation,
    Message,
    MessageInsert,
    MessageWithSender,
    Profile
} from './database.types';
import { conversationUtils, messageUtils, profileUtils } from './database.utils';
import { notifyNewMessage } from './notifications.utils';
import { supabase } from './supabase';

// ============================================================================
// CONVERSATION MANAGEMENT
// ============================================================================

export interface ConversationListItem extends Conversation {
  otherParticipant: Profile;
  lastMessage?: Message;
  unreadCount: number;
}

export const messagingUtils = {
  /**
   * Get or create a conversation between the current user and another user
   * @param currentUserId - The current user's ID
   * @param otherUserId - The other user's ID
   * @param swapId - Optional swap ID to associate with the conversation
   * @returns The conversation ID or null if failed
   */
  async startConversation(
    currentUserId: string,
    otherUserId: string,
    swapId?: string
  ): Promise<string | null> {
    return await conversationUtils.getOrCreateConversation(currentUserId, otherUserId, swapId);
  },

  /**
   * Get all conversations for the current user with enriched data
   * @param userId - The current user's ID
   * @returns Array of conversations with participant info and last message
   */
  async getConversationList(userId: string): Promise<ConversationListItem[]> {
    const conversations = await conversationUtils.getUserConversations(userId);

    const enrichedConversations: ConversationListItem[] = [];

    for (const conv of conversations) {
      // Determine which participant is the "other" user
      const otherParticipant =
        conv.participant_1_id === userId ? conv.participant_2 : conv.participant_1;

      // Get the last message
      const messages = conv.messages || [];
      const lastMessage = messages.length > 0 ? messages[messages.length - 1] : undefined;

      // Count unread messages (messages not sent by current user and not read)
      const unreadCount = messages.filter(
        (msg) => msg.sender_id !== userId && !msg.read_at
      ).length;

      enrichedConversations.push({
        ...conv,
        otherParticipant,
        lastMessage,
        unreadCount,
      });
    }

    return enrichedConversations;
  },

  /**
   * Get conversation details with messages
   * @param conversationId - The conversation ID
   * @param currentUserId - The current user's ID
   * @returns Conversation with messages and participant info
   */
  async getConversationDetails(
    conversationId: string,
    currentUserId: string
  ): Promise<{
    conversation: Conversation;
    messages: MessageWithSender[];
    otherParticipant: Profile | null;
  } | null> {
    const conversation = await conversationUtils.getConversation(conversationId);
    if (!conversation) return null;

    const messages = await messageUtils.getMessages(conversationId);

    // Get the other participant's profile
    const otherParticipantId =
      conversation.participant_1_id === currentUserId
        ? conversation.participant_2_id
        : conversation.participant_1_id;

    const otherParticipant = await profileUtils.getProfile(otherParticipantId);

    return {
      conversation,
      messages,
      otherParticipant,
    };
  },

  // ============================================================================
  // MESSAGE OPERATIONS
  // ============================================================================

  /**
   * Send a text message in a conversation
   * @param conversationId - The conversation ID
   * @param senderId - The sender's user ID
   * @param content - The message content
   * @returns The created message or null if failed
   */
  async sendTextMessage(
    conversationId: string,
    senderId: string,
    content: string
  ): Promise<Message | null> {
    const messageData: MessageInsert = {
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      message_type: 'text',
    };

    const message = await messageUtils.sendMessage(messageData);

    // Update conversation's last_message_at timestamp
    if (message) {
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

      // Get conversation details to find recipient
      const { data: conversation } = await supabase
        .from('conversations')
        .select('participant_1_id, participant_2_id')
        .eq('id', conversationId)
        .single();

      if (conversation) {
        const recipientId = conversation.participant_1_id === senderId 
          ? conversation.participant_2_id 
          : conversation.participant_1_id;

        // Get sender profile for notification
        const senderProfile = await profileUtils.getProfile(senderId);
        if (senderProfile) {
          const senderName = `${senderProfile.first_name} ${senderProfile.last_name}`;
          const messagePreview = content.length > 50 ? `${content.substring(0, 50)}...` : content;
          
          // Send notification to recipient
          await notifyNewMessage(recipientId, senderId, senderName, messagePreview);
        }
      }
    }

    return message;
  },

  /**
   * Send a system message in a conversation
   * @param conversationId - The conversation ID
   * @param senderId - The sender's user ID
   * @param content - The system message content
   * @returns The created message or null if failed
   */
  async sendSystemMessage(
    conversationId: string,
    senderId: string,
    content: string
  ): Promise<Message | null> {
    const messageData: MessageInsert = {
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      message_type: 'system',
    };

    return await messageUtils.sendMessage(messageData);
  },

  /**
   * Mark a specific message as read
   * @param messageId - The message ID
   * @returns True if successful
   */
  async markMessageAsRead(messageId: string): Promise<boolean> {
    return await messageUtils.markAsRead(messageId);
  },

  /**
   * Mark all messages in a conversation as read for the current user
   * @param conversationId - The conversation ID
   * @param currentUserId - The current user's ID
   * @returns True if successful
   */
  async markConversationAsRead(conversationId: string, currentUserId: string): Promise<boolean> {
    return await messageUtils.markConversationAsRead(conversationId, currentUserId);
  },

  /**
   * Get total unread message count for a user across all conversations
   * @param userId - The user's ID
   * @returns The total unread count
   */
  async getTotalUnreadCount(userId: string): Promise<number> {
    return await messageUtils.getUnreadCount(userId);
  },

  /**
   * Get unread count for a specific conversation
   * @param conversationId - The conversation ID
   * @param currentUserId - The current user's ID
   * @returns The unread count for this conversation
   */
  async getConversationUnreadCount(
    conversationId: string,
    currentUserId: string
  ): Promise<number> {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', currentUserId)
      .is('read_at', null);

    if (error) {
      console.error('Error getting conversation unread count:', error);
      return 0;
    }
    return count || 0;
  },

  // ============================================================================
  // MESSAGE STATUS TRACKING
  // ============================================================================

  /**
   * Check if a message has been delivered (exists in database)
   * @param messageId - The message ID
   * @returns True if message exists
   */
  async isMessageDelivered(messageId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('messages')
      .select('id')
      .eq('id', messageId)
      .single();

    return !error && !!data;
  },

  /**
   * Check if a message has been read
   * @param messageId - The message ID
   * @returns True if message has been read
   */
  async isMessageRead(messageId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('messages')
      .select('read_at')
      .eq('id', messageId)
      .single();

    return !error && !!data?.read_at;
  },

  /**
   * Get message status (sent, delivered, read)
   * @param messageId - The message ID
   * @returns Status string
   */
  async getMessageStatus(messageId: string): Promise<'sent' | 'delivered' | 'read' | 'unknown'> {
    const { data, error } = await supabase
      .from('messages')
      .select('id, read_at')
      .eq('id', messageId)
      .single();

    if (error || !data) return 'unknown';
    if (data.read_at) return 'read';
    return 'delivered';
  },

  // ============================================================================
  // CONVERSATION SEARCH AND FILTERING
  // ============================================================================

  /**
   * Search conversations by participant name or last message content
   * @param userId - The current user's ID
   * @param searchQuery - The search query
   * @returns Filtered conversations
   */
  async searchConversations(
    userId: string,
    searchQuery: string
  ): Promise<ConversationListItem[]> {
    const allConversations = await this.getConversationList(userId);

    const query = searchQuery.toLowerCase();

    return allConversations.filter((conv) => {
      const participantName =
        `${conv.otherParticipant.first_name} ${conv.otherParticipant.last_name}`.toLowerCase();
      const lastMessageContent = conv.lastMessage?.content.toLowerCase() || '';

      return participantName.includes(query) || lastMessageContent.includes(query);
    });
  },

  /**
   * Get conversations with unread messages only
   * @param userId - The current user's ID
   * @returns Conversations with unread messages
   */
  async getUnreadConversations(userId: string): Promise<ConversationListItem[]> {
    const allConversations = await this.getConversationList(userId);
    return allConversations.filter((conv) => conv.unreadCount > 0);
  },

  // ============================================================================
  // REAL-TIME FEATURES
  // ============================================================================

  /**
   * Subscribe to new messages in a conversation
   * @param conversationId - The conversation ID
   * @param onNewMessage - Callback for new messages
   * @returns Cleanup function to unsubscribe
   */
  subscribeToMessages(
    conversationId: string,
    onNewMessage: (message: MessageWithSender) => void,
    onMessageUpdate?: (message: Message) => void
  ): () => void {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const newMessage = payload.new as MessageWithSender;

          // Fetch sender profile if not already included
          if (!newMessage.sender) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', newMessage.sender_id)
              .single();

            if (profile) {
              newMessage.sender = profile;
            }
          }

          onNewMessage(newMessage);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const updatedMessage = payload.new as Message;
          if (onMessageUpdate) {
            onMessageUpdate(updatedMessage);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  /**
   * Subscribe to typing indicators for a conversation
   * @param conversationId - The conversation ID
   * @param currentUserId - The current user's ID
   * @param otherUserId - The other user's ID
   * @param onTypingChange - Callback when typing status changes
   * @returns Object with cleanup function and method to broadcast typing status
   */
  subscribeToTypingIndicators(
    conversationId: string,
    currentUserId: string,
    otherUserId: string,
    onTypingChange: (isTyping: boolean) => void
  ): {
    unsubscribe: () => void;
    broadcastTyping: (typing: boolean) => Promise<void>;
  } {
    const presenceChannel = supabase.channel(`presence:${conversationId}`, {
      config: {
        presence: {
          key: currentUserId,
        },
      },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();

        // Check if other user is typing
        const otherUserPresence = state[otherUserId];
        if (otherUserPresence && otherUserPresence.length > 0) {
          const isOtherUserTyping = otherUserPresence[0].typing === true;
          onTypingChange(isOtherUserTyping);
        } else {
          onTypingChange(false);
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track initial presence
          await presenceChannel.track({
            user_id: currentUserId,
            typing: false,
            online_at: new Date().toISOString(),
          });
        }
      });

    const broadcastTyping = async (typing: boolean) => {
      await presenceChannel.track({
        user_id: currentUserId,
        typing,
        online_at: new Date().toISOString(),
      });
    };

    return {
      unsubscribe: () => {
        supabase.removeChannel(presenceChannel);
      },
      broadcastTyping,
    };
  },

  /**
   * Batch mark multiple messages as read
   * @param messageIds - Array of message IDs
   * @returns True if successful
   */
  async batchMarkAsRead(messageIds: string[]): Promise<boolean> {
    if (messageIds.length === 0) return true;

    const { error } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .in('id', messageIds)
      .is('read_at', null);

    if (error) {
      console.error('Error batch marking messages as read:', error);
      return false;
    }

    return true;
  },
};
