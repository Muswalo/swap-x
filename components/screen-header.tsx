import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

export type ScreenHeaderProps = {
  title: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightIcon?: 'share' | 'settings' | 'more' | 'close';
  onRightPress?: () => void;
  subtitle?: string;
};

export function ScreenHeader({
  title,
  showBack = true,
  onBackPress,
  rightIcon = 'share',
  onRightPress,
  subtitle,
}: ScreenHeaderProps) {
  const router = useRouter();
  const text = useThemeColor({}, 'text');
  const border = `${text}15`;

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  const getRightIconName = () => {
    switch (rightIcon) {
      case 'settings':
        return 'settings';
      case 'more':
        return 'more-vertical';
      case 'close':
        return 'x';
      case 'share':
      default:
        return 'share-2';
    }
  };

  return (
    <View style={[styles.header, { borderBottomColor: border }]}>
      <View style={styles.leftSection}>
        {showBack && (
          <Pressable
            onPress={handleBackPress}
            style={({ pressed }) => [
              styles.button,
              {
                opacity: pressed ? 0.7 : 1,
                backgroundColor: `${text}10`,
              },
            ]}
          >
            <Feather name="chevron-left" size={24} color={text} />
          </Pressable>
        )}
      </View>

      <View style={styles.centerSection}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        {subtitle && <ThemedText style={[styles.subtitle, { color: `${text}77` }]}>{subtitle}</ThemedText>}
      </View>

      <View style={styles.rightSection}>
        <Pressable
          onPress={onRightPress}
          style={({ pressed }) => [
            styles.button,
            {
              opacity: pressed ? 0.7 : 1,
              backgroundColor: `${text}10`,
            },
          ]}
        >
          <Feather name={getRightIconName() as any} size={20} color={text} />
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  leftSection: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  rightSection: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
});
