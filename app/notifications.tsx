import { NotificationsScreenSkeleton } from '@/components/notifications/NotificationsScreenSkeleton';
import { ScreenHeader } from '@/components/screen-header';
import { ShimmerProvider } from '@/components/shimmer-provider';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { supabase } from '@/lib/supabase';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

type Notification = {
    id: string;
    title: string;
    body: string;
    notification_type: string;
    status: string;
    read_at: string | null;
    created_at: string;
    priority: string;
    swap_id?: string;
    from_user_id?: string;
    data?: any;
};

const getNotificationIcon = (type: string) => {
    switch (type) {
        case 'swap_match':
            return 'zap';
        case 'swap_contacted':
        case 'message_received':
            return 'message-circle';
        case 'swap_accepted':
            return 'check-circle';
        case 'swap_declined':
            return 'x-circle';
        case 'swap_expired':
            return 'alert-circle';
        case 'profile_view':
            return 'eye';
        case 'system_alert':
        case 'system_maintenance':
            return 'info';
        default:
            return 'bell';
    }
};

const getNotificationColor = (type: string, tint: string) => {
    switch (type) {
        case 'swap_match':
            return '#FFB800';
        case 'swap_accepted':
            return '#34C759';
        case 'swap_declined':
        case 'swap_expired':
            return '#FF3B30';
        case 'system_alert':
        case 'system_maintenance':
            return '#5AC8FA';
        default:
            return tint;
    }
};

const formatRelativeTime = (date: string) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now.getTime() - notifDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;

    return notifDate.toLocaleDateString();
};

