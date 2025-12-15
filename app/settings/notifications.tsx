import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { supabase } from '@/lib/supabase';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface NotificationSettings {
    push_notifications: boolean;
    email_notifications: boolean;
    match_notifications: boolean;
    message_notifications: boolean;
    marketing_notifications: boolean;
}

export default function NotificationSettingsScreen() {
    const bg = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const mutedColor = useThemeColor({}, 'muted');
    const borderColor = useThemeColor({}, 'border');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<NotificationSettings>({
        push_notifications: true,
        email_notifications: true,
        match_notifications: true,
        message_notifications: true,
        marketing_notifications: false,
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('user_settings')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            if (data) {
                setSettings({
                    push_notifications: data.push_notifications,
                    email_notifications: data.email_notifications,
                    match_notifications: data.match_notifications,
                    message_notifications: data.message_notifications,
                    marketing_notifications: data.marketing_notifications,
                });
            }
        } catch (error) {
            console.error('Error loading notification settings:', error);
            Alert.alert('Error', 'Failed to load notification settings');
        } finally {
            setLoading(false);
        }
    };

    const updateSetting = async (key: keyof NotificationSettings, value: boolean) => {
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('user_settings')
                .update({ [key]: value })
                .eq('user_id', user.id);

            if (error) throw error;

            setSettings(prev => ({ ...prev, [key]: value }));
        } catch (error) {
            console.error('Error updating notification setting:', error);
            Alert.alert('Error', 'Failed to update notification setting');
            setSettings(prev => ({ ...prev, [key]: !value }));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={['top']}>
                <ThemedView style={[styles.container, { backgroundColor: bg }]}>
                    <ScreenHeader title="Notifications" showBack={true} />
                    <ThemedView style={styles.loadingContainer}>
                        <ActivityIndicator size="large" />
                    </ThemedView>
                </ThemedView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={['top']}>
            <ThemedView style={[styles.container, { backgroundColor: bg }]}>
                <ScreenHeader title="Notifications" showBack={true} />
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <ThemedView style={styles.description}>
                        <ThemedText style={[styles.descriptionText, { color: mutedColor }]}>
                            Manage your notification preferences. You can control which types of notifications you receive.
                        </ThemedText>
                    </ThemedView>

                    <ThemedView style={[styles.settingItem, { borderBottomColor: borderColor }]}>
                        <ThemedView style={styles.settingInfo}>
                            <ThemedText style={[styles.settingTitle, { color: textColor }]}>
                                Push Notifications
                            </ThemedText>
                            <ThemedText style={[styles.settingDescription, { color: mutedColor }]}>
                                Receive push notifications on your device
                            </ThemedText>
                        </ThemedView>
                        <Switch
                            value={settings.push_notifications}
                            onValueChange={(value) => updateSetting('push_notifications', value)}
                            disabled={saving}
                        />
                    </ThemedView>

                    <ThemedView style={[styles.settingItem, { borderBottomColor: borderColor }]}>
                        <ThemedView style={styles.settingInfo}>
                            <ThemedText style={[styles.settingTitle, { color: textColor }]}>
                                Email Notifications
                            </ThemedText>
                            <ThemedText style={[styles.settingDescription, { color: mutedColor }]}>
                                Receive notifications via email
                            </ThemedText>
                        </ThemedView>
                        <Switch
                            value={settings.email_notifications}
                            onValueChange={(value) => updateSetting('email_notifications', value)}
                            disabled={saving}
                        />
                    </ThemedView>

                    <ThemedView style={[styles.settingItem, { borderBottomColor: borderColor }]}>
                        <ThemedView style={styles.settingInfo}>
                            <ThemedText style={[styles.settingTitle, { color: textColor }]}>
                                Match Notifications
                            </ThemedText>
                            <ThemedText style={[styles.settingDescription, { color: mutedColor }]}>
                                Get notified about potential swap matches
                            </ThemedText>
                        </ThemedView>
                        <Switch
                            value={settings.match_notifications}
                            onValueChange={(value) => updateSetting('match_notifications', value)}
                            disabled={saving}
                        />
                    </ThemedView>

                    <ThemedView style={[styles.settingItem, { borderBottomColor: borderColor }]}>
                        <ThemedView style={styles.settingInfo}>
                            <ThemedText style={[styles.settingTitle, { color: textColor }]}>
                                Message Notifications
                            </ThemedText>
                            <ThemedText style={[styles.settingDescription, { color: mutedColor }]}>
                                Get notified when you receive new messages
                            </ThemedText>
                        </ThemedView>
                        <Switch
                            value={settings.message_notifications}
                            onValueChange={(value) => updateSetting('message_notifications', value)}
                            disabled={saving}
                        />
                    </ThemedView>

                    <ThemedView style={[styles.settingItem, { borderBottomColor: borderColor }]}>
                        <ThemedView style={styles.settingInfo}>
                            <ThemedText style={[styles.settingTitle, { color: textColor }]}>
                                Marketing Notifications
                            </ThemedText>
                            <ThemedText style={[styles.settingDescription, { color: mutedColor }]}>
                                Receive updates about new features and tips
                            </ThemedText>
                        </ThemedView>
                        <Switch
                            value={settings.marketing_notifications}
                            onValueChange={(value) => updateSetting('marketing_notifications', value)}
                            disabled={saving}
                        />
                    </ThemedView>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    description: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    descriptionText: {
        fontSize: 14,
        lineHeight: 20,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    settingInfo: {
        flex: 1,
        marginRight: 16,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    settingDescription: {
        fontSize: 14,
        lineHeight: 18,
    },
});
