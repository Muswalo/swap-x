import { useThemeColor } from '@/hooks/use-theme-color';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

export function SwapCardSkeleton() {
  const text = useThemeColor({}, 'text');
  const border = `${text}15`;
  const cardBg = useThemeColor({}, 'background');
  const shimmerBg = `${text}08`;

  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shimmerAnim]);

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const SkeletonBox = ({ width, height, style }: any) => (
    <Animated.View
      style={[
        { width, height, backgroundColor: shimmerBg, borderRadius: 8 },
        { opacity: shimmerOpacity },
        style,
      ]}
    />
  );

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
      {/* Header */}
      <View style={styles.header}>
        <SkeletonBox width={40} height={40} style={{ borderRadius: 20 }} />
        <View style={styles.userInfo}>
          <SkeletonBox width={120} height={16} />
          <SkeletonBox width={80} height={13} style={{ marginTop: 4 }} />
          <SkeletonBox width={60} height={11} style={{ marginTop: 2 }} />
        </View>
      </View>

      {/* Swap Section */}
      <View style={styles.swapSection}>
        <View style={styles.locationRow}>
          <SkeletonBox width={60} height={12} />
          <SkeletonBox width="90%" height={14} style={{ marginTop: 6 }} />
          <SkeletonBox width="70%" height={12} style={{ marginTop: 4 }} />
        </View>
        
        <View style={styles.arrowContainer}>
          <SkeletonBox width={16} height={16} style={{ borderRadius: 8 }} />
        </View>
        
        <View style={styles.locationRow}>
          <SkeletonBox width={60} height={12} />
          <SkeletonBox width="90%" height={14} style={{ marginTop: 6 }} />
          <SkeletonBox width="70%" height={12} style={{ marginTop: 4 }} />
        </View>
      </View>
    </View>
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
    padding: 16,
    alignItems: 'center',
    gap: 12,
  },
  userInfo: {
    flex: 1,
  },
  swapSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  locationRow: {
    flex: 1,
  },
  arrowContainer: {
    paddingHorizontal: 8,
    paddingTop: 20,
  },
});