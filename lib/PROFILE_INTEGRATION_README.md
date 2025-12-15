# Profile Data Integration

This document describes the profile data integration implementation for task 3.2.

## Overview

The profile screen has been fully integrated with Supabase to:
1. Load profile data from the database
2. Upload profile photos to Supabase Storage
3. Update profile information with validation
4. Handle loading and error states

## Components Modified

### 1. `app/profile.tsx`
- Added database integration using `profileUtils.getProfile()` and `profileUtils.updateProfile()`
- Implemented image upload functionality using `storageUtils.uploadProfilePhoto()`
- Added form validation for required fields and email format
- Added loading states and error handling
- Integrated with Supabase auth to get current user

### 2. `components/profile/ProfileHeader.tsx`
- Added `isUploading` prop to show upload indicator
- Added upload overlay with ActivityIndicator during image upload
- Disabled image picker interaction during upload

### 3. `lib/storage.utils.ts` (New File)
- Created storage utility functions for file uploads
- `uploadProfilePhoto()`: Compresses, resizes, and uploads profile photos to Supabase Storage
- `uploadSwapImages()`: Handles multiple swap image uploads
- `deleteFile()`: Deletes files from storage buckets
- `extractFilePath()`: Extracts file path from public URLs

## Features Implemented

### Profile Loading
- Fetches profile data on component mount
- Converts database format to UI format
- Generates fallback avatar URL if no photo exists
- Shows loading indicator while fetching data

### Profile Editing
- Opens bottom modal with editable form fields
- Validates required fields (first name, last name, email, phone, job title)
- Validates email format using regex
- Updates database with new values
- Shows success/error alerts

### Image Upload
- Requests media library permissions
- Opens image picker with 1:1 aspect ratio
- Compresses and resizes image to 400x400px
- Uploads to Supabase Storage 'avatars' bucket
- Updates profile with new image URL
- Shows upload indicator during process

### Error Handling
- Handles missing user authentication
- Handles database fetch errors
- Handles image upload failures
- Shows user-friendly error messages
- Provides retry functionality

## Database Schema Requirements

The implementation expects the following profile table structure:

```sql
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY,
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
```

## Storage Buckets Required

1. **avatars**: For profile photos
   - Public bucket
   - Accepts JPEG images
   - Path format: `profile-photos/{userId}-{timestamp}.jpg`

2. **swap-photos**: For swap images (future use)
   - Public bucket
   - Accepts JPEG images
   - Path format: `swap-images/{userId}-{timestamp}-{random}.jpg`

## Validation Rules

### Required Fields
- First Name
- Last Name
- Email
- Phone Number
- Job Title

### Email Validation
- Must match pattern: `^[^\s@]+@[^\s@]+\.[^\s@]+$`

### Image Upload
- Aspect ratio: 1:1 (square)
- Compression: 0.8 quality
- Max dimensions: 400x400px for profile photos
- Format: JPEG

## Usage Example

```typescript
// The profile screen automatically loads on mount
// User can:
// 1. Tap edit icon to enter edit mode
// 2. Tap avatar to upload new photo (in edit mode)
// 3. Edit any field in the form
// 4. Save changes or cancel

// Programmatic usage of utilities:
import { profileUtils } from '@/lib/database.utils';
import { storageUtils } from '@/lib/storage.utils';

// Load profile
const profile = await profileUtils.getProfile(userId);

// Update profile
const updated = await profileUtils.updateProfile(userId, {
  first_name: 'John',
  last_name: 'Doe',
  bio: 'Updated bio',
});

// Upload photo
const imageUrl = await storageUtils.uploadProfilePhoto(userId, localImageUri);
```

## Requirements Satisfied

This implementation satisfies the following requirements from the spec:

- **Requirement 2.4**: Profile editing with form validation
  - ✅ Validates required fields
  - ✅ Validates email format
  - ✅ Shows validation errors to user

- **Requirement 2.5**: Profile data persistence
  - ✅ Saves changes to Supabase database
  - ✅ Updates profile_photo_url field
  - ✅ Updates updated_at timestamp
  - ✅ Shows success feedback

## Testing Checklist

- [x] Profile loads from database on mount
- [x] Loading indicator shows while fetching
- [x] Error state shows if profile not found
- [x] Edit button opens modal with current data
- [x] Image picker opens when tapping avatar in edit mode
- [x] Image upload shows progress indicator
- [x] Validation prevents saving invalid data
- [x] Save button updates database
- [x] Success message shows after save
- [x] Cancel button discards changes
- [x] Profile refreshes after successful save

## Future Enhancements

1. Add image cropping functionality
2. Add profile photo deletion
3. Add profile completion percentage
4. Add profile visibility settings
5. Add profile change history
6. Add profile photo gallery/selection
