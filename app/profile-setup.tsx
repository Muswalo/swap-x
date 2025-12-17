import { AppButton } from '@/components/app-button';
import { DistrictModal } from '@/components/district-modal';
import { MinistryModal } from '@/components/ministry-modal';
import { SuccessModal } from '@/components/success-modal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { supabase } from '@/lib/supabase';
import { Feather } from '@expo/vector-icons';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export type ProfileSetupProps = {
    onComplete?: () => void;
};

type SwapListing = {
    // Current Position
    currentMinistry: string;
    currentDistrict: string;
    currentInstitution: string;
    currentAreaType: string;
    salaryScale: string;
    reasonForSwap: string;
    jobTitle: string;


    // Desired Position
    desiredMinistry: string;
    desiredDistrict: string;
    desiredAreaType: string;

    // Additional Details
    housingCondition: string;
    additionalDetails: string;
    images: string[];
};

type ProcessedImage = {
    uri: string;
    width: number;
    height: number;
};

const MINISTRIES = [
    'Health',
    'Education',
    'Finance',
    'Agriculture',
    'Home Affairs',
    'Lands',
    'Justice',
    'Other',
];

const DISTRICTS = [
    'Lusaka',
    'Kitwe',
    'Ndola',
    'Kabwe',
    'Chingola',
    'Mufulira',
    'Livingstone',
    'Kasama',
    'Chipata',
    'Solwezi',
    'Mongu',
    'Mansa',
    'Kafue',
    'Chongwe',
    'Chadiza',
    'Chama',
    'Kalomo',
    'Mazabuka',
    'Nakonde',
    'Mbala',
    'Mporokoso',
    'Kasongo',
    'Chavuma',
    'Kabompo',
    'Other',
];

const SALARY_SCALES = [
    'A1 - A5',
    'B1 - B5',
    'C1 - C5',
    'D1 - D5',
    'E1 - E5',
    'Other',
];

const HOUSING_CONDITIONS = [
    'Government House',
    'Personal House',
    'Renting',
    'Shared Accommodation',
    'No Housing',
];

const AREA_TYPES = [
    'Rural',
    'Peri-urban',
    'Urban',
];

const IMAGE_MAX_WIDTH = 1200;
const IMAGE_MAX_HEIGHT = 1200;
const IMAGE_QUALITY = 0.2;

