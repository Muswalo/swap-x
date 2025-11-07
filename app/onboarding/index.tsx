import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

import { AppButton } from '@/components/app-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useOnboarding } from '@/context/onboarding-provider';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';

// Constants
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ANIMATION_DURATION = 2000;
const SLIDES = [
  {
    key: 'welcome',
    title: 'Find Transfer Matches',
    subtitle: 'Connect with colleagues nearby or with exact-role matches to swap posts faster.',
    accent: '#3B82F6', // blue
    icon: 'users-connect',
  },
  {
    key: 'how',
    title: 'Smart Suggestions',
    subtitle: 'Geo proximity, exact matching, inbox chat, and optional contact upload to find peers.',
    accent: '#8B5CF6', // purple
    icon: 'sparkles',
  },
  {
    key: 'start',
    title: 'Pay Only When Needed',
    subtitle: 'Browse free. Pay to unlock details when a match matters. Fast and lightweight.',
    accent: '#10B981', // green
    icon: 'wallet',
  },
] as const;

// SVG Icons
const ICONS = {
  'users-connect': `<svg viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="140" cy="90" r="40" stroke="currentColor" stroke-width="8" fill="none"/>
    <circle cx="100" cy="160" r="30" fill="currentColor" opacity="0.3"/>
    <circle cx="100" cy="160" r="18" fill="currentColor"/>
    <circle cx="180" cy="160" r="30" fill="currentColor" opacity="0.3"/>
    <circle cx="180" cy="160" r="18" fill="currentColor"/>
    <line x1="120" y1="110" x2="100" y2="142" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
    <line x1="160" y1="110" x2="180" y2="142" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
    <path d="M70 205c0-16.569 13.431-30 30-30s30 13.431 30 30" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
    <path d="M150 205c0-16.569 13.431-30 30-30s30 13.431 30 30" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
  </svg>`,
  'sparkles': `<svg viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M140 50L148 90L188 98L148 106L140 146L132 106L92 98L132 90L140 50Z" fill="currentColor"/>
    <path d="M100 150L105 170L125 175L105 180L100 200L95 180L75 175L95 170L100 150Z" fill="currentColor" opacity="0.6"/>
    <path d="M180 150L185 170L205 175L185 180L180 200L175 180L155 175L175 170L180 150Z" fill="currentColor" opacity="0.6"/>
    <circle cx="80" cy="80" r="4" fill="currentColor" opacity="0.4"/>
    <circle cx="200" cy="80" r="4" fill="currentColor" opacity="0.4"/>
    <circle cx="140" cy="220" r="4" fill="currentColor" opacity="0.4"/>
  </svg>`,
  'wallet': `<svg viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="60" y="90" width="160" height="120" rx="12" fill="currentColor" opacity="0.2"/>
    <rect x="60" y="90" width="160" height="120" rx="12" stroke="currentColor" stroke-width="6"/>
    <rect x="70" y="70" width="140" height="30" rx="8" fill="currentColor" opacity="0.3"/>
    <circle cx="180" cy="150" r="12" fill="currentColor"/>
    <line x1="80" y1="130" x2="130" y2="130" stroke="currentColor" stroke-width="4" stroke-linecap="round" opacity="0.4"/>
    <line x1="80" y1="145" x2="110" y2="145" stroke="currentColor" stroke-width="4" stroke-linecap="round" opacity="0.4"/>
  </svg>`,
};

