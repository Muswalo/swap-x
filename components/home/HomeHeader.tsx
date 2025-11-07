import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

export type HomeHeaderProps = {
  userName: string;
  email?: string;
  avatarUrl: string;
  onPressChat?: () => void;
  onPressNotifications?: () => void;
  hasNotifications?: boolean;
};

export function HomeHeader({ userName, email, avatarUrl, onPressChat, onPressNotifications, hasNotifications }: HomeHeaderProps) {
  const text = useThemeColor({}, 'text');
  const bg = useThemeColor({}, 'background');
  const border = `${text}20`;
  const cardBg = `${text}0A`;

  return (
    <View style={[styles.header, { borderBottomColor: border, backgroundColor: bg }]}> 
      <View style={styles.userSection}>
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        <View style={styles.userInfo}>
          <ThemedText style={styles.userName} numberOfLines={1}>{userName}</ThemedText>
          <ThemedText style={[styles.userEmail, { color: `${text}99` }]} numberOfLines={1}>{email || ''}</ThemedText>
        </View>
      </View>
      <View style={styles.headerIcons}>
        <Pressable style={[styles.iconButton, { backgroundColor: cardBg }]} onPress={onPressChat}>
          <Feather name="message-circle" size={20} color={text} />
        </Pressable>
        <Pressable style={[styles.iconButton, { backgroundColor: cardBg }]} onPress={onPressNotifications}>
          {hasNotifications ? <View style={styles.notificationDot} /> : null}
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
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    zIndex: 1,
  },
});
