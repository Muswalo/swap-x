import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { BottomModal } from '@/components/bottom-modal';
import { DistrictModal } from '@/components/district-modal';
import { MinistryModal } from '@/components/ministry-modal';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type PreferencesEditModalProps = {
  isVisible: boolean;
  onClose: () => void;
  currentLocation: string;
  desiredLocation: string;
  currentMinistry?: string;
  desiredMinistry?: string;
  onSave: (preferences: {
    currentLocation: string;
    desiredLocation: string;
    currentMinistry?: string;
    desiredMinistry?: string;
  }) => void;
};

export function PreferencesEditModal({
  isVisible,
  onClose,
  currentLocation,
  desiredLocation,
  currentMinistry,
  desiredMinistry,
  onSave,
}: PreferencesEditModalProps) {
  const insets = useSafeAreaInsets();
  const text = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const border = `${text}15`;
  const cardBg = `${text}0A`;

  const [tempCurrentLocation, setTempCurrentLocation] = useState(currentLocation);
  const [tempDesiredLocation, setTempDesiredLocation] = useState(desiredLocation);
  const [tempCurrentMinistry, setTempCurrentMinistry] = useState(currentMinistry);
  const [tempDesiredMinistry, setTempDesiredMinistry] = useState(desiredMinistry);

  // Update state when props change
  React.useEffect(() => {
    setTempCurrentLocation(currentLocation);
    setTempDesiredLocation(desiredLocation);
    setTempCurrentMinistry(currentMinistry);
    setTempDesiredMinistry(desiredMinistry);
  }, [currentLocation, desiredLocation, currentMinistry, desiredMinistry]);

  const [showCurrentDistrictModal, setShowCurrentDistrictModal] = useState(false);
  const [showDesiredDistrictModal, setShowDesiredDistrictModal] = useState(false);
  const [showCurrentMinistryModal, setShowCurrentMinistryModal] = useState(false);
  const [showDesiredMinistryModal, setShowDesiredMinistryModal] = useState(false);

  const handleSave = () => {
    onSave({
      currentLocation: tempCurrentLocation,
      desiredLocation: tempDesiredLocation,
      currentMinistry: tempCurrentMinistry,
      desiredMinistry: tempDesiredMinistry,
    });
    onClose();
  };

  const handleCancel = () => {
    // Reset to original values
    setTempCurrentLocation(currentLocation);
    setTempDesiredLocation(desiredLocation);
    setTempCurrentMinistry(currentMinistry);
    setTempDesiredMinistry(desiredMinistry);
    onClose();
  };

  return (
    <>
      <BottomModal isVisible={isVisible} onClose={handleCancel} heightPercent={70}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText style={styles.title}>Edit Preferences</ThemedText>
            <ThemedText style={[styles.subtitle, { color: `${text}70` }]}>
              Update your swap preferences
            </ThemedText>
          </View>

          {/* Current Location */}
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: `${text}77` }]}>
              Current Location
            </ThemedText>
            <Pressable
              style={[styles.selector, { backgroundColor: cardBg, borderColor: border }]}
              onPress={() => setShowCurrentDistrictModal(true)}
            >
              <View style={styles.selectorContent}>
                <Feather name="map-pin" size={18} color={tint} />
                <ThemedText style={styles.selectorText}>
                  {tempCurrentLocation || 'Select current district'}
                </ThemedText>
              </View>
              <Feather name="chevron-right" size={18} color={`${text}66`} />
            </Pressable>
          </View>

          {/* Desired Location */}
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: `${text}77` }]}>
              Desired Location
            </ThemedText>
            <Pressable
              style={[styles.selector, { backgroundColor: cardBg, borderColor: border }]}
              onPress={() => setShowDesiredDistrictModal(true)}
            >
              <View style={styles.selectorContent}>
                <Feather name="target" size={18} color={tint} />
                <ThemedText style={styles.selectorText}>
                  {tempDesiredLocation || 'Select desired district'}
                </ThemedText>
              </View>
              <Feather name="chevron-right" size={18} color={`${text}66`} />
            </Pressable>
          </View>

          {/* Current Ministry */}
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: `${text}77` }]}>
              Current Ministry (Optional)
            </ThemedText>
            <Pressable
              style={[styles.selector, { backgroundColor: cardBg, borderColor: border }]}
              onPress={() => setShowCurrentMinistryModal(true)}
            >
              <View style={styles.selectorContent}>
                <Feather name="briefcase" size={18} color={tint} />
                <ThemedText style={styles.selectorText}>
                  {tempCurrentMinistry || 'Select current ministry'}
                </ThemedText>
              </View>
              <Feather name="chevron-right" size={18} color={`${text}66`} />
            </Pressable>
          </View>

          {/* Desired Ministry */}
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: `${text}77` }]}>
              Desired Ministry (Optional)
            </ThemedText>
            <Pressable
              style={[styles.selector, { backgroundColor: cardBg, borderColor: border }]}
              onPress={() => setShowDesiredMinistryModal(true)}
            >
              <View style={styles.selectorContent}>
                <Feather name="briefcase" size={18} color={tint} />
                <ThemedText style={styles.selectorText}>
                  {tempDesiredMinistry || 'Any ministry'}
                </ThemedText>
              </View>
              <Feather name="chevron-right" size={18} color={`${text}66`} />
            </Pressable>
          </View>

          {/* Action Buttons */}
          <View style={[styles.actions, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <Pressable
              style={[styles.button, styles.cancelButton, { borderColor: border }]}
              onPress={handleCancel}
            >
              <ThemedText style={[styles.buttonText, { color: text }]}>
                Cancel
              </ThemedText>
            </Pressable>
            <Pressable
              style={[styles.button, styles.saveButton, { backgroundColor: tint }]}
              onPress={handleSave}
            >
              <ThemedText style={[styles.buttonText, { color: '#FFFFFF' }]}>
                Save Changes
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </BottomModal>

      {/* District Modals */}
      <DistrictModal
        isVisible={showCurrentDistrictModal}
        onClose={() => setShowCurrentDistrictModal(false)}
        onSelect={setTempCurrentLocation}
        selectedDistrict={tempCurrentLocation}
      />
      <DistrictModal
        isVisible={showDesiredDistrictModal}
        onClose={() => setShowDesiredDistrictModal(false)}
        onSelect={setTempDesiredLocation}
        selectedDistrict={tempDesiredLocation}
      />

      {/* Ministry Modals */}
      <MinistryModal
        isVisible={showCurrentMinistryModal}
        onClose={() => setShowCurrentMinistryModal(false)}
        onSelect={setTempCurrentMinistry}
        selectedMinistry={tempCurrentMinistry}
      />
      <MinistryModal
        isVisible={showDesiredMinistryModal}
        onClose={() => setShowDesiredMinistryModal(false)}
        onSelect={setTempDesiredMinistry}
        selectedMinistry={tempDesiredMinistry}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 12,
  },
  header: {
    marginBottom: 24,
    gap: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
  },
  section: {
    marginBottom: 20,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  selectorText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 'auto',
    paddingTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1.5,
  },
  saveButton: {
    // backgroundColor set dynamically
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});