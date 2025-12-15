import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

export type HomeHeaderProps = {
  userName: string;
  email?: string;
  avatarUrl: string;
  onPressAvatar?: () => void;
  onPressChat?: () => void;
  onPressNotifications?: () => void;
  hasNotifications?: boolean;
  notificationCount?: number;
};

export function HomeHeader({ userName, email, avatarUrl, onPressAvatar, onPressChat, onPressNotifications, hasNotifications, notificationCount }: HomeHeaderProps) {
  const text = useThemeColor({}, 'text');
  const bg = useThemeColor({}, 'background');
  const tint = useThemeColor({}, 'tint');
  const border = `${text}20`;
  const cardBg = `${text}0A`;

  return (
    <View style={[styles.header, { borderBottomColor: border, backgroundColor: bg }]}> 
      <Pressable 
        style={styles.userSection} 
        onPress={onPressAvatar}
        android_ripple={{ color: `${text}10` }}
      >
        {({ pressed }) => (
          <>
            <Image source={{ uri: avatarUrl }} style={[styles.avatar, { opacity: pressed ? 0.7 : 1 }]} />
            <View style={styles.userInfo}>
              <ThemedText style={styles.userName} numberOfLines={1}>{userName}</ThemedText>
              <ThemedText style={[styles.userEmail, { color: `${text}99` }]} numberOfLines={1}>{email || ''}</ThemedText>
            </View>
          </>
        )}
      </Pressable>
      <View style={styles.headerIcons}>
        <Pressable style={[styles.iconButton, { backgroundColor: cardBg }]} onPress={onPressChat}>
          <Feather name="message-circle" size={20} color={text} />
        </Pressable>
        <Pressable style={[styles.iconButton, { backgroundColor: cardBg }]} onPress={onPressNotifications}>
          {hasNotifications && notificationCount && notificationCount > 0 ? (
            <View style={[styles.notificationBadge, { backgroundColor: tint }]}>
              <ThemedText style={styles.badgeText}>
                {notificationCount > 99 ? '99+' : notificationCount}
              </ThemedText>
            </View>
          ) : null}
          <Feather name="bell" size={20} color={text} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 13,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    zIndex: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
