# Design Document

## Overview

The SwapX app completion involves building a comprehensive government employee job swap platform with real-time messaging, profile management, settings, and complete database integration. The design maintains consistency with existing patterns while adding new functionality for production readiness.

## Architecture

### Technology Stack
- **Frontend**: React Native with Expo Router
- **Backend**: Supabase (PostgreSQL + Real-time subscriptions)
- **Navigation**: Expo Router with tab-based navigation
- **State Management**: React hooks and context
- **Styling**: Custom themed components with consistent design system
- **Real-time**: Supabase real-time subscriptions for messaging
- **Storage**: Supabase Storage for profile images and swap photos

### Navigation Structure
```
App Root
├── Onboarding (conditional)
├── Auth (conditional)
└── Main App (authenticated)
    ├── (tabs)
    │   ├── Home (index)
    │   ├── Explore
    │   ├── Messages (new)
    │   └── Settings (new)
    ├── Profile Screen (new)
    ├── Chat Screen (new)
    ├── Swap Details
    ├── Profile Setup
    └── Notifications
```

## Components and Interfaces

### New Components to Create

#### 1. Profile Screen Components
- `ProfileScreen`: Main profile viewing/editing screen
- `ProfileHeader`: Profile photo, name, and basic info
- `ProfileSection`: Reusable section component for profile data
- `EditProfileModal`: Modal for editing profile information

#### 2. Settings Components
- `SettingsScreen`: Main settings screen with categories
- `SettingsSection`: Grouped settings items
- `SettingsItem`: Individual setting row with navigation
- `NotificationSettings`: Notification preferences management
- `AccountSettings`: Account management options

#### 3. Messaging Components
- `ChatScreen`: Individual conversation screen
- `MessageBubble`: Individual message component
- `MessageInput`: Text input with send functionality
- `ConversationList`: Enhanced version of existing messages screen
- `TypingIndicator`: Shows when someone is typing

#### 4. Enhanced Home Components
- `SwapFilters`: Advanced filtering options
- `CreateSwapFAB`: Floating action button for creating swaps
- `SwapMatchAlert`: Component for showing potential matches

### Updated Components

#### 1. Tab Navigation
Update `app/(tabs)/_layout.tsx` to include Messages and Settings tabs:
```typescript
<Tabs.Screen name="messages" options={{ title: 'Messages', tabBarIcon: MessageIcon }} />
<Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: SettingsIcon }} />
```

#### 2. Home Header Enhancement
Modify `HomeHeader` to make avatar clickable and navigate to profile screen.

## Data Models

### Complete Database Schema

Based on the existing `swap_identification_queue` table pattern, here are the additional tables needed:

```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone_number TEXT,
    profile_photo_url TEXT,
    job_title TEXT,
    current_ministry TEXT,
    current_district TEXT,
    current_institution TEXT,
    salary_scale TEXT,
    years_of_service INTEGER,
    bio TEXT,
    profile_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Swaps table (enhanced)
CREATE TABLE public.swaps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    current_ministry TEXT NOT NULL,
    current_district TEXT NOT NULL,
    current_institution TEXT,
    current_area_type TEXT NOT NULL,
    desired_ministry TEXT,
    desired_district TEXT NOT NULL,
    desired_area_type TEXT NOT NULL,
    job_title TEXT NOT NULL,
    salary_scale TEXT,
    reason_for_swap TEXT,
    housing_condition TEXT,
    additional_details TEXT,
    images TEXT[], -- Array of image URLs
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Conversations table
CREATE TABLE public.conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant_1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    participant_2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    swap_id UUID REFERENCES swaps(id) ON DELETE SET NULL,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(participant_1_id, participant_2_id, swap_id)
);

-- Messages table
CREATE TABLE public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'system')),
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table (enhanced)
CREATE TABLE public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    notification_type TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
    data JSONB,
    swap_id UUID REFERENCES swaps(id) ON DELETE SET NULL,
    from_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    read_at TIMESTAMP WITH TIME ZONE,
    device_token TEXT,
    delivery_channel TEXT DEFAULT 'push',
    scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification tokens table
CREATE TABLE public.notification_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    expo_push_token TEXT NOT NULL,
    device_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, expo_push_token)
);

-- User settings table
CREATE TABLE public.user_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    match_notifications BOOLEAN DEFAULT TRUE,
    message_notifications BOOLEAN DEFAULT TRUE,
    marketing_notifications BOOLEAN DEFAULT FALSE,
    privacy_profile_visible BOOLEAN DEFAULT TRUE,
    privacy_contact_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Swap interests/matches table
CREATE TABLE public.swap_interests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    swap_id UUID REFERENCES swaps(id) ON DELETE CASCADE,
    interested_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(swap_id, interested_user_id)
);
```