export default function OnboardingPager() {
  // Hooks
  const { setOnboarding } = useOnboarding();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  
  // Refs
  const scrollRef = useRef<ScrollView>(null);
  const bobAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const fadeAnimation = useRef(new Animated.Value(1)).current;
  const rotateAnimation = useRef(new Animated.Value(0)).current;
  
  // State
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const currentAccent = SLIDES[currentIndex].accent;
  const iconColor = colorScheme === 'dark' ? '#FFFFFF' : '#000000';

  const isLastSlide = currentIndex === SLIDES.length - 1;
  const isFirstSlide = currentIndex === 0;

  // Animations
  useEffect(() => {
    // Floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bobAnimation, {
          toValue: -12,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(bobAnimation, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Rotation animation
    Animated.loop(
      Animated.timing(rotateAnimation, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();
  }, [bobAnimation, rotateAnimation]);

  // Slide change animation
  useEffect(() => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(scaleAnimation, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnimation, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(fadeAnimation, {
          toValue: 0.3,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [currentIndex]);

  // Handlers
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / SCREEN_WIDTH);
    
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < SLIDES.length) {
      setCurrentIndex(newIndex);
    }
  };

  const navigateToSlide = (index: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
    }
  };

  const handleNext = async () => {
    if (!isLastSlide) {
      const nextIndex = currentIndex + 1;
      navigateToSlide(nextIndex);
      // Let the scroll animation complete before updating state
      setTimeout(() => setCurrentIndex(nextIndex), 50);
    } else {
      await setOnboarding(true);
      router.replace('/auth');
    }
  };

  const handleBack = () => {
    if (!isFirstSlide) {
      const prevIndex = currentIndex - 1;
      navigateToSlide(prevIndex);
      // Let the scroll animation complete before updating state
      setTimeout(() => setCurrentIndex(prevIndex), 50);
    }
  };

  // Back handler
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!isFirstSlide) {
        handleBack();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [currentIndex]);

  const rotate = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      {/* Animated gradient background */}
      <View style={styles.gradientContainer}>
        <Animated.View
          style={[
            styles.gradientCircle,
            {
              backgroundColor: `${currentAccent}15`,
              transform: [{ scale: scaleAnimation }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.gradientCircle2,
            {
              backgroundColor: `${currentAccent}10`,
              transform: [{ rotate }],
            },
          ]}
        />
      </View>

      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {SLIDES.map((slide, index) => (
          <View key={slide.key} style={[styles.slide, { width: SCREEN_WIDTH }]}>
            <Animated.View 
              style={[
                styles.content,
                {
                  opacity: fadeAnimation,
                  transform: [{ scale: scaleAnimation }],
                },
              ]}
            >
              {/* Badge indicator */}
              <View style={[styles.badge, { backgroundColor: `${slide.accent}20` }]}>
                <ThemedText style={[styles.badgeText, { color: slide.accent }]}>
                  {index + 1} of {SLIDES.length}
                </ThemedText>
              </View>

              <ThemedText type="title" style={styles.title}>
                {slide.title}
              </ThemedText>
              
              <ThemedText style={styles.subtitle}>
                {slide.subtitle}
              </ThemedText>

              <View style={styles.artContainer}>
                {/* Animated background elements */}
                <Animated.View 
                  style={[
                    styles.backgroundShape, 
                    { 
                      backgroundColor: `${slide.accent}12`,
                      transform: [{ translateY: bobAnimation }],
                    }
                  ]} 
                />
                <Animated.View 
                  style={[
                    styles.backgroundSquare, 
                    { 
                      borderColor: `${slide.accent}30`,
                      transform: [
                        { rotate: '15deg' },
                        { scale: scaleAnimation },
                      ],
                    }
                  ]} 
                />
                <Animated.View 
                  style={[
                    styles.backgroundCircle, 
                    { 
                      borderColor: `${slide.accent}20`,
                      transform: [{ rotate }],
                    }
                  ]} 
                />
                
                <Animated.View 
                  style={[
                    styles.artWrapper,
                    { 
                      transform: [
                        { translateY: bobAnimation },
                        { scale: scaleAnimation },
                      ],
                    }
                  ]}
                >
                  <SvgXml 
                    xml={ICONS[slide.icon]} 
                    width={280} 
                    height={280}
                    color={iconColor}
                  />
                </Animated.View>
              </View>
            </Animated.View>
          </View>
        ))}
      </ScrollView>

      {/* Footer with glassmorphism */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.footerContent}>
          {/* Modern dots indicator */}
          <View style={styles.dotsContainer}>
            {SLIDES.map((slide, index) => {
              const isActive = index === currentIndex;
              return (
                <Animated.View
                  key={`${slide.key}-${index}`}
                  style={[
                    styles.dot,
                    { 
                      backgroundColor: isActive 
                        ? currentAccent
                        : `${textColor}20`,
                      width: isActive ? 24 : 8,
                    },
                  ]}
                />
              );
            })}
          </View>

          {/* Navigation Buttons */}
          <View style={styles.actions}>
            <AppButton
              accessibilityLabel="Back"
              title="Back"
              variant="ghost"
              disabled={isFirstSlide}
              onPress={handleBack}
              style={[
                styles.backButton,
                { opacity: isFirstSlide ? 0 : 1 }
              ]}
            />

            <AppButton
              accessibilityLabel={isLastSlide ? 'Get Started' : 'Next'}
              title={isLastSlide ? 'Get Started' : 'Next'}
              variant="primary"
              onPress={handleNext}
              style={styles.nextButton}
            />
          </View>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  gradientCircle: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    top: -100,
    right: -100,
  },
  gradientCircle2: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    bottom: -50,
    left: -50,
  },
  scrollContent: {
    alignItems: 'stretch',
  },
  slide: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 100,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    gap: 20,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  artContainer: {
    marginTop: 48,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  backgroundShape: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 170,
  },
  backgroundSquare: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 32,
    borderWidth: 2,
  },
  backgroundCircle: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 1,
  },
  artWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  title: {
    fontSize: 36,
    lineHeight: 42,
    textAlign: 'center',
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 26,
    opacity: 0.7,
    textAlign: 'center',
    maxWidth: '90%',
  },
  footer: {
    paddingHorizontal: 24,
  },
  footerContent: {
    gap: 28,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 32,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  backButton: {
    minWidth: 100,
  },
  nextButton: {
    flex: 1,
    minWidth: 180,
  },
});