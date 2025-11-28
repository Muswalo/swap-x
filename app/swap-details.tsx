import { ScreenHeader } from '@/components/screen-header';
import { ShimmerProvider } from '@/components/shimmer-provider';
import { SwapDetailsScreenSkeleton } from '@/components/swap/SwapDetailsScreenSkeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { supabase } from '@/lib/supabase';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

type SwapDetails = {
    id: string;
    posterName: string;
    jobTitle: string;
    currentMinistry: string;
    desiredMinistry: string | null;
    currentLocation: string;
    currentAreaType: string;
    desiredLocation: string;
    desiredAreaType: string;
    currentInstitution: string | null;
    salaryScale: string | null;
    housingCondition: string | null;
    reasonForSwap: string | null;
    additionalDetails: string | null;
    images: string[];
    postedDate: string;
    avatarUri: string;
    role: string;
};

export default function SwapDetailsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams();
    const swapId = params.swapId as string;

    const bg = useThemeColor({}, 'background');
    const text = useThemeColor({}, 'text');
    const tint = useThemeColor({}, 'tint');
    const border = `${text}15`;
    const cardBg = useThemeColor({}, 'background');
    const sectionBg = `${text}05`;

    const [swap, setSwap] = useState<SwapDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        loadSwapDetails();
    }, [swapId]);

    useEffect(() => {
        if (!isLoading && swap) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [isLoading, swap, fadeAnim]);

    const loadSwapDetails = async () => {
        try {
            setIsLoading(true);
            if (!swapId) return;

            // Fetch swap data
            const { data: swapData, error: swapError } = await supabase
                .from('swaps')
                .select('*')
                .eq('id', swapId)
                .single();

            if (swapError) throw swapError;

            // Fetch user profile data for the poster
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('first_name, last_name')
                .eq('user_id', swapData.user_id)
                .single();

            if (profileError) console.warn('Profile data not found:', profileError);
            // Format the swap details
            const firstName = profileData?.first_name || 'User';
            const lastName = profileData?.last_name || '';
            const posterName = `${firstName} ${lastName}`.trim();
            const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(posterName)}&background=random&size=128&bold=true`;

            // Format the posted date
            const createdDate = new Date(swapData.created_at);
            const now = new Date();
            const diffMs = now.getTime() - createdDate.getTime();
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMins = Math.floor(diffMs / (1000 * 60));

            let postedDate = 'just now';
            if (diffMins > 0 && diffMins < 60) postedDate = `${diffMins}m ago`;
            else if (diffHours > 0 && diffHours < 24) postedDate = `${diffHours}h ago`;
            else if (diffDays > 0 && diffDays < 7) postedDate = `${diffDays}d ago`;
            else postedDate = createdDate.toLocaleDateString();

            const formattedSwap: SwapDetails = {
                id: swapData.id,
                posterName,
                jobTitle: swapData.job_title || 'Staff Member',
                currentMinistry: swapData.current_ministry,
                desiredMinistry: swapData.desired_ministry,
                currentLocation: swapData.current_district,
                currentAreaType: swapData.current_area_type,
                desiredLocation: swapData.desired_district,
                desiredAreaType: swapData.desired_area_type,
                currentInstitution: swapData.current_institution,
                salaryScale: swapData.salary_scale,
                housingCondition: swapData.housing_condition,
                reasonForSwap: swapData.reason_for_swap,
                additionalDetails: swapData.additional_details,
                images: swapData.images || [],
                postedDate,
                avatarUri: avatarUrl,
                role: swapData.job_title || 'Staff Member',
            };

            setSwap(formattedSwap);
        } catch (error) {
            console.error('Error loading swap details:', error);
        } finally {
            setIsLoading(false);
        }
    };


    const handleContactPress = () => {
        Alert.alert(
            `Contact ${firstName}`,
            `Start a conversation with ${firstName} about this swap opportunity?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Send Message',
                    onPress: () => {
                        console.log('Navigate to chat with');
                    },
                },
            ]
        );
    };

    const handleImageScroll = (event: any) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const currentIndex = Math.round(contentOffsetX / (width - 40));
        setCurrentImageIndex(currentIndex);
    };

    useEffect(() => {
        if (!isLoading && swap) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [isLoading, swap, fadeAnim]);

    if (isLoading || !swap) {
        return (
            <ShimmerProvider>
                <SwapDetailsScreenSkeleton />
            </ShimmerProvider>
        );
    }

    // Extract first name and redact last name
    const firstName = swap.posterName.split(' ')[0];
    const lastName = swap.posterName.split(' ')[1];
    const redactedLastName = lastName ? lastName.charAt(0) + '••••••' : '';
    const displayName = `${firstName} ${redactedLastName}`;

    return (
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
            <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={['top', 'bottom']}>
                <ThemedView style={[styles.container, { backgroundColor: bg }]}>
            {/* Header */}
            <ScreenHeader
              title="Swap Details"
              showBack={true}
              rightIcon="share"
              onRightPress={() => console.log('Share pressed')}
            />

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
            >
                {/* Profile Header Card */}
                <View style={[styles.profileCard, { backgroundColor: cardBg, borderColor: border }]}>
                    {/* Avatar and Basic Info */}
                    <View style={styles.profileHeader}>
                        <View style={[styles.avatarContainer, { backgroundColor: `${text}0A` }]}>
                            {swap.avatarUri ? (
                                <Image source={{ uri: swap.avatarUri }} style={styles.avatar} />
                            ) : (
                                <View style={[styles.placeholderAvatar, { backgroundColor: tint }]}>
                                    <ThemedText style={styles.placeholderText}>
                                        {firstName.charAt(0).toUpperCase()}.
                                    </ThemedText>
                                </View>
                            )}
                        </View>

                        <View style={styles.profileInfo}>
                            <ThemedText style={styles.profileName}>{displayName}</ThemedText>
                            <ThemedText style={[styles.jobTitle, { color: `${text}88` }]}>
                                {swap.jobTitle}
                            </ThemedText>
                            <ThemedText style={[styles.ministry, { color: `${text}77` }]}>
                                {swap.currentMinistry}
                            </ThemedText>
                        </View>

                        <View
                            style={[
                                styles.postedBadge,
                                {
                                    backgroundColor: `${tint}15`,
                                    borderColor: `${tint}30`,
                                },
                            ]}
                        >
                            <Feather name="clock" size={12} color={tint} />
                            <ThemedText style={[styles.postedText, { color: tint }]}>
                                {swap.postedDate}
                            </ThemedText>
                        </View>
                    </View>

                    {/* Divider */}
                    <View style={[styles.divider, { backgroundColor: border }]} />

                    {/* Quick Stats */}
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Feather name="dollar-sign" size={16} color={tint} />
                            <ThemedText style={[styles.statLabel, { color: `${text}77` }]}>
                                Salary Scale
                            </ThemedText>
                            <ThemedText style={styles.statValue}>{swap.salaryScale || 'N/A'}</ThemedText>
                        </View>
                        <View style={styles.statItem}>
                            <Feather name="map-pin" size={16} color={tint} />
                            <ThemedText style={[styles.statLabel, { color: `${text}77` }]}>
                                Location
                            </ThemedText>
                            <ThemedText style={styles.statValue}>{swap.currentLocation}</ThemedText>
                        </View>
                        <View style={styles.statItem}>
                            <Feather name="home" size={16} color={tint} />
                            <ThemedText style={[styles.statLabel, { color: `${text}77` }]}>
                                Housing
                            </ThemedText>
                            <ThemedText style={styles.statValue}>{swap.housingCondition || 'N/A'}</ThemedText>
                        </View>
                    </View>
                </View>

                {/* Images Carousel */}
                {swap.images.length > 0 && (
                    <View style={styles.imagesSection}>
                        <ThemedText style={styles.sectionTitle}>Gallery</ThemedText>
                        <ScrollView
                            horizontal
                            pagingEnabled
                            scrollEventThrottle={16}
                            onScroll={handleImageScroll}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.imagesContainer}
                        >
                            {swap.images.map((image, index) => (
                                <Image
                                    key={index}
                                    source={{ uri: image }}
                                    style={styles.image}
                                />
                            ))}
                        </ScrollView>
                        {/* Image Indicators */}
                        <View style={styles.indicatorsContainer}>
                            {swap.images.map((_, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.indicator,
                                        {
                                            backgroundColor:
                                                index === currentImageIndex ? tint : `${text}30`,
                                        },
                                    ]}
                                />
                            ))}
                        </View>
                    </View>
                )}

                {/* Current Position Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Feather name="arrow-up-right" size={18} color={tint} />
                        <ThemedText style={styles.sectionTitle}>Current Posting</ThemedText>
                    </View>

                    <View style={[styles.detailCard, { backgroundColor: sectionBg }]}>
                        <DetailRow
                            icon="briefcase"
                            label="Ministry"
                            value={swap.currentMinistry}
                            tint={tint}
                            textColor={text}
                        />
                        <DetailRow
                            icon="map-pin"
                            label="District"
                            value={swap.currentLocation}
                            tint={tint}
                            textColor={text}
                        />
                        <DetailRow
                            icon="layers"
                            label="Institution"
                            value={swap.currentInstitution || 'N/A'}
                            tint={tint}
                            textColor={text}
                        />
                        <DetailRow
                            icon="layers"
                            label="Area Type"
                            value={swap.currentAreaType}
                            tint={tint}
                            textColor={text}
                            isLast
                        />
                    </View>
                </View>

                {/* Desired Position Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Feather name="arrow-down-left" size={18} color={tint} />
                        <ThemedText style={styles.sectionTitle}>Desired Posting</ThemedText>
                    </View>

                    <View style={[styles.detailCard, { backgroundColor: sectionBg }]}>
                        <DetailRow
                            icon="briefcase"
                            label="Ministry"
                            value={swap.desiredMinistry  || 'N/A'}
                            tint={tint}
                            textColor={text}
                        />
                        <DetailRow
                            icon="map-pin"
                            label="District"
                            value={swap.desiredLocation}
                            tint={tint}
                            textColor={text}
                        />
                        <DetailRow
                            icon="layers"
                            label="Area Type"
                            value={swap.desiredAreaType}
                            tint={tint}
                            textColor={text}
                            isLast
                        />
                    </View>
                </View>

                {/* Additional Info Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Feather name="info" size={18} color={tint} />
                        <ThemedText style={styles.sectionTitle}>Additional Information</ThemedText>
                    </View>

                    <View style={[styles.detailCard, { backgroundColor: sectionBg }]}>
                        <DetailRow
                            icon="dollar-sign"
                            label="Salary Scale"
                            value={swap.salaryScale  || 'N/A'}
                            tint={tint}
                            textColor={text}
                        />
                        <DetailRow
                            icon="home"
                            label="Housing Condition"
                            value={swap.housingCondition  || 'N/A'}
                            tint={tint}
                            textColor={text}
                            isLast
                        />
                    </View>
                </View>

                {/* Reason for Swap Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Feather name="message-square" size={18} color={tint} />
                        <ThemedText style={styles.sectionTitle}>Reason for Swap</ThemedText>
                    </View>

                    <View style={[styles.textCard, { backgroundColor: sectionBg }]}>
                        <ThemedText style={[styles.descriptionText, { color: text }]}>
                            {swap.reasonForSwap}
                        </ThemedText>
                    </View>
                </View>

                {/* Additional Details Section */}
                {swap.additionalDetails && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Feather name="file-text" size={18} color={tint} />
                            <ThemedText style={styles.sectionTitle}>About</ThemedText>
                        </View>

                        <View style={[styles.textCard, { backgroundColor: sectionBg }]}>
                            <ThemedText style={[styles.descriptionText, { color: text }]}>
                                {swap.additionalDetails}
                            </ThemedText>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Contact Button */}
            <View style={[styles.footer, { borderTopColor: border }]}>
                <Pressable
                    onPress={handleContactPress}
                    style={({ pressed }) => [
                        styles.contactButton,
                        {
                            backgroundColor: tint,
                            opacity: pressed ? 0.85 : 1,
                        },
                    ]}
                >
                    <Feather name="message-circle" size={18} color="#FFFFFF" />
                    <ThemedText style={styles.contactButtonText}>
                        Contact {firstName}
                    </ThemedText>
                </Pressable>
            </View>
        </ThemedView>
        </SafeAreaView>
        </Animated.View>
    );
}

