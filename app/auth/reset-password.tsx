import { AppButton } from '@/components/app-button';
import { AuthHeader } from '@/components/auth-header';
import { FormInput } from '@/components/form-input';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ResetPasswordScreen() {
  const insets = useSafeAreaInsets();
  const bg = useThemeColor({}, 'background');
  const [kbOpen, setKbOpen] = useState(false);

  useEffect(() => {
    const sh = Keyboard.addListener('keyboardDidShow', () => setKbOpen(true));
    const hd = Keyboard.addListener('keyboardDidHide', () => setKbOpen(false));
    return () => { sh.remove(); hd.remove(); };
  }, []);

  return (
    <ThemedView style={[styles.container, { backgroundColor: bg, paddingTop: insets.top + 24 }]}> 
      <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: 'height' })} keyboardVerticalOffset={insets.top + 80} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: kbOpen ? 120 : 24 }]} keyboardShouldPersistTaps="handled">
          <AuthHeader title="Reset password" subtitle="Set a new password for your account." onBack={() => router.back()} />

          <View style={styles.form}>
            <FormInput icon="lock" placeholder="New password" secureTextEntry secureToggle returnKeyType="next" />
            <FormInput icon="lock" placeholder="Confirm new password" secureTextEntry secureToggle returnKeyType="done" />
          </View>
        </ScrollView>
        <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
          <AppButton title="Update password" variant="primary" onPress={() => {}} style={{ width: '100%' }} />
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 120,
    gap: 24,
  },
  form: {
    gap: 18,
    width: '100%',
  },
  footer: {
    paddingHorizontal: 24,
  },
});

