import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { notifySwapAccepted, notifySwapDeclined } from '@/lib/notifications.utils';
import { supabase } from '@/lib/supabase';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type SwapInterestWithProfile = {
    id: string;
    swap_id: string | null;
    interested_user_id: string | null;
    status: string | null;
    message: string | null;
    created_at: string | null;
    profile: {
        first_name: string | null;
        last_name: string | null;
        job_title: string | null;
        current_ministry: string | null;
        current_district: string | null;
        profile_photo_url: string | null;
    };
};

export default function SwapInterestsScreen() {
    const router = useRouter();
    const { swapId } = useLocalSearchParams<{ swapId: string }>();
    const bg = useThemeColor({}, 'background');
    const text = useThemeColor({}, 'text');
    const tint = useThemeColor({}, 'tint');
    const border = `${text}20`;
    const cardBg = `${text}08`;

    const [interests, setInterests] = useState<SwapInterestWithProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        loadInterests();
    }, [swapId]);

    const loadInterests = async () => {
        try {
            if (!swapId) {
                console.log('No swapId provided');
                setIsLoading(false);
                return;
            }

            console.log('Loading interests for swap:', swapId);

            // First get the interests
            const { data: interestsData, error: interestsError } = await supabase
                .from('swap_interests')
                .select('*')
                .eq('swap_id', swapId)
                .order('created_at', { ascending: false });

            if (interestsError) {
                console.error('Error fetching interests:', interestsError);
                throw interestsError;
            }

            console.log('Interests found:', interestsData?.length || 0);

            // Then get profiles for each interest
            const interestsWithProfiles: SwapInterestWithProfile[] = [];
            
            for (const interest of interestsData || []) {
                if (!interest.interested_user_id) continue;
                
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('first_name, last_name, job_title, current_ministry, current_district, profile_photo_url')
                    .eq('user_id', interest.interested_user_id)
                    .single();

                interestsWithProfiles.push({
                    ...interest,
                    profile: profileData || {
                        first_name: null,
                        last_name: null,
                        job_title: null,
                        current_ministry: null,
                        current_district: null,
                        profile_photo_url: null,
                    },
                });
            }

            setInterests(interestsWithProfiles);
        } catch (error) {
            console.error('Error loading interests:', error);
            Alert.alert('Error', 'Failed to load interests');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await loadInterests();
    };

    const handleUpdateStatus = async (
        interestId: string,
        newStatus: 'accepted' | 'declined',
        interestedUserId: string,
        interestedUserName: string
    ) => {
        try {
            const { error } = await supabase
                .from('swap_interests')
                .update({ status: newStatus })
                .eq('id', interestId);

            if (error) throw error;

            // Get current user info for notification
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('first_name, last_name')
                    .eq('user_id', user.id)
                    .single();

                if (profile) {
                    const ownerName = `${profile.first_name} ${profile.last_name}`;
                    
                    // Send notification
                    if (newStatus === 'accepted') {
                        await notifySwapAccepted(interestedUserId, user.id, ownerName, swapId!);
                    } else {
                        await notifySwapDeclined(interestedUserId, user.id, ownerName, swapId!);
                    }
                }
            }

            await loadInterests();
            Alert.alert(
                'Success',
                `Interest ${newStatus === 'accepted' ? 'accepted' : 'declined'}`
            );
        } catch (error) {
            console.error('Error updating interest status:', error);
            Alert.alert('Error', 'Failed to update interest status');
        }
    };

    const handleContactUser = async (userId: string, userName: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get or create conversation
            const conversationId = await supabase.rpc('get_or_create_conversation', {
                p_user1_id: user.id,
                p_user2_id: userId,
                p_swap_id: swapId,
            });

            router.push({
                pathname: '/chat',
                params: {
                    conversationId: conversationId.data,
                    otherUserId: userId,
                    otherUserName: userName,
                },
            });
        } catch (error) {
            console.error('Error creating conversation:', error);
            Alert.alert('Error', 'Failed to start conversation');
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor(diffMs / (1000 * 60));

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'accepted':
                return '#10B981';
            case 'declined':
                return '#EF4444';
            case 'pending':
                return '#F59E0B';
            default:
                return text;
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={['top']}>
                <ScreenHeader title="Swap Interests" showBack />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={tint} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={['top']}>
            <ScreenHeader title="Swap Interests" showBack />

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        tintColor={tint}
                    />
                }
            >
                {interests.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Feather name="heart" size={64} color={`${text}30`} />
                        <ThemedText style={[styles.emptyTitle, { color: `${text}77` }]}>
                            No Interests Yet
                        </ThemedText>
                        <ThemedText style={[styles.emptySubtitle, { color: `${text}60` }]}>
                            When someone expresses interest in your swap, they'll appear here
                        </ThemedText>
                    </View>
                ) : (
                    <View style={styles.interestsList}>
                        {interests.map((interest) => {
                            const profile = interest.profile;
                            const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User';
                            const avatarUrl = profile.profile_photo_url || 
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random&size=128&bold=true`;

                            return (
                                <View
                                    key={interest.id}
                                    style={[
                                        styles.interestCard,
                                        { backgroundColor: cardBg, borderColor: border },
                                    ]}
                                >
                                    <View style={styles.interestHeader}>
                                        <View style={styles.userInfo}>
                                            <View style={styles.avatarContainer}>
                                                <Image
                                                    source={{ uri: avatarUrl }}
                                                    style={styles.avatar}
                                                />
                                            </View>
                                            <View style={styles.userDetails}>
                                                <ThemedText style={styles.userName}>
                                                    {fullName}
                                                </ThemedText>
                                                <ThemedText
                                                    style={[styles.userRole, { color: `${text}77` }]}
                                                >
                                                    {profile.job_title || 'Staff Member'}
                                                </ThemedText>
                                                <View style={styles.locationRow}>
                                                    <Feather
                                                        name="map-pin"
                                                        size={12}
                                                        color={`${text}66`}
                                                    />
                                                    <ThemedText
                                                        style={[styles.locationText, { color: `${text}66` }]}
                                                    >
                                                        {profile.current_district || 'Unknown'}
                                                    </ThemedText>
                                                </View>
                                            </View>
                                        </View>
                                        <View
                                            style={[
                                                styles.statusBadge,
                                                {
                                                    backgroundColor: `${getStatusColor(interest.status || 'pending')}15`,
                                                },
                                            ]}
                                        >
                                            <ThemedText
                                                style={[
                                                    styles.statusText,
                                                    { color: getStatusColor(interest.status || 'pending') },
                                                ]}
                                            >
                                                {(interest.status || 'pending').charAt(0).toUpperCase() +
                                                    (interest.status || 'pending').slice(1)}
                                            </ThemedText>
                                        </View>
                                    </View>

                                    <View style={styles.interestMeta}>
                                        <Feather name="clock" size={12} color={`${text}66`} />
                                        <ThemedText style={[styles.metaText, { color: `${text}66` }]}>
                                            {formatDate(interest.created_at || new Date().toISOString())}
                                        </ThemedText>
                                    </View>

                                    {interest.message && (
                                        <View style={styles.messageContainer}>
                                            <ThemedText style={[styles.messageText, { color: text }]}>
                                                {interest.message}
                                            </ThemedText>
                                        </View>
                                    )}

                                    <View style={styles.actions}>
                                        <Pressable
                                            onPress={() =>
                                                handleContactUser(
                                                    interest.interested_user_id || '',
                                                    fullName
                                                )
                                            }
                                            style={({ pressed }) => [
                                                styles.actionButton,
                                                {
                                                    backgroundColor: `${tint}15`,
                                                    opacity: pressed ? 0.7 : 1,
                                                },
                                            ]}
                                        >
                                            <Feather name="message-circle" size={16} color={tint} />
                                            <ThemedText style={[styles.actionText, { color: tint }]}>
                                                Message
                                            </ThemedText>
                                        </Pressable>

                                        {(interest.status || 'pending') === 'pending' && (
                                            <>
                                                <Pressable
                                                    onPress={() =>
                                                        handleUpdateStatus(
                                                            interest.id, 
                                                            'accepted',
                                                            interest.interested_user_id || '',
                                                            fullName
                                                        )
                                                    }
                                                    style={({ pressed }) => [
                                                        styles.actionButton,
                                                        {
                                                            backgroundColor: '#10B98115',
                                                            opacity: pressed ? 0.7 : 1,
                                                        },
                                                    ]}
                                                >
                                                    <Feather name="check" size={16} color="#10B981" />
                                                    <ThemedText
                                                        style={[styles.actionText, { color: '#10B981' }]}
                                                    >
                                                        Accept
                                                    </ThemedText>
                                                </Pressable>

                                                <Pressable
                                                    onPress={() =>
                                                        handleUpdateStatus(
                                                            interest.id, 
                                                            'declined',
                                                            interest.interested_user_id || '',
                                                            fullName
                                                        )
                                                    }
                                                    style={({ pressed }) => [
                                                        styles.actionButton,
                                                        {
                                                            backgroundColor: '#EF444415',
                                                            opacity: pressed ? 0.7 : 1,
                                                        },
                                                    ]}
                                                >
                                                    <Feather name="x" size={16} color="#EF4444" />
                                                    <ThemedText
                                                        style={[styles.actionText, { color: '#EF4444' }]}
                                                    >
                                                        Decline
                                                    </ThemedText>
                                                </Pressable>
                                            </>
                                        )}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        gap: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    interestsList: {
        gap: 16,
    },
    interestCard: {
        borderRadius: 16,
        padding: 16,
        gap: 12,
        borderWidth: 1,
    },
    interestHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    userInfo: {
        flexDirection: 'row',
        gap: 12,
        flex: 1,
    },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    userDetails: {
        flex: 1,
        gap: 4,
    },
    userName: {
        fontSize: 16,
        fontWeight: '700',
    },
    userRole: {
        fontSize: 13,
        fontWeight: '500',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    locationText: {
        fontSize: 12,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    interestMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        fontSize: 12,
    },
    messageContainer: {
        padding: 12,
        borderRadius: 12,
        backgroundColor: 'rgba(0,0,0,0.03)',
    },
    messageText: {
        fontSize: 14,
        lineHeight: 20,
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    actionText: {
        fontSize: 13,
        fontWeight: '600',
    },
});
