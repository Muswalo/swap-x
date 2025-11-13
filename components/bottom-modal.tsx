import React, { ReactNode } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    Pressable,
    StyleSheet,
    View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

interface BottomModalProps {
    isVisible: boolean;
    onClose: () => void;
    children: ReactNode;
    heightPercent?: number; // Default 50%
    showHandle?: boolean; // Show drag handle
}

const { height: screenHeight } = Dimensions.get('window');

export const BottomModal: React.FC<BottomModalProps> = ({
    isVisible,
    onClose,
    children,
    heightPercent = 50,
    showHandle = true,
}) => {
    const insets = useSafeAreaInsets();
    const modalHeight = (screenHeight * heightPercent) / 100;

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
            navigationBarTranslucent={true}
            statusBarTranslucent={true}
        >
            <SafeAreaView style={styles.safeArea}>
                {/* Backdrop */}
                <Pressable
                    style={styles.backdrop}
                    onPress={onClose}
                />

                {/* Modal Container */}
                <View style={[styles.container, { height: '100%' }]}>
                    <Animated.View
                        style={[
                            styles.modal,
                            {
                                height: (screenHeight * heightPercent) / 100,
                            },
                        ]}
                    >
                        {/* Handle */}
                        {showHandle && (
                            <View style={styles.handleContainer}>
                                <View style={styles.handle} />
                            </View>
                        )}

                        {/* Content */}
                        <View style={styles.content}>
                            {children}
                        </View>
                    </Animated.View>
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modal: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
    },
    handleContainer: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderRadius: 2,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
});
