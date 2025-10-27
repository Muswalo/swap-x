import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

export function Divider({ label }: { label: string }) {
  const text = useThemeColor({}, 'text');
  return (
    <View style={styles.wrap}>
      <View style={[styles.line, { backgroundColor: `${text}22` }]} />
      <ThemedText style={[styles.label, { color: `${text}99` }]}>{label}</ThemedText>
      <View style={[styles.line, { backgroundColor: `${text}22` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    borderRadius: 999,
  },
  label: {
    fontSize: 12,
  },
});