// Helper Component for Detail Rows
function DetailRow({
    icon,
    label,
    value,
    tint,
    textColor,
    isLast = false,
}: {
    icon: string;
    label: string;
    value: string;
    tint: string;
    textColor: string;
    isLast?: boolean;
}) {
    return (
        <>
            <View style={styles.detailRow}>
                <View style={[styles.iconBox, { backgroundColor: `${tint}15` }]}>
                    <Feather name={icon as any} size={14} color={tint} />
                </View>
                <View style={styles.detailContent}>
                    <ThemedText style={[styles.detailLabel, { color: `${textColor}77` }]}>
                        {label}
                    </ThemedText>
                    <ThemedText style={[styles.detailValue, { color: textColor }]}>
                        {value}
                    </ThemedText>
                </View>
            </View>
            {!isLast && <View style={[styles.detailDivider, { backgroundColor: `${textColor}10` }]} />}
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    profileCard: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
        marginBottom: 16,
    },
    profileHeader: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'flex-start',
    },
    avatarContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
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
        fontSize: 24,
        fontWeight: '700',
    },
    profileInfo: {
        flex: 1,
        gap: 4,
    },
    profileName: {
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    jobTitle: {
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 18,
    },
    ministry: {
        fontSize: 13,
        fontWeight: '500',
    },
    postedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
    },
    postedText: {
        fontSize: 11,
        fontWeight: '600',
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
        fontSize: 11,
        fontWeight: '500',
    },
    statValue: {
        fontSize: 13,
        fontWeight: '700',
    },
    imagesSection: {
        marginBottom: 20,
        gap: 12,
    },
    imagesContainer: {
        gap: 12,
    },
    image: {
        width: width - 40,
        height: 280,
        borderRadius: 16,
        backgroundColor: 'rgba(128, 128, 128, 0.1)',
    },
    indicatorsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    indicator: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    section: {
        marginBottom: 20,
        gap: 12,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    detailCard: {
        borderRadius: 12,
        padding: 12,
    },
    detailRow: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
        paddingVertical: 10,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    detailContent: {
        flex: 1,
        gap: 2,
    },
    detailLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    detailDivider: {
        height: 1,
    },
    textCard: {
        borderRadius: 12,
        padding: 12,
    },
    descriptionText: {
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '500',
    },
    footer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        gap: 12,
    },
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 14,
        borderRadius: 12,
    },
    contactButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});
