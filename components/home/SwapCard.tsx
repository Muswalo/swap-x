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
  const border = `${text}15`;
  const cardBg = useThemeColor({}, 'background');

  // Hardcoded extra district details for MVP
  const currentDistrictInfo = {
    type: 'Rural',
    amenities: ['Schools', 'Hospital', 'Market'],
    transport: 'Moderate roads, bus access',
    housing: 'Available',
  };

  const desiredDistrictInfo = {
    type: 'Urban',
    amenities: ['Schools', 'Hospital', 'Shops', 'Clinics'],
    transport: 'Good roads, taxi & bus',
    housing: 'Limited',
  };

  const matchScore = 87; // Hardcoded similarity score for now
  const matchExplanation = "Strong match based on urban preference with reliable amenities and transport access";

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: cardBg,
          borderColor: border,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
      onPress={() => onPress?.(id)}
    >
      {/* Header Section with Avatar and User Info */}
      <View style={styles.header}>
        {/* Circular Avatar - Top Left */}
        <View style={[styles.avatarContainer, { backgroundColor: `${text}0A` }]}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.placeholderAvatar, { backgroundColor: tint }]}>
              <ThemedText style={styles.placeholderText}>
                {posterName.charAt(0).toUpperCase()}.
              </ThemedText>
            </View>
          )}
        </View>

        {/* User Details */}
        <View style={styles.userInfo}>
          {/* Name and Title */}
          <View style={styles.titleSection}>
            <ThemedText style={styles.name}>
              {posterName.split(' ')[0]} {'•••••'}
            </ThemedText>
            <ThemedText style={[styles.roleText, { color: `${text}88` }]} numberOfLines={1}>
              {role || 'Staff Member'} • {currentMinistry}
            </ThemedText>
          </View>

          {/* Meta Information Row */}
          <View style={styles.metaInfoRow}>
            {yearsOfService && (
              <ThemedText style={[styles.metaText, { color: `${text}77` }]}>
                {yearsOfService} yrs
              </ThemedText>
            )}
            {grade && (
              <ThemedText style={[styles.metaText, { color: `${text}77` }]}>
                {grade}
              </ThemedText>
            )}
            <ThemedText style={[styles.metaText, { color: `${text}77` }]}>
              {postedDate}
            </ThemedText>
          </View>
        </View>

        {/* Match Score Badge */}
        <View style={[styles.matchBadge, { backgroundColor: `${tint}12`, borderColor: `${tint}30` }]}>
          <Feather name="star" size={14} color={tint} />
          <ThemedText style={[styles.matchScore, { color: tint }]}>
            {matchScore}%
          </ThemedText>
        </View>
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: border }]} />

      {/* Swap Details Section */}
      <View style={styles.swapSection}>
        {/* Location Swap Details - Two Column Layout */}
        <View style={styles.locationWrapper}>
          {/* FROM Column */}
          <View style={styles.columnWithLabel}>
            <ThemedText style={[styles.swapLabel, { color: `${text}77` }]}>FROM</ThemedText>
            <View style={styles.districtColumn}>
              <View style={styles.districtHeader}>
                <View style={styles.locationTitleRow}>
                  <View style={[styles.dot, { backgroundColor: text }]} />
                  <ThemedText style={[styles.districtTitle, { color: text }]} numberOfLines={1}>
                    {currentLocation}
                  </ThemedText>
                </View>
                <View style={[styles.typeTag, { backgroundColor: `${text}0A` }]}>
                  <ThemedText style={[styles.typeText, { color: `${text}99` }]}>
                    {currentDistrictInfo.type}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Feather name="map-pin" size={10} color={`${text}66`} />
                <ThemedText style={[styles.infoText, { color: `${text}77` }]} numberOfLines={2}>
                  {currentDistrictInfo.amenities.join(', ')}
                </ThemedText>
              </View>

              <View style={styles.infoRow}>
                <Feather name="truck" size={10} color={`${text}66`} />
                <ThemedText style={[styles.infoText, { color: `${text}77` }]} numberOfLines={2}>
                  {currentDistrictInfo.transport}
                </ThemedText>
              </View>

              <View style={styles.infoRow}>
                <Feather name="home" size={10} color={`${text}66`} />
                <ThemedText style={[styles.infoText, { color: `${text}77` }]}>
                  {currentDistrictInfo.housing}
                </ThemedText>
              </View>
            </View>
          </View>

          {/* TO Column */}
          <View style={styles.columnWithLabel}>
            <ThemedText style={[styles.swapLabel, { color: `${text}77` }]}>TO</ThemedText>
            <View style={styles.districtColumn}>
              <View style={styles.districtHeader}>
                <View style={styles.locationTitleRow}>
                  <View style={[styles.dot, { backgroundColor: text }]} />
                  <ThemedText style={[styles.districtTitle, { color: text }]} numberOfLines={1}>
                    {desiredLocation}
                  </ThemedText>
                </View>
                <View style={[styles.typeTag, { backgroundColor: `${text}0A` }]}>
                  <ThemedText style={[styles.typeText, { color: `${text}99` }]}>
                    {desiredDistrictInfo.type}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Feather name="map-pin" size={10} color={`${text}66`} />
                <ThemedText style={[styles.infoText, { color: `${text}77` }]} numberOfLines={2}>
                  {desiredDistrictInfo.amenities.join(', ')}
                </ThemedText>
              </View>

              <View style={styles.infoRow}>
                <Feather name="truck" size={10} color={`${text}66`} />
                <ThemedText style={[styles.infoText, { color: `${text}77` }]} numberOfLines={2}>
                  {desiredDistrictInfo.transport}
                </ThemedText>
              </View>

              <View style={styles.infoRow}>
                <Feather name="home" size={10} color={`${text}66`} />
                <ThemedText style={[styles.infoText, { color: `${text}77` }]}>
                  {desiredDistrictInfo.housing}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Match Explanation */}
        <View style={[styles.matchExplanation, { backgroundColor: `${tint}08` }]}>
          <Feather name="info" size={12} color={tint} />
          <ThemedText style={[styles.explanationText, { color: `${text}99` }]}>
            {matchExplanation}
          </ThemedText>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'flex-start',
    gap: 10,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderAvatar: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
    gap: 4,
  },
  titleSection: {
    gap: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 18,
    letterSpacing: -0.3,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 15,
  },
  metaInfoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metaText: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '500',
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  matchScore: {
    fontSize: 13,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginHorizontal: 12,
  },
  swapSection: {
    padding: 12,
    gap: 10,
  },
  locationWrapper: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  columnWithLabel: {
    flex: 1,
    gap: 6,
  },
  swapLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  districtColumn: {
    gap: 5,
  },
  districtHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
    marginBottom: 2,
  },
  locationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  districtTitle: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  typeTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 5,
  },
  infoText: {
    fontSize: 10,
    lineHeight: 13,
    flex: 1,
  },
  matchExplanation: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    padding: 8,
    borderRadius: 8,
  },
  explanationText: {
    fontSize: 10,
    lineHeight: 14,
    flex: 1,
  },
});