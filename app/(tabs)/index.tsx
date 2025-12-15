import SwapPreferenceCard from "@/components/home/FilterCard";
import { HomeHeader } from "@/components/home/HomeHeader";
import { HomeScreenSkeleton } from "@/components/home/HomeScreenSkeleton";
import { MinistryChips } from "@/components/home/MinistryChips";
import { PreferencesEditModal } from "@/components/home/PreferencesEditModal";
import { QuickActions } from "@/components/home/QuickActions";
import { SearchBar } from "@/components/home/SearchBar";
import { SwapCard } from "@/components/home/SwapCard";
import { SwapCardSkeleton } from "@/components/home/SwapCardSkeleton";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { profileUtils, realtimeUtils, swapUtils, type SwapWithProfile } from "@/lib/database.utils";
import { supabase } from "@/lib/supabase";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Redirect, router, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type User = {
  email: string;
  user_metadata: {
    first_name?: string;
    last_name?: string;
    profile_completed?: boolean;
  };
};

type Ministry = {
  id: string;
  name: string;
};

const MINISTRIES: Ministry[] = [
  { id: "all", name: "All" },
  { id: "Health", name: "Health" },
  { id: "Education", name: "Education" },
  { id: "Finance", name: "Finance" },
  { id: "Agriculture", name: "Agriculture" },
  { id: "Home Affairs", name: "Home Affairs" },
  { id: "Lands", name: "Lands" },
  { id: "Justice", name: "Justice" },
  { id: "Local Government", name: "Local Gov" },
  { id: "Transport", name: "Transport" },
  { id: "Energy", name: "Energy" },
  { id: "Water & Sanitation", name: "Water" },
  { id: "Commerce", name: "Commerce" },
  { id: "Tourism", name: "Tourism" },
  { id: "Labour", name: "Labour" },
  { id: "Sports", name: "Sports" },
];

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

const handleCreateSwap = () => {
  router.push('/profile-setup');
};