export default function NotificationsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const bg = useThemeColor({}, 'background');
    const text = useThemeColor({}, 'text');
    const tint = useThemeColor({}, 'tint');
    const border = `${text}15`;
    const cardBg = `${text}08`;

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useFocusEffect(
        useCallback(() => {
            loadNotifications();
        }, [])
    );

    useEffect(() => {
        if (!isLoading) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [isLoading, fadeAnim]);

    const loadNotifications = async () => {
        try {
            setIsLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;
            setNotifications(data || []);
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await loadNotifications();
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleNotificationPress = async (notification: Notification) => {
        try {
            // Mark as read
            if (!notification.read_at) {
                console.log("Notification not read")
                await supabase
                    .from('notifications')
                    .update({ read_at: new Date().toISOString()})
                    .eq('id', notification.id);

                // Update local state
                setNotifications(notifications.map(n =>
                    n.id === notification.id ? { ...n, read_at: new Date().toISOString() } : n
                ));
            }

            // Navigate based on notification type
            if (notification.swap_id) {
                router.push({
                    pathname: '/swap-details',
                    params: { swapId: notification.swap_id }
                });
            } else if (notification.from_user_id) {
                console.log('Navigate to conversation:', notification.from_user_id);
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleClearAll = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            await supabase
                .from('notifications')
                .delete()
                .eq('user_id', user.id);

            setNotifications([]);
        } catch (error) {
            console.error('Error clearing notifications:', error);
        }
    };

    const handleDeleteNotification = async (id: string) => {
        try {
            await supabase
                .from('notifications')
                .delete()
                .eq('id', id);

            setNotifications(notifications.filter(n => n.id !== id));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const unreadCount = notifications.filter(n => !n.read_at).length;

    const renderNotificationItem = ({ item }: { item: Notification }) => {
        const isUnread = !item.read_at;
        const icon = getNotificationIcon(item.notification_type);
        const iconColor = getNotificationColor(item.notification_type, tint);
        const relativeTime = formatRelativeTime(item.created_at);

        return (
            <Pressable
                onPress={() => handleNotificationPress(item)}
                style={({ pressed }) => [
                    styles.notificationItem,
                    {
                        backgroundColor: isUnread ? `${tint}12` : cardBg,
                        opacity: pressed ? 0.7 : 1,
                    },
                ]}
            >
                <View style={[styles.iconContainer, { backgroundColor: `${iconColor}25` }]}>
                    <Feather name={icon as any} size={20} color={iconColor} />
                </View>

                <View style={styles.contentSection}>
                    <View style={styles.headerRow}>
                        <ThemedText
                            style={[
                                styles.title,
                                { fontWeight: isUnread ? '700' : '600' },
                            ]}
                            numberOfLines={1}
                        >
                            {item.title}
                        </ThemedText>
                        <ThemedText style={[styles.time, { color: `${text}77` }]}>
                            {relativeTime}
                        </ThemedText>
                    </View>

                    <ThemedText
                        style={[
                            styles.body,
                            { color: `${text}88`, fontWeight: isUnread ? '500' : '400' },
                        ]}
                        numberOfLines={2}
                    >
                        {item.body}
                    </ThemedText>

                    {isUnread && (
                        <View style={[styles.unreadIndicator, { backgroundColor: tint }]} />
                    )}
                </View>

                <Pressable
                    onPress={() => handleDeleteNotification(item.id)}
                    style={({ pressed }) => [
                        styles.deleteButton,
                        { opacity: pressed ? 0.7 : 0.5 },
                    ]}
                >
                    <Feather name="trash-2" size={16} color={`${text}77`} />
                </Pressable>
            </Pressable>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <View style={[styles.emptyIconContainer, { backgroundColor: `${tint}15` }]}>
                <Feather name="bell-off" size={40} color={tint} />
            </View>
            <ThemedText style={styles.emptyTitle}>All caught up!</ThemedText>
            <ThemedText style={[styles.emptySubtitle, { color: `${text}77` }]}>
                You don't have any notifications yet
            </ThemedText>
        </View>
    );

    if (isLoading) {
        return (
            <ShimmerProvider>
                <NotificationsScreenSkeleton />
            </ShimmerProvider>
        );
    }

    return (
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
            <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={['top', 'bottom']}>
                <ThemedView style={[styles.container, { backgroundColor: bg }]}>
                {/* Header */}
                <View style={styles.headerContainer}>
                    <ScreenHeader
                        title="Notifications"
                        showBack={true}
                        rightIcon={notifications.length > 0 ? 'more' : undefined}
                        onRightPress={() => {
                            if (unreadCount > 0) {
                                handleClearAll();
                            }
                        }}
                    />

                    {/* Unread Count Bar */}
                    {unreadCount > 0 && (
                        <View style={[styles.unreadBar, { backgroundColor: `${tint}15`, borderBottomColor: border }]}>
                            <Feather name="alert-circle" size={16} color={tint} />
                            <ThemedText style={[styles.unreadBarText, { color: tint }]}>
                                {unreadCount} new {unreadCount === 1 ? 'notification' : 'notifications'}
                            </ThemedText>
                        </View>
                    )}
                </View>

                {/* Notifications List */}
                {notifications.length > 0 ? (
                    <FlatList
                        data={notifications}
                        renderItem={renderNotificationItem}
                        keyExtractor={(item) => item.id}
                        scrollEnabled={true}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContent}
                        refreshControl={
                            <RefreshControl
                                refreshing={isRefreshing}
                                onRefresh={handleRefresh}
                                tintColor={tint}
                            />
                        }
                    />
                ) : (
                    <FlatList
                        data={[]}
                        renderItem={() => null}
                        keyExtractor={() => ''}
                        ListEmptyComponent={renderEmptyState()}
                        refreshControl={
                            <RefreshControl
                                refreshing={isRefreshing}
                                onRefresh={handleRefresh}
                                tintColor={tint}
                            />
                        }
                    />
                )}
                </ThemedView>
            </SafeAreaView>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
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
    },
    unreadBarText: {
        fontSize: 13,
        fontWeight: '600',
    },
    listContent: {
        paddingTop: 0,
    },
    notificationItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(128, 128, 128, 0.05)',
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
        flexShrink: 0,
    },
    contentSection: {
        flex: 1,
        gap: 6,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
    },
    title: {
        fontSize: 15,
        lineHeight: 18,
        flex: 1,
    },
    time: {
        fontSize: 12,
        fontWeight: '500',
        flexShrink: 0,
    },
    body: {
        fontSize: 13,
        lineHeight: 18,
    },
    unreadIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginTop: 6,
        alignSelf: 'flex-start',
    },
    deleteButton: {
        padding: 8,
        marginTop: 4,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
        lineHeight: 20,
    },
});
