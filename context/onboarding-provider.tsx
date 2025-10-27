import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface OnboardingContextType {
    hasCompletedOnboarding: boolean;
    setOnboarding: (completed: boolean) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

interface OnboardingProviderProps {
    children: ReactNode;
    initialState?: boolean;
    persist?: boolean; // if true, state is saved to AsyncStorage
}

const STORAGE_KEY = "@hasCompletedOnboarding";

export const OnboardingProvider = ({
    children,
    initialState = false,
    persist = true,
}: OnboardingProviderProps) => {
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(initialState);
    const [loading, setLoading] = useState(persist); // skip loading if not persisting

    useEffect(() => {
        if (!persist) return; // skip AsyncStorage if not persisting

        const loadState = async () => {
            try {
                const storedValue = await AsyncStorage.getItem(STORAGE_KEY);
                if (storedValue !== null) {
                    setHasCompletedOnboarding(storedValue === "true");
                }
            } catch (error) {
                console.error("Failed to load onboarding state:", error);
            } finally {
                setLoading(false);
            }
        };

        loadState();
    }, [persist]);

    const setOnboarding = async (completed: boolean) => {
        setHasCompletedOnboarding(completed);

        if (persist) {
            try {
                await AsyncStorage.setItem(STORAGE_KEY, completed.toString());
            } catch (error) {
                console.error("Failed to save onboarding state:", error);
            }
        }
    };

    if (persist && loading) return null;

    return (
        <OnboardingContext.Provider value={{ hasCompletedOnboarding, setOnboarding }}>
            {children}
        </OnboardingContext.Provider>
    );
};

export const useOnboarding = () => {
    const context = useContext(OnboardingContext);
    if (!context) throw new Error("useOnboarding must be used within OnboardingProvider");
    return context;
};
