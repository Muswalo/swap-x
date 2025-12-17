import { ScreenHeader } from '@/components/screen-header';
import { ShimmerProvider } from '@/components/shimmer-provider';
import { SwapDetailsScreenSkeleton } from '@/components/swap/SwapDetailsScreenSkeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { messagingUtils } from '@/lib/messaging.utils';
import { notifySwapInterest } from '@/lib/notifications.utils';
import { supabase } from '@/lib/supabase';
import { Feather } from '@expo/vector-icons';

import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';

// Payment components and utilities
import {
    ContactDetailsView,
    ContactOptionsModal,
    MobileMoneyModal,
    PaymentModal,
} from '@/components/payment';
import type { ContactDetails, PaymentOption } from '@/lib/payment.types';
import {
    checkContactAccess,
    checkSubscriptionStatus,
    getUserViewBalance,
    grantContactAccess,
    handlePackagePurchase,
    handleSubscriptionPurchase,
    processPayment,
    updateViewBalance,
} from '@/lib/payment.utils';

import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

type SwapDetails = {
    id: string;
    userId: string;
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
    isOwnSwap: boolean;
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
    const [isExpressingInterest, setIsExpressingInterest] = useState(false);
    const [hasExpressedInterest, setHasExpressedInterest] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [interestCount, setInterestCount] = useState(0);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // Payment flow state management (Requirements: 1.1)
    const [showContactOptionsModal, setShowContactOptionsModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showMobileMoneyModal, setShowMobileMoneyModal] = useState(false);
    const [showContactDetailsModal, setShowContactDetailsModal] = useState(false);
    const [selectedPaymentOption, setSelectedPaymentOption] = useState<PaymentOption | null>(null);
    const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [viewsRemaining, setViewsRemaining] = useState(0);
    const [contactDetails, setContactDetails] = useState<ContactDetails>({ phoneNumber: null, email: null });

    useEffect(() => {
        loadCurrentUser();
        loadSwapDetails();
    }, [swapId]);

    const loadCurrentUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUserId(user?.id || null);
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

    const loadSwapDetails = async () => {
        try {
            setIsLoading(true);
            if (!swapId) return;

            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            const userId = user?.id;

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
                .eq('user_id', swapData.user_id || '')
                .single();

            if (profileError) console.warn('Profile data not found:', profileError);
            
            // Check if user has already expressed interest
            if (userId) {
                const { data: interestData } = await supabase
                    .from('swap_interests')
                    .select('id')
                    .eq('swap_id', swapId)
                    .eq('interested_user_id', userId)
                    .single();
                
                setHasExpressedInterest(!!interestData);
            }

            // Get interest count for own swaps
            if (userId === swapData.user_id) {
                const { count } = await supabase
                    .from('swap_interests')
                    .select('*', { count: 'exact', head: true })
                    .eq('swap_id', swapId);
                
                setInterestCount(count || 0);
            }

            // Format the swap details
            const firstName = profileData?.first_name || 'User';
            const lastName = profileData?.last_name || '';
            const posterName = `${firstName} ${lastName}`.trim();
            const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(posterName)}&background=random&size=128&bold=true`;

            // Format the posted date
            const createdDate = new Date(swapData.created_at || new Date());
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

            const isOwnSwap = userId === swapData.user_id;

            const formattedSwap: SwapDetails = {
                id: swapData.id,
                userId: swapData.user_id || '',
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
                isOwnSwap,
            };

            setSwap(formattedSwap);
        } catch (error) {
            console.error('Error loading swap details:', error);
        } finally {
            setIsLoading(false);
        }
    };


    /**
     * Handle Contact button press - opens ContactOptionsModal
     * Requirements: 1.1, 1.5
     */
    const handleContactPress = async () => {
        if (!swap || !currentUserId) return;

        // If own swap, show contact details directly (Requirement 1.5)
        if (swap.isOwnSwap) {
            await loadAndShowContactDetails();
            return;
        }

        // Otherwise open ContactOptionsModal (Requirement 1.1)
        setShowContactOptionsModal(true);
    };

    /**
     * Handle "Message in App" option selection
     * Requirements: 1.2
     */
    const handleMessageInApp = async () => {
        if (!swap || !currentUserId) return;

        setShowContactOptionsModal(false);
        const firstName = swap.posterName.split(' ')[0];

        try {
            // Create or get existing conversation
            const conversationId = await messagingUtils.startConversation(
                currentUserId,
                swap.userId,
                swap.id
            );

            if (!conversationId) {
                throw new Error('Failed to create conversation');
            }

            // Navigate to chat screen
            router.push({
                pathname: '/chat',
                params: {
                    conversationId,
                    otherUserId: swap.userId,
                    otherUserName: firstName,
                },
            });
        } catch (error) {
            console.error('Error creating conversation:', error);
            Alert.alert('Error', 'Failed to start conversation. Please try again.');
        }
    };

    /**
     * Load contact details from the swap poster's profile
     */
    const loadAndShowContactDetails = async () => {
        if (!swap) return;

        try {
            const { data: profileData, error } = await supabase
                .from('profiles')
                .select('phone_number, email')
                .eq('user_id', swap.userId)
                .single();

            if (error) {
                console.error('Error loading contact details:', error);
                setContactDetails({ phoneNumber: null, email: null });
            } else {
                setContactDetails({
                    phoneNumber: profileData?.phone_number || null,
                    email: profileData?.email || null,
                });
            }

            setShowContactDetailsModal(true);
        } catch (error) {
            console.error('Error loading contact details:', error);
            Alert.alert('Error', 'Failed to load contact details. Please try again.');
        }
    };

    /**
     * Handle "View Contact Details" option selection
     * Requirements: 1.3, 1.4, 2.4
     */
    const handleViewContactDetails = async () => {
        if (!swap || !currentUserId) return;

        setShowContactOptionsModal(false);

        try {
            // Check if user has active subscription (Requirement 2.4)
            const subscriptionStatus = await checkSubscriptionStatus(currentUserId);
            if (subscriptionStatus.isActive) {
                // Grant access for subscription users and show contact details
                await grantContactAccess(currentUserId, swap.id, 'subscription');
                await loadAndShowContactDetails();
                return;
            }

            // Check if user already has access (Requirement 1.3)
            const hasAccess = await checkContactAccess(currentUserId, swap.id);
            if (hasAccess) {
                await loadAndShowContactDetails();
                return;
            }

            // No access - load view balance and show payment modal (Requirement 1.4)
            const balance = await getUserViewBalance(currentUserId);
            setViewsRemaining(balance);
            setShowPaymentModal(true);
        } catch (error) {
            console.error('Error checking contact access:', error);
            Alert.alert('Error', 'Failed to check access. Please try again.');
        }
    };

    /**
     * Handle payment option selection
     * Requirements: 3.1
     */
    const handlePaymentOptionSelect = (option: PaymentOption) => {
        setSelectedPaymentOption(option);
        setPaymentError(null);
        setShowPaymentModal(false);
        setShowMobileMoneyModal(true);
    };

    /**
     * Handle using view balance instead of paying
     * Requirements: 5.2, 5.3
     */
    const handleUseViewBalance = async () => {
        if (!swap || !currentUserId || viewsRemaining <= 0) return;

        try {
            // Decrement balance
            const success = await updateViewBalance(currentUserId, 1);
            if (!success) {
                Alert.alert('Error', 'Failed to use view balance. Please try again.');
                return;
            }

            // Grant access
            await grantContactAccess(currentUserId, swap.id, 'package');

            // Update local state and show contact details
            setViewsRemaining(prev => prev - 1);
            setShowPaymentModal(false);
            await loadAndShowContactDetails();
        } catch (error) {
            console.error('Error using view balance:', error);
            Alert.alert('Error', 'Failed to use view balance. Please try again.');
        }
    };

    /**
     * Handle payment submission
     * Requirements: 3.3, 3.5, 3.6
     */
    const handlePaymentSubmit = async (phoneNumber: string) => {
        if (!swap || !currentUserId || !selectedPaymentOption) return;

        setIsPaymentProcessing(true);
        setPaymentError(null);

        try {
            let result;

            if (selectedPaymentOption.type === 'subscription') {
                // Handle subscription purchase
                result = await handleSubscriptionPurchase(currentUserId, phoneNumber);
            } else if (['package_3', 'package_6', 'package_10'].includes(selectedPaymentOption.type)) {
                // Handle package purchase
                result = await handlePackagePurchase(
                    currentUserId,
                    phoneNumber,
                    selectedPaymentOption.type as 'package_3' | 'package_6' | 'package_10'
                );
            } else {
                // Handle single payment
                result = await processPayment(
                    currentUserId,
                    selectedPaymentOption.amount,
                    phoneNumber,
                    selectedPaymentOption.type
                );
            }

            if (!result.success) {
                // Payment failed - show error and allow retry (Requirement 3.6)
                setPaymentError(result.error || 'Payment failed. Please try again.');
                setIsPaymentProcessing(false);
                return;
            }

            // Payment succeeded - grant access (Requirement 3.5)
            const paymentMethod = selectedPaymentOption.type === 'subscription' 
                ? 'subscription' 
                : selectedPaymentOption.type === 'single' 
                    ? 'single' 
                    : 'package';
            
            await grantContactAccess(currentUserId, swap.id, paymentMethod);

            // Close modal and show contact details (Requirement 3.5)
            setShowMobileMoneyModal(false);
            setSelectedPaymentOption(null);
            setIsPaymentProcessing(false);
            
            await loadAndShowContactDetails();
        } catch (error) {
            console.error('Error processing payment:', error);
            setPaymentError('An unexpected error occurred. Please try again.');
            setIsPaymentProcessing(false);
        }
    };

    /**
     * Handle copy to clipboard for contact details
     * Note: Using Alert as a fallback since expo-clipboard may not be installed
     */
    const handleCopyToClipboard = async (text: string) => {
        // For now, just log the copy action
        // In production, install expo-clipboard and use: await Clipboard.setStringAsync(text);
        console.log('Copied to clipboard:', text);
    };

    const handleExpressInterest = async () => {
        if (!swap || !currentUserId || hasExpressedInterest) return;

        Alert.alert(
            'Express Interest',
            'Would you like to express interest in this swap? The poster will be notified.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Express Interest',
                    onPress: async () => {
                        try {
                            setIsExpressingInterest(true);

                            // Insert interest record
                            const { error: interestError } = await supabase
                                .from('swap_interests')
                                .insert({
                                    swap_id: swap.id,
                                    interested_user_id: currentUserId,
                                    status: 'pending',
                                });

                            if (interestError) throw interestError;

                            // Send notification to swap owner
                            const { data: profile } = await supabase
                                .from('profiles')
                                .select('first_name, last_name')
                                .eq('user_id', currentUserId)
                                .single();

                            const userName = profile 
                                ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Someone'
                                : 'Someone';

                            await notifySwapInterest(swap.userId, currentUserId, userName, swap.id);

                            setHasExpressedInterest(true);
                            Alert.alert('Success', 'Your interest has been expressed!');
                        } catch (error) {
                            console.error('Error expressing interest:', error);
                            Alert.alert('Error', 'Failed to express interest. Please try again.');
                        } finally {
                            setIsExpressingInterest(false);
                        }
                    },
                },
            ]
        );
    };

    const handleManageSwap = () => {
        if (!swap) return;

        const actions = [
            {
                text: `View Interests (${interestCount})`,
                onPress: () => router.push({
                    pathname: '/swap-interests',
                    params: { swapId: swap.id }
                }),
            },
            {
                text: 'Edit',
                onPress: () => router.push({
                    pathname: '/edit-swap',
                    params: { swapId: swap.id }
                }),
            },
            {
                text: 'Close Swap',
                onPress: () => handleCloseSwap(),
            },
            {
                text: 'Delete',
                style: 'destructive' as const,
                onPress: () => handleDeleteSwap(),
            },
            {
                text: 'Cancel',
                style: 'cancel' as const,
            },
        ];

        Alert.alert('Manage Swap', 'What would you like to do with this swap?', actions);
    };

    const handleCloseSwap = async () => {
        if (!swap) return;

        Alert.alert(
            'Close Swap',
            'Mark this swap as completed? It will be removed from search results.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Close',
                    onPress: async () => {
                        try {
                            const { error } = await supabase
                                .from('swaps')
                                .update({ status: 'completed', updated_at: new Date().toISOString() })
                                .eq('id', swap.id);

                            if (error) throw error;

                            Alert.alert('Success', 'Swap has been closed', [
                                { text: 'OK', onPress: () => router.back() }
                            ]);
                        } catch (error) {
                            console.error('Error closing swap:', error);
                            Alert.alert('Error', 'Failed to close swap. Please try again.');
                        }
                    },
                },
            ]
        );
    };

    const handleDeleteSwap = async () => {
        if (!swap) return;

        Alert.alert(
            'Delete Swap',
            'Are you sure you want to delete this swap? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const { error } = await supabase
                                .from('swaps')
                                .delete()
                                .eq('id', swap.id);

                            if (error) throw error;

                            Alert.alert('Success', 'Swap has been deleted', [
                                { text: 'OK', onPress: () => router.back() }
                            ]);
                        } catch (error) {
                            console.error('Error deleting swap:', error);
                            Alert.alert('Error', 'Failed to delete swap. Please try again.');
                        }
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
              rightIcon={swap.isOwnSwap && interestCount > 0 ? "more" : "share"}
              onRightPress={() => {
                if (swap.isOwnSwap && interestCount > 0) {
                  router.push({
                    pathname: '/swap-interests',
                    params: { swapId: swap.id }
                  });
                } else {
                  console.log('Share pressed');
                }
              }}
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

            {/* Action Buttons */}
            <View style={[styles.footer, { borderTopColor: border }]}>
                {swap.isOwnSwap ? (
                    // Show manage button for own swaps
                    <Pressable
                        onPress={handleManageSwap}
                        style={({ pressed }) => [
                            styles.contactButton,
                            {
                                backgroundColor: tint,
                                opacity: pressed ? 0.85 : 1,
                            },
                        ]}
                    >
                        <Feather name="settings" size={18} color="#FFFFFF" />
                        <ThemedText style={styles.contactButtonText}>
                            Manage Swap
                        </ThemedText>
                    </Pressable>
                ) : (
                    // Show contact and interest buttons for other users' swaps
                    <View style={styles.actionButtonsRow}>
                        <Pressable
                            onPress={handleExpressInterest}
                            disabled={hasExpressedInterest || isExpressingInterest}
                            style={({ pressed }) => [
                                styles.interestButton,
                                {
                                    backgroundColor: hasExpressedInterest ? `${text}20` : `${tint}15`,
                                    borderColor: hasExpressedInterest ? `${text}30` : tint,
                                    opacity: pressed ? 0.7 : 1,
                                },
                            ]}
                        >
                            {isExpressingInterest ? (
                                <ActivityIndicator size="small" color={tint} />
                            ) : (
                                <>
                                    <Feather 
                                        name={hasExpressedInterest ? "check" : "heart"} 
                                        size={18} 
                                        color={hasExpressedInterest ? text : tint} 
                                    />
                                </>
                            )}
                        </Pressable>
                        <Pressable
                            onPress={handleContactPress}
                            style={({ pressed }) => [
                                styles.contactButton,
                                styles.flexButton,
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
                )}
            </View>

            {/* Payment Flow Modals */}
            {/* Contact Options Modal - Requirements: 1.1, 1.2 */}
            <ContactOptionsModal
                isVisible={showContactOptionsModal}
                onClose={() => setShowContactOptionsModal(false)}
                onMessageInApp={handleMessageInApp}
                onViewContactDetails={handleViewContactDetails}
                posterName={firstName}
            />

            {/* Payment Modal - Requirements: 2.1, 2.2, 2.3, 2.5 */}
            <PaymentModal
                isVisible={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onSelectOption={handlePaymentOptionSelect}
                onUseViewBalance={handleUseViewBalance}
                viewsRemaining={viewsRemaining}
            />

            {/* Mobile Money Modal - Requirements: 3.1, 3.2, 3.4 */}
            <MobileMoneyModal
                isVisible={showMobileMoneyModal}
                onClose={() => {
                    setShowMobileMoneyModal(false);
                    setSelectedPaymentOption(null);
                    setPaymentError(null);
                }}
                onPay={handlePaymentSubmit}
                amount={selectedPaymentOption?.amount || 0}
                description={selectedPaymentOption?.description || ''}
                isLoading={isPaymentProcessing}
                error={paymentError}
            />

            {/* Contact Details View - Requirements: 1.3 */}
            <ContactDetailsView
                isVisible={showContactDetailsModal}
                onClose={() => setShowContactDetailsModal(false)}
                contactDetails={contactDetails}
                posterName={firstName}
                onCopyToClipboard={handleCopyToClipboard}
            />
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
    actionButtonsRow: {
        flexDirection: 'row',
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
    flexButton: {
        flex: 1,
    },
    interestButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1.5,
    },
    interestButtonText: {
        fontSize: 15,
        fontWeight: '700',
    },
    contactButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});
