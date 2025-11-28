import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SkeletonBox } from '@/components/skeleton-box';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';

const { width } = Dimensions.get('window');

export function SwapDetailsScreenSkeleton() {
    const insets = useSafeAreaInsets();
    const bg = useThemeColor({}, 'background');
    const text = useThemeColor({}, 'text');
    const cardBg = `${text}08`;
    const sectionBg = `${text}05`;

    return (
        <ThemedView
            style={[
                styles.container,
                { backgroundColor: bg, paddingTop: insets.top },
            ]}
        >
            {/* Header Skeleton */}
            <View style={styles.header}>
                <SkeletonBox width={100} height={24} borderRadius={6} />
                <SkeletonBox width={40} height={40} borderRadius={20} />
            </View>

            {/* Profile Card Skeleton */}
            <View style={[styles.profileCard, { backgroundColor: cardBg }]}>
                {/* Avatar and Info */}
                <View style={styles.profileHeader}>
                    <SkeletonBox
                        width={64}
                        height={64}
                        borderRadius={32}
                        style={styles.avatar}
                    />
                    <View style={styles.profileInfo}>
                        <SkeletonBox width={120} height={18} borderRadius={6} />
                        <SkeletonBox width={100} height={14} borderRadius={4} style={styles.profileText} />
                        <SkeletonBox width={140} height={13} borderRadius={4} style={styles.profileText} />
                    </View>
                    <SkeletonBox width={50} height={28} borderRadius={8} style={styles.badge} />
                </View>

                {/* Divider */}
                <View style={[styles.divider, { backgroundColor: `${text}20` }]} />

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <SkeletonBox width={16} height={16} borderRadius={4} />
                        <SkeletonBox width={70} height={11} borderRadius={4} style={styles.statLabel} />
                        <SkeletonBox width={60} height={13} borderRadius={4} style={styles.statValue} />
                    </View>
                    <View style={styles.statItem}>
                        <SkeletonBox width={16} height={16} borderRadius={4} />
                        <SkeletonBox width={70} height={11} borderRadius={4} style={styles.statLabel} />
                        <SkeletonBox width={60} height={13} borderRadius={4} style={styles.statValue} />
                    </View>
                    <View style={styles.statItem}>
                        <SkeletonBox width={16} height={16} borderRadius={4} />
                        <SkeletonBox width={70} height={11} borderRadius={4} style={styles.statLabel} />
                        <SkeletonBox width={60} height={13} borderRadius={4} style={styles.statValue} />
                    </View>
                </View>
            </View>

            {/* Images Carousel Skeleton */}
            <View style={styles.imagesSection}>
                <SkeletonBox width={80} height={18} borderRadius={6} />
                <SkeletonBox
                    width={width - 40}
                    height={280}
                    borderRadius={16}
                    style={styles.imagePlaceholder}
                />
                <View style={styles.indicators}>
                    {[1, 2].map((i) => (
                        <SkeletonBox
                            key={i}
                            width={6}
                            height={6}
                            borderRadius={3}
                            style={styles.indicator}
                        />
                    ))}
                </View>
            </View>

            {/* Section Skeletons */}
            {[1, 2, 3, 4].map((section) => (
                <View key={section} style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <SkeletonBox width={16} height={16} borderRadius={4} />
                        <SkeletonBox width={130} height={16} borderRadius={6} />
                    </View>
                    <View style={[styles.detailCard, { backgroundColor: sectionBg }]}>
                        {[1, 2, 3].map((row) => (
                            <View key={row} style={styles.detailRow}>
                                <SkeletonBox width={36} height={36} borderRadius={10} />
                                <View style={styles.detailContent}>
                                    <SkeletonBox width={100} height={12} borderRadius={4} />
                                    <SkeletonBox width={150} height={14} borderRadius={4} style={styles.detailValue} />
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            ))}

            {/* Contact Button Skeleton */}
            <View style={styles.footer}>
                <SkeletonBox width="100%" height={50} borderRadius={12} />
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
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
    profileCard: {
        margin: 16,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    profileHeader: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    avatar: {
        flexShrink: 0,
    },
    profileInfo: {
        flex: 1,
        gap: 6,
    },
    profileText: {
        marginTop: 4,
    },
    badge: {
        marginTop: 2,
    },
    divider: {
        height: 1,
        marginVertical: 12,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        gap: 6,
    },
    statLabel: {
        marginTop: 4,
    },
    statValue: {
        marginTop: 2,
    },
    imagesSection: {
        paddingHorizontal: 16,
        marginBottom: 20,
        gap: 12,
    },
    imagePlaceholder: {
        marginTop: 8,
    },
    indicators: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginTop: 8,
    },
    indicator: {
        marginHorizontal: 2,
    },
    section: {
        paddingHorizontal: 16,
        marginBottom: 20,
        gap: 12,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailCard: {
        borderRadius: 12,
        padding: 12,
    },
    detailRow: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'flex-start',
        paddingVertical: 10,
    },
    detailContent: {
        flex: 1,
        gap: 6,
    },
    detailValue: {
        marginTop: 2,
    },
    footer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(128, 128, 128, 0.1)',
    },
});
