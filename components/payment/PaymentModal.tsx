/**
 * PaymentModal Component
 * 
 * Bottom modal displaying payment options: K2, K5, K10, K15, K50.
 * Shows "Best Value" badge on K50 option.
 * Shows remaining views if user has balance.
 * Requirements: 2.1, 2.2, 2.3, 2.5
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { BottomModal } from '@/components/bottom-modal';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { PAYMENT_TIERS, PaymentOption } from '@/lib/payment.types';

export interface PaymentModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectOption: (option: PaymentOption) => void;
  onUseViewBalance?: () => void;
  viewsRemaining?: number;
}

export function PaymentModal({
  isVisible,
  onClose,
  onSelectOption,
  onUseViewBalance,
  viewsRemaining = 0,
}: PaymentModalProps) {
  const tint = useThemeColor({}, 'tint');
  const text = useThemeColor({}, 'text');
  const borderColor = `${text}15`;
  const successColor = '#34C759';

  return (
    <BottomModal
      isVisible={isVisible}
      onClose={onClose}
      heightPercent={viewsRemaining > 0 ? 70 : 65}
    >
      <View style={styles.container}>
        <ThemedText type="subtitle" style={styles.title}>
          View Contact Details
        </ThemedText>

        {/* Show remaining views if user has balance */}
        {viewsRemaining > 0 && (
          <Pressable
            style={[styles.balanceCard, { backgroundColor: `${successColor}15`, borderColor: successColor }]}
            onPress={onUseViewBalance}
            accessibilityLabel={`Use one of your ${viewsRemaining} remaining views`}
            accessibilityRole="button"
          >
            <View style={styles.balanceContent}>
              <View style={[styles.balanceIcon, { backgroundColor: successColor }]}>
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.balanceTextContainer}>
                <ThemedText type="defaultSemiBold">
                  You have {viewsRemaining} view{viewsRemaining !== 1 ? 's' : ''} remaining
                </ThemedText>
                <ThemedText style={styles.balanceDescription}>
                  Tap to use one view
                </ThemedText>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={successColor} />
          </Pressable>
        )}

        <ThemedText style={styles.sectionLabel}>
          {viewsRemaining > 0 ? 'Or purchase more views' : 'Choose a payment option'}
        </ThemedText>

        <ScrollView 
          style={styles.optionsScroll} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.optionsContent}
        >
          {PAYMENT_TIERS.map((option) => (
            <PaymentOptionCard
              key={option.type}
              option={option}
              onPress={() => onSelectOption(option)}
              tint={tint}
              text={text}
              borderColor={borderColor}
            />
          ))}
        </ScrollView>
      </View>
    </BottomModal>
  );
}


interface PaymentOptionCardProps {
  option: PaymentOption;
  onPress: () => void;
  tint: string;
  text: string;
  borderColor: string;
}

function PaymentOptionCard({ option, onPress, tint, text, borderColor }: PaymentOptionCardProps) {
  const isBestValue = option.isBestValue;
  
  return (
    <Pressable
      style={[
        styles.optionCard,
        { borderColor: isBestValue ? tint : borderColor },
        isBestValue && styles.bestValueCard,
      ]}
      onPress={onPress}
      accessibilityLabel={`${option.label} - ${option.description}`}
      accessibilityRole="button"
    >
      {isBestValue && (
        <View style={[styles.bestValueBadge, { backgroundColor: tint }]}>
          <ThemedText style={styles.bestValueText}>Best Value</ThemedText>
        </View>
      )}
      <View style={styles.optionCardContent}>
        <View style={styles.optionLeft}>
          <ThemedText type="defaultSemiBold" style={styles.optionPrice}>
            {option.label}
          </ThemedText>
          <ThemedText style={styles.optionDesc}>
            {option.description}
          </ThemedText>
        </View>
        <Ionicons name="chevron-forward" size={20} color={`${text}50`} />
      </View>
    </Pressable>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  balanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  balanceContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  balanceTextContainer: {
    flex: 1,
  },
  balanceDescription: {
    fontSize: 13,
    opacity: 0.7,
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 12,
  },
  optionsScroll: {
    flex: 1,
  },
  optionsContent: {
    gap: 10,
    paddingBottom: 16,
  },
  optionCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  bestValueCard: {
    borderWidth: 2,
  },
  bestValueBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    borderBottomRightRadius: 8,
  },
  bestValueText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  optionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  optionLeft: {
    flex: 1,
  },
  optionPrice: {
    fontSize: 17,
  },
  optionDesc: {
    fontSize: 13,
    opacity: 0.6,
    marginTop: 2,
  },
});
