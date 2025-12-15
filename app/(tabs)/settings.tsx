import { ScreenHeader } from '@/components/screen-header';
import { SettingsItemProps } from '@/components/settings/SettingsItem';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import React from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type SettingsSectionType = {
    title: string;
    items: SettingsItemProps[];
};

export default function SettingsScreen() {
    const bg = useThemeColor({}, 'background');
    const text = useThemeColor({}, 'text');

    const handleLogout = async () => {
        Alert.alert(
            'Log Out',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Log Out',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await supabase.auth.signOut();
                        } catch (error) {
                            console.error('Error logging out:', error);
                            Alert.alert('Error', 'Failed to log out. Please try again.');
                        }
                    },
                },
            ]
        );
    };

    const settingsSections: SettingsSectionType[] = [
        {
            title: 'Account',
            items: [
                {
                    id: 'profile',
                    title: 'Edit Profile',
                    icon: 'user',
                    onPress: () => router.push('/profile'),
                    showChevron: true,
                },
                {
                    id: 'account',
                    title: 'Account Settings',
                    icon: 'settings',
                    onPress: () => router.push('/settings/account'),
                    showChevron: true,
                },
            ],
        },
        {
            title: 'Preferences',
            items: [
                {
                    id: 'notifications',
                    title: 'Notifications',
                    icon: 'bell',
                    onPress: () => router.push('/settings/notifications'),
                    showChevron: true,
                },
            ],
        },
        {
            title: 'Support',
            items: [
                {
                    id: 'help',
                    title: 'Help & FAQ',
                    icon: 'help-circle',
                    onPress: () => router.push('/settings/help'),
                    showChevron: true,
                },
                {
                    id: 'about',
                    title: 'About',
                    icon: 'info',
                    onPress: () => router.push('/settings/about'),
                    showChevron: true,
                },
            ],
        },
        {
            title: 'Account Actions',
            items: [
                {
                    id: 'logout',
                    title: 'Log Out',
                    icon: 'log-out',
                    onPress: handleLogout,
                    showChevron: false,
                    isDanger: true,
                },
            ],
        },
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={['top']}>
            <ThemedView style={[styles.container, { backgroundColor: bg }]}>
                {/* Header */}
                <ScreenHeader
                    title="Settings"
                    showBack={false}
                />

                {/* Settings Content */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {settingsSections.map((section, index) => (
                        <SettingsSection key={index} {...section} />
                    ))}

                    {/* App Version */}
                    <View style={styles.versionContainer}>
                        <ThemedText style={[styles.versionText, { color: `${text}50` }]}>
                            SwapX Version 1.0.0
                        </ThemedText>
                    </View>
                </ScrollView>
            </ThemedView>
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
    versionContainer: {
        alignItems: 'center',
        marginTop: 16,
        paddingVertical: 16,
    },
    versionText: {
        fontSize: 12,
        fontWeight: '500',
    },
});
