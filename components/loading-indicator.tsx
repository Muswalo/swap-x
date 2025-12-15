import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { ActivityIndicator, StyleSheet, View, ViewStyle } from 'react-native';

export type LoadingIndicatorProps = {
  size?: 'small' | 'large';
  message?: string;
  style?: ViewStyle;
  fullScreen?: boolean;
};

/**
 * Loading indicator component with optional message
 */
export function LoadingIndicator({
  size = 'large',
  message,
  style,
  fullScreen = false,
}: LoadingIndicatorProps) {
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');

  const containerStyle = fullScreen
    ? [styles.fullScreenContainer, { backgroundColor }]
    : [styles.container, style];

  return (
    <View style={containerStyle}>
      <ActivityIndicator size={size} color={tintColor} />
      {message && (
        <ThemedText style={styles.message}>{message}</ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
  },
});
