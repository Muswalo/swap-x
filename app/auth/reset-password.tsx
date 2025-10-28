import { AppButton } from '@/components/app-button';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthHeader } from '@/components/auth-header';
import { ControlledInput } from '@/components/controlled-fields';
import { ErrorNotice } from '@/components/error-notice';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';

export default function ResetPasswordScreen() {
  const insets = useSafeAreaInsets();
  const bg = useThemeColor({}, 'background');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const schema = z.object({
    password: z.string().min(6, 'Password should be at least 6 characters'),
    confirm: z.string().min(6, 'Password should be at least 6 characters'),
  }).refine((val) => val.password === val.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  });
  type FormValues = z.infer<typeof schema>;
  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: { password: '', confirm: '' },
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  return (
    <ThemedView style={[styles.container, { backgroundColor: bg, paddingTop: insets.top + 24 }]}> 
      <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: 'height' })} keyboardVerticalOffset={insets.top} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <AuthHeader title="Reset password" subtitle="Set a new password for your account." onBack={() => router.back()} />

          <ErrorNotice message={formError} visible={!!formError} variant="danger" />

          <View style={styles.form}>
            <ControlledInput control={control} name="password" icon="lock" placeholder="New password" secureTextEntry secureToggle returnKeyType="next" />
            <ControlledInput control={control} name="confirm" icon="lock" placeholder="Confirm new password" secureTextEntry secureToggle returnKeyType="done" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <AppButton
          title={submitting ? 'Updating...' : 'Update password'}
          variant="primary"
          onPress={handleSubmit(async (vals) => {
            if (submitting) return;
            setFormError(null);
            setSubmitting(true);
            try {
              console.log('Reset submit', vals);
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

