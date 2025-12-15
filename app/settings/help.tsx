import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import React, { useState } from 'react';
import { Linking, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface FAQItem {
    question: string;
    answer: string;
}

const FAQ_DATA: FAQItem[] = [
    {
        question: 'How do I create a swap request?',
        answer: 'To create a swap request, go to the Home tab and tap the "+" button. Fill in your current location details and desired location, then submit. Your swap will be visible to other users looking for similar exchanges.'
    },
    {
        question: 'How do I contact someone about a swap?',
        answer: 'When you find a swap that interests you, tap on it to view details. You can then tap the "Message" button to start a conversation with the person who posted the swap.'
    },
    {
        question: 'Can I edit my swap after posting?',
        answer: 'Yes! Go to your profile and find your active swaps. Tap on any swap to view details, then use the edit option to make changes. You can also pause or delete swaps from there.'
    },
    {
        question: 'How do I update my profile information?',
        answer: 'Tap on your profile picture in the Home tab or go to Settings. From there, you can edit your personal information, job details, and profile photo.'
    },
    {
        question: 'What happens when I find a match?',
        answer: 'When you find a potential match, use the messaging feature to discuss details. Once both parties agree, you can proceed with the official swap process through your respective ministries.'
    },
    {
        question: 'How do I manage my notifications?',
        answer: 'Go to Settings > Notifications to customize which notifications you receive. You can control push notifications, email alerts, and specific notification types like messages and matches.'
    },
    {
        question: 'Is my information secure?',
        answer: 'Yes, we take security seriously. Your data is encrypted and stored securely. Only information you choose to share in your profile is visible to other users. You can control your privacy settings in the Settings tab.'
    },
    {
        question: 'Can I delete my account?',
        answer: 'Yes, you can delete your account from Settings > Account Settings > Delete Account. Please note that this action is permanent and cannot be undone.'
    }
];

export default function HelpScreen() {
    const bg = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const mutedColor = useThemeColor({}, 'muted');
    const borderColor = useThemeColor({}, 'border');
    const primaryColor = useThemeColor({}, 'primary');

    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    const handleContactSupport = () => {
        Linking.openURL('mailto:support@swapx.gov.zm?subject=SwapX Support Request');
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={['top']}>
            <ThemedView style={[styles.container, { backgroundColor: bg }]}>
                <ScreenHeader title="Help & FAQ" showBack={true} />
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <ThemedView style={styles.section}>
                        <ThemedText style={[styles.sectionTitle, { color: mutedColor }]}>
                            FREQUENTLY ASKED QUESTIONS
                        </ThemedText>
                        {FAQ_DATA.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.faqItem, { borderBottomColor: borderColor }]}
                                onPress={() => toggleFAQ(index)}
                            >
                                <ThemedView style={styles.faqHeader}>
                                    <ThemedText style={[styles.faqQuestion, { color: textColor }]}>
                                        {item.question}
                                    </ThemedText>
                                    <ThemedText style={[styles.faqIcon, { color: primaryColor }]}>
                                        {expandedIndex === index ? '−' : '+'}
                                    </ThemedText>
                                </ThemedView>
                                {expandedIndex === index && (
                                    <ThemedText style={[styles.faqAnswer, { color: mutedColor }]}>
                                        {item.answer}
                                    </ThemedText>
                                )}
                            </TouchableOpacity>
                        ))}
                    </ThemedView>

                    <ThemedView style={styles.section}>
                        <ThemedText style={[styles.sectionTitle, { color: mutedColor }]}>
                            CONTACT SUPPORT
                        </ThemedText>
                        <ThemedView style={[styles.contactCard, { borderColor: borderColor }]}>
                            <ThemedText style={[styles.contactTitle, { color: textColor }]}>
                                Need more help?
                            </ThemedText>
                            <ThemedText style={[styles.contactDescription, { color: mutedColor }]}>
                                Our support team is here to assist you with any questions or issues.
                            </ThemedText>
                            <TouchableOpacity
                                style={[styles.contactButton, { backgroundColor: primaryColor }]}
                                onPress={handleContactSupport}
                            >
                                <ThemedText style={styles.contactButtonText}>
                                    Email Support
                                </ThemedText>
                            </TouchableOpacity>
                        </ThemedView>
                    </ThemedView>

                    <ThemedView style={styles.section}>
                        <ThemedText style={[styles.sectionTitle, { color: mutedColor }]}>
                            USEFUL LINKS
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
                            onPress={() => Linking.openURL('https://swapx.gov.zm/guidelines')}
                        >
                            <ThemedText style={[styles.linkText, { color: textColor }]}>
                                Community Guidelines
                            </ThemedText>
                            <ThemedText style={[styles.linkArrow, { color: mutedColor }]}>
                                ›
                            </ThemedText>
                        </TouchableOpacity>
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
    faqItem: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    faqHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    faqQuestion: {
        fontSize: 16,
        fontWeight: '500',
        flex: 1,
        marginRight: 12,
    },
    faqIcon: {
        fontSize: 24,
        fontWeight: '300',
    },
    faqAnswer: {
        fontSize: 14,
        lineHeight: 20,
        marginTop: 12,
    },
    contactCard: {
        marginHorizontal: 16,
        padding: 16,
        borderWidth: 1,
        borderRadius: 12,
    },
    contactTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    contactDescription: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 16,
    },
    contactButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
    },
    contactButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
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
});
