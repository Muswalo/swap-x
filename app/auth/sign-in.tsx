import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React, { useEffect, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Link } from 'expo-router';
import { AppButton } from '@/components/app-button';
import { FormInput } from '@/components/form-input';
import { SocialButton } from '@/components/social-button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Divider } from '@/components/divider';
import { useOnboarding } from '@/context/onboarding-provider';
import { AuthHeader } from '@/components/auth-header';

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const bg = useThemeColor({}, 'background');
  const tint = useThemeColor({}, 'tint');
  const text = useThemeColor({}, 'text');
  const { setOnboarding } = useOnboarding();
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
          <AuthHeader title="Welcome back" subtitle="Sign in to continue." onBack={() => setOnboarding(false)} />

          <View style={styles.form}>
            <FormInput icon="mail" placeholder="Email" keyboardType="email-address" autoCapitalize="none" returnKeyType="next" />
            <FormInput icon="lock" placeholder="Password" secureTextEntry secureToggle returnKeyType="done" />
          </View>

          <View style={styles.forgotRow}>
            <Link href="/auth/forgot-password" style={[styles.link, { color: tint }]}>Forgot password?</Link>
          </View>

          <Divider label="or continue with" />

          <SocialButton provider="google" title="Continue with Google" onPress={() => {}} style={{ width: '100%' }} />

          <View style={styles.switchRow}>
            <ThemedText>New here? </ThemedText>
            <Link href="/auth/sign-up" style={[styles.link, { color: tint }]}>Create an account</Link>
          </View>
        </ScrollView>
        <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
          <AppButton title="Sign in" variant="primary" onPress={() => {}} style={{ width: '100%' }} />
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
  forgotRow: {
    width: '100%',
    alignItems: 'flex-end',
  },
  title: { width: '100%', textAlign: 'left' },
  subtitle: { width: '100%', textAlign: 'left', opacity: 0.8 },
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
