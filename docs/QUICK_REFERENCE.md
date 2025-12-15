# SwapX Quick Reference Guide

Quick reference for common patterns and components in the SwapX application.

## Import Shortcuts

```typescript
// Error Handling
import { useAsyncOperation } from '@/hooks/use-async-operation';
import { getUserFriendlyMessage, retryOperation } from '@/utils/error-handler';

// Feedback Components
import { LoadingIndicator } from '@/components/loading-indicator';
import { ErrorNotice } from '@/components/error-notice';
import { Toast } from '@/components/toast';
import { SuccessFeedback } from '@/components/success-feedback';
import { RefreshControl } from '@/components/refresh-control';

// Skeleton Screens
import {
  ProfileSkeleton,
  SwapListSkeleton,
  SwapDetailsSkeleton,
  MessagesListSkeleton,
  ChatSkeleton,
  SettingsSkeleton,
} from '@/components/skeleton-screens';

// Hooks
import { useToast } from '@/hooks/use-toast';

// Core Components
import { AppButton } from '@/components/app-button';
import { ScreenHeader } from '@/components/screen-header';
import { BottomModal } from '@/components/bottom-modal';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
```

## Common Patterns

### 1. Screen with Data Loading

```typescript
function MyScreen() {
  const { data, error, isLoading, execute } = useAsyncOperation();
  const { toast, showSuccess, showError, hideToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await execute(
      async () => await fetchData(),
      { retry: true }
    );
  };

  if (isLoading && !data) {
    return <ProfileSkeleton />;
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScreenHeader title="My Screen" showBack />
      
      {error && <ErrorNotice message={error} visible variant="danger" />}
      
      {data && <Content data={data} />}
      
      <Toast {...toast} onHide={hideToast} />
    </ThemedView>
  );
}
```

### 2. Form with Validation

```typescript
function MyForm() {
  const [isSaving, setIsSaving] = useState(false);
  const { showSuccess, showError } = useToast();

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      await saveData(formData);
      showSuccess('Saved successfully');
      router.back();
    } catch (error) {
      showError(getUserFriendlyMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View>
      <FormInput {...} />
      <AppButton
        title="Save"
        onPress={handleSubmit}
        loading={isSaving}
        disabled={!isValid}
      />
    </View>
  );
}
```

### 3. List with Pull-to-Refresh

```typescript
function MyList() {
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState([]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await fetchItems();
      setItems(data);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      }
    >
      {items.map(item => <ItemCard key={item.id} item={item} />)}
    </ScrollView>
  );
}
```

### 4. Modal with Form

```typescript
function MyComponent() {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <AppButton
        title="Open Modal"
        onPress={() => setModalVisible(true)}
      />
      
      <BottomModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Modal Title"
      >
        <FormContent />
      </BottomModal>
    </>
  );
}
```

## Quick Snippets

### Show Success Toast
```typescript
const { showSuccess } = useToast();
showSuccess('Action completed successfully');
```

### Show Error Toast
```typescript
const { showError } = useToast();
showError(getUserFriendlyMessage(error));
```

### Retry Operation
```typescript
const result = await retryOperation(
  async () => await fetchData(),
  { maxRetries: 3 }
);
```

### Loading Button
```typescript
<AppButton
  title="Save"
  onPress={handleSave}
  loading={isSaving}
/>
```

### Error Notice
```typescript
<ErrorNotice
  message={error}
  visible={!!error}
  variant="danger"
/>
```

### Skeleton Loading
```typescript
{isLoading ? <ProfileSkeleton /> : <ProfileContent />}
```

## Color Values

```typescript
// Success
const successColor = '#34c759';

// Error
const errorColor = '#ff453a';

// Warning
const warningColor = '#ff9f0a';

// Info (use theme tint)
const tintColor = useThemeColor({}, 'tint');
```

## Spacing Values

```typescript
const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
};
```

## Border Radius

```typescript
const borderRadius = {
  small: 8,
  medium: 12,
  large: 16,
};
```

## Common StyleSheet

```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
});
```

## Database Operations

```typescript
import { profileUtils, swapUtils } from '@/lib/database.utils';

// Get profile
const profile = await profileUtils.getProfile(userId);

// Update profile
const updated = await profileUtils.updateProfile(userId, updates);

// Get swaps
const swaps = await swapUtils.getSwaps({ ministry: 'Health' });

// Create swap
const swap = await swapUtils.createSwap(swapData);
```

## Navigation

```typescript
import { useRouter } from 'expo-router';

const router = useRouter();

// Navigate to screen
router.push('/profile');

// Navigate with params
router.push({
  pathname: '/swap-details',
  params: { swapId: '123' }
});

// Go back
router.back();

// Replace current screen
router.replace('/home');
```

## Theming

```typescript
import { useThemeColor } from '@/hooks/use-theme-color';

const bg = useThemeColor({}, 'background');
const text = useThemeColor({}, 'text');
const tint = useThemeColor({}, 'tint');
```

## Safe Area

```typescript
import { SafeAreaView } from 'react-native-safe-area-context';

<SafeAreaView style={{ flex: 1 }} edges={['top']}>
  {/* Content */}
</SafeAreaView>
```

## Icons

```typescript
import { Feather } from '@expo/vector-icons';

<Feather name="check-circle" size={24} color={tintColor} />
```

## Common Icon Names

- `check-circle`: Success
- `x-circle`: Error
- `alert-circle`: Warning
- `info`: Information
- `alert-triangle`: Alert
- `chevron-right`: Navigation
- `chevron-left`: Back
- `search`: Search
- `filter`: Filter
- `settings`: Settings
- `user`: Profile
- `message-circle`: Messages
- `bell`: Notifications
- `home`: Home
- `edit`: Edit
- `trash-2`: Delete
- `plus`: Add
- `x`: Close
