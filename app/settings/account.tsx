import { AppButton } from '@/components/app-button';
import { BottomModal } from '@/components/bottom-modal';
import { FormInput } from '@/components/form-input';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AccountSettingsScreen() {
    const bg = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const mutedColor = useThemeColor({}, 'muted');
    const borderColor = useThemeColor({}, 'border');
    const dangerColor = '#EF4444';

    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [emailModalVisible, setEmailModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [deleteConfirmation, setDeleteConfirmation] = useState('');

    const [loading, setLoading] = useState(false);

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
                            router.replace('/auth/login');
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
                visible={passwordModalVisible}
                onClose={() => {
                    setPasswordModalVisible(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                }}
                title="Change Password"
            >
                <ThemedView style={styles.modalContent}>
                    <FormInput
                        label="Current Password"
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        secureTextEntry
                        placeholder="Enter current password"
                    />
                    <FormInput
                        label="New Password"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry
                        placeholder="Enter new password"
                    />
                    <FormInput
                        label="Confirm New Password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        placeholder="Confirm new password"
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
                visible={emailModalVisible}
                onClose={() => {
                    setEmailModalVisible(false);
                    setNewEmail('');
                }}
                title="Change Email"
            >
                <ThemedView style={styles.modalContent}>
                    <ThemedText style={[styles.modalDescription, { color: mutedColor }]}>
                        You will receive a verification email at your new address. Please confirm to complete the change.
                    </ThemedText>
                    <FormInput
                        label="New Email Address"
                        value={newEmail}
                        onChangeText={setNewEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholder="Enter new email"
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
                visible={deleteModalVisible}
                onClose={() => {
                    setDeleteModalVisible(false);
                    setDeleteConfirmation('');
                }}
                title="Delete Account"
            >
                <ThemedView style={styles.modalContent}>
                    <ThemedText style={[styles.modalDescription, { color: dangerColor }]}>
                        Warning: This action cannot be undone. All your data including profile, swaps, and messages will be permanently deleted.
                    </ThemedText>
                    <FormInput
                        label="Type DELETE to confirm"
                        value={deleteConfirmation}
                        onChangeText={setDeleteConfirmation}
                        placeholder="DELETE"
                        autoCapitalize="characters"
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
});
