/**
 * ContactOptionsModal Component
 * 
 * Bottom modal with "Message in App" and "View Contact Details" options.
 * Requirements: 1.1, 1.2
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { BottomModal } from '@/components/bottom-modal';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

export interface ContactOptionsModalProps {
  isVisible: boolean;
  onClose: () => void;
  onMessageInApp: () => void;
  onViewContactDetails: () => void;
  posterName?: string;
}

export function ContactOptionsModal({
  isVisible,
  onClose,
  onMessageInApp,
  onViewContactDetails,
  posterName = 'this user',
}: ContactOptionsModalProps) {
  const tint = useThemeColor({}, 'tint');
  const text = useThemeColor({}, 'text');
  const borderColor = `${text}15`;

  return (
    <BottomModal
      isVisible={isVisible}
      onClose={onClose}
      heightPercent={35}
    >
      <View style={styles.container}>
        <ThemedText type="subtitle" style={styles.title}>
          Contact Options
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          How would you like to reach {posterName}?
        </ThemedText>

        <View style={styles.optionsContainer}>
          {/* Message in App Option */}
          <Pressable
            style={[styles.optionButton, { borderColor }]}
            onPress={onMessageInApp}
            accessibilityLabel="Message in App"
            accessibilityRole="button"
          >
            <View style={[styles.iconContainer, { backgroundColor: `${tint}15` }]}>
              <Ionicons name="chatbubble-outline" size={24} color={tint} />
            </View>
            <View style={styles.optionTextContainer}>
              <ThemedText type="defaultSemiBold">Message in App</ThemedText>
              <ThemedText style={styles.optionDescription}>
                Start a conversation directly
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={`${text}50`} />
          </Pressable>

          {/* View Contact Details Option */}
          <Pressable
            style={[styles.optionButton, { borderColor }]}
            onPress={onViewContactDetails}
            accessibilityLabel="View Contact Details"
            accessibilityRole="button"
          >
            <View style={[styles.iconContainer, { backgroundColor: `${tint}15` }]}>
              <Ionicons name="call-outline" size={24} color={tint} />
            </View>
            <View style={styles.optionTextContainer}>
              <ThemedText type="defaultSemiBold">View Contact Details</ThemedText>
              <ThemedText style={styles.optionDescription}>
                See phone number and email
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={`${text}50`} />
          </Pressable>
        </View>
      </View>
    </BottomModal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
  },
  title: {
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
    fontSize: 14,
    marginBottom: 20,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionDescription: {
    fontSize: 13,
    opacity: 0.6,
    marginTop: 2,
  },
});
