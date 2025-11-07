import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

export type SwapCardProps = {
  id: string;
  posterName: string;
  currentMinistry: string;
  desiredMinistry: string;
  currentLocation: string;
  desiredLocation: string;
  postedDate: string;
  avatarUri?: string;
  onPress?: (id: string) => void;
};

export function SwapCard({ 
  id, 
  posterName, 
  currentMinistry, 
  currentLocation, 
  desiredLocation, 
  postedDate, 
  avatarUri,
  onPress 
}: SwapCardProps) {
  const text = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const border = `${text}15`;
  const cardBg = useThemeColor({}, 'background');

  return (
    <Pressable 
      style={[styles.card, { backgroundColor: cardBg, borderColor: border }]} 
      onPress={() => onPress?.(id)}
    >
      {/* Ministry Badge - Positioned absolutely in top right */}
      <View style={[styles.ministryBadge, { backgroundColor: cardBg, borderColor: border }]}>
        <ThemedText style={[styles.ministryText, { color: tint }]} numberOfLines={1}>
          {currentMinistry}
        </ThemedText>
      </View>
      
      <View style={styles.content}>
        {/* Avatar/Image Section */}
        <View style={[styles.imageContainer, { backgroundColor: `${text}0A` }]}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.image} />
          ) : (
            <View style={[styles.placeholderAvatar, { backgroundColor: tint }]}>
              <ThemedText style={styles.placeholderText}>{posterName.charAt(0)}</ThemedText>
            </View>
          )}
        </View>

        {/* Details Section */}
        <View style={styles.details}>
          {/* Person Name */}
          <ThemedText style={styles.name} numberOfLines={1}>
            {posterName}
          </ThemedText>

          {/* Location with Arrow */}
          <View style={styles.locationRow}>
            <ThemedText style={[styles.locationText, { color: `${text}99` }]} numberOfLines={1}>
              {currentLocation}
            </ThemedText>
            <Feather name="arrow-right" size={14} color={`${text}99`} style={styles.arrowIcon} />
            <ThemedText style={[styles.locationText, { color: `${text}99` }]} numberOfLines={1}>
              {desiredLocation}
            </ThemedText>
          </View>

          {/* Posted Date */}
          <View style={styles.dateRow}>
            <Feather name="calendar" size={12} color={tint} />
            <ThemedText style={[styles.dateText, { color: tint }]}>
              {postedDate}
            </ThemedText>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
    alignItems: 'center',
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
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
    fontSize: 32,
    fontWeight: '700',
  },
  details: {
    flex: 1,
    gap: 4,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 13,
    lineHeight: 18,
  },
  arrowIcon: {
    marginHorizontal: 2,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
  },
  ministryBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    maxWidth: 120,
  },
  ministryText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
    opacity: 0.9,
  },
});