const handleViewMySwaps = () => {
  router.push('/my-swaps');
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");
  const tint = useThemeColor({}, "tint");
  const border = `${text}20`;
  const cardBg = `${text}0A`;

  const handleSwapCardPress = (swapId: string, posterName: string) => {
    router.push({
      pathname: '/swap-details',
      params: { swapId, posterName }
    });
  };

  const [user, setUser] = useState<User | null>(null);
  const [selectedMinistry, setSelectedMinistry] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterFrom, setFilterFrom] = useState("Any Location");
  const [filterTo, setFilterTo] = useState("Any Location");
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedProfile, setHasCompletedProfile] = useState<boolean | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [allSwaps, setAllSwaps] = useState<SwapWithProfile[]>([]);
  const [exactMatches, setExactMatches] = useState<SwapWithProfile[]>([]);
  const [recommendations, setRecommendations] = useState<SwapWithProfile[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [swapsLoading, setSwapsLoading] = useState(false);


  useEffect(() => {
    checkProfileStatus();
  }, []);

  useEffect(() => {
    if (hasCompletedProfile) {
      loadSwaps();
    }
  }, [selectedMinistry, searchQuery, hasCompletedProfile]);

  useFocusEffect(
    React.useCallback(() => {
      loadUnreadNotificationCount();
      if (hasCompletedProfile) {
        loadSwaps();
      }
    }, [hasCompletedProfile])
  );

  // Set up real-time subscription for swap updates
  useEffect(() => {
    if (!hasCompletedProfile) return;

    const channel = realtimeUtils.subscribeToSwaps((swap) => {
      // Reload swaps when a new swap is created or updated
      loadSwaps();
    });

    return () => {
      realtimeUtils.unsubscribe(channel);
    };
  }, [hasCompletedProfile]);

  // Set up real-time subscription for notifications
  useEffect(() => {
    const setupNotificationSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel('user-notifications')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            // Reload notification count when notifications change
            loadUnreadNotificationCount();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupNotificationSubscription();
  }, []);

  const loadUnreadNotificationCount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .is('read_at', null);

      if (error) throw error;
      setUnreadNotificationCount(count || 0);
    } catch (error) {
      console.error('Error loading unread notification count:', error);
    }
  };

  const checkProfileStatus = async () => {
    try {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user as any);

        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', data.user.id)
          .single();
        const profileCompleted = profileData?.profile_completed ?? false;

        setHasCompletedProfile(profileCompleted);
        setUserProfile(profileData);
      }
    } catch (error) {
      console.error('Error checking profile status:', error);
      setHasCompletedProfile(false);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSwaps = async () => {
    try {
      setSwapsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Build filters
      const filters: any = {};
      
      if (selectedMinistry !== 'all') {
        filters.ministry = selectedMinistry;
      }
      
      if (searchQuery.trim()) {
        filters.searchQuery = searchQuery.trim();
      }
      console.log ("filters", filters);
      // Load all swaps with filters
      const swaps = await swapUtils.getSwaps(filters);
      console.log ("fetched swaps", swaps)
      // Filter out user's own swaps
      const otherSwaps = swaps.filter(swap => swap.user_id !== user.id);
      console.log ("otherSwaps", otherSwaps)
      setAllSwaps(otherSwaps);

      // Calculate exact matches based on user's profile
      if (userProfile && userProfile.desired_district && userProfile.current_district) {
        const matches = otherSwaps.filter(swap => {
          // Exact match: their current location is user's desired, and their desired is user's current
          const locationMatch = 
            swap.current_district === userProfile.desired_district &&
            swap.desired_district === userProfile.current_district;
          
          const ministryMatch = 
            userProfile.current_ministry && swap.current_ministry === userProfile.current_ministry;
          
          return locationMatch || ministryMatch;
        });
        setExactMatches(matches.slice(0, 5));

        // Calculate recommendations based on similar preferences
        const recommended = otherSwaps.filter(swap => {
          const ministryMatch = userProfile.current_ministry && swap.current_ministry === userProfile.current_ministry;
          const desiredMinistryMatch = userProfile.current_ministry && swap.desired_ministry === userProfile.current_ministry;
          const locationSimilarity = userProfile.desired_district && swap.desired_district === userProfile.desired_district;
          
          return ministryMatch || desiredMinistryMatch || locationSimilarity;
        });
        
        // If no specific recommendations, show all swaps as recommendations
        if (recommended.length === 0) {
          setRecommendations(otherSwaps.slice(0, 5));
        } else {
          setRecommendations(recommended.slice(0, 5));
        }
      } else {
        // No user profile preferences set, show all swaps
        setExactMatches([]);
        setRecommendations(otherSwaps.slice(0, 10));
      }
    } catch (error) {
      console.error('Error loading swaps:', error);
    } finally {
      setSwapsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Refresh profile status and swaps data
      await checkProfileStatus();
      await loadSwaps();
      await loadUnreadNotificationCount();
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePreferencesSave = async (preferences: {
    currentLocation: string;
    desiredLocation: string;
    currentMinistry?: string;
    desiredMinistry?: string;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update user profile with new preferences
      const updates = {
        current_district: preferences.currentLocation,
        desired_district: preferences.desiredLocation,
        current_ministry: preferences.currentMinistry,
        desired_ministry: preferences.desiredMinistry,
      };

      await profileUtils.updateProfile(user.id, updates);
      
      // Update local state
      setUserProfile((prev: any) => ({ ...prev, ...updates }));
      setFilterFrom(preferences.currentLocation);
      setFilterTo(preferences.desiredLocation);
      
      // Reload swaps with new preferences
      await loadSwaps();
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const userName =
    user?.user_metadata?.first_name && user?.user_metadata?.last_name
      ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
      : user?.email?.split("@")[0] || "User";

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    userName
  )}&background=random&size=128&bold=true`;

  // Show skeleton while loading
  if (isLoading) {
    return <HomeScreenSkeleton />;
  }

  // Redirect to profile setup if not completed
  if (hasCompletedProfile === false) {
    return <Redirect href="/profile-setup" />;
  }

  // Helper function to safely get profile data
  const getProfile = (swap: SwapWithProfile) => {
    if (!swap.profile) return null;
    // Handle both single profile and array of profiles
    return Array.isArray(swap.profile) ? swap.profile[0] : swap.profile;
  };

  // Show normal home screen
  return (
    <ThemedView
      style={[
        styles.container,
        { backgroundColor: bg, paddingTop: insets.top },
      ]}
    >
      <HomeHeader
        userName={userName}
        email={user?.email || ""}
        avatarUrl={avatarUrl}
        onPressAvatar={() => router.push('/profile')}
        onPressChat={() => router.push('/messages')}
        onPressNotifications={() => router.push('/notifications')}
        hasNotifications={unreadNotificationCount > 0}
        notificationCount={unreadNotificationCount}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={tint}
          />
        }
      >
        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery("")}
          placeholder="Search swaps, ministries, locations..."
        />

        {/* Filter Card */}
        <SwapPreferenceCard
          currentLocation={userProfile?.current_district || filterFrom}
          desiredLocation={userProfile?.desired_district || filterTo}
          onEdit={() => setShowPreferencesModal(true)}
        />

        {/* Quick Actions */}
        <QuickActions
          onCreateSwap={handleCreateSwap}
          onViewMySwaps={handleViewMySwaps}
        />

        {/* Ministry Tabs */}
        <MinistryChips
          ministries={MINISTRIES}
          selectedId={selectedMinistry}
          onSelect={setSelectedMinistry}
        />

        {/* Exact Matches Section */}
        {swapsLoading ? (
          <View style={styles.swapsSection}>
            <View style={styles.swapsSectionHeader}>
              <View>
                <ThemedText style={styles.sectionTitle}>Exact Matches</ThemedText>
                <ThemedText style={[styles.sectionSubtitle, { color: `${text}77` }]}>
                  Perfect swap opportunities
                </ThemedText>
              </View>
            </View>
            {[1, 2, 3].map((item) => (
              <SwapCardSkeleton key={item} />
            ))}
          </View>
        ) : exactMatches.length > 0 ? (
          <View style={styles.swapsSection}>
            <View style={styles.swapsSectionHeader}>
              <View>
                <ThemedText style={styles.sectionTitle}>Exact Matches</ThemedText>
                <ThemedText style={[styles.sectionSubtitle, { color: `${text}77` }]}>
                  Perfect swap opportunities
                </ThemedText>
              </View>
              <Pressable
                style={({ pressed }) => [{
                  opacity: pressed ? 0.7 : 1,
                }]}
                onPress={() => router.push('/exact-matches')}
              >
                <Feather name="arrow-right" size={18} color={tint} />
              </Pressable>
            </View>
            {exactMatches.map((swap) => {
              const profile = getProfile(swap);
              if (!profile) return null;
              
              const posterName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User';
              
              return (
                <SwapCard
                  key={swap.id}
                  id={swap.id}
                  posterName={posterName}
                  role={swap.job_title}
                  currentMinistry={swap.current_ministry}
                  desiredMinistry={swap.desired_ministry || 'Any'}
                  currentLocation={swap.current_district}
                  desiredLocation={swap.desired_district}
                  postedDate={formatPostedDate(swap.created_at || new Date().toISOString())}
                  avatarUri={getAvatarUrl(profile)}
                  onPress={() => handleSwapCardPress(swap.id, posterName)}
                />
              );
            })}
          </View>
        ) : null}

        {/* Recommendations Section - Show all swaps if no specific recommendations */}
        {swapsLoading ? (
          <View style={styles.swapsSection}>
            <View style={styles.swapsSectionHeader}>
              <View>
                <ThemedText style={styles.sectionTitle}>Available Swaps</ThemedText>
                <ThemedText style={[styles.sectionSubtitle, { color: `${text}77` }]}>
                  Browse swap opportunities
                </ThemedText>
              </View>
            </View>
            {[1, 2, 3].map((item) => (
              <SwapCardSkeleton key={item} />
            ))}
          </View>
        ) : (recommendations.length > 0 || allSwaps.length > 0) ? (
          <View style={styles.swapsSection}>
            <View style={styles.swapsSectionHeader}>
              <View>
                <ThemedText style={styles.sectionTitle}>
                  {recommendations.length > 0 ? 'Recommended' : 'Available Swaps'}
                </ThemedText>
                <ThemedText style={[styles.sectionSubtitle, { color: `${text}77` }]}>
                  {recommendations.length > 0 ? 'Suggested swaps for you' : 'Browse swap opportunities'}
                </ThemedText>
              </View>
              <Pressable
                style={({ pressed }) => [{
                  opacity: pressed ? 0.7 : 1,
                }]}
                onPress={() => router.push('/recommendations')}
              >
                <Feather name="arrow-right" size={18} color={tint} />
              </Pressable>
            </View>
            {(recommendations.length > 0 ? recommendations : allSwaps.slice(0, 5)).map((swap) => {
              const profile = getProfile(swap);
              if (!profile) return null;
              
              const posterName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User';
              
              return (
                <SwapCard
                  key={swap.id}
                  id={swap.id}
                  posterName={posterName}
                  role={swap.job_title}
                  currentMinistry={swap.current_ministry}
                  desiredMinistry={swap.desired_ministry || 'Any'}
                  currentLocation={swap.current_district}
                  desiredLocation={swap.desired_district}
                  postedDate={formatPostedDate(swap.created_at || new Date().toISOString())}
                  avatarUri={getAvatarUrl(profile)}
                  onPress={() => handleSwapCardPress(swap.id, posterName)}
                />
              );
            })}
          </View>
        ) : null}

        {/* No Results Message */}
        {!isLoading && !swapsLoading && allSwaps.length === 0 && (
          <View style={styles.emptyState}>
            <Feather name="inbox" size={48} color={`${text}40`} />
            <ThemedText style={[styles.emptyStateText, { color: `${text}77` }]}>
              No swaps found
            </ThemedText>
            <ThemedText style={[styles.emptyStateSubtext, { color: `${text}60` }]}>
              {searchQuery || selectedMinistry !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Be the first to create a swap!'}
            </ThemedText>
          </View>
        )}
      </ScrollView>

      {/* Preferences Edit Modal */}
      <PreferencesEditModal
        isVisible={showPreferencesModal}
        onClose={() => setShowPreferencesModal(false)}
        currentLocation={userProfile?.current_district || ''}
        desiredLocation={userProfile?.desired_district || ''}
        currentMinistry={userProfile?.current_ministry}
        desiredMinistry={userProfile?.desired_ministry}
        onSave={handlePreferencesSave}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 16,
  },
  swapsSection: {
    marginTop: 16,
    gap: 12,
    paddingVertical: 4,
  },
  swapsSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700" },
  sectionSubtitle: { fontSize: 12, fontWeight: "500", marginTop: 2 },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
});