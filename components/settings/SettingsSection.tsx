import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SettingsItem, SettingsItemProps } from './SettingsItem';

export type SettingsSectionProps = {
    title: string;
    items: SettingsItemProps[];
};

export function SettingsSection({ title, items }: SettingsSectionProps) {
    const text = useThemeColor({}, 'text');
    const border = `${text}15`;

    return (
        <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: `${text}77` }]}>
                {title}
            </ThemedText>
            <View style={[styles.sectionContent, { backgroundColor: `${text}05`, borderColor: border }]}>
                {items.map((item, index) => (
                    <SettingsItem
                        key={item.id}
                        {...item}
                        isLast={index === items.length - 1}
                    />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    sectionContent: {
        marginHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
    },
});
