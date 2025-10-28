import { AppButton } from '@/components/app-button';
import { AuthHeader } from '@/components/auth-header';
import { ControlledInput } from '@/components/controlled-fields';
import { ErrorNotice } from '@/components/error-notice';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export default function VerifyEmailScreen() {
  const insets = useSafeAreaInsets();
  const bg = useThemeColor({}, 'background');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <AppButton
          title={submitting ? 'Verifying...' : 'Verify email'}
          variant="primary"
          onPress={handleSubmit(async (vals) => {
            if (submitting) return;
            setFormError(null);
            setSubmitting(true);
            try {
              console.log('Verify email submit', vals);
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
  footer: {
    paddingHorizontal: 24,
  },
});

