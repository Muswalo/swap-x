import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

export type QuickActionsProps = {
  onCreateSwap: () => void;
  onViewMySwaps: () => void;
};

export function QuickActions({ onCreateSwap, onViewMySwaps }: QuickActionsProps) {
  const tint = useThemeColor({}, 'tint');
  const text = useThemeColor({}, 'text');
  const cardBg = `${text}0A`;
  const border = `${text}15`;

  return (
    <View style={styles.container}>
      <Pressable
        onPress={onCreateSwap}
        style={({ pressed }) => [
          styles.actionButton,
          {
            backgroundColor: tint,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <Feather name="plus-circle" size={20} color="#FFFFFF" />
        <ThemedText style={[styles.buttonText, { color: '#FFFFFF' }]}>
          Post Swap
        </ThemedText>
      </Pressable>

      <Pressable
        onPress={onViewMySwaps}
        style={({ pressed }) => [
          styles.actionButton,
          styles.secondaryButton,
          {
            backgroundColor: cardBg,
            borderColor: border,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <Feather name="list" size={20} color={tint} />
        <ThemedText style={[styles.buttonText, { color: tint }]}>
          My Swaps
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    marginBottom: 4,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  secondaryButton: {
    borderWidth: 1.5,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});