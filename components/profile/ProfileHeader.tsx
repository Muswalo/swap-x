import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

export type ProfileHeaderProps = {
  firstName: string;
  lastName: string;
  jobTitle: string;
  currentDistrict: string;
  profilePhotoUrl?: string;
  isEditing?: boolean;
  isUploading?: boolean;
  onImagePress?: () => void;
};

export function ProfileHeader({
  firstName,
  lastName,
  jobTitle,
  currentDistrict,
  profilePhotoUrl,
  isEditing = false,
  isUploading = false,
  onImagePress,
}: ProfileHeaderProps) {
  const text = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`;

  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.avatarContainer, { backgroundColor: `${text}0A` }]}
        onPress={isEditing && !isUploading ? onImagePress : undefined}
        disabled={!isEditing || isUploading}
      >
        {profilePhotoUrl ? (
          <Image source={{ uri: profilePhotoUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.placeholderAvatar, { backgroundColor: tint }]}>
            <ThemedText style={styles.placeholderText}>{initials}</ThemedText>
          </View>
        )}
        {isUploading && (
          <View style={styles.uploadingOverlay}>
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        )}
        {isEditing && !isUploading && (
          <View style={[styles.editBadge, { backgroundColor: tint }]}>
            <Feather name="camera" size={16} color="#FFFFFF" />
          </View>
        )}
      </Pressable>
      <ThemedText style={styles.name}>
        {firstName} {lastName}
      </ThemedText>
      <ThemedText style={[styles.role, { color: `${text}77` }]}>{jobTitle}</ThemedText>
      <View style={[styles.locationBadge, { backgroundColor: `${tint}15` }]}>
        <Feather name="map-pin" size={14} color={tint} />
        <ThemedText style={[styles.locationText, { color: tint }]}>
          {currentDistrict}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
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
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  role: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 12,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
