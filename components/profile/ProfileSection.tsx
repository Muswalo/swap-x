import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

export type ProfileSectionProps = {
  title: string;
  children: ReactNode;
};

export function ProfileSection({ title, children }: ProfileSectionProps) {
  const text = useThemeColor({}, 'text');

  return (
    <View style={styles.section}>
      <ThemedText style={[styles.sectionTitle, { color: `${text}77` }]}>
        {title}
      </ThemedText>
      {children}
    </View>
  );
}

export type ProfileInfoRowProps = {
  label: string;
  value: string;
  isLast?: boolean;
};

export function ProfileInfoRow({ label, value, isLast = false }: ProfileInfoRowProps) {
  const text = useThemeColor({}, 'text');
  const border = `${text}15`;

  return (
    <View
      style={[
        styles.infoRow,
        {
          borderBottomWidth: isLast ? 0 : 1,
          borderBottomColor: border,
        },
      ]}
    >
      <ThemedText style={[styles.infoLabel, { color: `${text}77` }]}>{label}</ThemedText>
      <ThemedText style={styles.infoValue} numberOfLines={2}>
        {value}
      </ThemedText>
    </View>
  );
}

export type ProfileSectionContentProps = {
  children: ReactNode;
};

export function ProfileSectionContent({ children }: ProfileSectionContentProps) {
  const text = useThemeColor({}, 'text');
  const border = `${text}15`;

  return (
    <View
      style={[
        styles.sectionContent,
        { backgroundColor: `${text}05`, borderColor: border },
      ]}
    >
      {children}
    </View>
  );
}

export type ProfileBioProps = {
  bio: string;
};

export function ProfileBio({ bio }: ProfileBioProps) {
  const text = useThemeColor({}, 'text');
  const border = `${text}15`;

  return (
    <View
      style={[
        styles.bioContainer,
        { backgroundColor: `${text}05`, borderColor: border },
      ]}
    >
      <ThemedText style={styles.bioText}>{bio}</ThemedText>
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
  bioContainer: {
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 16,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
});
