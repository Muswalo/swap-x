import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

export type SettingsItemProps = {
    id: string;
    title: string;
    icon: keyof typeof Feather.glyphMap;
    onPress?: () => void;
    showChevron?: boolean;
    isDanger?: boolean;
    isLast?: boolean;
    // For toggle items
    isToggle?: boolean;
    toggleValue?: boolean;
    onToggleChange?: (value: boolean) => void;
};

export function SettingsItem({
    id,
    title,
    icon,
    onPress,
    showChevron = true,
    isDanger = false,
    isLast = false,
    isToggle = false,
    toggleValue = false,
    onToggleChange,
}: SettingsItemProps) {
    const text = useThemeColor({}, 'text');
    const tint = useThemeColor({}, 'tint');
    const border = `${text}15`;

    const handlePress = () => {
        if (isToggle && onToggleChange) {
            onToggleChange(!toggleValue);
        } else if (onPress) {
            onPress();
        }
    };

    return (
        <Pressable
            onPress={handlePress}
            disabled={isToggle && !onToggleChange}
            style={({ pressed }) => [
                styles.settingsItem,
                {
                    backgroundColor: pressed ? `${text}08` : 'transparent',
                    borderBottomWidth: isLast ? 0 : 1,
                    borderBottomColor: border,
                },
            ]}
        >
            <View style={styles.itemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: isDanger ? '#FF453A15' : `${tint}15` }]}>
                    <Feather 
                        name={icon} 
                        size={20} 
                        color={isDanger ? '#FF453A' : tint} 
                    />
                </View>
                <ThemedText 
                    style={[
                        styles.itemTitle,
                        isDanger && { color: '#FF453A' }
                    ]}
                >
                    {title}
                </ThemedText>
            </View>
            {isToggle ? (
                <Switch
                    value={toggleValue}
                    onValueChange={onToggleChange}
                    trackColor={{ false: `${text}30`, true: tint }}
                    thumbColor="#FFFFFF"
                />
            ) : showChevron ? (
                <Feather name="chevron-right" size={20} color={`${text}50`} />
            ) : null}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    settingsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemTitle: {
        fontSize: 15,
        fontWeight: '500',
    },
});
