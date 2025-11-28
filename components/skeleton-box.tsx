import { useShimmer } from '@/components/shimmer-provider';
import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { Animated, StyleSheet } from 'react-native';

export type SkeletonBoxProps = {
    width?: number | string;
    height?: number;
    borderRadius?: number;
    style?: any;
};

export function SkeletonBox({
    width = '100%',
    height = 20,
    borderRadius = 12,
    style,
}: SkeletonBoxProps) {
    const text = useThemeColor({}, 'text');
    const shimmerBg = `${text}08`;
    const { shimmerOpacity } = useShimmer();

    return (
        <Animated.View
            style={[
                styles.box,
                {
                    width,
                    height,
                    borderRadius,
                    backgroundColor: shimmerBg,
                    opacity: shimmerOpacity,
                },
                style,
            ]}
        />
    );
}

const styles = StyleSheet.create({
    box: {
        borderRadius: 12,
    },
});
