# SwapX Database Documentation

This document provides information about the database schema, types, and utility functions for the SwapX application.

## Files Overview

- **`database_schema.sql`**: Complete SQL schema with tables, indexes, RLS policies, and functions
- **`database.types.ts`**: TypeScript type definitions for all database tables
- **`database.utils.ts`**: Utility functions for common database operations
- **`supabase.ts`**: Supabase client configuration with type safety

## Database Setup

### 1. Apply the Schema

To set up the database, run the SQL schema file in your Supabase SQL editor:

```sql
-- Copy and paste the contents of database_schema.sql
-- Or use the Supabase CLI:
supabase db reset
```

### 2. Verify Tables

After applying the schema, verify that all tables are created:

- profiles
- swaps
- conversations
- messages
- notifications
- notification_tokens
- user_settings
- swap_interests
- swap_identification_queue

## Using Database Utilities

### Profile Operations

```typescript
import { profileUtils } from '@/lib/database.utils';

// Get a user's profile
const profile = await profileUtils.getProfile(userId);

// Create a profile
const newProfile = await profileUtils.createProfile({
  user_id: userId,
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  job_title: 'Teacher',
  current_ministry: 'Education',
  current_district: 'Kampala',
});

// Update a profile
const updated = await profileUtils.updateProfile(userId, {
  bio: 'Experienced teacher looking for a swap',
  profile_completed: true,
});
```

### Swap Operations

```typescript
import { swapUtils } from '@/lib/database.utils';

// Get all active swaps with filters
const swaps = await swapUtils.getSwaps({
  ministry: 'Health',
  district: 'Kampala',
  searchQuery: 'nurse',
});

// Create a swap
const newSwap = await swapUtils.createSwap({
  user_id: userId,
  current_ministry: 'Education',
  current_district: 'Kampala',
  current_area_type: 'Urban',
  desired_district: 'Mbarara',
  desired_area_type: 'Rural',
  job_title: 'Teacher',
  reason_for_swap: 'Family reasons',
});

// Update swap status
await swapUtils.updateSwapStatus(swapId, 'paused');

// Delete a swap
await swapUtils.deleteSwap(swapId);
```

### Messaging Operations

```typescript
import { conversationUtils, messageUtils } from '@/lib/database.utils';

// Get or create a conversation
const conversationId = await conversationUtils.getOrCreateConversation(
  currentUserId,
  otherUserId,
  swapId // optional
);

// Send a message
const message = await messageUtils.sendMessage({
  conversation_id: conversationId,
  sender_id: currentUserId,
  content: 'Hi, I am interested in your swap!',
});

// Get messages
const messages = await messageUtils.getMessages(conversationId);

// Mark conversation as read
await messageUtils.markConversationAsRead(conversationId, currentUserId);

// Get unread count
const unreadCount = await messageUtils.getUnreadCount(currentUserId);
```

### Notification Operations

```typescript
import { notificationUtils, notificationTokenUtils } from '@/lib/database.utils';

// Register push notification token
await notificationTokenUtils.registerToken({
  user_id: userId,
  expo_push_token: token,
  device_type: 'ios',
});

// Get notifications
const notifications = await notificationUtils.getNotifications(userId);

// Mark as read
await notificationUtils.markAsRead(notificationId);

// Mark all as read
await notificationUtils.markAllAsRead(userId);

// Get unread count
const unreadCount = await notificationUtils.getUnreadCount(userId);
```

### Settings Operations

```typescript
import { settingsUtils } from '@/lib/database.utils';

// Get user settings
const settings = await settingsUtils.getSettings(userId);

// Update settings
await settingsUtils.updateSettings(userId, {
  push_notifications: true,
  message_notifications: true,
  match_notifications: false,
});
```

### Swap Interest Operations

```typescript
import { swapInterestUtils } from '@/lib/database.utils';

// Express interest in a swap
await swapInterestUtils.expressInterest({
  swap_id: swapId,
  interested_user_id: userId,
  message: 'I would like to discuss this swap opportunity',
});

// Get interests for a swap
const interests = await swapInterestUtils.getSwapInterests(swapId);

// Update interest status
await swapInterestUtils.updateInterestStatus(interestId, 'accepted');
```

