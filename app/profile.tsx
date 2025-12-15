import { AppButton } from '@/components/app-button';
import { BottomModal } from '@/components/bottom-modal';
import { FormInput } from '@/components/form-input';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import {
    ProfileBio,
    ProfileInfoRow,
    ProfileSection,
    ProfileSectionContent,
} from '@/components/profile/ProfileSection';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { profileUtils } from '@/lib/database.utils';
import { storageUtils } from '@/lib/storage.utils';
import { supabase } from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ProfileData = {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    profilePhotoUrl: string;
    jobTitle: string;
    currentMinistry: string;
    currentDistrict: string;
    currentInstitution: string;
    salaryScale: string;
    yearsOfService: number;
    bio: string;
};

export default function ProfileScreen() {
    const bg = useThemeColor({}, 'background');
    const text = useThemeColor({}, 'text');

    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState<ProfileData | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    // Load profile data on mount
    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setIsLoading(true);
            
            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                Alert.alert('Error', 'No user found. Please log in again.');
                return;
            }

            setUserId(user.id);

            // Fetch profile from database
            const profileData = await profileUtils.getProfile(user.id);
            
            if (profileData) {
                const formattedProfile: ProfileData = {
                    firstName: profileData.first_name || '',
                    lastName: profileData.last_name || '',
                    email: profileData.email || '',
                    phoneNumber: profileData.phone_number || '',
                    profilePhotoUrl: profileData.profile_photo_url || 
                        `https://api.dicebear.com/7.x/initials/png?seed=${profileData.first_name?.[0] || 'U'}.${profileData.last_name?.[0] || 'U'}&backgroundColor=random&bold=true`,
                    jobTitle: profileData.job_title || '',
                    currentMinistry: profileData.current_ministry || '',
                    currentDistrict: profileData.current_district || '',
                    currentInstitution: profileData.current_institution || '',
                    salaryScale: profileData.salary_scale || '',
                    yearsOfService: profileData.years_of_service || 0,
                    bio: profileData.bio || '',
                };
                setProfile(formattedProfile);
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            Alert.alert('Error', 'Failed to load profile. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = () => {
        if (profile) {
            setEditedProfile({ ...profile });
            setIsEditing(true);
        }
    };

    const handleCancel = () => {
        setEditedProfile(profile);
        setIsEditing(false);
    };

    const validateProfile = (): boolean => {
        if (!editedProfile) return false;

        if (!editedProfile.firstName.trim()) {
            Alert.alert('Validation Error', 'First name is required');
            return false;
        }
        if (!editedProfile.lastName.trim()) {
            Alert.alert('Validation Error', 'Last name is required');
            return false;
        }
        if (!editedProfile.email.trim()) {
            Alert.alert('Validation Error', 'Email is required');
            return false;
        }
        if (!editedProfile.phoneNumber.trim()) {
            Alert.alert('Validation Error', 'Phone number is required');
            return false;
        }
        if (!editedProfile.jobTitle.trim()) {
            Alert.alert('Validation Error', 'Job title is required');
            return false;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(editedProfile.email)) {
            Alert.alert('Validation Error', 'Please enter a valid email address');
            return false;
        }

        return true;
    };

    const handleSave = async () => {
        if (!validateProfile() || !userId || !editedProfile) return;

        try {
            setIsSaving(true);

            // Prepare update data
            const updateData = {
                first_name: editedProfile.firstName,
                last_name: editedProfile.lastName,
                email: editedProfile.email,
                phone_number: editedProfile.phoneNumber,
                profile_photo_url: editedProfile.profilePhotoUrl,
                job_title: editedProfile.jobTitle,
                current_ministry: editedProfile.currentMinistry,
                current_district: editedProfile.currentDistrict,
                current_institution: editedProfile.currentInstitution,
                salary_scale: editedProfile.salaryScale,
                years_of_service: editedProfile.yearsOfService,
                bio: editedProfile.bio,
                updated_at: new Date().toISOString(),
            };

            // Update profile in database
            const updatedProfile = await profileUtils.updateProfile(userId, updateData);

            if (updatedProfile) {
                setProfile(editedProfile);
                setIsEditing(false);
                Alert.alert('Success', 'Profile updated successfully');
            } else {
                Alert.alert('Error', 'Failed to update profile. Please try again.');
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            Alert.alert('Error', 'Failed to save profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleImagePick = async () => {
        if (!userId || !editedProfile) return;

        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (permissionResult.granted === false) {
                Alert.alert('Permission Required', 'Permission to access camera roll is required!');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setIsUploadingImage(true);
                
                // Upload image to Supabase Storage
                const imageUrl = await storageUtils.uploadProfilePhoto(userId, result.assets[0].uri);
                
                if (imageUrl) {
                    setEditedProfile({ ...editedProfile, profilePhotoUrl: imageUrl });
                    Alert.alert('Success', 'Profile photo uploaded successfully');
                } else {
                    Alert.alert('Error', 'Failed to upload image. Please try again.');
                }
                
                setIsUploadingImage(false);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image. Please try again.');
            setIsUploadingImage(false);
        }
    };

    const updateField = (field: keyof ProfileData, value: string | number) => {
        if (editedProfile) {
            setEditedProfile({ ...editedProfile, [field]: value });
        }
    };

    const displayProfile = isEditing ? editedProfile : profile;

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={['top']}>
                <ThemedView style={[styles.container, { backgroundColor: bg }]}>
                    <ScreenHeader title="Profile" showBack={true} />
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={text} />
                        <ThemedText style={styles.loadingText}>Loading profile...</ThemedText>
                    </View>
                </ThemedView>
            </SafeAreaView>
        );
    }

    if (!displayProfile) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={['top']}>
                <ThemedView style={[styles.container, { backgroundColor: bg }]}>
                    <ScreenHeader title="Profile" showBack={true} />
                    <View style={styles.loadingContainer}>
                        <ThemedText style={styles.errorText}>No profile data found</ThemedText>
                        <AppButton title="Retry" onPress={loadProfile} style={{ marginTop: 16 }} />
                    </View>
                </ThemedView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={['top']}>
            <ThemedView style={[styles.container, { backgroundColor: bg }]}>
                {/* Header */}
                <ScreenHeader
                    title="Profile"
                    showBack={true}
                    rightIcon={isEditing ? undefined : 'edit-2'}
                    onRightPress={isEditing ? undefined : handleEdit}
                />

                {/* Profile Content */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Profile Header */}
                    <ProfileHeader
                        firstName={displayProfile.firstName}
                        lastName={displayProfile.lastName}
                        jobTitle={displayProfile.jobTitle}
                        currentDistrict={displayProfile.currentDistrict}
                        profilePhotoUrl={displayProfile.profilePhotoUrl}
                        isEditing={isEditing}
                        isUploading={isUploadingImage}
                        onImagePress={handleImagePick}
                    />

                    {/* Bio Section */}
                    {displayProfile.bio && (
                        <ProfileSection title="About">
                            <ProfileBio bio={displayProfile.bio} />
                        </ProfileSection>
                    )}

                    {/* Contact Information */}
                    <ProfileSection title="Contact Information">
                        <ProfileSectionContent>
                            <ProfileInfoRow label="Email" value={displayProfile.email} />
                            <ProfileInfoRow
                                label="Phone"
                                value={displayProfile.phoneNumber}
                                isLast
                            />
                        </ProfileSectionContent>
                    </ProfileSection>

                    {/* Work Information */}
                    <ProfileSection title="Work Information">
                        <ProfileSectionContent>
                            <ProfileInfoRow label="Ministry" value={displayProfile.currentMinistry} />
                            <ProfileInfoRow label="District" value={displayProfile.currentDistrict} />
                            <ProfileInfoRow
                                label="Institution"
                                value={displayProfile.currentInstitution}
                            />
                            <ProfileInfoRow label="Salary Scale" value={displayProfile.salaryScale} />
                            <ProfileInfoRow
                                label="Years of Service"
                                value={`${displayProfile.yearsOfService} years`}
                                isLast
                            />
                        </ProfileSectionContent>
                    </ProfileSection>
                </ScrollView>

                {/* Edit Modal */}
                <BottomModal
                    isVisible={isEditing && editedProfile !== null}
                    onClose={handleCancel}
                    heightPercent={85}
                >
                    {editedProfile && (
                        <View style={styles.modalContent}>
                            <ThemedText style={styles.modalTitle}>Edit Profile</ThemedText>

                            <ScrollView
                                style={styles.modalScroll}
                                showsVerticalScrollIndicator={false}
                            >
                                <View style={styles.formSection}>
                                    <ThemedText style={[styles.formLabel, { color: `${text}99` }]}>
                                        Personal Information
                                    </ThemedText>
                                    <FormInput
                                        placeholder="First Name"
                                        value={editedProfile.firstName}
                                        onChangeText={(value) => updateField('firstName', value)}
                                        containerStyle={styles.input}
                                    />
                                    <FormInput
                                        placeholder="Last Name"
                                        value={editedProfile.lastName}
                                        onChangeText={(value) => updateField('lastName', value)}
                                        containerStyle={styles.input}
                                    />
                                    <FormInput
                                        placeholder="Bio"
                                        value={editedProfile.bio}
                                        onChangeText={(value) => updateField('bio', value)}
                                        multiline
                                        numberOfLines={4}
                                        containerStyle={[styles.input, { height: 100 }]}
                                        style={{ textAlignVertical: 'top', paddingTop: 12 }}
                                    />
                                </View>

                                <View style={styles.formSection}>
                                    <ThemedText style={[styles.formLabel, { color: `${text}99` }]}>
                                        Contact Information
                                    </ThemedText>
                                    <FormInput
                                        placeholder="Email"
                                        value={editedProfile.email}
                                        onChangeText={(value) => updateField('email', value)}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        containerStyle={styles.input}
                                    />
                                    <FormInput
                                        placeholder="Phone Number"
                                        value={editedProfile.phoneNumber}
                                        onChangeText={(value) => updateField('phoneNumber', value)}
                                        keyboardType="phone-pad"
                                        containerStyle={styles.input}
                                    />
                                </View>

                                <View style={styles.formSection}>
                                    <ThemedText style={[styles.formLabel, { color: `${text}99` }]}>
                                        Work Information
                                    </ThemedText>
                                    <FormInput
                                        placeholder="Job Title"
                                        value={editedProfile.jobTitle}
                                        onChangeText={(value) => updateField('jobTitle', value)}
                                        containerStyle={styles.input}
                                    />
                                    <FormInput
                                        placeholder="Ministry"
                                        value={editedProfile.currentMinistry}
                                        onChangeText={(value) => updateField('currentMinistry', value)}
                                        containerStyle={styles.input}
                                    />
                                    <FormInput
                                        placeholder="District"
                                        value={editedProfile.currentDistrict}
                                        onChangeText={(value) => updateField('currentDistrict', value)}
                                        containerStyle={styles.input}
                                    />
                                    <FormInput
                                        placeholder="Institution"
                                        value={editedProfile.currentInstitution}
                                        onChangeText={(value) =>
                                            updateField('currentInstitution', value)
                                        }
                                        containerStyle={styles.input}
                                    />
                                    <FormInput
                                        placeholder="Salary Scale"
                                        value={editedProfile.salaryScale}
                                        onChangeText={(value) => updateField('salaryScale', value)}
                                        containerStyle={styles.input}
                                    />
                                    <FormInput
                                        placeholder="Years of Service"
                                        value={editedProfile.yearsOfService.toString()}
                                        onChangeText={(value) =>
                                            updateField('yearsOfService', parseInt(value) || 0)
                                        }
                                        keyboardType="number-pad"
                                        containerStyle={styles.input}
                                    />
                                </View>
                            </ScrollView>

                            <View style={styles.modalActions}>
                                <AppButton
                                    title="Cancel"
                                    variant="ghost"
                                    onPress={handleCancel}
                                    style={{ flex: 1 }}
                                />
                                <AppButton
                                    title={isSaving ? 'Saving...' : 'Save Changes'}
                                    onPress={handleSave}
                                    disabled={isSaving}
                                    style={{ flex: 1 }}
                                />
                            </View>
                        </View>
                    )}
                </BottomModal>
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
        paddingBottom: 32,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
    },
    modalContent: {
        flex: 1,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 20,
    },
    modalScroll: {
        flex: 1,
        marginBottom: 16,
    },
    formSection: {
        marginBottom: 24,
    },
    formLabel: {
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 12,
    },
    input: {
        marginBottom: 12,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        paddingTop: 16,
        paddingBottom: 8,
    },
});