export default function ProfileSetupScreen({ onComplete }: ProfileSetupProps) {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const bg = useThemeColor({}, 'background');
    const text = useThemeColor({}, 'text');
    const tint = useThemeColor({}, 'tint');
    const border = `${text}20`;
    const cardBg = `${text}08`;
    const inputBg = `${text}06`;

    const [listing, setListing] = useState<SwapListing>({
        currentMinistry: '',
        currentDistrict: '',
        currentInstitution: '',
        currentAreaType: '',
        salaryScale: '',
        desiredMinistry: '',
        desiredDistrict: '',
        desiredAreaType: '',
        housingCondition: '',
        additionalDetails: '',
        images: [],
        reasonForSwap: '',
        jobTitle: '',
    });

    const [submitting, setSubmitting] = useState(false);
    const [ministryModalVisible, setMinistryModalVisible] = useState(false);
    const [districtModalVisible, setDistrictModalVisible] = useState(false);
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const [currentMinistryModalType, setCurrentMinistryModalType] = useState<'current' | 'desired'>('current');
    const [currentDistrictModalType, setCurrentDistrictModalType] = useState<'current' | 'desired'>('current');
    const [selectedImages, setSelectedImages] = useState<string[]>([]);

    const handleSkip = () => {
        onComplete?.();
    };

    const handleOpenMinistryModal = (type: 'current' | 'desired') => {
        setCurrentMinistryModalType(type);
        setMinistryModalVisible(true);
    };

    const handleSelectMinistry = (ministry: string) => {
        if (currentMinistryModalType === 'current') {
            setListing({ ...listing, currentMinistry: ministry });
        } else {
            setListing({ ...listing, desiredMinistry: ministry });
        }
    };

    const handleOpenDistrictModal = (type: 'current' | 'desired') => {
        setCurrentDistrictModalType(type);
        setDistrictModalVisible(true);
    };

    const handleSelectDistrict = (district: string) => {
        if (currentDistrictModalType === 'current') {
            setListing({ ...listing, currentDistrict: district });
        } else {
            setListing({ ...listing, desiredDistrict: district });
        }
    };

    const handleImagePick = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"],
                allowsMultipleSelection: true,
                quality: 1,
                selectionLimit: 4,
            });

            if (!result.canceled) {
                const newImages = result.assets.map(asset => asset.uri);
                setSelectedImages(prev => [...prev, ...newImages].slice(0, 4));
            }
        } catch (error) {
            console.error('Error picking images:', error);
        }
    };

    const handleRemoveImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
    };

    const manipulateImage = async (uri: string): Promise<ProcessedImage> => {
        try {
            const result = await ImageManipulator.manipulateAsync(
                uri,
                [],
                {
                    compress: IMAGE_QUALITY,
                    format: ImageManipulator.SaveFormat.JPEG,
                }
            );

            return {
                uri: result.uri,
                width: result.width,
                height: result.height,
            };
        } catch (error) {
            console.error('Error manipulating image:', error);
            throw error;
        }
    };


    const uploadToCloudinary = async (imageUri: string): Promise<string> => {
        try {
            const formData = new FormData();
            formData.append("file", {
                uri: imageUri,
                type: "image/jpeg",
                name: `image_${Date.now()}.jpg`,
            } as any);

            formData.append("upload_preset", process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAS_PRESET!);
            formData.append("cloud_name", process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME!);

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/diijbevmb/image/upload`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            const result = await response.json();
            return result.secure_url;
        } catch (error) {
            console.error("Cloudinary upload failed:", error);
            throw error;
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            let uploadedUrls: string[] = [];



            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert('User not authenticated');
                setSubmitting(false);
                return;
            }
            // Check if images are attached
            if (selectedImages.length !== 0) {
                // Manipulate all images
                const manipulatedImages = await Promise.all(
                    selectedImages.map(uri => manipulateImage(uri))
                );

                // Upload all manipulated images to Cloudinary
                uploadedUrls = await Promise.all(
                    manipulatedImages.map(img => uploadToCloudinary(img.uri))
                );
            }

            // Create swap listing in Supabase
            const { error: swapError } = await supabase.from('swaps').insert({
                user_id: user.id,
                current_ministry: listing.currentMinistry,
                current_district: listing.currentDistrict,
                current_institution: listing.currentInstitution,
                current_area_type: listing.currentAreaType,
                salary_scale: listing.salaryScale,
                reason_for_swap: listing.reasonForSwap,
                job_title: listing.jobTitle,
                desired_ministry: listing.currentMinistry,
                desired_district: listing.desiredDistrict,
                desired_area_type: listing.desiredAreaType,
                housing_condition: listing.housingCondition,
                additional_details: listing.additionalDetails,
                images: uploadedUrls,
                status: 'active',
            });

            if (swapError) throw swapError;

            // Update profile as completed
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ profile_completed: true })
                .eq('user_id', user.id);

            if (profileError) throw profileError;

            // Show success modal
            setSuccessModalVisible(true);
        } catch (error) {
            console.error('Error creating listing:', error);
            alert('Failed to create listing. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSuccessProceed = () => {
        setSuccessModalVisible(false);
        router.replace('/(tabs)');
    };

    const canSubmit =
        listing.currentMinistry &&
        listing.currentDistrict &&
        listing.desiredDistrict;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: bg, }} edges={['top', 'bottom']}>
            <ThemedView
                style={[
                    styles.container,
                    { backgroundColor: bg },
                ]}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <View style={[styles.iconCircle, { backgroundColor: `${tint}15` }]}>
                            <Feather name="compass" size={24} color={tint} />
                        </View>
                        <View style={styles.headerText}>
                            <ThemedText style={styles.title}>Set Up Your Swap</ThemedText>
                            <ThemedText style={styles.subtitle}>
                                Get matched with someone who wants your post.
                            </ThemedText>
                        </View>
                    </View>
                    <Pressable
                        onPress={handleSkip}
                        style={({ pressed }) => [
                            styles.skipButton,
                            { opacity: pressed ? 0.5 : 0.7 },
                        ]}
                    >
                        <ThemedText style={styles.skipText}>Skip</ThemedText>
                    </Pressable>
                </View>

                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Help Text */}
                    <View style={[styles.helpCard, { backgroundColor: `${tint}10` }]}>
                        <Feather name="target" size={16} color={tint} />
                        <ThemedText style={[styles.helpText, { color: tint }]}>
                            Your swap will be visible to others looking for matches. The more
                            details you provide, the better your chances of finding the
                            perfect swap
                        </ThemedText>
                    </View>

                    {/* Progress Indicator */}
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                            <View
                                style={[
                                    styles.progressFill,
                                    {
                                        backgroundColor: tint,
                                        width: `${(Object.values(listing).filter(v =>
                                            Array.isArray(v) ? v.length > 0 : v !== ''
                                        ).length / 9) * 100
                                            }%`,
                                    },
                                ]}
                            />
                        </View>
                        <ThemedText style={styles.progressText}>
                            {Object.values(listing).filter(v =>
                                Array.isArray(v) ? v.length > 0 : v !== ''
                            ).length} of 10 fields completed
                        </ThemedText>
                    </View>

                    {/* Current Position Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Feather name="briefcase" size={18} color={tint} />
                            <View >
                                <ThemedText style={styles.sectionTitle}>
                                    Your Current Post
                                </ThemedText>
                                <ThemedText
                                    style={[styles.sectionHint, { color: `${text}70`, marginTop: 4 }]}
                                >
                                    Tell us where you are now, we’ll use this to find your best match.
                                </ThemedText>
                            </View>
                        </View>

                        {/* Ministry */}
                        <View style={styles.fieldGroup}>
                            <ThemedText style={styles.label}>Ministry *</ThemedText>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.chipsContainer}
                            >
                                {MINISTRIES.map((ministry) => {
                                    const isSelected = listing.currentMinistry === ministry;
                                    const isOtherSelected = ministry === 'Other' && listing.currentMinistry && !MINISTRIES.includes(listing.currentMinistry);

                                    return (
                                        <Pressable
                                            key={ministry}
                                            onPress={() => {
                                                if (ministry === 'Other') {
                                                    handleOpenMinistryModal('current');
                                                } else {
                                                    setListing({ ...listing, currentMinistry: ministry });
                                                }
                                            }}
                                            style={({ pressed }) => [
                                                styles.chip,
                                                {
                                                    backgroundColor:
                                                        isSelected || isOtherSelected ? tint : cardBg,
                                                    borderColor:
                                                        isSelected || isOtherSelected ? tint : border,
                                                    opacity: pressed ? 0.7 : 1,
                                                },
                                            ]}
                                        >
                                            <View style={styles.chipContent}>
                                                <ThemedText
                                                    style={[
                                                        styles.chipText,
                                                        {
                                                            color:
                                                                isSelected || isOtherSelected
                                                                    ? '#FFFFFF'
                                                                    : text,
                                                        },
                                                    ]}
                                                >
                                                    {ministry}
                                                </ThemedText>
                                                {isOtherSelected && (
                                                    <Feather name="check" size={14} color="#FFFFFF" style={{ marginLeft: 4 }} />
                                                )}
                                            </View>
                                        </Pressable>
                                    );
                                })}
                            </ScrollView>
                        </View>

                        {/* District */}
                        <View style={styles.fieldGroup}>
                            <ThemedText style={styles.label}>District *</ThemedText>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.chipsContainer}
                            >
                                {DISTRICTS.map((district) => {
                                    const isSelected = listing.currentDistrict === district;
                                    const isOtherSelected = district === 'Other' && listing.currentDistrict && !DISTRICTS.includes(listing.currentDistrict);

                                    return (
                                        <Pressable
                                            key={district}
                                            onPress={() => {
                                                if (district === 'Other') {
                                                    handleOpenDistrictModal('current');
                                                } else {
                                                    setListing({ ...listing, currentDistrict: district });
                                                }
                                            }}
                                            style={({ pressed }) => [
                                                styles.chip,
                                                {
                                                    backgroundColor:
                                                        isSelected || isOtherSelected ? tint : cardBg,
                                                    borderColor:
                                                        isSelected || isOtherSelected ? tint : border,
                                                    opacity: pressed ? 0.7 : 1,
                                                },
                                            ]}
                                        >
                                            <View style={styles.chipContent}>
                                                <ThemedText
                                                    style={[
                                                        styles.chipText,
                                                        {
                                                            color:
                                                                isSelected || isOtherSelected
                                                                    ? '#FFFFFF'
                                                                    : text,
                                                        },
                                                    ]}
                                                >
                                                    {district}
                                                </ThemedText>
                                                {isOtherSelected && (
                                                    <Feather name="check" size={14} color="#FFFFFF" style={{ marginLeft: 4 }} />
                                                )}
                                            </View>
                                        </Pressable>
                                    );
                                })}
                            </ScrollView>
                        </View>

                        {/* Area Type */}
                        <View style={styles.fieldGroup}>
                            <ThemedText style={styles.label}>Current Area Type</ThemedText>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.chipsContainer}
                            >
                                {AREA_TYPES.map((areaType) => (
                                    <Pressable
                                        key={areaType}
                                        onPress={() =>
                                            setListing({ ...listing, currentAreaType: areaType })
                                        }
                                        style={({ pressed }) => [
                                            styles.chip,
                                            {
                                                backgroundColor:
                                                    listing.currentAreaType === areaType ? tint : cardBg,
                                                borderColor:
                                                    listing.currentAreaType === areaType ? tint : border,
                                                opacity: pressed ? 0.7 : 1,
                                            },
                                        ]}
                                    >
                                        <ThemedText
                                            style={[
                                                styles.chipText,
                                                {
                                                    color:
                                                        listing.currentAreaType === areaType ? '#FFFFFF' : text,
                                                },
                                            ]}
                                        >
                                            {areaType}
                                        </ThemedText>
                                    </Pressable>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Institution */}
                        <View style={styles.fieldGroup}>
                            <ThemedText style={styles.label}>Institution Name</ThemedText>
                            <TextInput
                                style={[
                                    styles.input,
                                    { backgroundColor: inputBg, color: text, borderColor: border },
                                ]}
                                value={listing.currentInstitution}
                                onChangeText={(text) =>
                                    setListing({ ...listing, currentInstitution: text })
                                }
                                placeholder="e.g., Lusaka General Hospital"
                                placeholderTextColor={`${text}50`}
                            />
                        </View>

                        {/* Job Title */}
                        <View style={styles.fieldGroup}>
                            <ThemedText style={styles.label}>Job Title *</ThemedText>
                            <TextInput
                                style={[
                                    styles.input,
                                    { backgroundColor: inputBg, color: text, borderColor: border },
                                ]}
                                value={listing.jobTitle}
                                onChangeText={(text) =>
                                    setListing({ ...listing, jobTitle: text })
                                }
                                placeholder="e.g., Senior Nurse, Teacher, Officer"
                                placeholderTextColor={`${text}50`}
                            />
                        </View>

                        {/* Salary Scale */}
                        <View style={styles.fieldGroup}>
                            <ThemedText style={styles.label}>Salary Scale</ThemedText>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.chipsContainer}
                            >
                                {SALARY_SCALES.map((scale) => (
                                    <Pressable
                                        key={scale}
                                        onPress={() =>
                                            setListing({ ...listing, salaryScale: scale })
                                        }
                                        style={({ pressed }) => [
                                            styles.chip,
                                            {
                                                backgroundColor:
                                                    listing.salaryScale === scale ? tint : cardBg,
                                                borderColor:
                                                    listing.salaryScale === scale ? tint : border,
                                                opacity: pressed ? 0.7 : 1,
                                            },
                                        ]}
                                    >
                                        <ThemedText
                                            style={[
                                                styles.chipText,
                                                {
                                                    color:
                                                        listing.salaryScale === scale ? '#FFFFFF' : text,
                                                },
                                            ]}
                                        >
                                            {scale}
                                        </ThemedText>
                                    </Pressable>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Housing */}
                        <View style={styles.fieldGroup}>
                            <ThemedText style={styles.label}>Housing Condition</ThemedText>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.chipsContainer}
                            >
                                {HOUSING_CONDITIONS.map((condition) => (
                                    <Pressable
                                        key={condition}
                                        onPress={() =>
                                            setListing({ ...listing, housingCondition: condition })
                                        }
                                        style={({ pressed }) => [
                                            styles.chip,
                                            {
                                                backgroundColor:
                                                    listing.housingCondition === condition ? tint : cardBg,
                                                borderColor:
                                                    listing.housingCondition === condition ? tint : border,
                                                opacity: pressed ? 0.7 : 1,
                                            },
                                        ]}
                                    >
                                        <ThemedText
                                            style={[
                                                styles.chipText,
                                                {
                                                    color:
                                                        listing.housingCondition === condition
                                                            ? '#FFFFFF'
                                                            : text,
                                                },
                                            ]}
                                        >
                                            {condition}
                                        </ThemedText>
                                    </Pressable>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Reason for Swap */}
                        <View style={styles.fieldGroup}>
                            <ThemedText style={styles.label}>Reason for Swap</ThemedText>
                            <TextInput
                                style={[
                                    styles.textArea,
                                    { backgroundColor: inputBg, color: text, borderColor: border },
                                ]}
                                value={listing.reasonForSwap}
                                onChangeText={(text) =>
                                    setListing({ ...listing, reasonForSwap: text })
                                }
                                placeholder="e.g., Family relocation, better opportunities, etc."
                                placeholderTextColor={`${text}50`}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                            />
                        </View>
                    </View>

                    {/* Desired Position Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Feather name="target" size={18} color={tint} />
                            <View >
                                <ThemedText style={styles.sectionTitle}>
                                    Where You Want to Go
                                </ThemedText>
                                <ThemedText
                                    style={[styles.sectionHint, { color: `${text}70`, marginTop: 4 }]}
                                >
                                    Choose your ideal ministry and district, we’ll take it from there.
                                </ThemedText>
                            </View>
                        </View>

                        {/* Desired District */}
                        <View style={styles.fieldGroup}>
                            <ThemedText style={styles.label}>Desired District *</ThemedText>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.chipsContainer}
                            >
                                {DISTRICTS.map((district) => {
                                    const isSelected = listing.desiredDistrict === district;
                                    const isOtherSelected = district === 'Other' && listing.desiredDistrict && !DISTRICTS.includes(listing.desiredDistrict);

                                    return (
                                        <Pressable
                                            key={district}
                                            onPress={() => {
                                                if (district === 'Other') {
                                                    handleOpenDistrictModal('desired');
                                                } else {
                                                    setListing({ ...listing, desiredDistrict: district });
                                                }
                                            }}
                                            style={({ pressed }) => [
                                                styles.chip,
                                                {
                                                    backgroundColor:
                                                        isSelected || isOtherSelected ? tint : cardBg,
                                                    borderColor:
                                                        isSelected || isOtherSelected ? tint : border,
                                                    opacity: pressed ? 0.7 : 1,
                                                },
                                            ]}
                                        >
                                            <View style={styles.chipContent}>
                                                <ThemedText
                                                    style={[
                                                        styles.chipText,
                                                        {
                                                            color:
                                                                isSelected || isOtherSelected
                                                                    ? '#FFFFFF'
                                                                    : text,
                                                        },
                                                    ]}
                                                >
                                                    {district}
                                                </ThemedText>
                                                {isOtherSelected && (
                                                    <Feather name="check" size={14} color="#FFFFFF" style={{ marginLeft: 4 }} />
                                                )}
                                            </View>
                                        </Pressable>
                                    );
                                })}
                            </ScrollView>
                        </View>

                        {/* Desired Area Type */}
                        <View style={styles.fieldGroup}>
                            <ThemedText style={styles.label}>Desired Area Type</ThemedText>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.chipsContainer}
                            >
                                {AREA_TYPES.map((areaType) => (
                                    <Pressable
                                        key={areaType}
                                        onPress={() =>
                                            setListing({ ...listing, desiredAreaType: areaType })
                                        }
                                        style={({ pressed }) => [
                                            styles.chip,
                                            {
                                                backgroundColor:
                                                    listing.desiredAreaType === areaType ? tint : cardBg,
                                                borderColor:
                                                    listing.desiredAreaType === areaType ? tint : border,
                                                opacity: pressed ? 0.7 : 1,
                                            },
                                        ]}
                                    >
                                        <ThemedText
                                            style={[
                                                styles.chipText,
                                                {
                                                    color:
                                                        listing.desiredAreaType === areaType ? '#FFFFFF' : text,
                                                },
                                            ]}
                                        >
                                            {areaType}
                                        </ThemedText>
                                    </Pressable>
                                ))}
                            </ScrollView>
                        </View>
                    </View>

                    {/* Additional Details Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Feather name="file-text" size={18} color={tint} />
                            <View >
                                <ThemedText style={styles.sectionTitle}>
                                    Additional Information
                                </ThemedText>
                                <ThemedText
                                    style={[styles.sectionHint, { color: `${text}70`, marginTop: 4 }]}
                                >
                                    Share details like schools or transport, we’ll match you better.
                                </ThemedText>
                            </View>
                        </View>

                        {/* Details Text Area */}
                        <View style={styles.fieldGroup}>
                            <ThemedText style={styles.label}>
                                Anything else to share?
                            </ThemedText>
                            <TextInput
                                style={[
                                    styles.textArea,
                                    { backgroundColor: inputBg, color: text, borderColor: border },
                                ]}
                                value={listing.additionalDetails}
                                onChangeText={(text) =>
                                    setListing({ ...listing, additionalDetails: text })
                                }
                                placeholder="e.g., Close to schools, near city center, etc."
                                placeholderTextColor={`${text}50`}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>

                        {/* Images */}
                        <View style={styles.fieldGroup}>
                            <View style={styles.sectionHeader}>
                                <Feather name="file-text" size={18} color={tint} />
                                <View >
                                    <ThemedText style={styles.sectionTitle}>
                                        Photos
                                    </ThemedText>
                                    <ThemedText
                                        style={[styles.sectionHint, { color: `${text}70`, marginTop: 4 }]}
                                    >
                                        Add up to 4 photos to showcase your current location and setup
                                    </ThemedText>
                                </View>
                            </View>

                            <View style={styles.imagesContainer}>
                                {selectedImages.map((uri, index) => (
                                    <View key={index} style={styles.imageWrapper}>
                                        <Image source={{ uri }} style={styles.image} />
                                        <Pressable
                                            onPress={() => handleRemoveImage(index)}
                                            style={[styles.removeButton, { backgroundColor: tint }]}
                                        >
                                            <Feather name="x" size={14} color="#FFFFFF" />
                                        </Pressable>
                                    </View>
                                ))}

                                {selectedImages.length < 4 && (
                                    <Pressable
                                        onPress={handleImagePick}
                                        style={[
                                            styles.addImageButton,
                                            { backgroundColor: cardBg, borderColor: border },
                                        ]}
                                    >
                                        <Feather name="camera" size={24} color={tint} />
                                        <ThemedText style={[styles.addImageText, { color: tint }]}>
                                            Add Photo
                                        </ThemedText>
                                    </Pressable>
                                )}
                            </View>
                        </View>
                    </View>
                </ScrollView>

                {/* Footer */}
                <View style={styles.footer}>
                    <AppButton
                        title={submitting ? 'Creating...' : 'Create Swap Listing'}
                        onPress={handleSubmit}
                        disabled={!canSubmit || submitting}
                        style={{ width: '100%' }}
                    />
                </View>

                {/* Modals */}
                <MinistryModal
                    isVisible={ministryModalVisible}
                    onClose={() => setMinistryModalVisible(false)}
                    onSelect={handleSelectMinistry}
                    selectedMinistry={
                        currentMinistryModalType === 'current'
                            ? listing.currentMinistry
                            : listing.desiredMinistry
                    }
                />

                <DistrictModal
                    isVisible={districtModalVisible}
                    onClose={() => setDistrictModalVisible(false)}
                    onSelect={handleSelectDistrict}
                    selectedDistrict={
                        currentDistrictModalType === 'current'
                            ? listing.currentDistrict
                            : listing.desiredDistrict
                    }
                />

                <SuccessModal
                    isVisible={successModalVisible}
                    onProceed={handleSuccessProceed}
                    title="Success!"
                    message="Your swap listing has been created successfully."
                />
            </ThemedView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 24,
        paddingBottom: 20,
        gap: 16,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerText: {
        flex: 1,
        gap: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 15,
        opacity: 0.7,
        lineHeight: 21,
    },
    skipButton: {
        alignSelf: 'flex-end',
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    skipText: {
        fontSize: 15,
        fontWeight: '500',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 24,
        gap: 28,
    },
    progressContainer: {
        gap: 8,
    },
    progressBar: {
        height: 4,
        backgroundColor: 'rgba(128, 128, 128, 0.1)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },
    progressText: {
        fontSize: 12,
        opacity: 0.6,
        textAlign: 'center',
    },
    section: {
        gap: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '600',
    },
    sectionHint: {
        fontSize: 13,
        lineHeight: 19,
        fontWeight: '400',
    },
    fieldGroup: {
        gap: 12,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        opacity: 0.8,
    },
    chipsContainer: {
        gap: 8,
        paddingRight: 24,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1.5,
    },
    chipContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    chipText: {
        fontSize: 14,
        fontWeight: '500',
    },
    input: {
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 16,
        fontSize: 15,
    },
    textArea: {
        minHeight: 100,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
    },
    imagesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    imageWrapper: {
        position: 'relative',
        width: 100,
        height: 100,
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    removeButton: {
        position: 'absolute',
        top: 4,
        right: 4,
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addImageButton: {
        width: 100,
        height: 100,
        borderRadius: 12,
        borderWidth: 2,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    addImageText: {
        fontSize: 12,
        fontWeight: '500',
    },
    helpCard: {
        flexDirection: 'row',
        gap: 12,
        padding: 16,
        borderRadius: 12,
        alignItems: 'flex-start',
    },
    helpText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 19,
        fontWeight: '500',
    },
    footer: {
        paddingHorizontal: 24,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(128, 128, 128, 0.1)',
    },
});