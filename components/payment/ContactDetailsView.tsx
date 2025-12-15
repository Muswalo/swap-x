/**
 * ContactDetailsView Component
 * 
 * Displays phone number and email with copy to clipboard functionality.
 * Requirements: 1.3
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { BottomModal } from '@/components/bottom-modal';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { ContactDetails } from '@/lib/payment.types';

export interface ContactDetailsViewProps {
  isVisible: boolean;
  onClose: () => void;
  contactDetails: ContactDetails;
  posterName?: string;
  onCopyToClipboard?: (text: string) => Promise<void>;
}

export function ContactDetailsView({
  isVisible,
  onClose,
  contactDetails,
  posterName = 'Contact',
  onCopyToClipboard,
}: ContactDetailsViewProps) {
  const [copiedField, setCopiedField] = useState<'phone' | 'email' | null>(null);
  const tint = useThemeColor({}, 'tint');
  const text = useThemeColor({}, 'text');
  const borderColor = `${text}15`;
  const successColor = '#34C759';

  const handleCopy = async (value: string, field: 'phone' | 'email') => {
    if (onCopyToClipboard) {
      await onCopyToClipboard(value);
    }
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const hasPhone = !!contactDetails.phoneNumber;
  const hasEmail = !!contactDetails.email;
  const hasAnyContact = hasPhone || hasEmail;

  return (
    <BottomModal
      isVisible={isVisible}
      onClose={onClose}
      heightPercent={hasAnyContact ? 45 : 30}
    >
      <View style={styles.container}>
        <View style={[styles.iconContainer, { backgroundColor: `${successColor}15` }]}>
          <Ionicons name="checkmark-circle" size={40} color={successColor} />
        </View>
        
        <ThemedText type="subtitle" style={styles.title}>
          {posterName}'s Contact Details
        </ThemedText>

        {!hasAnyContact ? (
          <View style={styles.noContactContainer}>
            <ThemedText style={styles.noContactText}>
              No contact details available for this user.
            </ThemedText>
          </View>
        ) : (
          <View style={styles.detailsContainer}>
            {/* Phone Number */}
            {hasPhone && (
              <ContactDetailRow
                icon="call-outline"
                label="Phone"
                value={contactDetails.phoneNumber!}
                onCopy={() => handleCopy(contactDetails.phoneNumber!, 'phone')}
                isCopied={copiedField === 'phone'}
                tint={tint}
                text={text}
                borderColor={borderColor}
                successColor={successColor}
              />
            )}

            {/* Email */}
            {hasEmail && (
              <ContactDetailRow
                icon="mail-outline"
                label="Email"
                value={contactDetails.email!}
                onCopy={() => handleCopy(contactDetails.email!, 'email')}
                isCopied={copiedField === 'email'}
                tint={tint}
                text={text}
                borderColor={borderColor}
                successColor={successColor}
              />
            )}
          </View>
        )}

        {/* Close Button */}
        <Pressable
          style={[styles.closeButton, { backgroundColor: tint }]}
          onPress={onClose}
          accessibilityLabel="Close contact details"
          accessibilityRole="button"
        >
          <ThemedText style={styles.closeButtonText}>Done</ThemedText>
        </Pressable>
      </View>
    </BottomModal>
  );
}

interface ContactDetailRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  onCopy: () => void;
  isCopied: boolean;
  tint: string;
  text: string;
  borderColor: string;
  successColor: string;
}

function ContactDetailRow({
  icon,
  label,
  value,
  onCopy,
  isCopied,
  tint,
  text,
  borderColor,
  successColor,
}: ContactDetailRowProps) {
  return (
    <View style={[styles.detailRow, { borderColor }]}>
      <View style={[styles.detailIconContainer, { backgroundColor: `${tint}15` }]}>
        <Ionicons name={icon} size={20} color={tint} />
      </View>
      <View style={styles.detailContent}>
        <ThemedText style={styles.detailLabel}>{label}</ThemedText>
        <ThemedText type="defaultSemiBold" style={styles.detailValue}>
          {value}
        </ThemedText>
      </View>
      <Pressable
        style={[
          styles.copyButton,
          { backgroundColor: isCopied ? `${successColor}15` : `${text}08` },
        ]}
        onPress={onCopy}
        accessibilityLabel={isCopied ? 'Copied' : `Copy ${label}`}
        accessibilityRole="button"
      >
        <Ionicons
          name={isCopied ? 'checkmark' : 'copy-outline'}
          size={18}
          color={isCopied ? successColor : `${text}60`}
        />
        <ThemedText
          style={[
            styles.copyButtonText,
            { color: isCopied ? successColor : `${text}60` },
          ]}
        >
          {isCopied ? 'Copied' : 'Copy'}
        </ThemedText>
      </Pressable>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  noContactContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  noContactText: {
    textAlign: 'center',
    opacity: 0.6,
  },
  detailsContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    opacity: 0.5,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 4,
  },
  copyButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  closeButton: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
