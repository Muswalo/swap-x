import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

export function SplashScreen() {
  const bg = useThemeColor({}, 'background');
  const tint = useThemeColor({}, 'tint');
  const text = useThemeColor({}, 'text');

  return (
    <ThemedView style={[styles.container, { backgroundColor: bg }]}> 
      <View style={styles.centerWrap}>
        <ThemedText style={[styles.title, { color: text }]}>Swap X</ThemedText>
        <View style={[styles.bar, { backgroundColor: `${tint}22` }]}> 
          <View style={[styles.barFill, { backgroundColor: tint }]} />
        </View>
      </View>

      <View style={styles.footer}>
        <Image source={require('@/assets/images/dottra.png')} style={styles.logo} resizeMode="contain" />
        <ThemedText style={styles.byline}>by Dottra Technologies</ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 48 },
  centerWrap: { alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 48 },
  title: { fontSize: 42, fontWeight: '800', letterSpacing: 1 },
  bar: { width: 140, height: 8, borderRadius: 999, overflow: 'hidden' },
  barFill: { width: '36%', height: '100%' },
  footer: { alignItems: 'center', gap: 10 },
  logo: { width: 36, height: 36, opacity: 0.9 },
  byline: { opacity: 0.7, fontSize: 13 },
});
