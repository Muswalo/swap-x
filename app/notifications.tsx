import { BottomModal } from '@/components/bottom-modal';
import { NotificationsScreenSkeleton } from '@/components/notifications/NotificationsScreenSkeleton';
import { ScreenHeader } from '@/components/screen-header';
import { ShimmerProvider } from '@/components/shimmer-provider';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useNotification } from '@/context/notifications-provider';
import { useThemeColor } from '@/hooks/use-theme-color';
import { type Notification } from '@/lib/database.utils';
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
    ScrollView,
    StyleSheet,
    View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

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

const formatRelativeTime = (date: string | null) => {
    if (!date) return 'Unknown';
    
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

type NotificationFilter = 'all' | 'unread' | 'messages' | 'swaps' | 'system';

export default function NotificationsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const bg = useThemeColor({}, 'background');
    const text = useThemeColor({}, 'text');
    const tint = useThemeColor({}, 'tint');
    const border = `${text}15`;
    const cardBg = `${text}08`;
    const { refreshUnreadCount } = useNotification();

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<NotificationFilter>('all');
    const [showOptionsModal, setShowOptionsModal] = useState(false);
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

    // Real-time subscription for new notifications
    useEffect(() => {
        const setupRealtimeSubscription = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const channel = supabase
                .channel('notifications')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${user.id}`,
                    },
                    (payload) => {
                        console.log('New notification received:', payload);
                        const newNotification = payload.new as Notification;
                        setNotifications(prev => [newNotification, ...prev]);
                    }
                )
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${user.id}`,
                    },
                    (payload) => {
                        console.log('Notification updated:', payload);
                        const updatedNotification = payload.new as Notification;
                        setNotifications(prev =>
                            prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
                        );
                    }
                )
                .on(
                    'postgres_changes',
                    {
                        event: 'DELETE',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${user.id}`,
                    },
                    (payload) => {
                        console.log('Notification deleted:', payload);
                        const deletedNotification = payload.old as Notification;
                        setNotifications(prev =>
                            prev.filter(n => n.id !== deletedNotification.id)
                        );
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        };

        setupRealtimeSubscription();
    }, []);

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
                
                // Refresh badge count
                await refreshUnreadCount();
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

    const handleMarkAllAsRead = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const unreadIds = notifications
                .filter(n => !n.read_at)
                .map(n => n.id);

            if (unreadIds.length === 0) return;

            await supabase
                .from('notifications')
                .update({ read_at: new Date().toISOString() })
                .in('id', unreadIds);

            setNotifications(notifications.map(n => ({
                ...n,
                read_at: n.read_at || new Date().toISOString()
            })));
            
            // Refresh badge count
            await refreshUnreadCount();
        } catch (error) {
            console.error('Error marking all as read:', error);
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
            setShowOptionsModal(false);
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

    // Filter notifications based on active filter
    const filteredNotifications = notifications.filter(notification => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'unread') return !notification.read_at;
        if (activeFilter === 'messages') {
            return ['message_received', 'swap_contacted'].includes(notification.notification_type);
        }
        if (activeFilter === 'swaps') {
            return ['swap_match', 'swap_accepted', 'swap_declined', 'swap_expired', 'swap_interest'].includes(notification.notification_type);
        }
        if (activeFilter === 'system') {
            return ['system_alert', 'system_maintenance', 'profile_view'].includes(notification.notification_type);
        }
        return true;
    });

    const filterOptions: { label: string; value: NotificationFilter; icon: string; count?: number }[] = [
        { label: 'All', value: 'all', icon: 'list', count: notifications.length },
        { label: 'Unread', value: 'unread', icon: 'circle', count: unreadCount },
        { label: 'Messages', value: 'messages', icon: 'message-circle', count: notifications.filter(n => ['message_received', 'swap_contacted'].includes(n.notification_type)).length },
        { label: 'Swaps', value: 'swaps', icon: 'zap', count: notifications.filter(n => ['swap_match', 'swap_accepted', 'swap_declined', 'swap_expired', 'swap_interest'].includes(n.notification_type)).length },
        { label: 'System', value: 'system', icon: 'info', count: notifications.filter(n => ['system_alert', 'system_maintenance', 'profile_view'].includes(n.notification_type)).length },
    ];

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
                        onRightPress={() => setShowOptionsModal(true)}
                    />

                    {/* Filter Tabs */}
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filterContainer}
                    >
                        {filterOptions.map((option) => (
                            <Pressable
                                key={option.value}
                                onPress={() => setActiveFilter(option.value)}
                                style={({ pressed }) => [
                                    styles.filterTab,
                                    {
                                        backgroundColor: activeFilter === option.value ? tint : `${text}08`,
                                        opacity: pressed ? 0.7 : 1,
                                    },
                                ]}
                            >
                                <Feather 
                                    name={option.icon as any} 
                                    size={14} 
                                    color={activeFilter === option.value ? '#fff' : text} 
                                />
                                <ThemedText
                                    style={[
                                        styles.filterTabText,
                                        { color: activeFilter === option.value ? '#fff' : text },
                                    ]}
                                >
                                    {option.label}
                                </ThemedText>
                                {option.count !== undefined && option.count > 0 && (
                                    <View style={[
                                        styles.filterBadge,
                                        { backgroundColor: activeFilter === option.value ? 'rgba(255,255,255,0.3)' : `${tint}25` }
                                    ]}>
                                        <ThemedText style={[
                                            styles.filterBadgeText,
                                            { color: activeFilter === option.value ? '#fff' : tint }
                                        ]}>
                                            {option.count}
                                        </ThemedText>
                                    </View>
                                )}
                            </Pressable>
                        ))}
                    </ScrollView>

                    {/* Unread Count Bar */}
                    {unreadCount > 0 && activeFilter === 'all' && (
                        <View style={[styles.unreadBar, { backgroundColor: `${tint}15`, borderBottomColor: border }]}>
                            <Feather name="alert-circle" size={16} color={tint} />
                            <ThemedText style={[styles.unreadBarText, { color: tint }]}>
                                {unreadCount} new {unreadCount === 1 ? 'notification' : 'notifications'}
                            </ThemedText>
                            <Pressable
                                onPress={handleMarkAllAsRead}
                                style={({ pressed }) => [
                                    styles.markAllButton,
                                    { opacity: pressed ? 0.7 : 1 }
                                ]}
                            >
                                <ThemedText style={[styles.markAllButtonText, { color: tint }]}>
                                    Mark all read
                                </ThemedText>
                            </Pressable>
                        </View>
                    )}
                </View>

                {/* Notifications List */}
                {filteredNotifications.length > 0 ? (
                    <FlatList
                        data={filteredNotifications}
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

                {/* Options Modal */}
                <BottomModal
                    isVisible={showOptionsModal}
                    onClose={() => setShowOptionsModal(false)}
                    // title="Notification Options"
                >
                    <View style={styles.modalContent}>
                        {unreadCount > 0 && (
                            <Pressable
                                onPress={() => {
                                    handleMarkAllAsRead();
                                    setShowOptionsModal(false);
                                }}
                                style={({ pressed }) => [
                                    styles.modalOption,
                                    { opacity: pressed ? 0.7 : 1 }
                                ]}
                            >
                                <Feather name="check-circle" size={20} color={tint} />
                                <ThemedText style={styles.modalOptionText}>
                                    Mark all as read
                                </ThemedText>
                            </Pressable>
                        )}
                        
                        {notifications.length > 0 && (
                            <Pressable
                                onPress={handleClearAll}
                                style={({ pressed }) => [
                                    styles.modalOption,
                                    { opacity: pressed ? 0.7 : 1 }
                                ]}
                            >
                                <Feather name="trash-2" size={20} color="#FF3B30" />
                                <ThemedText style={[styles.modalOptionText, { color: '#FF3B30' }]}>
                                    Clear all notifications
                                </ThemedText>
                            </Pressable>
                        )}
                    </View>
                </BottomModal>
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
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
    },
    filterTab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    filterTabText: {
        fontSize: 13,
        fontWeight: '600',
    },
    filterBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        minWidth: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterBadgeText: {
        fontSize: 11,
        fontWeight: '700',
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
        flex: 1,
    },
    markAllButton: {
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    markAllButtonText: {
        fontSize: 13,
        fontWeight: '700',
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
    modalContent: {
        paddingVertical: 8,
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        gap: 16,
    },
    modalOptionText: {
        fontSize: 16,
        fontWeight: '600',
    },
});