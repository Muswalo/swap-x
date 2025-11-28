import React, { ReactNode, useEffect, useRef } from 'react';
import { Animated } from 'react-native';

type ShimmerContextType = {
    shimmerAnim: Animated.Value;
    shimmerOpacity: Animated.AnimatedInterpolation<number>;
};

export const ShimmerContext = React.createContext<ShimmerContextType | null>(null);

export function ShimmerProvider({ children }: { children: ReactNode }) {
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmerAnim, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [shimmerAnim]);

    const shimmerOpacity = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <ShimmerContext.Provider value={{ shimmerAnim, shimmerOpacity }}>
            {children}
        </ShimmerContext.Provider>
    );
}

export function useShimmer() {
    const context = React.useContext(ShimmerContext);
    if (!context) {
        throw new Error('useShimmer must be used within ShimmerProvider');
    }
    return context;
}
