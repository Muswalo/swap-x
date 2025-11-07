import { useThemeColor } from '@/hooks/use-theme-color';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

export type SearchBarProps = {
  value: string;
  placeholder?: string;
  onChangeText: (t: string) => void;
  onClear?: () => void;
};

export function SearchBar({ value, placeholder = 'Search...', onChangeText, onClear }: SearchBarProps) {
  const text = useThemeColor({}, 'text');
  const border = `${text}15`;
  const cardBg = useThemeColor({}, 'background');
  return (
    <View style={[styles.bar, { backgroundColor: cardBg, borderColor: border }]}>
      <Feather name="search" size={20} color={`${text}66`} />
      <TextInput
        style={[styles.input, { color: text }]}
        placeholder={placeholder}
        placeholderTextColor={`${text}66`}
        value={value}
        onChangeText={onChangeText}
      />
      {value ? (
        <Pressable onPress={onClear}>
          <Feather name="x-circle" size={18} color={`${text}66`} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 62,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 20,
    gap: 10
  },
  input: {
    flex: 1,
    fontSize: 15
  },
});
