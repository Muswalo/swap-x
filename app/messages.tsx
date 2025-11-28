import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    FlatList,
    Image,
    Pressable,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

type Conversation = {
    id: string;
    name: string;
    lastMessage: string;
    timestamp: string;
    avatarUri?: string;
    unreadCount: number;
    isOnline: boolean;
    role: string;
};

const MOCK_CONVERSATIONS: Conversation[] = [
    {
        id: '1',
        name: 'John Banda',
        lastMessage: 'Yes, I\'m interested in the swap. When can we discuss?',
        timestamp: '2m',
        unreadCount: 2,
        isOnline: true,
        role: 'Senior Nurse',
        avatarUri: 'https://api.dicebear.com/7.x/initials/png?seed=J.&backgroundColor=random&bold=true',
    },
    {
        id: '2',
        name: 'Mary Phiri',
        lastMessage: 'Thank you for reaching out. Let me check my schedule.',
        timestamp: '1h',
        unreadCount: 0,
        isOnline: true,
        role: 'Nurse',
        avatarUri: 'https://api.dicebear.com/7.x/initials/png?seed=M.&backgroundColor=random&bold=true',
    },
    {
        id: '3',
        name: 'Peter Mwansa',
        lastMessage: 'I\'ll get back to you by end of week',
        timestamp: '3h',
        unreadCount: 0,
        isOnline: false,
        role: 'Officer',
        avatarUri: 'https://api.dicebear.com/7.x/initials/png?seed=P.&backgroundColor=random&bold=true',
    },
    {
        id: '4',
        name: 'Sarah Chibwe',
        lastMessage: 'This looks like a great opportunity!',
        timestamp: '1d',
        unreadCount: 0,
        isOnline: true,
        role: 'Inspector',
        avatarUri: 'https://api.dicebear.com/7.x/initials/png?seed=S.&backgroundColor=random&bold=true',
    },
    {
        id: '5',
        name: 'David Moyo',
        lastMessage: 'Can we schedule a meeting next week?',
        timestamp: '2d',
        unreadCount: 0,
        isOnline: false,
        role: 'Technician',
        avatarUri: 'https://api.dicebear.com/7.x/initials/png?seed=D.&backgroundColor=random&bold=true',
    },
];

export default function MessagesScreen() {
    const insets = useSafeAreaInsets();
    const bg = useThemeColor({}, 'background');
    const text = useThemeColor({}, 'text');
    const tint = useThemeColor({}, 'tint');
    const border = `${text}15`;
    const inputBg = `${text}06`;
    const sectionBg = `${text}05`;

    const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredConversations = conversations.filter(conv =>
        conv.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sortedConversations = [...filteredConversations].sort((a, b) => {
        // Sort unread conversations first, then by timestamp
        if (a.unreadCount !== b.unreadCount) {
            return b.unreadCount - a.unreadCount;
        }
        return 0;
    });

    const handleConversationPress = (conversation: Conversation) => {
        console.log('Open conversation:', conversation.id, conversation.name);
        // TODO: Navigate to chat screen with conversation
    };

    const handleDeleteConversation = (id: string) => {
        setConversations(conversations.filter(conv => conv.id !== id));
    };

    const renderConversationItem = ({ item }: { item: Conversation }) => (
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
                    {item.avatarUri ? (
                        <Image source={{ uri: item.avatarUri }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.placeholderAvatar, { backgroundColor: tint }]}>
                            <ThemedText style={styles.placeholderText}>
                                {item.name.charAt(0).toUpperCase()}
                            </ThemedText>
                        </View>
                    )}
                </View>
                {item.isOnline && (
                    <View style={[styles.onlineIndicator, { backgroundColor: tint }]} />
                )}
            </View>

            <View style={[styles.contentSection, { borderBottomColor: border }]}>
                <View style={styles.nameRow}>
                    <View style={{ flex: 1 }}>
                        <ThemedText style={styles.name}>{item.name}</ThemedText>
                        <ThemedText style={[styles.role, { color: `${text}77` }]}>
                            {item.role}
                        </ThemedText>
                    </View>
                    <ThemedText style={[styles.timestamp, { color: `${text}77` }]}>
                        {item.timestamp}
                    </ThemedText>
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
                        {item.lastMessage}
                    </ThemedText>

                    {item.unreadCount > 0 && (
                        <View style={[styles.unreadBadge, { backgroundColor: tint }]}>
                            <ThemedText style={styles.unreadText}>
                                {item.unreadCount}
                            </ThemedText>
                        </View>
                    )}
                </View>
            </View>
        </Pressable>
    );

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
        <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={['top', 'bottom']}>
            <ThemedView style={[styles.container, { backgroundColor: bg }]}>
                {/* Header */}
                <ScreenHeader
                    title="Messages"
                    showBack={true}
                    rightIcon="settings"
                    onRightPress={() => console.log('Settings pressed')}
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
                </View>

                {/* Conversations List */}
                {sortedConversations.length > 0 ? (
                    <FlatList
                        data={sortedConversations}
                        renderItem={renderConversationItem}
                        keyExtractor={(item) => item.id}
                        scrollEnabled={true}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContent}
                    />
                ) : (
                    renderEmptyState()
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
        paddingHorizontal: 16,
        paddingVertical: 22,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(128, 128, 128, 0.1)',
    },
    searchInputWrapper: {
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
    onlineIndicator: {
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 2,
        borderColor: '#FFFFFF',
        position: 'absolute',
        bottom: 0,
        right: 0,
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
