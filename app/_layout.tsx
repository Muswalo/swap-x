import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { SplashScreen } from '@/components/splash-screen';
import { NotificationProvider } from "@/context/notifications-provider";
import { OnboardingProvider, useOnboarding } from "@/context/onboarding-provider";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { supabase } from '@/lib/supabase';
import * as Notifications from "expo-notifications";
import React, { useEffect, useState } from 'react';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});


export const unstable_settings = {
  anchor: "(tabs)",
};

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const { hasCompletedOnboarding } = useOnboarding();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setIsLoggedIn(!!data.session?.user);
    })().finally(() => setIsBooting(false));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => {
      mounted = false;
      sub.subscription?.unsubscribe();
    };
  }, []);

  return (
    <NotificationProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        {isBooting ? (
          <SplashScreen />
        ) : (
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
              gestureEnabled: true,
            }}
          >

            {/* Onboarding screen */}
            <Stack.Protected guard={!hasCompletedOnboarding}>
              <Stack.Screen name="onboarding" />
            </Stack.Protected>

            {/* Auth screen */}
            <Stack.Protected guard={hasCompletedOnboarding && !isLoggedIn}>
              <Stack.Screen name="auth" />
            </Stack.Protected>

            {/* Main app */}
            <Stack.Protected guard={isLoggedIn}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="profile-setup" options={{ headerShown: false }} />
              <Stack.Screen name="swap-details" options={{ headerShown: false }} />
              <Stack.Screen name="messages" options={{ headerShown: false }} />
              <Stack.Screen name="notifications" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: "modal", title: "Modal" }} />
            </Stack.Protected>
          </Stack>
        )}
        <StatusBar style="auto" />
      </ThemeProvider>
    </NotificationProvider>
  );
}

export default function RootLayout() {
  return (
    // Update to true for production to persist onboarding state
    <OnboardingProvider persist={false}>
      <RootLayoutContent />
    </OnboardingProvider>
  );
}
