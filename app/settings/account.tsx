import { AppButton } from '@/components/app-button';
import { BottomModal } from '@/components/bottom-modal';
import { FormInput } from '@/components/form-input';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { SubscriptionStatus } from '@/lib/payment.types';
import { checkSubscriptionStatus, getUserViewBalance } from '@/lib/payment.utils';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AccountSettingsScreen() {
    const bg = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const tint = useThemeColor({}, 'tint');
    const mutedColor = `${textColor}77`;
    const borderColor = `${textColor}20`;
    const dangerColor = '#EF4444';
    const successColor = '#34C759';

    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [emailModalVisible, setEmailModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [deleteConfirmation, setDeleteConfirmation] = useState('');

    const [loading, setLoading] = useState(false);

    // Subscription and balance state (Requirements: 5.3, 7.5)
    const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
        isActive: false,
        expiresAt: null,
        daysRemaining: 0,
    });
    const [viewsRemaining, setViewsRemaining] = useState(0);
    const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);

    // Load subscription status and view balance when screen is focused
    useFocusEffect(
        useCallback(() => {
            loadSubscriptionAndBalance();
        }, [])
    );

    const loadSubscriptionAndBalance = async () => {
        try {
            setIsLoadingSubscription(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const [status, balance] = await Promise.all([
                checkSubscriptionStatus(user.id),
                getUserViewBalance(user.id),
            ]);

            setSubscriptionStatus(status);
            setViewsRemaining(balance);
        } catch (error) {
            console.error('Error loading subscription status:', error);
        } finally {
            setIsLoadingSubscription(false);
        }
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            Alert.alert('Success', 'Password changed successfully');
            setPasswordModalVisible(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            console.error('Error changing password:', error);
            Alert.alert('Error', error.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const handleChangeEmail = async () => {
        if (!newEmail) {
            Alert.alert('Error', 'Please enter a new email address');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                email: newEmail
            });

            if (error) throw error;

            Alert.alert(
                'Verification Email Sent',
                'Please check your new email address to confirm the change'
            );
            setEmailModalVisible(false);
            setNewEmail('');
        } catch (error: any) {
            console.error('Error changing email:', error);
            Alert.alert('Error', error.message || 'Failed to change email');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmation.toLowerCase() !== 'delete') {
            Alert.alert('Error', 'Please type DELETE to confirm');
            return;
        }

        Alert.alert(
            'Delete Account',
            'Are you absolutely sure? This action cannot be undone and all your data will be permanently deleted.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            const { data: { user } } = await supabase.auth.getUser();
                            if (!user) return;

                            // Delete user profile (cascade will handle related data)
                            const { error: deleteError } = await supabase
                                .from('profiles')
                                .delete()
                                .eq('user_id', user.id);

                            if (deleteError) throw deleteError;

                            // Sign out
                            await supabase.auth.signOut();

                            Alert.alert('Account Deleted', 'Your account has been permanently deleted');
                            router.replace('/auth/sign-in');
                        } catch (error: any) {
                            console.error('Error deleting account:', error);
                            Alert.alert('Error', error.message || 'Failed to delete account');
                        } finally {
                            setLoading(false);
                            setDeleteModalVisible(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={['top']}>
            <ThemedView style={[styles.container, { backgroundColor: bg }]}>
                <ScreenHeader title="Account Settings" showBack={true} />
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Subscription & Balance Section (Requirements: 5.3, 7.5) */}
                    <ThemedView style={styles.section}>
                        <ThemedText style={[styles.sectionTitle, { color: mutedColor }]}>
                            SUBSCRIPTION & VIEWS
                        </ThemedText>
                        
                        {/* Subscription Status Card */}
                        <View style={[styles.subscriptionCard, { borderColor: borderColor }]}>
                            <View style={styles.subscriptionHeader}>
                                <View style={[
                                    styles.subscriptionIconContainer,
                                    { backgroundColor: subscriptionStatus.isActive ? `${successColor}15` : `${mutedColor}15` }
                                ]}>
                                    <Ionicons 
                                        name={subscriptionStatus.isActive ? "checkmark-circle" : "time-outline"} 
                                        size={24} 
                                        color={subscriptionStatus.isActive ? successColor : mutedColor} 
                                    />
                                </View>
                                <View style={styles.subscriptionInfo}>
                                    <ThemedText style={[styles.subscriptionLabel, { color: textColor }]}>
                                        Subscription Status
                                    </ThemedText>
                                    {isLoadingSubscription ? (
                                        <ThemedText style={[styles.subscriptionValue, { color: mutedColor }]}>
                                            Loading...
                                        </ThemedText>
                                    ) : (
                                        <ThemedText style={[
                                            styles.subscriptionValue,
                                            { color: subscriptionStatus.isActive ? successColor : mutedColor }
                                        ]}>
                                            {subscriptionStatus.isActive ? 'Active' : 'Inactive'}
                                        </ThemedText>
                                    )}
                                </View>
                            </View>
                            
                            {/* Days Remaining (only show if active) */}
                            {subscriptionStatus.isActive && !isLoadingSubscription && (
                                <View style={[styles.daysRemainingContainer, { borderTopColor: borderColor }]}>
                                    <Ionicons name="calendar-outline" size={16} color={tint} />
                                    <ThemedText style={[styles.daysRemainingText, { color: textColor }]}>
                                        {subscriptionStatus.daysRemaining} day{subscriptionStatus.daysRemaining !== 1 ? 's' : ''} remaining
                                    </ThemedText>
                                </View>
                            )}
                        </View>

                        {/* View Balance Card */}
                        <View style={[styles.subscriptionCard, { borderColor: borderColor, marginTop: 12 }]}>
                            <View style={styles.subscriptionHeader}>
                                <View style={[
                                    styles.subscriptionIconContainer,
                                    { backgroundColor: viewsRemaining > 0 ? `${tint}15` : `${mutedColor}15` }
                                ]}>
                                    <Ionicons 
                                        name="eye-outline" 
                                        size={24} 
                                        color={viewsRemaining > 0 ? tint : mutedColor} 
                                    />
                                </View>
                                <View style={styles.subscriptionInfo}>
                                    <ThemedText style={[styles.subscriptionLabel, { color: textColor }]}>
                                        Contact Views Remaining
                                    </ThemedText>
                                    {isLoadingSubscription ? (
                                        <ThemedText style={[styles.subscriptionValue, { color: mutedColor }]}>
                                            Loading...
                                        </ThemedText>
                                    ) : (
                                        <ThemedText style={[
                                            styles.subscriptionValue,
                                            { color: viewsRemaining > 0 ? tint : mutedColor }
                                        ]}>
                                            {viewsRemaining} view{viewsRemaining !== 1 ? 's' : ''}
                                        </ThemedText>
                                    )}
                                </View>
                            </View>
                        </View>
                    </ThemedView>

                    <ThemedView style={styles.section}>
                        <ThemedText style={[styles.sectionTitle, { color: mutedColor }]}>
                            SECURITY
                        </ThemedText>
                        <TouchableOpacity
                            style={[styles.settingItem, { borderBottomColor: borderColor }]}
                            onPress={() => setPasswordModalVisible(true)}
                        >
                            <ThemedText style={[styles.settingTitle, { color: textColor }]}>
                                Change Password
                            </ThemedText>
                            <ThemedText style={[styles.settingArrow, { color: mutedColor }]}>
                                ›
                            </ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.settingItem, { borderBottomColor: borderColor }]}
                            onPress={() => setEmailModalVisible(true)}
                        >
                            <ThemedText style={[styles.settingTitle, { color: textColor }]}>
                                Change Email
                            </ThemedText>
                            <ThemedText style={[styles.settingArrow, { color: mutedColor }]}>
                                ›
                            </ThemedText>
                        </TouchableOpacity>
                    </ThemedView>

                    <ThemedView style={styles.section}>
                        <ThemedText style={[styles.sectionTitle, { color: mutedColor }]}>
                            DANGER ZONE
                        </ThemedText>
                        <TouchableOpacity
                            style={[styles.settingItem, { borderBottomColor: borderColor }]}
                            onPress={() => setDeleteModalVisible(true)}
                        >
                            <ThemedText style={[styles.settingTitle, { color: dangerColor }]}>
                                Delete Account
                            </ThemedText>
                            <ThemedText style={[styles.settingArrow, { color: dangerColor }]}>
                                ›
                            </ThemedText>
                        </TouchableOpacity>
                    </ThemedView>
                </ScrollView>
            </ThemedView>

            {/* Change Password Modal */}
            <BottomModal
                isVisible={passwordModalVisible}
                onClose={() => {
                    setPasswordModalVisible(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                }}
            >
                <ThemedView style={styles.modalContent}>
                    <ThemedText type="subtitle" style={styles.modalTitle}>Change Password</ThemedText>
                    <ThemedText style={[styles.inputLabel, { color: mutedColor }]}>Current Password</ThemedText>
                    <FormInput
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        secureTextEntry
                        secureToggle
                        placeholder="Enter current password"
                        containerStyle={styles.inputContainer}
                    />
                    <ThemedText style={[styles.inputLabel, { color: mutedColor }]}>New Password</ThemedText>
                    <FormInput
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry
                        secureToggle
                        placeholder="Enter new password"
                        containerStyle={styles.inputContainer}
                    />
                    <ThemedText style={[styles.inputLabel, { color: mutedColor }]}>Confirm New Password</ThemedText>
                    <FormInput
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        secureToggle
                        placeholder="Confirm new password"
                        containerStyle={styles.inputContainer}
                    />
                    <AppButton
                        title="Change Password"
                        onPress={handleChangePassword}
                        loading={loading}
                        style={styles.modalButton}
                    />
                </ThemedView>
            </BottomModal>

            {/* Change Email Modal */}
            <BottomModal
                isVisible={emailModalVisible}
                onClose={() => {
                    setEmailModalVisible(false);
                    setNewEmail('');
                }}
            >
                <ThemedView style={styles.modalContent}>
                    <ThemedText type="subtitle" style={styles.modalTitle}>Change Email</ThemedText>
                    <ThemedText style={[styles.modalDescription, { color: mutedColor }]}>
                        You will receive a verification email at your new address. Please confirm to complete the change.
                    </ThemedText>
                    <ThemedText style={[styles.inputLabel, { color: mutedColor }]}>New Email Address</ThemedText>
                    <FormInput
                        value={newEmail}
                        onChangeText={setNewEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholder="Enter new email"
                        containerStyle={styles.inputContainer}
                    />
                    <AppButton
                        title="Change Email"
                        onPress={handleChangeEmail}
                        loading={loading}
                        style={styles.modalButton}
                    />
                </ThemedView>
            </BottomModal>

            {/* Delete Account Modal */}
            <BottomModal
                isVisible={deleteModalVisible}
                onClose={() => {
                    setDeleteModalVisible(false);
                    setDeleteConfirmation('');
                }}
            >
                <ThemedView style={styles.modalContent}>
                    <ThemedText type="subtitle" style={styles.modalTitle}>Delete Account</ThemedText>
                    <ThemedText style={[styles.modalDescription, { color: dangerColor }]}>
                        Warning: This action cannot be undone. All your data including profile, swaps, and messages will be permanently deleted.
                    </ThemedText>
                    <ThemedText style={[styles.inputLabel, { color: mutedColor }]}>Type DELETE to confirm</ThemedText>
                    <FormInput
                        value={deleteConfirmation}
                        onChangeText={setDeleteConfirmation}
                        placeholder="DELETE"
                        autoCapitalize="characters"
                        containerStyle={styles.inputContainer}
                    />
                    <AppButton
                        title="Delete My Account"
                        onPress={handleDeleteAccount}
                        loading={loading}
                        style={[styles.modalButton, { backgroundColor: dangerColor }]}
                    />
                </ThemedView>
            </BottomModal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingVertical: 16,
        paddingBottom: 32,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.5,
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '500',
    },
    settingArrow: {
        fontSize: 24,
        fontWeight: '300',
    },
    modalContent: {
        padding: 16,
    },
    modalDescription: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 16,
    },
    modalButton: {
        marginTop: 8,
    },
    modalTitle: {
        textAlign: 'center',
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 6,
        marginTop: 12,
    },
    inputContainer: {
        marginBottom: 4,
    },
    // Subscription & Balance styles (Requirements: 5.3, 7.5)
    subscriptionCard: {
        marginHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
    },
    subscriptionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
    },
    subscriptionIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    subscriptionInfo: {
        flex: 1,
        gap: 2,
    },
    subscriptionLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    subscriptionValue: {
        fontSize: 16,
        fontWeight: '700',
    },
    daysRemainingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
    },
    daysRemainingText: {
        fontSize: 14,
        fontWeight: '500',
    },
});
