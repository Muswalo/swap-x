import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export type AppButtonProps = {
  title: string;
  onPress?: () => void;
  accessibilityLabel?: string;
  disabled?: boolean;
  variant?: 'primary' | 'ghost';
  style?: ViewStyle | ViewStyle[];
};

export function AppButton({
  title,
  onPress,
  accessibilityLabel,
  disabled,
  variant = 'primary',
  style,
}: AppButtonProps) {
  const colorScheme = useColorScheme();
  const tint = useThemeColor({}, 'tint');
  const text = useThemeColor({}, 'text');

  const isPrimary = variant === 'primary';
  const containerStyle: any = [
    styles.base,
    isPrimary
      ? [{ backgroundColor: tint }]
      : [{ borderColor: `${tint}66`, borderWidth: 1, backgroundColor: 'transparent' }],
    disabled ? { opacity: 0.5 } : null,
    style,
  ];

  const labelColor = isPrimary
    ? colorScheme === 'dark'
      ? Colors.light.text // dark scheme uses white tint -> use dark label
      : '#FFFFFF'
    : text;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      disabled={disabled}
      style={containerStyle}
    >
      <ThemedText style={[styles.label, { color: labelColor }]}>{title}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
});
