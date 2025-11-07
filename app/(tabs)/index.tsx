import SwapPreferenceCard from "@/components/home/FilterCard";
import { HomeHeader } from "@/components/home/HomeHeader";
import { MinistryChips } from "@/components/home/MinistryChips";
import { SearchBar } from "@/components/home/SearchBar";
import { SwapCard } from "@/components/home/SwapCard";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { supabase } from "@/lib/supabase";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type User = {
  email: string;
  user_metadata: {
    first_name?: string;
    last_name?: string;
  };
};

type Ministry = {
  id: string;
  name: string;
};

type Swap = {
  id: string;
  posterName: string;
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
    currentMinistry: "Health",
    desiredMinistry: "Education",
    currentLocation: "Lusaka",
    desiredLocation: "Ndola",
    postedDate: "2 days ago",
  },
  {
    id: "2",
    posterName: "Mary Phiri",
    currentMinistry: "Finance",
    desiredMinistry: "Agriculture",
    currentLocation: "Kitwe",
    desiredLocation: "Chipata",
    postedDate: "5 days ago",
  },
  {
    id: "3",
    posterName: "Peter Mwansa",
    currentMinistry: "Education",
    desiredMinistry: "Health",
    currentLocation: "Ndola",
    desiredLocation: "Lusaka",
    postedDate: "1 week ago",
  },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");
  const tint = useThemeColor({}, "tint");
  const border = `${text}20`;
  const cardBg = `${text}0A`;

  const [user, setUser] = useState<User | null>(null);
  const [selectedMinistry, setSelectedMinistry] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterFrom, setFilterFrom] = useState("Any Location");
  const [filterTo, setFilterTo] = useState("Any Location");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUser(data.user as any);
    })();
  }, []);

  const userName =
    user?.user_metadata?.first_name && user?.user_metadata?.last_name
      ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
      : user?.email?.split("@")[0] || "User";

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    userName
  )}&background=random&size=128&bold=true`;

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
        onPressChat={() => { }}
        onPressNotifications={() => { }}
        hasNotifications
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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

        {/* Ministry Tabs */}
        <MinistryChips
          ministries={MINISTRIES}
          selectedId={selectedMinistry}
          onSelect={setSelectedMinistry}
        />

        {/* Swaps List */}
        <View style={styles.swapsSection}>
          <View style={styles.swapsSectionHeader}>
            <ThemedText style={styles.sectionTitle}>Available Swaps</ThemedText>
            <Pressable
              style={({ pressed }) => [
                styles.filterButton,
                {
                  borderColor: border,
                  backgroundColor: pressed ? `${tint}15` : 'transparent',
                  opacity: pressed ? 0.8 : 1,
                }
              ]}
            >
              <Feather name="sliders" size={16} color={tint} />
            </Pressable>
          </View>
          {MOCK_SWAPS.map((swap) => (
            <SwapCard
              key={swap.id}
              id={swap.id}
              posterName={swap.posterName}
              currentMinistry={swap.currentMinistry}
              desiredMinistry={swap.desiredMinistry}
              currentLocation={swap.currentLocation}
              desiredLocation={swap.desiredLocation}
              postedDate={swap.postedDate}
              avatarUri={`https://api.dicebear.com/7.x/initials/png?seed=${encodeURIComponent(
                swap.posterName
              )}`}
              onPress={() => { }}
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
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
