import { AppButton } from '@/components/app-button';
import { AuthHeader } from '@/components/auth-header';
import { ControlledInput } from '@/components/controlled-fields';
import { ErrorNotice } from '@/components/error-notice';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const bg = useThemeColor({}, 'background');
  const tint = useThemeColor({}, 'tint');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const schema = z.object({ email: z.email('Enter a valid email address') });
  type FormValues = z.infer<typeof schema>;
  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: { email: '' },
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  return (
    <ThemedView style={[styles.container, { backgroundColor: bg, paddingTop: insets.top + 24 }]}> 
      <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: 'height' })} keyboardVerticalOffset={insets.top} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <AuthHeader title="Forgot password" subtitle="Enter your email to reset your password." onBack={() => router.back()} />

          <ErrorNotice message={formError} visible={!!formError} variant="danger" />

          <View style={styles.form}>
            <ControlledInput control={control} name="email" icon="mail" placeholder="Email" keyboardType="email-address" autoCapitalize="none" returnKeyType="done" />
          </View>

          <View style={styles.switchRow}>
            <ThemedText>Remembered it? </ThemedText>
            <Link href="/auth/sign-in" style={[styles.link, { color: tint }]}>Sign in</Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <AppButton
          title={submitting ? 'Sending link...' : 'Send reset link'}
          variant="primary"
          onPress={handleSubmit(async (vals) => {
            if (submitting) return;
            setFormError(null);
            setSubmitting(true);
            try {
              console.log('Forgot submit', vals);
              await new Promise((r) => setTimeout(r, 900));
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

