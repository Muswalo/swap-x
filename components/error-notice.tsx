import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';

export type ErrorNoticeProps = {
  message?: string | null;
  visible?: boolean;
  style?: ViewStyle | ViewStyle[];
  variant?: 'info' | 'danger' | 'success' | 'warning';
};

export function ErrorNotice({ message, visible, style, variant = 'info' }: ErrorNoticeProps) {
  const text = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');

  const color = (() => {
    switch (variant) {
      case 'danger':
        return '#ff453a';
      case 'success':
        return '#34c759';
      case 'warning':
        return '#ff9f0a';
      case 'info':
      default:
        return tint;
    }
  })();

  const bg = `${color}14`; // ~8% alpha
  const border = `${color}33`; // ~20% alpha
  const iconName = variant === 'danger' ? 'alert-triangle' : variant === 'success' ? 'check-circle' : variant === 'warning' ? 'alert-circle' : 'info';

  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(-8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: visible ? 1 : 0, duration: 180, useNativeDriver: true }),
      Animated.timing(translate, { toValue: visible ? 0 : -8, duration: 180, useNativeDriver: true }),
    ]).start();
  }, [visible, opacity, translate]);

  if (!message) return null;

  return (
    <Animated.View style={[styles.wrap, { backgroundColor: bg, borderColor: border, opacity, transform: [{ translateY: translate }] }, style]}> 
      <Feather name={iconName as any} size={16} color={color} style={{ marginRight: 8 }} />
      <ThemedText style={[styles.text, { color }]}>{message}</ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
  },
});
