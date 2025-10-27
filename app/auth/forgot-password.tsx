import { AppButton } from '@/components/app-button';
import { AuthHeader } from '@/components/auth-header';
import { FormInput } from '@/components/form-input';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Link, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const bg = useThemeColor({}, 'background');
  const tint = useThemeColor({}, 'tint');
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
          <AuthHeader title="Forgot password" subtitle="Enter your email to reset your password." onBack={() => router.back()} />

          <View style={styles.form}>
            <FormInput icon="mail" placeholder="Email" keyboardType="email-address" autoCapitalize="none" returnKeyType="done" />
          </View>

          <View style={styles.switchRow}>
            <ThemedText>Remembered it? </ThemedText>
            <Link href="/auth/sign-in" style={[styles.link, { color: tint }]}>Sign in</Link>
          </View>
        </ScrollView>
        <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
          <AppButton title="Send reset link" variant="primary" onPress={() => {}} style={{ width: '100%' }} />
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
  link: { fontWeight: '600' },
  switchRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  footer: {
    paddingHorizontal: 24,
  },
});

