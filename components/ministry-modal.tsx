import { useThemeColor } from '@/hooks/use-theme-color';
import { Feather } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
    FlatList,
    Pressable,
    StyleSheet,
    TextInput,
    View
} from 'react-native';
import { BottomModal } from './bottom-modal';
import { ThemedText } from './themed-text';

const MINISTRIES = [
    'Health',
    'Education',
    'Finance',
    'Agriculture',
    'Home Affairs',
    'Lands',
    'Justice',
    'Local Government',
    'Transport',
    'Energy',
    'Water & Sanitation',
    'Commerce',
    'Tourism',
    'Labour',
    'Sports',
];

interface MinistryModalProps {
    isVisible: boolean;
    onClose: () => void;
    onSelect: (ministry: string) => void;
    selectedMinistry?: string;
}

export const MinistryModal: React.FC<MinistryModalProps> = ({
    isVisible,
    onClose,
    onSelect,
    selectedMinistry,
}) => {
    const bg = useThemeColor({}, 'background');
    const text = useThemeColor({}, 'text');
    const tint = useThemeColor({}, 'tint');
    const border = `${text}20`;
    const inputBg = `${text}06`;

    const [searchQuery, setSearchQuery] = useState('');

    const filteredMinistries = useMemo(() => {
        if (!searchQuery.trim()) return MINISTRIES;
        return MINISTRIES.filter(ministry =>
            ministry.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    const handleSelect = (ministry: string) => {
        onSelect(ministry);
        setSearchQuery('');
        onClose();
    };

    return (
        <BottomModal isVisible={isVisible} onClose={onClose} heightPercent={50}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <ThemedText style={styles.title}>Select Ministry</ThemedText>
                    <ThemedText style={[styles.subtitle, { color: `${text}70` }]}>
                        Choose from available ministries
                    </ThemedText>
                </View>

                {/* Search Bar */}
                <View style={[styles.searchContainer, { backgroundColor: inputBg, borderColor: border }]}>
                    <Feather name="search" size={18} color={`${text}60`} />
                    <TextInput
                        style={[styles.searchInput, { color: text }]}
                        placeholder="Search ministries..."
                        placeholderTextColor={`${text}50`}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <Pressable onPress={() => setSearchQuery('')}>
                            <Feather name="x" size={18} color={`${text}60`} />
                        </Pressable>
                    )}
                </View>

                {/* List */}
                <FlatList
                    data={filteredMinistries}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <Pressable
                            style={({ pressed }) => [
                                styles.ministryItem,
                                {
                                    backgroundColor:
                                        selectedMinistry === item ? `${tint}15` : 'transparent',
                                    opacity: pressed ? 0.6 : 1,
                                },
                            ]}
                            onPress={() => handleSelect(item)}
                        >
                            <ThemedText
                                style={[
                                    styles.ministryName,
                                    {
                                        color: selectedMinistry === item ? tint : text,
                                        fontWeight: selectedMinistry === item ? '600' : '500',
                                    },
                                ]}
                            >
                                {item}
                            </ThemedText>
                            {selectedMinistry === item && (
                                <Feather name="check" size={20} color={tint} />
                            )}
                        </Pressable>
                    )}
                    scrollEnabled={true}
                    showsVerticalScrollIndicator={true}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Feather name="inbox" size={32} color={`${text}40`} />
                            <ThemedText style={[styles.emptyText, { color: `${text}60` }]}>
                                No ministries found
                            </ThemedText>
                        </View>
                    }
                />
            </View>
        </BottomModal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 12,
    },
    header: {
        marginBottom: 16,
        gap: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 13,
        fontWeight: '400',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        paddingVertical: 6,
    },
    ministryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 4,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    },
    ministryName: {
        fontSize: 15,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 32,
        gap: 8,
    },
    emptyText: {
        fontSize: 14,
        fontWeight: '500',
        marginTop: 8,
    },
});
