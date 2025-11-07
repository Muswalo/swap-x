import { AppButton } from '@/components/app-button';
import { AuthHeader } from '@/components/auth-header';
import { ControlledInput } from '@/components/controlled-fields';
import { ErrorNotice } from '@/components/error-notice';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { supabase } from '@/lib/supabase';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';

export default function VerifyEmailScreen() {
  const insets = useSafeAreaInsets();
  const bg = useThemeColor({}, 'background');
  const tint = useThemeColor({}, 'tint');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const params = useLocalSearchParams<{ email?: string }>();
  const email = params?.email ?? '';
  const [resendIn, setResendIn] = useState(60);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (resendIn === 0) return;
    const id = setInterval(() => setResendIn((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [resendIn]);

  const handleResend = async () => {
    if (resendIn > 0 || resending || submitting) return;
    if (!email) {
      setFormError('Missing email. Please restart sign up.');
      return;
    }
    setFormError(null);
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email });
      if (error) {
        const msg = (error as any)?.message?.toLowerCase?.() || '';
        if (msg.includes('rate') && msg.includes('limit')) {
          setFormError('Too many attempts. Please try again later.');
        } else if (msg.includes('already') && (msg.includes('confirm') || msg.includes('verified'))) {
          setFormError('Email already verified. Please sign in.');
        } else {
          setFormError('Could not resend verification email. Please try again.');
        }
        return;
      }
      console.log('Resent verification email to', email);
      setResendIn(60);
    } finally {
      setResending(false);
    }
  };

  const schema = z.object({ code: z.string().trim().regex(/^\d{6}$/, 'Enter the 6-digit code') });
  type FormValues = z.infer<typeof schema>;
  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: { code: '' },
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  return (
    <ThemedView style={[styles.container, { backgroundColor: bg, paddingTop: insets.top + 24 }]}> 
      <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: 'height' })} keyboardVerticalOffset={insets.top} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <AuthHeader title="Verify your email" subtitle="Enter the 6-digit code sent to your email." onBack={() => router.back()} />

          <ErrorNotice message={formError} visible={!!formError} variant="danger" />

          <View style={styles.form}>
            <ControlledInput control={control} name="code" icon="hash" placeholder="6-digit code" keyboardType="number-pad" maxLength={6} returnKeyType="done" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <View style={styles.resendRow}>
        <ThemedText>Didn't receive the email? </ThemedText>
        <Pressable disabled={resendIn > 0 || resending || submitting} onPress={handleResend} style={{ opacity: resendIn > 0 || resending || submitting ? 0.5 : 1 }}>
          <ThemedText style={[styles.link, { color: tint }]}>
            {resending ? 'Resending...' : resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend email'}
          </ThemedText>
        </Pressable>
      </View>
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <AppButton
          title={submitting ? 'Verifying...' : 'Verify email'}
          variant="primary"
          onPress={handleSubmit(async (vals) => {
            if (submitting) return;
            setFormError(null);
            setSubmitting(true);
            try {
              if (!email) {
                setFormError('Missing email. Please restart sign up.');
                return;
              }
              const { data, error } = await supabase.auth.verifyOtp({
                email,
                token: vals.code,
                type: 'signup',
              });
              if (error) {
                const msg = (error as any)?.message?.toLowerCase?.() || '';
                if (msg.includes('invalid') || msg.includes('incorrect')) {
                  setFormError('Invalid code. Please check and try again.');
                } else if (msg.includes('expired')) {
                  setFormError('Code expired. Request a new verification email.');
                } else if (msg.includes('rate') && msg.includes('limit')) {
                  setFormError('Too many attempts. Please try again later.');
                } else {
                  setFormError('Could not verify email. Please try again.');
                }
                return;
              }
              console.log('Email verified', { user: data?.user });
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
  footer: {
    paddingHorizontal: 24,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 6,
  },
  link: {
    fontWeight: '600',
  },
});