## Real-time Subscriptions

### Subscribe to Messages

```typescript
import { realtimeUtils } from '@/lib/database.utils';

// Subscribe to new messages
const channel = realtimeUtils.subscribeToMessages(conversationId, (message) => {
  console.log('New message:', message);
  // Update UI with new message
});

// Unsubscribe when component unmounts
useEffect(() => {
  return () => {
    realtimeUtils.unsubscribe(channel);
  };
}, []);
```

### Subscribe to Notifications

```typescript
// Subscribe to notifications
const channel = realtimeUtils.subscribeToNotifications(userId, (notification) => {
  console.log('New notification:', notification);
  // Show notification to user
});

// Cleanup
useEffect(() => {
  return () => {
    realtimeUtils.unsubscribe(channel);
  };
}, []);
```

### Subscribe to Swap Updates

```typescript
// Subscribe to all swap updates
const channel = realtimeUtils.subscribeToSwaps((swap) => {
  console.log('Swap updated:', swap);
  // Refresh swap list
});

// Cleanup
useEffect(() => {
  return () => {
    realtimeUtils.unsubscribe(channel);
  };
}, []);
```

## Database Functions

### Process Swap Matches

The database includes a function to process swap matches automatically:

```typescript
import { supabase } from '@/lib/supabase';

// Manually trigger swap matching (usually done by cron job)
const { data, error } = await supabase.rpc('process_swap_matches');

if (data) {
  console.log(`Processed ${data[0].processed_count} swaps`);
  console.log(`Created ${data[0].notifications_created} notifications`);
}
```

## Row Level Security (RLS)

All tables have RLS enabled with the following policies:

- **Profiles**: Users can view all profiles, but only update their own
- **Swaps**: Users can view active swaps and manage their own swaps
- **Conversations**: Users can only view and create conversations they're part of
- **Messages**: Users can only view and send messages in their conversations
- **Notifications**: Users can only view and manage their own notifications
- **Settings**: Users can only view and update their own settings

## Best Practices

1. **Error Handling**: All utility functions return `null` on error and log to console
2. **Type Safety**: Use TypeScript types for all database operations
3. **Real-time Cleanup**: Always unsubscribe from real-time channels when components unmount
4. **Optimistic Updates**: Update UI optimistically before database confirmation for better UX
5. **Pagination**: Use `limit` parameter for large datasets
6. **Indexes**: The schema includes indexes for common queries - use them in your queries

## Common Patterns

### Creating a Profile After Signup

```typescript
const { data: authData } = await supabase.auth.signUp({
  email,
  password,
});

if (authData.user) {
  await profileUtils.createProfile({
    user_id: authData.user.id,
    email: authData.user.email,
    first_name: firstName,
    last_name: lastName,
  });
}
```

### Getting Conversations with Unread Counts

```typescript
const conversations = await conversationUtils.getUserConversations(userId);

// Add unread counts
const conversationsWithUnread = await Promise.all(
  conversations.map(async (conv) => {
    const messages = await messageUtils.getMessages(conv.id);
    const unreadCount = messages.filter(
      (m) => m.sender_id !== userId && !m.read_at
    ).length;
    return { ...conv, unread_count: unreadCount };
  })
);
```

### Searching Swaps

```typescript
// Search by text
const results = await swapUtils.getSwaps({
  searchQuery: 'teacher',
});

// Filter by location and ministry
const filtered = await swapUtils.getSwaps({
  ministry: 'Education',
  district: 'Kampala',
  areaType: 'Urban',
});
```

## Troubleshooting

### Connection Issues

If you encounter connection issues:

1. Check your `.env` file has correct Supabase credentials
2. Verify RLS policies are correctly set up
3. Check Supabase dashboard for any errors

### Type Errors

If you get TypeScript errors:

1. Ensure `database.types.ts` is up to date with your schema
2. Regenerate types if schema changes: `supabase gen types typescript`
3. Check that `supabase.ts` imports the Database type

### Real-time Not Working

If real-time subscriptions aren't working:

1. Enable real-time in Supabase dashboard for required tables
2. Check that RLS policies allow the user to access the data
3. Verify the channel is properly subscribed before data changes
