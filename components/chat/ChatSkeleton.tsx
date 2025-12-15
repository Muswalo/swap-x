import { SkeletonBox } from '@/components/skeleton-box';
import { ThemedView } from '@/components/themed-view';
import React from 'react';
import { StyleSheet, View } from 'react-native';

/**
 * Skeleton loader for chat screen while loading conversation details
 */
export function ChatSkeleton() {
  return (
    <ThemedView style={styles.container}>
      {/* Message bubbles skeleton */}
      <View style={styles.messagesContainer}>
        {/* Left bubble (other user) */}
        <View style={styles.leftBubbleContainer}>
          <SkeletonBox width={50} height={50} borderRadius={25} />
          <View style={styles.bubbleContent}>
            <SkeletonBox width={220} height={60} borderRadius={16} />
          </View>
        </View>

        {/* Right bubble (current user) */}
        <View style={styles.rightBubbleContainer}>
          <SkeletonBox width={180} height={50} borderRadius={16} />
        </View>

        {/* Left bubble (other user) */}
        <View style={styles.leftBubbleContainer}>
          <SkeletonBox width={50} height={50} borderRadius={25} />
          <View style={styles.bubbleContent}>
            <SkeletonBox width={260} height={80} borderRadius={16} />
          </View>
        </View>

        {/* Right bubble (current user) */}
        <View style={styles.rightBubbleContainer}>
          <SkeletonBox width={200} height={60} borderRadius={16} />
        </View>

        {/* Left bubble (other user) */}
        <View style={styles.leftBubbleContainer}>
          <SkeletonBox width={50} height={50} borderRadius={25} />
          <View style={styles.bubbleContent}>
            <SkeletonBox width={150} height={50} borderRadius={16} />
          </View>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  messagesContainer: {
    flex: 1,
  },
  leftBubbleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  rightBubbleContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  bubbleContent: {
    marginLeft: 8,
  },
});
