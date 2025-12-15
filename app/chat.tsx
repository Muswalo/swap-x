import { ChatSkeleton } from '@/components/chat/ChatSkeleton';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { MessageInput } from '@/components/chat/MessageInput';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { Tables } from '@/lib/database.types';
import type { MessageWithSender } from '@/lib/database.utils';
import { messagingUtils } from '@/lib/messaging.utils';
import { supabase } from '@/lib/supabase';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Profile = Tables<'profiles'>;
type Message = Tables<'messages'>;

// Cache for conversation data to avoid repeated DB hits
const conversationCache = new Map<string, {
    messages: MessageWithSender[];
    otherParticipant: Profile;
    timestamp: number;
}>();

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedConversation = (conversationId: string) => {
    const cached = conversationCache.get(conversationId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached;
    }
    return null;
};

const setCachedConversation = (
    conversationId: string,
    messages: MessageWithSender[],
    otherParticipant: Profile
) => {
    conversationCache.set(conversationId, {
        messages,
        otherParticipant,
        timestamp: Date.now(),
    });
};

export default function ChatScreen() {
    const params = useLocalSearchParams<{ conversationId?: string; userId?: string }>();
    const bg = useThemeColor({}, 'background');
    const text = useThemeColor({}, 'text');

    const conversationId = params.conversationId || null;
    
    const [messages, setMessages] = useState<MessageWithSender[]>([]);
    const [otherUser, setOtherUser] = useState<Profile | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Load current user
    useEffect(() => {
        const loadCurrentUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setCurrentUserId(user.id);
            }
        };
        loadCurrentUser();
    }, []);

    // Load conversation and messages with caching
    useEffect(() => {
        if (!conversationId || !currentUserId) return;

        const loadConversation = async () => {
            setIsLoading(true);
            try {
                // Check cache first
                const cached = getCachedConversation(conversationId);
                if (cached) {
                    setMessages(cached.messages);
                    setOtherUser(cached.otherParticipant);
                    setIsLoading(false);
                    
                    // Mark messages as read in background
                    messagingUtils.markConversationAsRead(conversationId, currentUserId);
                    return;
                }

                // Fetch from DB if not cached
                const details = await messagingUtils.getConversationDetails(conversationId, currentUserId);
                if (details) {
                    setMessages(details.messages);
                    setOtherUser(details.otherParticipant);
                    
                    // Cache the conversation data
                    setCachedConversation(conversationId, details.messages, details.otherParticipant);
                    
                    // Mark messages as read
                    await messagingUtils.markConversationAsRead(conversationId, currentUserId);
                }
            } catch (error) {
                console.error('Error loading conversation:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadConversation();
    }, [conversationId, currentUserId]);

    // Subscribe to new messages and message updates (read receipts)
    useEffect(() => {
        if (!conversationId) return;

        const channel = supabase
            .channel(`messages:${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`,
                },
                async (payload) => {
                    const newMessage = payload.new as MessageWithSender;
                    
                    // Fetch sender profile if not already included
                    if (!newMessage.sender) {
                        const { data: profile } = await supabase
                            .from('profiles')
                            .select('*')
                            .eq('user_id', newMessage.sender_id)
                            .single();
                        
                        if (profile) {
                            newMessage.sender = profile;
                        }
                    }
                    
                    setMessages((prev) => {
                        const updated = [...prev, newMessage];
                        // Update cache with new message
                        if (conversationId && otherUser) {
                            setCachedConversation(conversationId, updated, otherUser);
                        }
                        return updated;
                    });
                    
                    // Mark as read if not from current user
                    if (newMessage.sender_id && newMessage.sender_id !== currentUserId) {
                        await messagingUtils.markMessageAsRead(newMessage.id);
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`,
                },
                (payload) => {
                    const updatedMessage = payload.new as Message;
                    
                    // Update the message in the list (for read receipts)
                    setMessages((prev) =>
                        prev.map((msg) =>
                            msg.id === updatedMessage.id
                                ? { ...msg, read_at: updatedMessage.read_at }
                                : msg
                        )
                    );
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [conversationId, currentUserId]);

    // Subscribe to typing indicators using presence
    useEffect(() => {
        if (!conversationId || !currentUserId || !otherUser?.user_id) return;

        const presenceChannel = supabase.channel(`presence:${conversationId}`, {
            config: {
                presence: {
                    key: currentUserId,
                },
            },
        });

        presenceChannel
            .on('presence', { event: 'sync' }, () => {
                const state = presenceChannel.presenceState();
                
                // Check if other user is typing
                const otherUserPresence = state[otherUser.user_id];
                if (otherUserPresence && otherUserPresence.length > 0) {
                    const presenceData = otherUserPresence[0] as any;
                    const isOtherUserTyping = presenceData.typing === true;
                    setIsTyping(isOtherUserTyping);
                } else {
                    setIsTyping(false);
                }
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    // Track initial presence
                    await presenceChannel.track({
                        user_id: currentUserId,
                        typing: false,
                        online_at: new Date().toISOString(),
                    });
                }
            });

        return () => {
            supabase.removeChannel(presenceChannel);
        };
    }, [conversationId, currentUserId, otherUser]);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (flatListRef.current && messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages]);

    const broadcastTypingStatus = async (typing: boolean) => {
        if (!conversationId || !currentUserId) return;

        const presenceChannel = supabase.channel(`presence:${conversationId}`);
        
        await presenceChannel.track({
            user_id: currentUserId,
            typing,
            online_at: new Date().toISOString(),
        });
    };

    const handleTyping = () => {
        // Broadcast that user is typing
        broadcastTypingStatus(true);

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set timeout to stop typing indicator after 3 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            broadcastTypingStatus(false);
        }, 3000);
    };

    const handleSend = async (content: string) => {
        if (!conversationId || !currentUserId) return;

        try {
            // Stop typing indicator
            broadcastTypingStatus(false);
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            await messagingUtils.sendTextMessage(conversationId, currentUserId, content);
            // Message will be added via real-time subscription
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const renderMessage = ({ item, index }: { item: MessageWithSender; index: number }) => {
        const isCurrentUser = item.sender_id === currentUserId;
        const showAvatar = !isCurrentUser && (
            index === messages.length - 1 || 
            messages[index + 1]?.sender_id !== item.sender_id
        );

        return (
            <MessageBubble
                message={item}
                isCurrentUser={isCurrentUser}
                showAvatar={showAvatar}
            />
        );
    };

    const userName = otherUser 
        ? `${otherUser.first_name || ''} ${otherUser.last_name || ''}`.trim() 
        : (isLoading ? '' : 'User');
    const userStatus = isLoading ? '' : 'Online'; // TODO: Implement real online status

    return (
        <View style={[styles.container, { backgroundColor: bg }]}>
            <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
                <KeyboardAvoidingView
                    style={styles.container}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                >
                    <ThemedView style={[styles.container, { backgroundColor: bg }]}>
                        {/* Header */}
                        <ScreenHeader
                            title={userName}
                            subtitle={userStatus}
                            showBack={true}
                            rightIcon="more"
                            onRightPress={() => console.log('More options')}
                        />

                        {/* Loading State with Skeleton */}
                        {isLoading ? (
                            <ChatSkeleton />
                        ) : (
                            <FlatList
                                ref={flatListRef}
                                data={messages}
                                renderItem={renderMessage}
                                keyExtractor={(item) => item.id}
                                contentContainerStyle={styles.messagesList}
                                showsVerticalScrollIndicator={false}
                                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                            />
                        )}

                        {/* Typing Indicator */}
                        {isTyping && <TypingIndicator userName={userName} />}
                    </ThemedView>
                </KeyboardAvoidingView>
            </SafeAreaView>
            
            {/* Input Area - Outside SafeAreaView to handle bottom inset separately */}
            <SafeAreaView style={{ backgroundColor: bg }} edges={['bottom', 'left', 'right']}>
                <MessageInput
                    onSend={handleSend}
                    onTyping={handleTyping}
                    disabled={!conversationId || isLoading}
                />
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    messagesList: {
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
});
