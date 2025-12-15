import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import Constants from 'expo-constants';
import React from 'react';
import { Linking, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AboutScreen() {
    const bg = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const mutedColor = useThemeColor({}, 'muted');
    const borderColor = useThemeColor({}, 'border');
    const primaryColor = useThemeColor({}, 'primary');

    const appVersion = Constants.expoConfig?.version || '1.0.0';
    const buildNumber = Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode || '1';

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={['top']}>
            <ThemedView style={[styles.container, { backgroundColor: bg }]}>
                <ScreenHeader title="About" showBack={true} />
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <ThemedView style={styles.logoContainer}>
                        <ThemedView style={[styles.logoCircle, { backgroundColor: primaryColor }]}>
                            <ThemedText style={styles.logoText}>SwapX</ThemedText>
                        </ThemedView>
                        <ThemedText style={[styles.appName, { color: textColor }]}>
                            SwapX
                        </ThemedText>
                        <ThemedText style={[styles.appTagline, { color: mutedColor }]}>
                            Government Employee Job Swap Platform
                        </ThemedText>
                        <ThemedText style={[styles.version, { color: mutedColor }]}>
                            Version {appVersion} (Build {buildNumber})
                        </ThemedText>
                    </ThemedView>

                    <ThemedView style={styles.section}>
                        <ThemedText style={[styles.sectionTitle, { color: mutedColor }]}>
                            ABOUT SWAPX
                        </ThemedText>
                        <ThemedView style={[styles.infoCard, { borderColor: borderColor }]}>
                            <ThemedText style={[styles.infoText, { color: textColor }]}>
                                SwapX is a platform designed to help government employees in Zambia find and arrange job location swaps. 
                                Whether you're looking to move closer to family, explore a new region, or find better opportunities, 
                                SwapX makes it easy to connect with others seeking similar exchanges.
                            </ThemedText>
                        </ThemedView>
                    </ThemedView>

                    <ThemedView style={styles.section}>
                        <ThemedText style={[styles.sectionTitle, { color: mutedColor }]}>
                            FEATURES
                        </ThemedText>
                        <ThemedView style={[styles.featureItem, { borderBottomColor: borderColor }]}>
                            <ThemedText style={[styles.featureIcon, { color: primaryColor }]}>
                                ✓
                            </ThemedText>
                            <ThemedText style={[styles.featureText, { color: textColor }]}>
                                Browse and search for swap opportunities
                            </ThemedText>
                        </ThemedView>
                        <ThemedView style={[styles.featureItem, { borderBottomColor: borderColor }]}>
                            <ThemedText style={[styles.featureIcon, { color: primaryColor }]}>
                                ✓
                            </ThemedText>
                            <ThemedText style={[styles.featureText, { color: textColor }]}>
                                Real-time messaging with potential swap partners
                            </ThemedText>
                        </ThemedView>
                        <ThemedView style={[styles.featureItem, { borderBottomColor: borderColor }]}>
                            <ThemedText style={[styles.featureIcon, { color: primaryColor }]}>
                                ✓
                            </ThemedText>
                            <ThemedText style={[styles.featureText, { color: textColor }]}>
                                Filter by ministry, district, and location type
                            </ThemedText>
                        </ThemedView>
                        <ThemedView style={[styles.featureItem, { borderBottomColor: borderColor }]}>
                            <ThemedText style={[styles.featureIcon, { color: primaryColor }]}>
                                ✓
                            </ThemedText>
                            <ThemedText style={[styles.featureText, { color: textColor }]}>
                                Secure and private profile management
                            </ThemedText>
                        </ThemedView>
                    </ThemedView>

                    <ThemedView style={styles.section}>
                        <ThemedText style={[styles.sectionTitle, { color: mutedColor }]}>
                            LEGAL
                        </ThemedText>
                        <TouchableOpacity
                            style={[styles.linkItem, { borderBottomColor: borderColor }]}
                            onPress={() => Linking.openURL('https://swapx.gov.zm/terms')}
                        >
                            <ThemedText style={[styles.linkText, { color: textColor }]}>
                                Terms of Service
                            </ThemedText>
                            <ThemedText style={[styles.linkArrow, { color: mutedColor }]}>
                                ›
                            </ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.linkItem, { borderBottomColor: borderColor }]}
                            onPress={() => Linking.openURL('https://swapx.gov.zm/privacy')}
                        >
                            <ThemedText style={[styles.linkText, { color: textColor }]}>
                                Privacy Policy
                            </ThemedText>
                            <ThemedText style={[styles.linkArrow, { color: mutedColor }]}>
                                ›
                            </ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.linkItem, { borderBottomColor: borderColor }]}
                            onPress={() => Linking.openURL('https://swapx.gov.zm/licenses')}
                        >
                            <ThemedText style={[styles.linkText, { color: textColor }]}>
                                Open Source Licenses
                            </ThemedText>
                            <ThemedText style={[styles.linkArrow, { color: mutedColor }]}>
                                ›
                            </ThemedText>
                        </TouchableOpacity>
                    </ThemedView>

                    <ThemedView style={styles.footer}>
                        <ThemedText style={[styles.footerText, { color: mutedColor }]}>
                            © 2025 SwapX. All rights reserved.
                        </ThemedText>
                        <ThemedText style={[styles.footerText, { color: mutedColor }]}>
                            Made with ❤️ for Zambian Government Employees
                        </ThemedText>
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
    logoContainer: {
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 16,
    },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    logoText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '700',
    },
    appName: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 8,
    },
    appTagline: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 8,
    },
    version: {
        fontSize: 12,
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
    infoCard: {
        marginHorizontal: 16,
        padding: 16,
        borderWidth: 1,
        borderRadius: 12,
    },
    infoText: {
        fontSize: 14,
        lineHeight: 22,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    featureIcon: {
        fontSize: 20,
        fontWeight: '700',
        marginRight: 12,
    },
    featureText: {
        fontSize: 14,
        flex: 1,
    },
    linkItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    linkText: {
        fontSize: 16,
        fontWeight: '500',
    },
    linkArrow: {
        fontSize: 24,
        fontWeight: '300',
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 24,
        paddingHorizontal: 16,
    },
    footerText: {
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 4,
    },
});
