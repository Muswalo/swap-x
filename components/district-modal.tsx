import { useThemeColor } from '@/hooks/use-theme-color';
import { Feather } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
    FlatList,
    Pressable,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';
import { BottomModal } from './bottom-modal';
import { ThemedText } from './themed-text';

const DISTRICTS = [
  // Central Province
  "Chibombo",
  "Chisamba",
  "Chitambo",
  "Kabwe",
  "Kapiri Mposhi",
  "Luano",
  "Mkushi",
  "Mumbwa",
  "Ngabwe",
  "Serenje",
  "Shibuyunji",
  // Copperbelt Province
  "Chililabombwe",
  "Chingola",
  "Kalulushi",
  "Kitwe",
  "Luanshya",
  "Lufwanyama",
  "Masaiti",
  "Mpongwe",
  "Mufulira",
  "Ndola",
  // Eastern Province
  "Chadiza",
  "Chama",
  "Chasefu",
  "Chipangali",
  "Chipata",
  "Kasenengwa",
  "Katete",
  "Lumezi",
  "Lundazi",
  "Lusangazi",
  "Mambwe",
  "Nyimba",
  "Petauke",
  "Sinda",
  "Vubwi",
  // Luapula Province
  "Chembe",
  "Chiengi",
  "Chifunabuli",
  "Chipili",
  "Kawambwa",
  "Lunga",
  "Mansa",
  "Milenge",
  "Mwansabombwe",
  "Mwense",
  "Nchelenge",
  "Samfya",
  // Lusaka Province
  "Chilanga",
  "Chongwe",
  "Kafue",
  "Luangwa",
  "Lusaka",
  "Rufunsa",
  // Northern Province
  "Chinsali",
  "Isoka",
  "Kanchibiya",
  "Lavushimanda",
  "Mafinga",
  "Mpika",
  "Nakonde",
  "Shiwang'andu",
  // North Western Province
  "Chilubi",
  "Kaputa",
  "Kasama",
  "Lunte",
  "Lupososhi",
  "Luwingu",
  "Mbala",
  "Mporokoso",
  "Mpulungu",
  "Mungwi",
  "Nsama",
  "Senga",
  // North-Western Province
  "Chavuma",
  "Ikelenge",
  "Kabompo",
  "Mufumbwe",
  "Mushindamo",
  "Solwezi",
  "Zambezi",
  // Southern Province
  "Choma",
  "Gwembe",
  "Kalomo",
  "Kazungula",
  "Livingstone",
  "Maamba",
  "Monze",
  "Namwala",
  "Pemba",
  "Sinazongwe",
  // Western Province
  "Kaoma",
  "Lukulu",
  "Mongu",
  "Nalolo",
  "Nkeyema",
  "Sesheke",
  "Sikongo",
  "Sinjembela",
];

interface DistrictModalProps {
    isVisible: boolean;
    onClose: () => void;
    onSelect: (district: string) => void;
    selectedDistrict?: string;
}

export const DistrictModal: React.FC<DistrictModalProps> = ({
    isVisible,
    onClose,
    onSelect,
    selectedDistrict,
}) => {
    const bg = useThemeColor({}, 'background');
    const text = useThemeColor({}, 'text');
    const tint = useThemeColor({}, 'tint');
    const border = `${text}20`;
    const inputBg = `${text}06`;

    const [searchQuery, setSearchQuery] = useState('');

    const filteredDistricts = useMemo(() => {
        if (!searchQuery.trim()) return DISTRICTS;
        return DISTRICTS.filter(district =>
            district.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    const handleSelect = (district: string) => {
        onSelect(district);
        setSearchQuery('');
        onClose();
    };

    return (
        <BottomModal isVisible={isVisible} onClose={onClose} heightPercent={50}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <ThemedText style={styles.title}>Select District</ThemedText>
                    <ThemedText style={[styles.subtitle, { color: `${text}70` }]}>
                        Choose your preferred district
                    </ThemedText>
                </View>

                {/* Search Bar */}
                <View style={[styles.searchContainer, { backgroundColor: inputBg, borderColor: border }]}>
                    <Feather name="search" size={18} color={`${text}60`} />
                    <TextInput
                        style={[styles.searchInput, { color: text }]}
                        placeholder="Search districts..."
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
                    data={filteredDistricts}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <Pressable
                            style={({ pressed }) => [
                                styles.districtItem,
                                {
                                    backgroundColor:
                                        selectedDistrict === item ? `${tint}15` : 'transparent',
                                    opacity: pressed ? 0.6 : 1,
                                },
                            ]}
                            onPress={() => handleSelect(item)}
                        >
                            <ThemedText
                                style={[
                                    styles.districtName,
                                    {
                                        color: selectedDistrict === item ? tint : text,
                                        fontWeight: selectedDistrict === item ? '600' : '500',
                                    },
                                ]}
                            >
                                {item}
                            </ThemedText>
                            {selectedDistrict === item && (
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
                                No districts found
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
    districtItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 4,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    },
    districtName: {
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
