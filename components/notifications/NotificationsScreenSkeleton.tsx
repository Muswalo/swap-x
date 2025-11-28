import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SkeletonBox } from '@/components/skeleton-box';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';

export function NotificationsScreenSkeleton() {
    const insets = useSafeAreaInsets();
    const bg = useThemeColor({}, 'background');
    const text = useThemeColor({}, 'text');
    const cardBg = `${text}08`;

    return (
        <ThemedView
            style={[
                styles.container,
                { backgroundColor: bg, paddingTop: insets.top },
            ]}
        >
            {/* Header Skeleton */}
            <View style={styles.header}>
                <SkeletonBox width={120} height={28} borderRadius={8} />
                <SkeletonBox width={40} height={40} borderRadius={20} />
            </View>

            {/* Search Bar Skeleton */}
            <View style={styles.searchContainer}>
                <SkeletonBox width="100%" height={48} borderRadius={12} />
            </View>

            {/* Unread Bar Skeleton */}
            <View style={[styles.unreadBar, { backgroundColor: cardBg }]}>
                <SkeletonBox width={16} height={16} borderRadius={8} />
                <SkeletonBox width={180} height={14} borderRadius={6} />
            </View>

            {/* Notification Items Skeleton */}
            {[1, 2, 3, 4, 5].map((item) => (
                <View key={item} style={styles.notificationItemSkeleton}>
                    {/* Icon Container */}
                    <SkeletonBox
                        width={44}
                        height={44}
                        borderRadius={12}
                        style={styles.iconBox}
                    />

                    {/* Content Section */}
                    <View style={styles.contentSection}>
                        {/* Header Row */}
                        <View style={styles.headerRow}>
                            <SkeletonBox width="60%" height={15} borderRadius={6} />
                            <SkeletonBox width={40} height={12} borderRadius={4} />
                        </View>

                        {/* Body Text */}
                        <SkeletonBox
                            width="100%"
                            height={13}
                            borderRadius={6}
                            style={styles.bodyText}
                        />
                        <SkeletonBox
                            width="85%"
                            height={13}
                            borderRadius={6}
                        />
                    </View>

                    {/* Delete Button */}
                    <SkeletonBox
                        width={24}
                        height={24}
                        borderRadius={6}
                        style={styles.deleteButton}
                    />
                </View>
            ))}
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(128, 128, 128, 0.1)',
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(128, 128, 128, 0.1)',
    },
    unreadBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(128, 128, 128, 0.1)',
    },
    notificationItemSkeleton: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(128, 128, 128, 0.05)',
    },
    iconBox: {
        marginTop: 4,
        flexShrink: 0,
    },
    contentSection: {
        flex: 1,
        gap: 8,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
    },
    bodyText: {
        marginTop: 2,
    },
    deleteButton: {
        marginTop: 4,
    },
});
