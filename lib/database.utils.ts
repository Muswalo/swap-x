import type { Tables, TablesInsert, TablesUpdate } from "./database.types";
import { supabase } from "./supabase";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

// Table row types
type Profile = Tables<"profiles">;
type Swap = Tables<"swaps">;
type Conversation = Tables<"conversations">;
type Message = Tables<"messages">;
export type Notification = Tables<"notifications">;
type NotificationToken = Tables<"notification_tokens">;
type UserSettings = Tables<"user_settings">;
type SwapInterest = Tables<"swap_interests">;

// Insert types
type ProfileInsert = TablesInsert<"profiles">;
type SwapInsert = TablesInsert<"swaps">;
type MessageInsert = TablesInsert<"messages">;
type NotificationInsert = TablesInsert<"notifications">;
type NotificationTokenInsert = TablesInsert<"notification_tokens">;
type SwapInterestInsert = TablesInsert<"swap_interests">;

// Update types
type ProfileUpdate = TablesUpdate<"profiles">;
type SwapUpdate = TablesUpdate<"swaps">;
type UserSettingsUpdate = TablesUpdate<"user_settings">;

// Extended types with relations
export type SwapWithProfile = Swap & {
  profile: Profile | Profile[] | null;
};

export type MessageWithSender = Message & {
  sender: Profile | Profile[] | null;
};

export type ConversationWithDetails = Conversation & {
  participant_1: Profile | Profile[] | null;
  participant_2: Profile | Profile[] | null;
  messages: Message[];
};

// Status types
type SwapStatus = string; 
// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Log errors consistently
 */
function logError(error: any, context: string): void {
  console.error(`[${context}]`, error);
}

/**
 * Retry operation with exponential backoff
 */
async function retryOperation<T>(
  operation: () => Promise<T>,
  options: { maxRetries?: number; delay?: number } = {}
): Promise<T> {
  const { maxRetries = 3, delay = 1000 } = options;
  let lastError: any;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, delay * Math.pow(2, attempt))
        );
      }
    }
  }

  throw lastError;
}

// ============================================================================
// PROFILE OPERATIONS
// ============================================================================

export const profileUtils = {
  /**
   * Get a profile by user ID
   */
  async getProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await retryOperation(
        async () =>
          await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", userId)
            .single(),
        { maxRetries: 2 }
      );

      if (error) {
        logError(error, "profileUtils.getProfile");
        return null;
      }
      return data;
    } catch (error) {
      logError(error, "profileUtils.getProfile");
      return null;
    }
  },

  /**
   * Create a new profile
   */
  async createProfile(profile: ProfileInsert): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .insert(profile)
        .select()
        .single();

      if (error) {
        logError(error, "profileUtils.createProfile");
        throw error;
      }
      return data;
    } catch (error) {
      logError(error, "profileUtils.createProfile");
      throw error;
    }
  },

  /**
   * Update a profile
   */
  async updateProfile(
    userId: string,
    updates: ProfileUpdate
  ): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        logError(error, "profileUtils.updateProfile");
        throw error;
      }
      return data;
    } catch (error) {
      logError(error, "profileUtils.updateProfile");
      throw error;
    }
  },

  /**
   * Get multiple profiles by user IDs
   */
  async getProfiles(userIds: string[]): Promise<Profile[]> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .in("user_id", userIds);

    if (error) {
      console.error("Error fetching profiles:", error);
      return [];
    }
    return data || [];
  },
};

// ============================================================================
// SWAP OPERATIONS
// ============================================================================

