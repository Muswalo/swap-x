import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

export type SwapCardProps = {
  id: string;
  posterName: string;
  currentMinistry: string;
  desiredMinistry?: string;
  currentLocation: string;
  desiredLocation: string;
  postedDate: string;
  avatarUri?: string;
  role?: string;
  grade?: string;
  yearsOfService?: number;
  onPress?: (id: string) => void;
};

export function SwapCard({
  id,
  posterName,
  currentMinistry,
  desiredMinistry,
  currentLocation,
  desiredLocation,
  postedDate,
  avatarUri,
  role,
  grade,
  yearsOfService,
  onPress
}: SwapCardProps) {
  const text = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const cardBg = useThemeColor({}, 'background');
  const subtleText = `${text}80`;
  const accentBg = `${tint}08`; // Very light tint for background
  const borderCol = `${text}10`;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: cardBg,
          borderColor: borderCol,
          transform: [{ scale: pressed ? 0.99 : 1 }],
        },
      ]}
      onPress={() => onPress?.(id)}
    >
      {/* 1. HEADER: Tags & Date (Context) */}
      <View style={styles.headerRow}>
        <View style={styles.tagsContainer}>
          {grade && (
            <View style={[styles.badge, { borderColor: borderCol }]}>
              <ThemedText style={styles.badgeText}>{grade}</ThemedText>
            </View>
          )}
          {yearsOfService && (
            <View style={[styles.badge, { borderColor: borderCol }]}>
              <ThemedText style={styles.badgeText}>{yearsOfService}y exp</ThemedText>
            </View>
          )}
        </View>
        <ThemedText style={[styles.dateText, { color: subtleText }]}>
          {postedDate}
        </ThemedText>
      </View>

      {/* 2. BODY: The Swap Route (Vertical Timeline) */}
      <View style={styles.routeContainer}>
        
        {/* FROM (Current) */}
        <View style={styles.routeStep}>
          <View style={styles.iconColumn}>
            <Feather name="circle" size={14} color={subtleText} />
            <View style={[styles.verticalLine, { backgroundColor: borderCol }]} />
          </View>
          <View style={styles.detailsColumn}>
            <ThemedText style={[styles.locationLabel, { color: subtleText }]}>FROM</ThemedText>
            <ThemedText style={styles.locationTitle}>{currentLocation}</ThemedText>
            <ThemedText style={[styles.ministryText, { color: subtleText }]}>
              {currentMinistry}
            </ThemedText>
          </View>
        </View>

        {/* TO (Desired) - Highlighted */}
        <View style={[styles.routeStep, styles.targetStep, { backgroundColor: accentBg }]}>
          <View style={styles.iconColumn}>
            <Feather name="map-pin" size={14} color={tint} />
          </View>
          <View style={styles.detailsColumn}>
            <ThemedText style={[styles.locationLabel, { color: tint }]}>TO</ThemedText>
            <ThemedText style={styles.locationTitle}>{desiredLocation}</ThemedText>
            <ThemedText style={[styles.ministryText, { color: subtleText }]}>
              {desiredMinistry || 'Any Ministry'}
            </ThemedText>
          </View>
        </View>

      </View>

      {/* 3. FOOTER: User Profile (Anchor) */}
      <View style={[styles.footer, { borderTopColor: borderCol }]}>
        <View style={styles.userInfo}>
          <View style={[styles.avatar, { backgroundColor: `${text}10` }]}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <ThemedText style={[styles.avatarLetter, { color: text }]}>
                {posterName.charAt(0).toUpperCase()}
              </ThemedText>
            )}
          </View>
          <View style={styles.userText}>
            <ThemedText style={styles.userName} numberOfLines={1}>
              {posterName}
            </ThemedText>
            <ThemedText style={[styles.userRole, { color: subtleText }]} numberOfLines={1}>
              {role || 'Staff Member'}
            </ThemedText>
          </View>
        </View>
        
        <View style={[styles.actionBtn, { backgroundColor: tint }]}>
          <Feather name="chevron-right" size={20} color="#fff" />
        </View>
      </View>

    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  /* Header */
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  dateText: {
    fontSize: 12,
  },

  /* Body / Route */
  routeContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  routeStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  targetStep: {
    marginTop: 4,
    padding: 12,
    borderRadius: 12,
    marginLeft: -12, // Pull back to align icons visually
    marginRight: -12,
    paddingLeft: 12, 
  },
  iconColumn: {
    alignItems: 'center',
    width: 20,
    marginRight: 12,
    paddingTop: 4, // Align icon with text cap height
  },
  verticalLine: {
    width: 2,
    height: 36, // Fixed height to connect dots
    marginVertical: 4,
    borderRadius: 1,
  },
  detailsColumn: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  locationTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
  },
  ministryText: {
    fontSize: 13,
  },

  /* Footer */
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarLetter: {
    fontSize: 14,
    fontWeight: '700',
  },
  userText: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
  },
  userRole: {
    fontSize: 12,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});