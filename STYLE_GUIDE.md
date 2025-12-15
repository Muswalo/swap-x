# SwapX Style Guide

This document outlines the design system and styling conventions for the SwapX application.

## Design Principles

1. **Consistency**: Use the same components and patterns throughout the app
2. **Accessibility**: Ensure all interactive elements are accessible
3. **Feedback**: Provide clear feedback for all user actions
4. **Performance**: Optimize for smooth animations and fast load times

## Color System

### Light Mode
- **Primary Text**: `#11181C`
- **Background**: `#fff`
- **Tint/Primary**: `#0a7ea4`
- **Icon**: `#687076`
- **Card Background**: `#ffffff`

### Dark Mode
- **Primary Text**: `#ECEDEE`
- **Background**: `#151718`
- **Tint/Primary**: `#fff`
- **Icon**: `#9BA1A6`
- **Card Background**: `#1e1e1e`

### Semantic Colors
- **Success**: `#34c759`
- **Error**: `#ff453a`
- **Warning**: `#ff9f0a`
- **Info**: Use theme tint color

## Typography

### Font Families
- **Sans**: System default
- **Serif**: Georgia, Times New Roman
- **Mono**: Monospace for code/technical content

### Font Sizes
- **Title**: 24px, weight 700
- **Heading**: 20px, weight 600
- **Body**: 16px, weight 400
- **Caption**: 14px, weight 400
- **Small**: 12px, weight 400

## Spacing

Use consistent spacing values:
- **xs**: 4px
- **sm**: 8px
- **md**: 12px
- **lg**: 16px
- **xl**: 24px
- **2xl**: 32px
- **3xl**: 48px

## Border Radius

- **Small**: 8px
- **Medium**: 12px
- **Large**: 16px
- **Circle**: 50% or half of width/height

## Components

### Core Components

#### ScreenHeader
Use for all screen headers with consistent navigation.

```tsx
import { ScreenHeader } from '@/components/screen-header';

<ScreenHeader 
  title="Screen Title"
  showBack={true}
  subtitle="Optional subtitle"
/>
```

#### AppButton
Use for all primary and secondary actions.

```tsx
import { AppButton } from '@/components/app-button';

<AppButton
  title="Action"
  onPress={handlePress}
  variant="primary" // or "ghost"
  loading={isLoading}
  disabled={isDisabled}
/>
```

#### BottomModal
Use for selection interfaces and forms.

```tsx
import { BottomModal } from '@/components/bottom-modal';

<BottomModal
  visible={isVisible}
  onClose={handleClose}
  title="Modal Title"
>
  {/* Modal content */}
</BottomModal>
```

### Feedback Components

#### ErrorNotice
Display error messages inline.

```tsx
import { ErrorNotice } from '@/components/error-notice';

<ErrorNotice
  message={errorMessage}
  visible={!!errorMessage}
  variant="danger" // or "info", "success", "warning"
/>
```

#### LoadingIndicator
Show loading states.

```tsx
import { LoadingIndicator } from '@/components/loading-indicator';

<LoadingIndicator
  size="large"
  message="Loading..."
  fullScreen={false}
/>
```

#### Toast
Show temporary notifications.

```tsx
import { Toast } from '@/components/toast';
import { useToast } from '@/hooks/use-toast';

const { toast, showSuccess, showError } = useToast();

<Toast
  message={toast.message}
  type={toast.type}
  visible={toast.visible}
  onHide={hideToast}
/>
```

#### SuccessFeedback
Show success messages with auto-hide.

```tsx
import { SuccessFeedback } from '@/components/success-feedback';

<SuccessFeedback
  message="Action completed successfully"
  visible={showSuccess}
  onHide={() => setShowSuccess(false)}
/>
```

### Skeleton Screens

Use skeleton screens for loading states:

```tsx
import { 
  ProfileSkeleton,
  SwapListSkeleton,
  SwapDetailsSkeleton,
  MessagesListSkeleton,
  ChatSkeleton,
  SettingsSkeleton,
} from '@/components/skeleton-screens';

// Use appropriate skeleton based on screen
{isLoading ? <ProfileSkeleton /> : <ProfileContent />}
```

### RefreshControl

Use themed refresh control for pull-to-refresh:

```tsx
import { RefreshControl } from '@/components/refresh-control';

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

## Error Handling

### Error Boundary
All screens are wrapped in an error boundary at the root level.

### Async Operations
Use the `useAsyncOperation` hook for consistent error handling:

```tsx
import { useAsyncOperation } from '@/hooks/use-async-operation';

const { data, error, isLoading, execute } = useAsyncOperation();

const handleAction = async () => {
  await execute(
    async () => {
      // Your async operation
      return await someAsyncFunction();
    },
    {
      retry: true,
      maxRetries: 3,
      onSuccess: () => showSuccess('Action completed'),
      onError: (error) => showError(getUserFriendlyMessage(error)),
    }
  );
};
```

## Best Practices

### 1. Always Use Themed Components
```tsx
// ✅ Good
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

// ❌ Bad
import { View, Text } from 'react-native';
```

### 2. Provide Loading States
```tsx
// ✅ Good
{isLoading ? <LoadingIndicator /> : <Content />}

// ❌ Bad
{/* No loading state */}
```

### 3. Handle Errors Gracefully
```tsx
// ✅ Good
<ErrorNotice message={error} visible={!!error} variant="danger" />

// ❌ Bad
{error && <Text>{error}</Text>}
```

### 4. Use Consistent Spacing
```tsx
// ✅ Good
const styles = StyleSheet.create({
  container: {
    padding: 16, // lg
    gap: 12, // md
  },
});

// ❌ Bad
const styles = StyleSheet.create({
  container: {
    padding: 15,
    gap: 11,
  },
});
```

### 5. Provide User Feedback
```tsx
// ✅ Good
const handleSave = async () => {
  setLoading(true);
  try {
    await saveData();
    showSuccess('Saved successfully');
  } catch (error) {
    showError(getUserFriendlyMessage(error));
  } finally {
    setLoading(false);
  }
};

// ❌ Bad
const handleSave = async () => {
  await saveData();
  // No feedback
};
```

## Accessibility

1. **Labels**: Always provide `accessibilityLabel` for interactive elements
2. **Roles**: Use appropriate `accessibilityRole` props
3. **States**: Indicate loading, disabled, and error states clearly
4. **Touch Targets**: Minimum 44x44 points for touch targets
5. **Contrast**: Ensure sufficient color contrast for text

## Animation Guidelines

1. **Duration**: 200-300ms for most animations
2. **Easing**: Use native driver when possible
3. **Performance**: Avoid animating layout properties
4. **Feedback**: Provide immediate visual feedback for interactions

## Testing Checklist

- [ ] Component uses themed colors
- [ ] Loading states are implemented
- [ ] Error states are handled
- [ ] Success feedback is provided
- [ ] Accessibility labels are present
- [ ] Touch targets are adequate
- [ ] Animations are smooth
- [ ] Works in both light and dark mode
- [ ] Responsive to different screen sizes
