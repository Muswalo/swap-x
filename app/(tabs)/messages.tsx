import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { ConversationListItem } from '@/lib/messaging.utils';
import { messagingUtils } from '@/lib/messaging.utils';
import { supabase } from '@/lib/supabase';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Pressable,
    RefreshControl,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MessagesScreen() {
    const bg = useThemeColor({}, 'background');
    const text = useThemeColor({}, 'text');
    const tint = useThemeColor({}, 'tint');
    const border = `${text}15`;
    const inputBg = `${text}06`;
    const router = useRouter();

    const [conversations, setConversations] = useState<ConversationListItem[]>([]);
    const [filteredConversations, setFilteredConversations] = useState<ConversationListItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [filterUnread, setFilterUnread] = useState(false);

    // Get current user
    useEffect(() => {
        const getCurrentUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setCurrentUserId(user.id);
            }
        };
        getCurrentUser();
    }, []);

    // Load conversations
    const loadConversations = useCallback(async () => {
        if (!currentUserId) return;

        try {
            const convList = await messagingUtils.getConversationList(currentUserId);
            
            // Sort by last message time and unread status
            const sorted = convList.sort((a, b) => {
                // Unread conversations first
                if (a.unreadCount !== b.unreadCount) {
                    return b.unreadCount - a.unreadCount;
                }
                // Then by last message time
                const timeA = new Date(a.last_message_at).getTime();
                const timeB = new Date(b.last_message_at).getTime();
                return timeB - timeA;
            });

            setConversations(sorted);
            setFilteredConversations(sorted);
        } catch (error) {
            console.error('Error loading conversations:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [currentUserId]);

    // Initial load
    useEffect(() => {
        if (currentUserId) {
            loadConversations();
        }
    }, [currentUserId, loadConversations]);

    // Real-time subscription for new messages
    useEffect(() => {
        if (!currentUserId) return;

        const channel = supabase
            .channel('conversations-updates')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'messages',
                },
                () => {
                    // Reload conversations when any message changes
                    loadConversations();
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'conversations',
                },
                () => {
                    // Reload conversations when conversation changes
                    loadConversations();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUserId, loadConversations]);

    // Search and filter
    useEffect(() => {
        let filtered = conversations;

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter((conv) => {
                const participantName =
                    `${conv.otherParticipant.first_name} ${conv.otherParticipant.last_name}`.toLowerCase();
                const lastMessageContent = conv.lastMessage?.content.toLowerCase() || '';
                return participantName.includes(query) || lastMessageContent.includes(query);
            });
        }

        // Apply unread filter
        if (filterUnread) {
            filtered = filtered.filter((conv) => conv.unreadCount > 0);
        }

        setFilteredConversations(filtered);
    }, [searchQuery, conversations, filterUnread]);

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        loadConversations();
    }, [loadConversations]);

    const handleConversationPress = async (conversation: ConversationListItem) => {
        // Navigate to chat screen
        router.push({
            pathname: '/chat',
            params: {
                conversationId: conversation.id,
                otherUserId: conversation.otherParticipant.user_id,
                otherUserName: `${conversation.otherParticipant.first_name} ${conversation.otherParticipant.last_name}`,
            },
        });

        // Mark conversation as read
        if (conversation.unreadCount > 0) {
            await messagingUtils.markConversationAsRead(conversation.id, currentUserId!);
            // Reload to update unread count
            loadConversations();
        }
    };

    const formatTimestamp = (timestamp: string): string => {
        const now = new Date();
        const messageDate = new Date(timestamp);
        const diffMs = now.getTime() - messageDate.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'now';
        if (diffMins < 60) return `${diffMins}m`;
        if (diffHours < 24) return `${diffHours}h`;
        if (diffDays < 7) return `${diffDays}d`;
        return messageDate.toLocaleDateString();
    };

    const renderConversationItem = ({ item }: { item: ConversationListItem }) => {
        const participantName = `${item.otherParticipant.first_name} ${item.otherParticipant.last_name}`;
        const participantRole = item.otherParticipant.job_title || 'Government Employee';
        const lastMessageText = item.lastMessage?.content || 'No messages yet';
        const timestamp = item.lastMessage ? formatTimestamp(item.lastMessage.created_at) : '';
        const avatarUri = item.otherParticipant.profile_photo_url;
        const initials = `${item.otherParticipant.first_name?.charAt(0) || ''}${item.otherParticipant.last_name?.charAt(0) || ''}`;

        return (
            <Pressable
                onPress={() => handleConversationPress(item)}
                style={({ pressed }) => [
                    styles.conversationItem,
                    {
                        backgroundColor: pressed ? `${text}08` : 'transparent',
                    },
                ]}
            >
                <View style={styles.avatarSection}>
                    <View style={[styles.avatarContainer, { backgroundColor: `${text}0A` }]}>
                        {avatarUri ? (
                            <Image source={{ uri: avatarUri }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.placeholderAvatar, { backgroundColor: tint }]}>
                                <ThemedText style={styles.placeholderText}>
                                    {initials.toUpperCase()}
                                </ThemedText>
                            </View>
                        )}
                    </View>
                </View>

                <View style={[styles.contentSection, { borderBottomColor: border }]}>
                    <View style={styles.nameRow}>
                        <View style={{ flex: 1 }}>
                            <ThemedText style={styles.name}>{participantName}</ThemedText>
                            <ThemedText style={[styles.role, { color: `${text}77` }]}>
                                {participantRole}
                            </ThemedText>
                        </View>
                        {timestamp && (
                            <ThemedText style={[styles.timestamp, { color: `${text}77` }]}>
                                {timestamp}
                            </ThemedText>
                        )}
                    </View>

                    <View style={styles.messageRow}>
                        <ThemedText
                            style={[
                                styles.lastMessage,
                                {
                                    color: item.unreadCount > 0 ? text : `${text}77`,
                                    fontWeight: item.unreadCount > 0 ? '600' : '400',
                                },
                            ]}
                            numberOfLines={1}
                        >
                            {lastMessageText}
                        </ThemedText>

                        {item.unreadCount > 0 && (
                            <View style={[styles.unreadBadge, { backgroundColor: tint }]}>
                                <ThemedText style={styles.unreadText}>
                                    {item.unreadCount > 9 ? '9+' : item.unreadCount}
                                </ThemedText>
                            </View>
                        )}
                    </View>
                </View>
            </Pressable>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <View style={[styles.emptyIconContainer, { backgroundColor: `${tint}15` }]}>
                <Feather name="message-circle" size={40} color={tint} />
            </View>
            <ThemedText style={styles.emptyTitle}>No conversations yet</ThemedText>
            <ThemedText style={[styles.emptySubtitle, { color: `${text}77` }]}>
                {searchQuery ? 'Try a different search' : 'Conversations will appear here when you connect with someone'}
            </ThemedText>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={['top']}>
            <ThemedView style={[styles.container, { backgroundColor: bg }]}>
                {/* Header */}
                <ScreenHeader
                    title="Messages"
                    showBack={false}
                />

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={[styles.searchInputWrapper, { backgroundColor: inputBg, borderColor: border }]}>
                        <Feather name="search" size={18} color={`${text}77`} />
                        <TextInput
                            style={[styles.searchInput, { color: text }]}
                            placeholder="Search conversations..."
                            placeholderTextColor={`${text}50`}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <Pressable onPress={() => setSearchQuery('')}>
                                <Feather name="x" size={18} color={`${text}77`} />
                            </Pressable>
                        )}
                    </View>

                    {/* Filter Button */}
                    <Pressable
                        onPress={() => setFilterUnread(!filterUnread)}
                        style={[
                            styles.filterButton,
                            {
                                backgroundColor: filterUnread ? tint : inputBg,
                                borderColor: filterUnread ? tint : border,
                            },
                        ]}
                    >
                        <Feather
                            name="filter"
                            size={18}
                            color={filterUnread ? '#FFFFFF' : `${text}77`}
                        />
                        {filterUnread && (
                            <ThemedText style={[styles.filterText, { color: '#FFFFFF' }]}>
                                Unread
                            </ThemedText>
                        )}
                    </Pressable>
                </View>

                {/* Loading State */}
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={tint} />
                        <ThemedText style={[styles.loadingText, { color: `${text}77` }]}>
                            Loading conversations...
                        </ThemedText>
                    </View>
                ) : (
                    <>
                        {/* Conversations List */}
                        {filteredConversations.length > 0 ? (
                            <FlatList
                                data={filteredConversations}
                                renderItem={renderConversationItem}
                                keyExtractor={(item) => item.id}
                                scrollEnabled={true}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={styles.listContent}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshing}
                                        onRefresh={handleRefresh}
                                        tintColor={tint}
                                        colors={[tint]}
                                    />
                                }
                            />
                        ) : (
                            renderEmptyState()
                        )}
                    </>
                )}
            </ThemedView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 22,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(128, 128, 128, 0.1)',
        gap: 12,
    },
    searchInputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
        padding: 0,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
    },
    filterText: {
        fontSize: 13,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
    },
    loadingText: {
        fontSize: 14,
        fontWeight: '500',
    },
    listContent: {
        paddingTop: 0,
    },
    conversationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    avatarSection: {
        position: 'relative',
    },
    avatarContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholderAvatar: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholderText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },

    contentSection: {
        flex: 1,
        gap: 6,
        borderBottomWidth: 1,
        paddingBottom: 12,
        paddingRight: 16,
    },
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 12,
    },
    name: {
        fontSize: 15,
        fontWeight: '600',
        lineHeight: 18,
    },
    role: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 2,
    },
    timestamp: {
        fontSize: 12,
        fontWeight: '500',
    },
    messageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    lastMessage: {
        fontSize: 13,
        lineHeight: 16,
        flex: 1,
    },
    unreadBadge: {
        minWidth: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
    },
    unreadText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '700',
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
