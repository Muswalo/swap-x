/**
 * MobileMoneyModal Component
 * 
 * Bottom modal with phone number input field for mobile money payment.
 * Displays selected amount, Pay button with loading state, and error messages.
 * Requirements: 3.1, 3.2, 3.4
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { BottomModal } from '@/components/bottom-modal';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

export interface MobileMoneyModalProps {
  isVisible: boolean;
  onClose: () => void;
  onPay: (phoneNumber: string) => void;
  amount: number;
  description: string;
  isLoading?: boolean;
  error?: string | null;
}

export function MobileMoneyModal({
  isVisible,
  onClose,
  onPay,
  amount,
  description,
  isLoading = false,
  error = null,
}: MobileMoneyModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const tint = useThemeColor({}, 'tint');
  const text = useThemeColor({}, 'text');
  const background = useThemeColor({}, 'background');
  const borderColor = `${text}20`;
  const dangerColor = '#FF3B30';

  const handlePay = () => {
    if (phoneNumber.trim() && !isLoading) {
      onPay(phoneNumber.trim());
    }
  };

  const isValidPhone = phoneNumber.trim().length >= 9;

  return (
    <BottomModal
      isVisible={isVisible}
      onClose={isLoading ? () => {} : onClose}
      heightPercent={45}
    >
      <View style={styles.container}>
        <ThemedText type="subtitle" style={styles.title}>
          Mobile Money Payment
        </ThemedText>

        {/* Amount Display */}
        <View style={[styles.amountCard, { backgroundColor: `${tint}10` }]}>
          <ThemedText style={styles.amountLabel}>Amount to pay</ThemedText>
          <ThemedText type="title" style={[styles.amountValue, { color: tint }]}>
            K{amount}
          </ThemedText>
          <ThemedText style={styles.amountDescription}>{description}</ThemedText>
        </View>

        {/* Phone Number Input */}
        <View style={styles.inputSection}>
          <ThemedText style={styles.inputLabel}>Mobile Money Number</ThemedText>
          <View style={[
            styles.inputContainer, 
            { borderColor: error ? dangerColor : borderColor, backgroundColor: `${text}05` }
          ]}>
            <Ionicons name="call-outline" size={20} color={`${text}50`} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: text }]}
              placeholder="e.g., 0971234567"
              placeholderTextColor={`${text}40`}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              editable={!isLoading}
              autoFocus
            />
          </View>
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color={dangerColor} />
              <ThemedText style={[styles.errorText, { color: dangerColor }]}>
                {error}
              </ThemedText>
            </View>
          )}
        </View>

        {/* Pay Button */}
        <Pressable
          style={[
            styles.payButton,
            { backgroundColor: tint },
            (!isValidPhone || isLoading) && styles.payButtonDisabled,
          ]}
          onPress={handlePay}
          disabled={!isValidPhone || isLoading}
          accessibilityLabel={isLoading ? 'Processing payment' : `Pay K${amount}`}
          accessibilityRole="button"
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <ThemedText style={styles.payButtonText}>Processing payment...</ThemedText>
            </View>
          ) : (
            <ThemedText style={styles.payButtonText}>Pay K{amount}</ThemedText>
          )}
        </Pressable>

        {/* Cancel Link */}
        {!isLoading && (
          <Pressable onPress={onClose} style={styles.cancelButton}>
            <ThemedText style={[styles.cancelText, { color: `${text}60` }]}>
              Cancel
            </ThemedText>
          </Pressable>
        )}
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
    marginBottom: 20,
  },
  amountCard: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  amountLabel: {
    fontSize: 13,
    opacity: 0.6,
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 4,
  },
  amountDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  errorText: {
    fontSize: 13,
  },
  payButton: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  cancelText: {
    fontSize: 15,
  },
});
