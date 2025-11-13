import { useThemeColor } from '@/hooks/use-theme-color';
import { Feather } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import {
    Animated,
    Modal,
    Pressable,
    StyleSheet,
    View,
} from 'react-native';
import { ThemedText } from './themed-text';

interface SuccessModalProps {
    isVisible: boolean;
    onProceed: () => void;
    title?: string;
    message?: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
    isVisible,
    onProceed,
    title = 'Success!',
    message = 'Your swap listing has been created successfully.',
}) => {
    const bg = useThemeColor({}, 'background');
    const text = useThemeColor({}, 'text');
    const tint = useThemeColor({}, 'tint');

    const scaleAnim = new Animated.Value(0);
    const opacityAnim = new Animated.Value(0);

    useEffect(() => {
        if (isVisible) {
            // Reset animations
            scaleAnim.setValue(0);
            opacityAnim.setValue(0);

            // Animate checkmark
            Animated.sequence([
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 4,
                    tension: 40,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [isVisible]);

    return (
        <Modal
            visible={isVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={onProceed}
            navigationBarTranslucent={true}
            statusBarTranslucent={true}
        >
            <View style={styles.backdrop}>
                <View style={[styles.centeredView, { backgroundColor: bg }]}>
                    {/* Animated Checkmark Container */}
                    <Animated.View
                        style={[
                            styles.checkmarkContainer,
                            {
                                transform: [{ scale: scaleAnim }],
                                opacity: opacityAnim,
                            },
                        ]}
                    >
                        <View style={[styles.checkmarkCircle, { backgroundColor: `${tint}15` }]}>
                            <Feather name="check" size={60} color={tint} strokeWidth={3} />
                        </View>
                    </Animated.View>

                    {/* Content */}
                    <View style={styles.content}>
                        <ThemedText style={styles.title}>{title}</ThemedText>
                        <ThemedText style={[styles.message, { color: `${text}70` }]}>
                            {message}
                        </ThemedText>
                    </View>

                    {/* Proceed Button */}
                    <Pressable
                        onPress={onProceed}
                        style={({ pressed }) => [
                            styles.button,
                            {
                                backgroundColor: tint,
                                opacity: pressed ? 0.8 : 1,
                            },
                        ]}
                    >
                        <ThemedText style={styles.buttonText}>Proceed</ThemedText>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    centeredView: {
        width: '85%',
        borderRadius: 20,
        padding: 32,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 15,
    },
    checkmarkContainer: {
        marginBottom: 24,
    },
    checkmarkCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        alignItems: 'center',
        marginBottom: 32,
        gap: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        letterSpacing: -0.5,
        textAlign: 'center',
    },
    message: {
        fontSize: 15,
        fontWeight: '400',
        textAlign: 'center',
        lineHeight: 22,
    },
    button: {
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});
