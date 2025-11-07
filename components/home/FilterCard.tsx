import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

export type SwapPreferenceCardProps = {
  currentLocation: string;
  desiredLocation: string;
  onEdit?: () => void;
  variant?: 'default' | 'compact';
};

export default function SwapPreferenceCard({ 
  currentLocation, 
  desiredLocation, 
  onEdit,
  variant = 'default'
}: SwapPreferenceCardProps) {
  const text = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const border = `${text}15`;
  const cardBg = useThemeColor({}, 'background');  
  const isCompact = variant === 'compact';
  const hasValidData = currentLocation && desiredLocation;

  return (
    <View style={[
      styles.card, 
      isCompact && styles.cardCompact,
      { 
        backgroundColor: cardBg, 
        borderColor: border,
        shadowColor: text 
      }
    ]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: `${tint}15` }]}>
            <Feather name="map-pin" size={isCompact ? 16 : 18} color={tint} />
          </View>
          <ThemedText style={[
            styles.title, 
            isCompact && styles.titleCompact
          ]}>
            Swap Preferences
          </ThemedText>
        </View>
        
        {onEdit && (
          <Pressable 
            style={({ pressed }) => [
              styles.editButton,
              isCompact && styles.editButtonCompact,
              { 
                backgroundColor: pressed ? `${tint}20` : `${tint}10`,
                opacity: pressed ? 0.8 : 1 
              }
            ]} 
            onPress={onEdit}
            accessibilityLabel="Edit swap preferences"
            accessibilityHint="Opens edit screen for current and preferred locations"
          >
            <Feather name="edit-3" size={isCompact ? 12 : 14} color={tint} />
            {!isCompact && (
              <ThemedText style={[styles.editText, { color: tint }]}>
                Edit
              </ThemedText>
            )}
          </Pressable>
        )}
      </View>

      {/* Details */}
      <View style={[styles.details, isCompact && styles.detailsCompact]}>
        <LocationRow
          icon="home"
          label="Current Location"
          value={currentLocation}
          tint={tint}
          textColor={text}
          isCompact={isCompact}
        />
        
        <View style={[styles.divider, { backgroundColor: `${text}08` }]} />
        
        <LocationRow
          icon="target"
          label="Preferred Location"
          value={desiredLocation}
          tint={tint}
          textColor={text}
          isCompact={isCompact}
        />
      </View>

    </View>
  );
}

// Sub-component for location rows
type LocationRowProps = {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  tint: string;
  textColor: string;
  isCompact?: boolean;
};

function LocationRow({ icon, label, value, tint, textColor, isCompact }: LocationRowProps) {
  return (
    <View style={styles.row}>
      <Feather 
        name={icon} 
        size={isCompact ? 14 : 16} 
        color={tint} 
      />
      <View style={styles.textGroup}>
        <ThemedText 
          style={[
            styles.label, 
            isCompact && styles.labelCompact,
            { color: `${textColor}70` }
          ]}
          numberOfLines={1}
        >
          {label}
        </ThemedText>
        <ThemedText 
          style={[
            styles.value, 
            isCompact && styles.valueCompact,
            { color: value ? textColor : `${textColor}50` }
          ]} 
          numberOfLines={2}
        >
          {value || 'Not set'}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 20,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    gap: 16,
  },
  cardCompact: {
    padding: 16,
    gap: 12,
    borderRadius: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconContainer: {
    padding: 6,
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  titleCompact: {
    fontSize: 15,
  },
  details: {
    gap: 16,
  },
  detailsCompact: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  textGroup: {
    flex: 1,
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  labelCompact: {
    fontSize: 11,
    letterSpacing: 0.6,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
  },
  valueCompact: {
    fontSize: 15,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    marginLeft: 28, // aligns with icon spacing
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  editButtonCompact: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  visibilityNote: {
    fontSize: 11,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});