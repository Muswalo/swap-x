import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

export type Ministry = { id: string; name: string };

export type MinistryChipsProps = {
  ministries: Ministry[];
  selectedId: string;
  onSelect: (id: string) => void;
  title?: string;
};

export function MinistryChips({
  ministries,
  selectedId,
  onSelect,
  title = "Ministries",
}: MinistryChipsProps) {
  const text = useThemeColor({}, "text");
  const tint = useThemeColor({}, "tint");
  const border = `${text}20`;

  return (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.list}
      >
        {ministries.map((m) => {
          const isSelected = selectedId === m.id;
          return (
            <Pressable
              key={m.id}
              style={[
                styles.chip,
                { borderColor: isSelected ? tint : border },
                isSelected && { backgroundColor: `${tint}15` },
              ]}
              onPress={() => onSelect(m.id)}
            >
              <ThemedText
                style={[
                  styles.chipText,
                  isSelected && { color: tint, fontWeight: "600" },
                ]}
              >
                {m.name}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
    gap: 12
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700"
  },
  list: {
    flexDirection: "row"
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
  },
  chipText: {
    fontSize: 14
  },
});