export const swapUtils = {
  /**
   * Get all active swaps with optional filters
   */
  async getSwaps(filters?: {
    ministry?: string;
    district?: string;
    areaType?: string;
    searchQuery?: string;
  }): Promise<SwapWithProfile[]> {
    let query = supabase
      .from("swaps")
      .select("*, profile:profiles(*)")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (filters?.ministry) {
      query = query.or(`current_ministry.eq.${filters.ministry},desired_ministry.eq.${filters.ministry}`);
    }
    if (filters?.district) {
      query = query.eq("current_district", filters.district);
    }
    if (filters?.areaType) {
      query = query.eq("current_area_type", filters.areaType);
    }
    if (filters?.searchQuery) {
      query = query.or(
        `job_title.ilike.%${filters.searchQuery}%,current_district.ilike.%${filters.searchQuery}%,current_ministry.ilike.%${filters.searchQuery}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching swaps:", error);
      return [];
    }
    return data as SwapWithProfile[] || [];
  },

  /**
   * Get a single swap by ID
   */
  async getSwap(swapId: string): Promise<SwapWithProfile | null> {
    const { data, error } = await supabase
      .from("swaps")
      .select("*, profile:profiles!swaps_user_id_fkey(*)")
      .eq("id", swapId)
      .single();

    if (error) {
      console.error("Error fetching swap:", error);
      return null;
    }
    return data as unknown as SwapWithProfile;
  },

  /**
   * Get swaps created by a user
   */
  async getUserSwaps(userId: string): Promise<Swap[]> {
    const { data, error } = await supabase
      .from("swaps")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user swaps:", error);
      return [];
    }
    return data || [];
  },

  /**
   * Create a new swap
   */
  async createSwap(swap: SwapInsert): Promise<Swap | null> {
    const { data, error } = await supabase
      .from("swaps")
      .insert(swap)
      .select()
      .single();

    if (error) {
      console.error("Error creating swap:", error);
      return null;
    }
    return data;
  },

  /**
   * Update a swap
   */
  async updateSwap(swapId: string, updates: SwapUpdate): Promise<Swap | null> {
    const { data, error } = await supabase
      .from("swaps")
      .update(updates)
      .eq("id", swapId)
      .select()
      .single();

    if (error) {
      console.error("Error updating swap:", error);
      return null;
    }
    return data;
  },

  /**
   * Delete a swap
   */
  async deleteSwap(swapId: string): Promise<boolean> {
    const { error } = await supabase.from("swaps").delete().eq("id", swapId);

    if (error) {
      console.error("Error deleting swap:", error);
      return false;
    }
    return true;
  },

  /**
   * Update swap status
   */
  async updateSwapStatus(
    swapId: string,
    status: SwapStatus
  ): Promise<Swap | null> {
    return this.updateSwap(swapId, { status });
  },
};

// ============================================================================
// CONVERSATION & MESSAGE OPERATIONS
// ============================================================================

export const conversationUtils = {
  /**
   * Get or create a conversation between two users
   */
  async getOrCreateConversation(
    user1Id: string,
    user2Id: string,
    swapId?: string
  ): Promise<string | null> {
    const { data, error } = await supabase.rpc("get_or_create_conversation", {
      p_user1_id: user1Id,
      p_user2_id: user2Id,
      p_swap_id: swapId,
    });

    if (error) {
      console.error("Error getting/creating conversation:", error);
      return null;
    }
    return data;
  },

  /**
   * Get all conversations for a user
   */
  async getUserConversations(
    userId: string
  ): Promise<ConversationWithDetails[]> {
    const { data, error } = await supabase
      .from("conversations")
      .select(
        `
        *,
        participant_1:profiles!conversations_sender_profile_fkey(*),
        participant_2:profiles!conversations2_sender_profile_fkey(*),
        messages(*)
      `
      )
      .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
      .order("last_message_at", { ascending: false });

    if (error) {
      console.error("Error fetching conversations:", error);
      return [];
    }
    return data as unknown as ConversationWithDetails[] || [];
  },

  /**
   * Get a single conversation by ID
   */
  async getConversation(conversationId: string): Promise<Conversation | null> {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .single();

    if (error) {
      console.error("Error fetching conversation:", error);
      return null;
    }
    
    return data;
  },
};

export const messageUtils = {
  /**
   * Get messages for a conversation
   */
  async getMessages(
    conversationId: string,
    limit = 50
  ): Promise<MessageWithSender[]> {
    const { data, error } = await supabase
      .from("messages")
      .select("*, sender:profiles(*)")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(limit);

    if (error) {
      console.error("Error fetching messages:", error);
      return [];
    }
    return data as unknown as MessageWithSender[] || [];
  },

  /**
   * Send a message    console.log("Error fetching conversation:", error);

   */
  async sendMessage(message: MessageInsert): Promise<Message | null> {
    const { data, error } = await supabase
      .from("messages")
      .insert(message)
      .select()
      .single();

    if (error) {
      console.error("Error sending message:", error);
      return null;
    }
    return data;
  },

  /**
   * Mark message as read
   */
  async markAsRead(messageId: string): Promise<boolean> {
    const { error } = await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("id", messageId);

    if (error) {
      console.error("Error marking message as read:", error);
      return false;
    }
    return true;
  },

  /**
   * Mark all messages in a conversation as read
   */
  async markConversationAsRead(
    conversationId: string,
    userId: string
  ): Promise<boolean> {
    const { error } = await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .neq("sender_id", userId)
      .is("read_at", null);

    if (error) {
      console.error("Error marking conversation as read:", error);
      return false;
    }
    return true;
  },

  /**
   * Get unread message count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .neq("sender_id", userId)
      .is("read_at", null);

    if (error) {
      console.error("Error getting unread count:", error);
      return 0;
    }
    return count || 0;
  },
};

// ============================================================================
// NOTIFICATION OPERATIONS
// ============================================================================

export const notificationUtils = {
  /**
   * Get notifications for a user
   */
  async getNotifications(userId: string, limit = 50): Promise<Notification[]> {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
    return data || [];
  },

  /**
   * Create a notification
   */
  async createNotification(
    notification: NotificationInsert
  ): Promise<Notification | null> {
    const { data, error } = await supabase
      .from("notifications")
      .insert(notification)
      .select()
      .single();

    if (error) {
      console.error("Error creating notification:", error);
      return null;
    }
    return data;
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    const { error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", notificationId);

    if (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }
    return true;
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", userId)
      .is("read_at", null);

    if (error) {
      console.error("Error marking all notifications as read:", error);
      return false;
    }
    return true;
  },

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<boolean> {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId);

    if (error) {
      console.error("Error deleting notification:", error);
      return false;
    }
    return true;
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .is("read_at", null);

    if (error) {
      console.error("Error getting unread notification count:", error);
      return 0;
    }
    return count || 0;
  },
};

// ============================================================================
// NOTIFICATION TOKEN OPERATIONS
// ============================================================================

export const notificationTokenUtils = {
  /**
   * Register a push notification token
   */
  async registerToken(
    token: NotificationTokenInsert
  ): Promise<NotificationToken | null> {
    const { data, error } = await supabase
      .from("notification_tokens")
      .upsert(token, { onConflict: "user_id,expo_push_token" })
      .select()
      .single();

    if (error) {
      console.error("Error registering notification token:", error);
      return null;
    }
    return data;
  },

  /**
   * Remove a push notification token
   */
  async removeToken(userId: string, expoPushToken: string): Promise<boolean> {
    const { error } = await supabase
      .from("notification_tokens")
      .delete()
      .eq("user_id", userId)
      .eq("expo_push_token", expoPushToken);

    if (error) {
      console.error("Error removing notification token:", error);
      return false;
    }
    return true;
  },
};

// ============================================================================
// USER SETTINGS OPERATIONS
// ============================================================================

export const settingsUtils = {
  /**
   * Get user settings
   */
  async getSettings(userId: string): Promise<UserSettings | null> {
    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error fetching user settings:", error);
      return null;
    }
    return data;
  },

  /**
   * Update user settings
   */
  async updateSettings(
    userId: string,
    updates: UserSettingsUpdate
  ): Promise<UserSettings | null> {
    const { data, error } = await supabase
      .from("user_settings")
      .update(updates)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating user settings:", error);
      return null;
    }
    return data;
  },
};

// ============================================================================
// SWAP INTEREST OPERATIONS
// ============================================================================

export const swapInterestUtils = {
  /**
   * Express interest in a swap
   */
  async expressInterest(
    interest: SwapInterestInsert
  ): Promise<SwapInterest | null> {
    const { data, error } = await supabase
      .from("swap_interests")
      .insert(interest)
      .select()
      .single();

    if (error) {
      console.error("Error expressing interest:", error);
      return null;
    }
    return data;
  },

  /**
   * Get interests for a swap
   */
  async getSwapInterests(swapId: string): Promise<SwapInterest[]> {
    const { data, error } = await supabase
      .from("swap_interests")
      .select("*")
      .eq("swap_id", swapId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching swap interests:", error);
      return [];
    }
    return data || [];
  },

  /**
   * Update interest status
   */
  async updateInterestStatus(
    interestId: string,
    status: "pending" | "accepted" | "declined"
  ): Promise<SwapInterest | null> {
    const { data, error } = await supabase
      .from("swap_interests")
      .update({ status })
      .eq("id", interestId)
      .select()
      .single();

    if (error) {
      console.error("Error updating interest status:", error);
      return null;
    }
    return data;
  },
};

// ============================================================================
// REAL-TIME SUBSCRIPTIONS
// ============================================================================

export const realtimeUtils = {
  /**
   * Subscribe to new messages in a conversation
   */
  subscribeToMessages(
    conversationId: string,
    callback: (message: Message) => void
  ) {
    return supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => callback(payload.new as Message)
      )
      .subscribe();
  },

  /**
   * Subscribe to user notifications
   */
  subscribeToNotifications(
    userId: string,
    callback: (notification: Notification) => void
  ) {
    return supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => callback(payload.new as Notification)
      )
      .subscribe();
  },

  /**
   * Subscribe to swap updates
   */
  subscribeToSwaps(callback: (swap: Swap) => void) {
    return supabase
      .channel("swaps")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "swaps",
        },
        (payload) => {
          if (
            payload.eventType === "INSERT" ||
            payload.eventType === "UPDATE"
          ) {
            callback(payload.new as Swap);
          }
        }
      )
      .subscribe();
  },

  /**
   * Unsubscribe from a channel
   */
  async unsubscribe(channel: ReturnType<typeof supabase.channel>) {
    await supabase.removeChannel(channel);
  },
};