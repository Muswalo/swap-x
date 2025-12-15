import { SkeletonBox } from '@/components/skeleton-box';
import { ThemedView } from '@/components/themed-view';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

/**
 * Skeleton screen for profile loading
 */
export function ProfileSkeleton() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <SkeletonBox width={100} height={100} borderRadius={50} />
        <View style={styles.headerInfo}>
          <SkeletonBox width="80%" height={24} style={styles.spacing} />
          <SkeletonBox width="60%" height={16} style={styles.spacing} />
        </View>
      </View>

      <View style={styles.section}>
        <SkeletonBox width={120} height={20} style={styles.spacing} />
        <SkeletonBox width="100%" height={60} style={styles.spacing} />
      </View>

      <View style={styles.section}>
        <SkeletonBox width={120} height={20} style={styles.spacing} />
        <SkeletonBox width="100%" height={40} style={styles.spacing} />
        <SkeletonBox width="100%" height={40} style={styles.spacing} />
      </View>
    </ThemedView>
  );
}

/**
 * Skeleton screen for swap list loading
 */
export function SwapListSkeleton() {
  return (
    <ScrollView style={styles.scrollContainer}>
      {[1, 2, 3, 4].map((item) => (
        <View key={item} style={styles.swapCard}>
          <SkeletonBox width="100%" height={200} style={styles.spacing} />
          <View style={styles.swapInfo}>
            <SkeletonBox width="70%" height={20} style={styles.spacing} />
            <SkeletonBox width="50%" height={16} style={styles.spacing} />
            <SkeletonBox width="90%" height={16} style={styles.spacing} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

/**
 * Skeleton screen for swap details loading
 */
export function SwapDetailsSkeleton() {
  return (
    <ScrollView style={styles.scrollContainer}>
      <SkeletonBox width="100%" height={300} style={styles.spacing} />
      
      <View style={styles.detailsContainer}>
        <SkeletonBox width="80%" height={28} style={styles.spacing} />
        <SkeletonBox width="60%" height={20} style={styles.spacing} />
        
        <View style={styles.section}>
          <SkeletonBox width={150} height={20} style={styles.spacing} />
          <SkeletonBox width="100%" height={80} style={styles.spacing} />
        </View>

        <View style={styles.section}>
          <SkeletonBox width={150} height={20} style={styles.spacing} />
          <SkeletonBox width="100%" height={40} style={styles.spacing} />
          <SkeletonBox width="100%" height={40} style={styles.spacing} />
        </View>

        <SkeletonBox width="100%" height={50} style={styles.spacing} />
      </View>
    </ScrollView>
  );
}

/**
 * Skeleton screen for messages list loading
 */
export function MessagesListSkeleton() {
  return (
    <ScrollView style={styles.scrollContainer}>
      {[1, 2, 3, 4, 5].map((item) => (
        <View key={item} style={styles.messageItem}>
          <SkeletonBox width={50} height={50} borderRadius={25} />
          <View style={styles.messageInfo}>
            <SkeletonBox width="70%" height={18} style={styles.spacing} />
            <SkeletonBox width="90%" height={14} style={styles.spacing} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

/**
 * Skeleton screen for chat messages loading
 */
export function ChatSkeleton() {
  return (
    <ScrollView style={styles.scrollContainer}>
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <View
          key={item}
          style={[
            styles.chatBubble,
            item % 2 === 0 ? styles.chatBubbleRight : styles.chatBubbleLeft,
          ]}
        >
          <SkeletonBox
            width={item % 3 === 0 ? 200 : 150}
            height={60}
            style={styles.spacing}
          />
        </View>
      ))}
    </ScrollView>
  );
}

/**
 * Skeleton screen for settings loading
 */
export function SettingsSkeleton() {
  return (
    <ScrollView style={styles.scrollContainer}>
      {[1, 2, 3].map((section) => (
        <View key={section} style={styles.section}>
          <SkeletonBox width={120} height={20} style={styles.spacing} />
          {[1, 2, 3, 4].map((item) => (
            <View key={item} style={styles.settingsItem}>
              <SkeletonBox width="70%" height={18} />
              <SkeletonBox width={40} height={24} borderRadius={12} />
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerInfo: {
    marginTop: 16,
    width: '100%',
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
  },
  spacing: {
    marginBottom: 12,
  },
  swapCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  swapInfo: {
    padding: 12,
  },
  detailsContainer: {
    padding: 16,
  },
  messageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  messageInfo: {
    flex: 1,
    marginLeft: 12,
  },
  chatBubble: {
    marginBottom: 12,
  },
  chatBubbleLeft: {
    alignItems: 'flex-start',
  },
  chatBubbleRight: {
    alignItems: 'flex-end',
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
});
