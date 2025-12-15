import { AppButton } from '@/components/app-button';
import { DistrictModal } from '@/components/district-modal';
import { MinistryModal } from '@/components/ministry-modal';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { Tables } from '@/lib/database.types';
import { swapUtils } from '@/lib/database.utils';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';

type Swap = Tables<'swaps'>;

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
  'Other',
];

const AREA_TYPES = ['Rural', 'Peri-urban', 'Urban'];

export default function EditSwapScreen() {
  const router = useRouter();
  const { swapId } = useLocalSearchParams<{ swapId: string }>();
  const bg = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const border = `${text}20`;
  const cardBg = `${text}08`;
  const inputBg = `${text}06`;

  const [swap, setSwap] = useState<Swap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [ministryModalVisible, setMinistryModalVisible] = useState(false);
  const [districtModalVisible, setDistrictModalVisible] = useState(false);
  const [currentModalType, setCurrentModalType] = useState<'current' | 'desired'>('current');

  useEffect(() => {
    loadSwap();
  }, [swapId]);

  const loadSwap = async () => {
    try {
      if (!swapId) {
        console.log('No swapId provided');
        setIsLoading(false);
        return;
      }
      console.log('Loading swap with ID:', swapId);
      const swapData = await swapUtils.getSwap(swapId);
      console.log('Swap data received:', swapData);
      if (swapData) {
        setSwap(swapData as Swap);
      } else {
        console.log('No swap data returned');
      }
    } catch (error) {
      console.error('Error loading swap:', error);
      Alert.alert('Error', 'Failed to load swap');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!swap) return;

    setIsSaving(true);
    try {
      await swapUtils.updateSwap(swap.id, {
        current_ministry: swap.current_ministry,
        current_district: swap.current_district,
        current_institution: swap.current_institution,
        current_area_type: swap.current_area_type,
        desired_ministry: swap.desired_ministry,
        desired_district: swap.desired_district,
        desired_area_type: swap.desired_area_type,
        job_title: swap.job_title,
        salary_scale: swap.salary_scale,
        reason_for_swap: swap.reason_for_swap,
        housing_condition: swap.housing_condition,
        additional_details: swap.additional_details,
        updated_at: new Date().toISOString(),
      });

      Alert.alert('Success', 'Swap updated successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Error updating swap:', error);
      Alert.alert('Error', 'Failed to update swap');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: bg }]}>
        <ScreenHeader title="Edit Swap" showBack />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tint} />
        </View>
      </ThemedView>
    );
  }

  if (!swap) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: bg }]}>
        <ScreenHeader title="Edit Swap" showBack />
        <View style={styles.errorContainer}>
          <ThemedText>Swap not found</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: bg }]}>
      <ScreenHeader title="Edit Swap" showBack />

      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: 'height' })}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Current Position Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="briefcase" size={18} color={tint} />
              <ThemedText style={styles.sectionTitle}>Current Position</ThemedText>
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText style={styles.label}>Ministry</ThemedText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsContainer}
              >
                {MINISTRIES.map((ministry) => {
                  const isSelected = swap.current_ministry === ministry;
                  return (
                    <Pressable
                      key={ministry}
                      onPress={() => {
                        if (ministry === 'Other') {
                          setCurrentModalType('current');
                          setMinistryModalVisible(true);
                        } else {
                          setSwap({ ...swap, current_ministry: ministry });
                        }
                      }}
                      style={({ pressed }) => [
                        styles.chip,
                        {
                          backgroundColor: isSelected ? tint : cardBg,
                          borderColor: isSelected ? tint : border,
                          opacity: pressed ? 0.7 : 1,
                        },
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.chipText,
                          { color: isSelected ? '#FFFFFF' : text },
                        ]}
                      >
                        {ministry}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText style={styles.label}>District</ThemedText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsContainer}
              >
                {DISTRICTS.map((district) => {
                  const isSelected = swap.current_district === district;
                  return (
                    <Pressable
                      key={district}
                      onPress={() => {
                        if (district === 'Other') {
                          setCurrentModalType('current');
                          setDistrictModalVisible(true);
                        } else {
                          setSwap({ ...swap, current_district: district });
                        }
                      }}
                      style={({ pressed }) => [
                        styles.chip,
                        {
                          backgroundColor: isSelected ? tint : cardBg,
                          borderColor: isSelected ? tint : border,
                          opacity: pressed ? 0.7 : 1,
                        },
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.chipText,
                          { color: isSelected ? '#FFFFFF' : text },
                        ]}
                      >
                        {district}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText style={styles.label}>Area Type</ThemedText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsContainer}
              >
                {AREA_TYPES.map((areaType) => {
                  const isSelected = swap.current_area_type === areaType;
                  return (
                    <Pressable
                      key={areaType}
                      onPress={() => setSwap({ ...swap, current_area_type: areaType })}
                      style={({ pressed }) => [
                        styles.chip,
                        {
                          backgroundColor: isSelected ? tint : cardBg,
                          borderColor: isSelected ? tint : border,
                          opacity: pressed ? 0.7 : 1,
                        },
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.chipText,
                          { color: isSelected ? '#FFFFFF' : text },
                        ]}
                      >
                        {areaType}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText style={styles.label}>Institution</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: inputBg, color: text, borderColor: border },
                ]}
                value={swap.current_institution || ''}
                onChangeText={(text) =>
                  setSwap({ ...swap, current_institution: text })
                }
                placeholder="e.g., Lusaka General Hospital"
                placeholderTextColor={`${text}50`}
              />
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText style={styles.label}>Job Title</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: inputBg, color: text, borderColor: border },
                ]}
                value={swap.job_title}
                onChangeText={(text) => setSwap({ ...swap, job_title: text })}
                placeholder="e.g., Senior Nurse"
                placeholderTextColor={`${text}50`}
              />
            </View>
          </View>

          {/* Desired Position Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="target" size={18} color={tint} />
              <ThemedText style={styles.sectionTitle}>Desired Position</ThemedText>
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText style={styles.label}>Desired District</ThemedText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsContainer}
              >
                {DISTRICTS.map((district) => {
                  const isSelected = swap.desired_district === district;
                  return (
                    <Pressable
                      key={district}
                      onPress={() => {
                        if (district === 'Other') {
                          setCurrentModalType('desired');
                          setDistrictModalVisible(true);
                        } else {
                          setSwap({ ...swap, desired_district: district });
                        }
                      }}
                      style={({ pressed }) => [
                        styles.chip,
                        {
                          backgroundColor: isSelected ? tint : cardBg,
                          borderColor: isSelected ? tint : border,
                          opacity: pressed ? 0.7 : 1,
                        },
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.chipText,
                          { color: isSelected ? '#FFFFFF' : text },
                        ]}
                      >
                        {district}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText style={styles.label}>Desired Area Type</ThemedText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsContainer}
              >
                {AREA_TYPES.map((areaType) => {
                  const isSelected = swap.desired_area_type === areaType;
                  return (
                    <Pressable
                      key={areaType}
                      onPress={() => setSwap({ ...swap, desired_area_type: areaType })}
                      style={({ pressed }) => [
                        styles.chip,
                        {
                          backgroundColor: isSelected ? tint : cardBg,
                          borderColor: isSelected ? tint : border,
                          opacity: pressed ? 0.7 : 1,
                        },
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.chipText,
                          { color: isSelected ? '#FFFFFF' : text },
                        ]}
                      >
                        {areaType}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </View>

          {/* Additional Details */}
          <View style={styles.fieldGroup}>
            <ThemedText style={styles.label}>Additional Details</ThemedText>
            <TextInput
              style={[
                styles.textArea,
                { backgroundColor: inputBg, color: text, borderColor: border },
              ]}
              value={swap.additional_details || ''}
              onChangeText={(text) =>
                setSwap({ ...swap, additional_details: text })
              }
              placeholder="Any additional information..."
              placeholderTextColor={`${text}50`}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <AppButton
            title={isSaving ? 'Saving...' : 'Save Changes'}
            onPress={handleSave}
            disabled={isSaving}
            style={styles.saveButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <MinistryModal
        isVisible={ministryModalVisible}
        onClose={() => setMinistryModalVisible(false)}
        onSelect={(ministry) => {
          if (currentModalType === 'current') {
            setSwap({ ...swap, current_ministry: ministry });
          } else {
            setSwap({ ...swap, desired_ministry: ministry });
          }
          setMinistryModalVisible(false);
        }}
      />

      <DistrictModal
        isVisible={districtModalVisible}
        onClose={() => setDistrictModalVisible(false)}
        onSelect={(district) => {
          if (currentModalType === 'current') {
            setSwap({ ...swap, current_district: district });
          } else {
            setSwap({ ...swap, desired_district: district });
          }
          setDistrictModalVisible(false);
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    borderWidth: 1,
  },
  textArea: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    borderWidth: 1,
    minHeight: 100,
  },
  chipsContainer: {
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    marginTop: 24,
  },
});
