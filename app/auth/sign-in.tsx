import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Link, router } from 'expo-router';
import { AppButton } from '@/components/app-button';
import { SocialButton } from '@/components/social-button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Divider } from '@/components/divider';
import { useOnboarding } from '@/context/onboarding-provider';
import { AuthHeader } from '@/components/auth-header';
import { ControlledInput } from '@/components/controlled-fields';
import { ErrorNotice } from '@/components/error-notice';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase';

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const bg = useThemeColor({}, 'background');
  const tint = useThemeColor({}, 'tint');
  const { setOnboarding } = useOnboarding();
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const schema = z.object({
    email: z.string().trim().email('Enter a valid email address'),
    password: z.string().min(6, 'Password should be at least 6 characters'),
  });
  type FormValues = z.infer<typeof schema>;
  const { control, handleSubmit, setError } = useForm<FormValues>({
    defaultValues: { email: '', password: '' },
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  return (
    <ThemedView style={[styles.container, { backgroundColor: bg, paddingTop: insets.top + 24 }]}> 
      <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: 'height' })} keyboardVerticalOffset={insets.top} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <AuthHeader title="Welcome back" subtitle="Sign in to continue." onBack={() => setOnboarding(false)} />

          <ErrorNotice message={formError} visible={!!formError} variant="danger" />

          <View style={styles.form}>
            <ControlledInput control={control} name="email" icon="mail" placeholder="Email" keyboardType="email-address" autoCapitalize="none" returnKeyType="next" />
            <ControlledInput control={control} name="password" icon="lock" placeholder="Password" secureTextEntry secureToggle returnKeyType="done" />
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
      </KeyboardAvoidingView>
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <AppButton
          title={submitting ? 'Signing in...' : 'Sign in'}
          variant="primary"
          onPress={handleSubmit(async (vals) => {
            if (submitting) return;
            setFormError(null);
            setSubmitting(true);
            try {
              const { data, error } = await supabase.auth.signInWithPassword({
                email: vals.email,
                password: vals.password,
              });

              if (error) {
                const msg = (error as any)?.message?.toLowerCase?.() || '';
                if (msg.includes('invalid') && (msg.includes('login') || msg.includes('credentials') || msg.includes('password'))) {
                  setFormError('Invalid email or password');
                } else if (msg.includes('confirm') || msg.includes('not confirmed') || msg.includes('verify')) {
                  try {
                    const { error: resendError } = await supabase.auth.resend({ type: 'signup', email: vals.email });
                    if (resendError) {
                      const rmsg = (resendError as any)?.message?.toLowerCase?.() || '';
                      if (rmsg.includes('rate') && rmsg.includes('limit')) {
                        setFormError('Too many attempts. Please try again later.');
                      } else if (rmsg.includes('already') && (rmsg.includes('confirm') || rmsg.includes('verified'))) {
                        setFormError('Email already verified. Please try signing in again.');
                      } else {
                        setFormError('Could not send verification email. Please try again.');
                      }
                      return;
                    }
                    router.push({ pathname: '/auth/verify-email', params: { email: vals.email } });
                  } catch {
                    setFormError('Could not send verification email. Please try again.');
                  }
                } else if (msg.includes('rate') && msg.includes('limit')) {
                  setFormError('Too many attempts. Please try again later.');
                } else if (/ban|block|disable|suspend|deactivat/.test(msg)) {
                  setFormError('Your account has been disabled or blocked. Please contact support.');
                } else {
                  setFormError('Could not sign in. Please try again.');
                }
                return;
              }

              console.log('SignIn success', { user: data?.user });
              router.replace('/(tabs)');
            } finally {
              setSubmitting(false);
            }
          })}
          disabled={submitting}
          style={{ width: '100%' }}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
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
