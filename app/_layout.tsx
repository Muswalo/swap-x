import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { OnboardingProvider, useOnboarding } from "@/context/onboarding-provider";
import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  anchor: "(tabs)",
};

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const { hasCompletedOnboarding } = useOnboarding();

  const isLoggedIn = false;

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
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
          <Stack.Screen name="modal" options={{ presentation: "modal", title: "Modal" }} />
        </Stack.Protected>

      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <OnboardingProvider persist={false}>
      <RootLayoutContent />
    </OnboardingProvider>
  );
}