### Indexes for Performance
```sql
-- Indexes for better query performance
CREATE INDEX idx_swaps_status ON swaps(status);
CREATE INDEX idx_swaps_current_district ON swaps(current_district);
CREATE INDEX idx_swaps_desired_district ON swaps(desired_district);
CREATE INDEX idx_swaps_current_ministry ON swaps(current_ministry);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read_at ON notifications(read_at);
```

## Error Handling

### Error Categories
1. **Network Errors**: Connection issues, timeouts
2. **Authentication Errors**: Session expired, unauthorized access
3. **Validation Errors**: Invalid form data, missing required fields
4. **Database Errors**: Constraint violations, foreign key errors
5. **File Upload Errors**: Image upload failures, size limits

### Error Handling Strategy
- Use consistent error boundaries for React components
- Implement retry mechanisms for network requests
- Show user-friendly error messages with actionable steps
- Log errors to Supabase for debugging
- Graceful degradation for non-critical features

## Testing Strategy

### Unit Testing
- Test individual components with React Native Testing Library
- Test utility functions and data transformations
- Mock Supabase client for isolated testing

### Integration Testing
- Test navigation flows between screens
- Test real-time messaging functionality
- Test database operations with test database

### User Acceptance Testing
- Test complete user journeys (signup → profile setup → swap creation → messaging)
- Test on both iOS and Android devices
- Test offline/online scenarios
- Performance testing with large datasets

### Testing Priorities (2-day timeline)
1. **Critical Path Testing**: Authentication, profile setup, swap creation
2. **Core Features**: Messaging, notifications, basic navigation
3. **Edge Cases**: Error handling, network issues (if time permits)

## Real-time Features

### Supabase Real-time Subscriptions

#### 1. Messages
```typescript
// Subscribe to new messages in a conversation
supabase
  .channel('messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `conversation_id=eq.${conversationId}`
  }, handleNewMessage)
  .subscribe()
```

#### 2. Notifications
```typescript
// Subscribe to user notifications
supabase
  .channel('notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${userId}`
  }, handleNewNotification)
  .subscribe()
```

#### 3. Swap Updates
```typescript
// Subscribe to swap status changes
supabase
  .channel('swaps')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'swaps'
  }, handleSwapUpdate)
  .subscribe()
```

## Security Considerations

### Row Level Security (RLS)
```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE swaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Example policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view public swaps" ON swaps
  FOR SELECT USING (status = 'active');

CREATE POLICY "Users can manage their own swaps" ON swaps
  FOR ALL USING (auth.uid() = user_id);
```

### Data Validation
- Client-side validation for immediate feedback
- Server-side validation with database constraints
- Input sanitization for text fields
- Image upload validation (size, format, content)

## Performance Optimizations

### Data Loading
- Implement pagination for swap listings
- Use lazy loading for images
- Cache frequently accessed data
- Optimize database queries with proper indexes

### Real-time Optimization
- Limit real-time subscriptions to active screens
- Unsubscribe from channels when components unmount
- Batch message updates to reduce re-renders

### Image Optimization
- Compress images before upload
- Generate thumbnails for profile photos
- Use progressive loading for swap images
- Implement image caching strategy