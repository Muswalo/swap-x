import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';

export function HomeScreenSkeleton() {
  const insets = useSafeAreaInsets();
  const bg = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const shimmerBg = `${text}08`;
  const shimmerHighlight = `${text}12`;

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
        { width, height, backgroundColor: shimmerBg, borderRadius: 12 },
        { opacity: shimmerOpacity },
        style,
      ]}
    />
  );

  return (
    <ThemedView
      style={[
        styles.container,
        { backgroundColor: bg, paddingTop: insets.top },
      ]}
    >
      {/* Header Skeleton */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <SkeletonBox width={48} height={48} style={{ borderRadius: 24 }} />
          <View style={styles.headerText}>
            <SkeletonBox width={120} height={20} />
            <SkeletonBox width={180} height={14} style={{ marginTop: 6 }} />
          </View>
        </View>
        <View style={styles.headerRight}>
          <SkeletonBox width={40} height={40} style={{ borderRadius: 20 }} />
          <SkeletonBox width={40} height={40} style={{ borderRadius: 20 }} />
        </View>
      </View>

      {/* Content Skeleton */}
      <View style={styles.content}>
        {/* Search Bar Skeleton */}
        <SkeletonBox width="100%" height={48} style={{ marginTop: 8 }} />

        {/* Filter Card Skeleton */}
        <View style={[styles.filterCard, { backgroundColor: shimmerBg }]}>
          <Animated.View style={{ opacity: shimmerOpacity }}>
            <View style={styles.filterHeader}>
              <SkeletonBox width={24} height={24} style={{ borderRadius: 6 }} />
              <SkeletonBox width={140} height={18} />
            </View>
            <View style={styles.filterDetails}>
              <SkeletonBox width="60%" height={14} />
              <SkeletonBox width="80%" height={16} style={{ marginTop: 8 }} />
              <SkeletonBox width="100%" height={1} style={{ marginTop: 16 }} />
              <SkeletonBox width="60%" height={14} style={{ marginTop: 16 }} />
              <SkeletonBox width="80%" height={16} style={{ marginTop: 8 }} />
            </View>
          </Animated.View>
        </View>

        {/* Quick Actions Skeleton */}
        <View style={styles.quickActions}>
          <SkeletonBox width="48%" height={50} />
          <SkeletonBox width="48%" height={50} />
        </View>

        {/* Ministry Chips Skeleton */}
        <View style={styles.chipsSection}>
          <SkeletonBox width={120} height={20} />
          <View style={styles.chipsList}>
            <SkeletonBox width={80} height={38} style={{ borderRadius: 20 }} />
            <SkeletonBox width={100} height={38} style={{ borderRadius: 20 }} />
            <SkeletonBox width={90} height={38} style={{ borderRadius: 20 }} />
            <SkeletonBox width={110} height={38} style={{ borderRadius: 20 }} />
          </View>
        </View>

        {/* Swaps List Skeleton */}
        <View style={styles.swapsSection}>
          <View style={styles.swapsHeader}>
            <SkeletonBox width={140} height={22} />
            <SkeletonBox width={36} height={36} style={{ borderRadius: 18 }} />
          </View>

          {/* Swap Cards Skeleton */}
          {[1, 2, 3].map((item) => (
            <View
              key={item}
              style={[styles.swapCard, { backgroundColor: shimmerBg }]}
            >
              <Animated.View style={{ opacity: shimmerOpacity }}>
                <View style={styles.swapContent}>
                  <SkeletonBox width={80} height={80} style={{ borderRadius: 12 }} />
                  <View style={styles.swapDetails}>
                    <SkeletonBox width="70%" height={18} />
                    <SkeletonBox width="90%" height={14} style={{ marginTop: 8 }} />
                    <SkeletonBox width="50%" height={12} style={{ marginTop: 8 }} />
                  </View>
                </View>
              </Animated.View>
            </View>
          ))}
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerText: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  filterCard: {
    marginTop: 20,
    padding: 20,
    borderRadius: 20,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  filterDetails: {
    marginTop: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  chipsSection: {
    marginTop: 24,
    gap: 12,
  },
  chipsList: {
    flexDirection: 'row',
    gap: 10,
  },
  swapsSection: {
    marginTop: 16,
    gap: 12,
  },
  swapsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  swapCard: {
    borderRadius: 20,
    padding: 12,
    marginBottom: 12,
  },
  swapContent: {
    flexDirection: 'row',
    gap: 12,
  },
  swapDetails: {
    flex: 1,
    justifyContent: 'center',
  },
});