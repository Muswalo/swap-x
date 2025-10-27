import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

export type AuthHeaderProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
};

export function AuthHeader({ title, subtitle, onBack }: AuthHeaderProps) {
  const text = useThemeColor({}, 'text');
  const iconFill = `${text}0F`;
  const iconBorder = `${text}22`;

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityLabel="Back"
        onPress={onBack}
        style={[styles.iconBtn, { backgroundColor: iconFill, borderColor: iconBorder }]}
        hitSlop={10}
      >
        <Feather name="arrow-left" size={20} color={text} />
      </Pressable>

      <View style={{ flex: 1, gap: 6 }}>
        <ThemedText type="title" style={styles.title}>{title}</ThemedText>
        {subtitle ? (
          <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    overflow: 'hidden',
  },
  title: { width: '100%', textAlign: 'left' },
  subtitle: { width: '100%', textAlign: 'left', opacity: 0.8 },
});
