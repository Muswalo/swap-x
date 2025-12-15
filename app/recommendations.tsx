import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SwapCard } from '@/components/home/SwapCard';
import { SwapCardSkeleton } from '@/components/home/SwapCardSkeleton';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { swapUtils, type SwapWithProfile } from '@/lib/database.utils';
import { supabase } from '@/lib/supabase';
import { Feather } from '@expo/vector-icons';

const getAvatarUrl = (profile: { first_name: string | null; last_name: string | null; profile_photo_url: string | null }) => {
  if (profile.profile_photo_url) {
    return profile.profile_photo_url;
  }
  const name = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=128&bold=true`;
};

const formatPostedDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
};

export default function RecommendationsScreen() {
  const insets = useSafeAreaInsets();
  const bg = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  
  const [recommendations, setRecommendations] = useState<SwapWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setUserProfile(profileData);

      // Load all swaps
      const swaps = await swapUtils.getSwaps();
      const otherSwaps = swaps.filter(swap => swap.user_id !== user.id);

      // Calculate recommendations based on similar preferences
      if (profileData) {
        const recommended = otherSwaps.filter(swap => {
          // Recommend based on similar ministry or nearby districts
          const ministryMatch = swap.current_ministry === profileData.current_ministry;
          const desiredMinistryMatch = swap.desired_ministry === profileData.current_ministry;
          const locationSimilarity = swap.desired_district === profileData.desired_district;
          
          return ministryMatch || desiredMinistryMatch || locationSimilarity;
        });
        
        // If no specific matches, show recent swaps
        if (recommended.length === 0) {
          setRecommendations(otherSwaps.slice(0, 10));
        } else {
          setRecommendations(recommended);
        }
      } else {
        setRecommendations(otherSwaps.slice(0, 10));
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwapCardPress = (swapId: string, posterName: string) => {
    router.push({
      pathname: '/swap-details',
      params: { swapId, posterName }
    });
  };

  const getProfile = (swap: SwapWithProfile) => {
    if (!swap.profile) return null;
    return Array.isArray(swap.profile) ? swap.profile[0] : swap.profile;
  };

  const renderSwapCard = ({ item }: { item: SwapWithProfile }) => {
    const profile = getProfile(item);
    if (!profile) return null;
    
    const posterName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User';
    
    return (
      <SwapCard
        id={item.id}
        posterName={posterName}
        role={item.job_title}
        currentMinistry={item.current_ministry}
        desiredMinistry={item.desired_ministry || 'Any'}
        currentLocation={item.current_district}
        desiredLocation={item.desired_district}
        postedDate={formatPostedDate(item.created_at || new Date().toISOString())}
        avatarUri={getAvatarUrl(profile)}
        onPress={() => handleSwapCardPress(item.id, posterName)}
      />
    );
  };

  const renderSkeleton = () => (
    <View>
      {[1, 2, 3, 4, 5].map((item) => (
        <SwapCardSkeleton key={item} />
      ))}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Feather name="compass" size={48} color={`${text}40`} />
      <ThemedText style={[styles.emptyStateText, { color: `${text}77` }]}>
        No recommendations available
      </ThemedText>
      <ThemedText style={[styles.emptyStateSubtext, { color: `${text}60` }]}>
        Complete your profile to get personalized recommendations
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor: bg, paddingTop: insets.top }]}>
      <ScreenHeader
        title="Recommendations"
        subtitle="Suggested swaps based on your preferences"
        onBackPress={() => router.back()}
      />

      {isLoading ? (
        <View style={styles.content}>
          {renderSkeleton()}
        </View>
      ) : (
        <FlatList
          data={recommendations}
          renderItem={renderSwapCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});