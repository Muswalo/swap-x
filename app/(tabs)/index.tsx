import SwapPreferenceCard from "@/components/home/FilterCard";
import { HomeHeader } from "@/components/home/HomeHeader";
import { HomeScreenSkeleton } from "@/components/home/HomeScreenSkeleton";
import { MinistryChips } from "@/components/home/MinistryChips";
import { QuickActions } from "@/components/home/QuickActions";
import { SearchBar } from "@/components/home/SearchBar";
import { SwapCard } from "@/components/home/SwapCard";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { supabase } from "@/lib/supabase";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Redirect, useRouter } from "expo-router";
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

type Swap = {
  id: string;
  posterName: string;
  role: string;
  currentMinistry: string;
  desiredMinistry: string;
  currentLocation: string;
  desiredLocation: string;
  postedDate: string;
};

const MINISTRIES: Ministry[] = [
  { id: "all", name: "All" },
  { id: "health", name: "Health" },
  { id: "education", name: "Education" },
  { id: "finance", name: "Finance" },
  { id: "agriculture", name: "Agriculture" },
  { id: "home-affairs", name: "Home Affairs" },
  { id: "lands", name: "Lands" },
  { id: "justice", name: "Justice" },
];

const MOCK_SWAPS: Swap[] = [
  {
    id: "1",
    posterName: "John Banda",
    role: "Teacher",
    currentMinistry: "Ministry of Health",
    desiredMinistry: "Education",
    currentLocation: "Lusaka",
    desiredLocation: "Ndola",
    postedDate: "2 days ago",
  },
  {
    id: "2",
    posterName: "Mary Phiri",
    role: "Nurse",
    currentMinistry: "Ministry of Finance",
    desiredMinistry: "Agriculture",
    currentLocation: "Kitwe",
    desiredLocation: "Chipata",
    postedDate: "5 days ago",
  },
  {
    id: "3",
    posterName: "Peter Mwansa",
    role: "Officer",
    currentMinistry: "Ministry of Education",
    desiredMinistry: "Health",
    currentLocation: "Ndola",
    desiredLocation: "Lusaka",
    postedDate: "1 week ago",
  },
  {
    id: "4",
    posterName: "Sarah Chibwe",
    role: "Inspector",
    currentMinistry: "Ministry of Agriculture",
    desiredMinistry: "Finance",
    currentLocation: "Livingstone",
    desiredLocation: "Kitwe",
    postedDate: "3 days ago",
  },
  {
    id: "5",
    posterName: "David Moyo",
    role: "Technician",
    currentMinistry: "Ministry of Health",
    desiredMinistry: "Education",
    currentLocation: "Kasama",
    desiredLocation: "Lusaka",
    postedDate: "4 days ago",
  },
];

const EXACT_MATCHES: Swap[] = MOCK_SWAPS.slice(0, 5);
const RECOMMENDATIONS: Swap[] = MOCK_SWAPS.slice(0, 5);

const getAvatarUrl = (posterName: string) => {
  const firstName = posterName.split(' ')[0];
  const initials = firstName + '.';
  return `https://api.dicebear.com/7.x/initials/png?seed=${encodeURIComponent(initials)}&backgroundColor=random&bold=true`;
};

const handleCreateSwap = () => {
  console.log('Navigate to create swap');
};

const handleViewMySwaps = () => {
  console.log('Navigate to my swaps');
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


  useEffect(() => {
    checkProfileStatus();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadUnreadNotificationCount();
    }, [])
  );

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
          .select('profile_completed')
          .eq('user_id', data.user.id)
          .single();
        const profileCompleted = profileData?.profile_completed ?? false;

        setHasCompletedProfile(profileCompleted);
      }
    } catch (error) {
      console.error('Error checking profile status:', error);
      setHasCompletedProfile(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Simulate refresh delay
      await new Promise(resolve => setTimeout(resolve, 500));
      // Refresh profile status and swaps data
      await checkProfileStatus();
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setIsRefreshing(false);
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
          currentLocation={filterFrom}
          desiredLocation={filterTo}
          onEdit={() => { }}
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
            >
              <Feather name="arrow-right" size={18} color={tint} />
            </Pressable>
          </View>
          {EXACT_MATCHES.map((swap) => (
            <SwapCard
              key={swap.id}
              id={swap.id}
              posterName={swap.posterName}
              role={swap.role}
              currentMinistry={swap.currentMinistry}
              desiredMinistry={swap.desiredMinistry}
              currentLocation={swap.currentLocation}
              desiredLocation={swap.desiredLocation}
              postedDate={swap.postedDate}
              avatarUri={getAvatarUrl(swap.posterName)}
              onPress={() => handleSwapCardPress(swap.id, swap.posterName)}
            />
          ))}
        </View>

        {/* Recommendations Section */}
        <View style={styles.swapsSection}>
          <View style={styles.swapsSectionHeader}>
            <View>
              <ThemedText style={styles.sectionTitle}>Recommended</ThemedText>
              <ThemedText style={[styles.sectionSubtitle, { color: `${text}77` }]}>
                Suggested by our AI matching algorithm
              </ThemedText>
            </View>
            <Pressable
              style={({ pressed }) => [{
                opacity: pressed ? 0.7 : 1,
              }]}
            >
              <Feather name="arrow-right" size={18} color={tint} />
            </Pressable>
          </View>
          {RECOMMENDATIONS.map((swap) => (
            <SwapCard
              key={swap.id}
              id={swap.id}
              posterName={swap.posterName}
              role={swap.role}
              currentMinistry={swap.currentMinistry}
              desiredMinistry={swap.desiredMinistry}
              currentLocation={swap.currentLocation}
              desiredLocation={swap.desiredLocation}
              postedDate={swap.postedDate}
              avatarUri={getAvatarUrl(swap.posterName)}
              onPress={() => handleSwapCardPress(swap.id, swap.posterName)}
            />
          ))}
        </View>
      </ScrollView>
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
});