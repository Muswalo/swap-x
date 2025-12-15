# Error Handling and User Feedback Guide

This guide explains how to implement proper error handling and user feedback in the SwapX application.

## Overview

The app uses a comprehensive error handling system that includes:
- Error boundaries for React component errors
- Retry mechanisms for network requests
- User-friendly error messages
- Loading states and feedback
- Toast notifications
- Skeleton screens

## Error Handling

### 1. Error Utilities

Located in `utils/error-handler.ts`, these utilities help parse and handle errors consistently.

#### Parse Errors
```typescript
import { parseError, getUserFriendlyMessage } from '@/utils/error-handler';

try {
  await someOperation();
} catch (error) {
  const parsedError = parseError(error);
  console.log(parsedError.message); // User-friendly message
  console.log(parsedError.code); // Error code
  console.log(parsedError.isRetryable); // Whether to retry
}
```

#### Retry Operations
```typescript
import { retryOperation } from '@/utils/error-handler';

const result = await retryOperation(
  async () => {
    return await fetchData();
  },
  {
    maxRetries: 3,
    delayMs: 1000,
    onRetry: (attempt, error) => {
      console.log(`Retry attempt ${attempt}`);
    },
  }
);
```

### 2. Error Boundary

The app is wrapped in an error boundary at the root level (`app/_layout.tsx`).

#### Custom Error Boundary
```typescript
import { ErrorBoundary } from '@/components/error-boundary';

<ErrorBoundary
  fallback={(error, resetError) => (
    <CustomErrorScreen error={error} onReset={resetError} />
  )}
  onError={(error, errorInfo) => {
    // Log to error tracking service
    logErrorToService(error, errorInfo);
  }}
>
  <YourComponent />
</ErrorBoundary>
```

### 3. Async Operation Hook

Use `useAsyncOperation` for consistent error handling in components.

```typescript
import { useAsyncOperation } from '@/hooks/use-async-operation';

function MyComponent() {
  const { data, error, isLoading, execute } = useAsyncOperation();

  const handleFetch = async () => {
    await execute(
      async () => {
        return await fetchData();
      },
      {
        retry: true,
        maxRetries: 3,
        onSuccess: () => {
          showToast('Data loaded successfully', 'success');
        },
        onError: (error) => {
          showToast(getUserFriendlyMessage(error), 'error');
        },
      }
    );
  };

  return (
    <View>
      {isLoading && <LoadingIndicator />}
      {error && <ErrorNotice message={error} visible={true} variant="danger" />}
      {data && <DataDisplay data={data} />}
    </View>
  );
}
```

## User Feedback

### 1. Loading States

#### Loading Indicator
```typescript
import { LoadingIndicator } from '@/components/loading-indicator';

// Inline loading
<LoadingIndicator size="small" message="Loading..." />

// Full screen loading
<LoadingIndicator size="large" message="Please wait..." fullScreen />
```

#### Skeleton Screens
```typescript
import { ProfileSkeleton, SwapListSkeleton } from '@/components/skeleton-screens';

{isLoading ? <ProfileSkeleton /> : <ProfileContent data={data} />}
```

#### Button Loading State
```typescript
import { AppButton } from '@/components/app-button';

<AppButton
  title="Save"
  onPress={handleSave}
  loading={isSaving}
  disabled={!isValid}
/>
```

### 2. Error Messages

#### Error Notice
```typescript
import { ErrorNotice } from '@/components/error-notice';

<ErrorNotice
  message={errorMessage}
  visible={!!errorMessage}
  variant="danger" // or "info", "success", "warning"
/>
```

### 3. Success Feedback

#### Success Feedback Component
```typescript
import { SuccessFeedback } from '@/components/success-feedback';

const [showSuccess, setShowSuccess] = useState(false);

<SuccessFeedback
  message="Profile updated successfully"
  visible={showSuccess}
  duration={3000}
  onHide={() => setShowSuccess(false)}
/>
```

