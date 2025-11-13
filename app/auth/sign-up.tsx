import { AppButton } from "@/components/app-button";
import { AuthHeader } from "@/components/auth-header";
import { ControlledCheckbox, ControlledInput, ControlledPhoneInput } from '@/components/controlled-fields';
import { Divider } from "@/components/divider";
import { ErrorNotice } from '@/components/error-notice';
import { SocialButton } from "@/components/social-button";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useOnboarding } from "@/context/onboarding-provider";
import { useThemeColor } from "@/hooks/use-theme-color";
import { supabase } from '@/lib/supabase';
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
import React, { useEffect, useState } from "react";
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { z } from "zod";

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const bg = useThemeColor({}, "background");
  const tint = useThemeColor({}, "tint");
  const text = useThemeColor({}, "text");
  const { setOnboarding } = useOnboarding();

  const [formError, setFormError] = useState<string | null>(null);
  const [dialCode, setDialCode] = useState<string>("+260");
  const [submitting, setSubmitting] = useState(false);

  const schema = z
    .object({
      firstName: z.string().trim().min(2, "Please enter your first name"),
      lastName: z.string().trim().min(2, "Please enter your last name"),
      email: z.email("Enter a valid email address"),
      phoneLocal: z
        .string()
        .trim()
        .regex(/^\d+$/, "Phone must contain digits only"),
      password: z.string().min(6, "Password should be at least 6 characters"),
      agree: z
        .boolean()
        .refine((val) => val === true, {
          message: "You must accept the Terms",
        }),
      dialCode: z.string().regex(/^\+\d+$/, "Invalid dial code"),
    })
    .superRefine((val, ctx) => {
      const full = `${val.dialCode}${val.phoneLocal}`;
      if (!/^\+[1-9]\d{7,14}$/.test(full)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter a valid international phone number",
          path: ["phoneLocal"],
        });
      }
    });

  type FormValues = z.infer<typeof schema>;

  const { control, handleSubmit, formState, setValue, watch, setError } =
    useForm<FormValues>({
      defaultValues: {
        firstName: "",
        lastName: "",
        email: "",
        phoneLocal: "",
        password: "",
        agree: false,
        dialCode: dialCode,
      },
      resolver: zodResolver(schema),
      mode: "onChange",
    });

  useEffect(() => {
    setValue("dialCode", dialCode);
  }, [dialCode, setValue]);

  return (
    <ThemedView
      style={[
        styles.container,
        { backgroundColor: bg, paddingTop: insets.top + 24 },
      ]}
    >
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: "height" })}
        keyboardVerticalOffset={insets.top}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <AuthHeader
            title="Create your account"
            subtitle="Sign up with email or continue with Google."
            onBack={() => setOnboarding(false)}
          />

          <ErrorNotice message={formError} visible={!!formError} variant="danger" />

          <View style={styles.form}>
            <ControlledInput control={control} name="firstName" icon="user" placeholder="First name" autoCapitalize="words" returnKeyType="next" />
            <ControlledInput control={control} name="lastName" icon="user" placeholder="Last name" autoCapitalize="words" returnKeyType="next" />
            <ControlledInput control={control} name="email" icon="mail" placeholder="Email" keyboardType="email-address" autoCapitalize="none" returnKeyType="next" />
            <ControlledPhoneInput control={control} name="phoneLocal" placeholder="Phone" defaultCountryIso="ZM" onDialCodeChange={(d) => setDialCode(d)} />
            <ControlledInput control={control} name="password" icon="lock" placeholder="Password" secureTextEntry secureToggle returnKeyType="done" />
          </View>

          <View style={{ width: '100%' }}>
            <View style={styles.row}>
              <ControlledCheckbox control={control} name="agree" />
              <ThemedText style={{ flex: 1 }}>
                I agree to the <Link href="/modal" style={[styles.link, { color: tint }]}>Terms of Service</Link>
              </ThemedText>
            </View>
            {formState.errors.agree?.message ? (
              <ThemedText style={{ color: '#ff453a', fontSize: 12, marginTop: 6 }}>
                {formState.errors.agree.message as string}
              </ThemedText>
            ) : null}
          </View>

          <Divider label="or continue with" />

          <SocialButton
            provider="google"
            title="Continue with Google"
            onPress={() => {}}
            style={{ width: "100%" }}
          />

          <View style={styles.switchRow}>
            <ThemedText>Already have an account? </ThemedText>
            <Link href="/auth/sign-in" style={[styles.link, { color: tint }]}>
              Sign in
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <AppButton
          title={submitting ? "Creating ..." : "Create account"}
          variant="primary"
          onPress={handleSubmit(async (vals) => {
            if (submitting) return;
            setFormError(null);
            setSubmitting(true);
            try {
              const fullPhone = `${vals.dialCode}${vals.phoneLocal}`;
              const { data, error } = await supabase.auth.signUp({
                email: vals.email,
                password: vals.password,
                options: {
                  data: {
                    first_name: vals.firstName,
                    last_name: vals.lastName,
                    phone: fullPhone,
                    profile_completed: false,
                  },
                },
              });

              // Handle Supabase duplicate email edge-case where identities may be empty
              if (!error && data?.user && Array.isArray((data as any).user.identities) && (data as any).user.identities.length === 0) {
                setError('email', { type: 'manual', message: 'Email already in use' });
                return;
              }

              if (error) {
                console.log(error)
                const msg = (error as any)?.message?.toLowerCase?.() || '';
                if (msg.includes('already') && msg.includes('exist')) {
                  setError('email', { type: 'manual', message: 'Email already in use' });
                } else if (msg.includes('rate') && msg.includes('limit')) {
                  setFormError('Too many attempts. Please try again later.');
                } else {
                  setFormError('Could not create account. Please try again.');
                }
                return;
              }

              console.log('SignUp success', { user: data?.user });
              router.push({ pathname: '/auth/verify-email', params: { email: vals.email } });
            } finally {
              setSubmitting(false);

            }
          })}
          disabled={submitting}
          style={{ width: "100%" }}
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
    width: "100%",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: { width: "100%", textAlign: "left" },
  subtitle: { width: "100%", textAlign: "left", opacity: 0.8 },
  link: { fontWeight: "600" },
  switchRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  footer: {
    paddingHorizontal: 24,
  },
});
