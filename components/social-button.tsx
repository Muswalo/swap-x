import React from 'react';
import { Pressable, StyleSheet, ViewStyle, Image } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

export type SocialButtonProps = {
  provider: 'google';
  title: string;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
};

export function SocialButton({ provider, title, onPress, style }: SocialButtonProps) {
  const text = useThemeColor({}, 'text');
  const bg = useThemeColor({}, 'background');
  const border = `${text}33`;
  const fill = `${text}0F`;

  return (
    <Pressable onPress={onPress} style={[styles.wrap, { backgroundColor: fill, borderColor: border }, style]}>
      {provider === 'google' ? (
        <AntDesign name="google" size={18} color={text} style={{ marginRight: 8 }} />
      ) : null}
      <ThemedText style={styles.label}>{title}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
});