#### Toast Notifications
```typescript
import { Toast } from '@/components/toast';
import { useToast } from '@/hooks/use-toast';

function MyComponent() {
  const { toast, showSuccess, showError, showWarning, showInfo, hideToast } = useToast();

  const handleAction = async () => {
    try {
      await performAction();
      showSuccess('Action completed successfully');
    } catch (error) {
      showError(getUserFriendlyMessage(error));
    }
  };

  return (
    <View>
      <AppButton title="Perform Action" onPress={handleAction} />
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
        position="top"
      />
    </View>
  );
}
```

### 4. Pull to Refresh

```typescript
import { RefreshControl } from '@/components/refresh-control';

const [refreshing, setRefreshing] = useState(false);

const handleRefresh = async () => {
  setRefreshing(true);
  try {
    await fetchData();
  } finally {
    setRefreshing(false);
  }
};

<ScrollView
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={handleRefresh}
    />
  }
>
  {/* Content */}
</ScrollView>
```

## Complete Example

Here's a complete example showing all feedback patterns:

```typescript
import { AppButton } from '@/components/app-button';
import { ErrorNotice } from '@/components/error-notice';
import { LoadingIndicator } from '@/components/loading-indicator';
import { ProfileSkeleton } from '@/components/skeleton-screens';
import { Toast } from '@/components/toast';
import { RefreshControl } from '@/components/refresh-control';
import { useAsyncOperation } from '@/hooks/use-async-operation';
import { useToast } from '@/hooks/use-toast';
import { getUserFriendlyMessage } from '@/utils/error-handler';
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';

function ProfileScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { data, error, isLoading, execute } = useAsyncOperation();
  const { toast, showSuccess, showError, hideToast } = useToast();

  // Initial load
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    await execute(
      async () => {
        return await fetchProfile();
      },
      {
        retry: true,
        maxRetries: 2,
      }
    );
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadProfile();
    } finally {
      setRefreshing(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveProfile(data);
      showSuccess('Profile saved successfully');
    } catch (error) {
      showError(getUserFriendlyMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (isLoading && !data) {
    return <ProfileSkeleton />;
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
      >
        {/* Error state */}
        {error && (
          <ErrorNotice
            message={error}
            visible={true}
            variant="danger"
          />
        )}

        {/* Content */}
        {data && <ProfileContent data={data} />}

        {/* Save button */}
        <AppButton
          title="Save Changes"
          onPress={handleSave}
          loading={isSaving}
        />
      </ScrollView>

      {/* Toast notifications */}
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
      />
    </View>
  );
}
```

## Error Categories

The error handler categorizes errors into:

1. **Network Errors**: Connection issues, timeouts
   - User message: "Network connection issue. Please check your internet connection."
   - Retryable: Yes

2. **Authentication Errors**: Session expired, unauthorized
   - User message: "Your session has expired. Please log in again."
   - Retryable: No

3. **Validation Errors**: Invalid input, missing fields
   - User message: "Invalid input. Please check your data."
   - Retryable: No

4. **Database Errors**: Constraint violations, foreign key errors
   - User message: "Database error occurred."
   - Retryable: No

5. **File Upload Errors**: Upload failures, size limits
   - User message: "Failed to upload file. Please try again."
   - Retryable: Yes

## Best Practices

1. **Always provide feedback**: Every user action should have visual feedback
2. **Use appropriate loading states**: Show skeletons for initial loads, spinners for actions
3. **Make errors actionable**: Tell users what went wrong and how to fix it
4. **Retry automatically**: For network errors, retry automatically with exponential backoff
5. **Log errors**: Always log errors for debugging, but show user-friendly messages
6. **Test error states**: Test all error scenarios during development
7. **Handle edge cases**: Consider offline mode, slow connections, and timeouts
8. **Provide escape hatches**: Always give users a way to recover from errors

## Testing Error Handling

```typescript
// Test error boundary
throw new Error('Test error');

// Test network error
await fetch('https://invalid-url.com');

// Test validation error
await saveProfile({ email: 'invalid-email' });

// Test retry mechanism
let attempts = 0;
await retryOperation(async () => {
  attempts++;
  if (attempts < 3) throw new Error('Network error');
  return 'success';
});
```
