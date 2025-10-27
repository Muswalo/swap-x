import { Asset } from 'expo-asset';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, BackHandler, Dimensions, NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SvgUri } from 'react-native-svg';

import { AppButton } from '@/components/app-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useOnboarding } from '@/context/onboarding-provider';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';

const { width } = Dimensions.get('window');

export default function OnboardingPager() {
  const { setOnboarding } = useOnboarding();
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();

  const bg = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const accent = scheme === 'dark' ? '#2563EB' : tint; // vivid blue in dark mode for visibility
  const artUri = useMemo(() => {
    const mod = scheme === 'dark'
      ? require('@/assets/images/connect-light.svg')
      : require('@/assets/images/connect-dark.svg');
    return Asset.fromModule(mod).uri;
  }, [scheme]);

  const bob = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: -6, duration: 1200, useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, [bob]);

  const slides = useMemo(
    () => [
      {
        key: 'welcome',
        title: 'Find transfer matches',
        subtitle:
          'Connect with colleagues nearby or with exact-role matches to swap posts faster.',
      },
      {
        key: 'how',
        title: 'Smart suggestions',
        subtitle:
          'Geo proximity, exact matching, inbox chat, and optional contact upload to find peers.',
      },
      {
        key: 'start',
        title: 'Pay only when needed',
        subtitle:
          'Browse free. Pay to unlock details when a match matters. Fast and lightweight.',
      },
    ],
    []
  );

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(x / width);
    if (newIndex !== index) setIndex(newIndex);
  };

  const goTo = (i: number) => {
    scrollRef.current?.scrollTo({ x: i * width, animated: true });
    setIndex(i);
  };

  const onNext = async () => {
    if (index < slides.length - 1) {
      goTo(index + 1);
    } else {
      await setOnboarding(true);
      router.replace('/auth');
    }
  };

  const onBack = () => {
    if (index > 0) goTo(index - 1);
  };

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (index > 0) {
        goTo(index - 1);
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [index]);

  return (
    <ThemedView style={[styles.container, { backgroundColor: bg }]}> 
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ alignItems: 'stretch' }}
      >
        {slides.map((s) => (
          <View key={s.key} style={[styles.slide, { width }]}> 
            <View style={styles.content}> 
              <ThemedText type="title" style={styles.title}>{s.title}</ThemedText>
              <ThemedText style={styles.subtitle}>{s.subtitle}</ThemedText>
              <View style={styles.artWrap}>
                <View style={[styles.backShape, { backgroundColor: `${accent}33` }]} />
                <View style={[styles.backSquare, { borderColor: `${accent}66` }]} />
                {!!artUri && (
                  <Animated.View style={{ transform: [{ translateY: bob }] }}>
                    <SvgUri width={260} height={260} uri={artUri} />
                  </Animated.View>
                )}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i === index ? tint : `${text}33` },
              ]}
            />
          ))}
        </View>

        <View style={styles.actions}>
          <AppButton
            accessibilityLabel="Back"
            title="Back"
            variant="ghost"
            disabled={index === 0}
            onPress={onBack}
            style={[{ opacity: index === 0 ? 0.4 : 1 }]}
          />

          <AppButton
            accessibilityLabel={index === slides.length - 1 ? 'Get started' : 'Next'}
            title={index === slides.length - 1 ? 'Get started' : 'Next'}
            variant="primary"
            onPress={onNext}
          />
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    gap: 16,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  artWrap: {
    marginTop: 16,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backShape: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    transform: [{ scale: 1 }],
  },
  backSquare: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 24,
    borderWidth: 2,
    transform: [{ rotate: '15deg' }],
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    textAlign: 'left',
    width: '100%',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.8,
    textAlign: 'left',
    width: '100%',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 16,
  },
  dots: {
    height: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  ghostBtn: {
    height: 48,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostText: {
    fontSize: 16,
  },
  primaryBtn: {
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});
