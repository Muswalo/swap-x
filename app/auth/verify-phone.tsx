import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React from 'react';
import { StyleSheet } from 'react-native';

export default function VerifyPhoneScreen() {
    return (
        <ThemedView>
            <ThemedText type="title">Welcome! verify phone screen</ThemedText>
        </ThemedView>
    );
}

const styles = StyleSheet.create({});
