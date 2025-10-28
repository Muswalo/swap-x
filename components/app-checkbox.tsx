import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useThemeColor } from '@/hooks/use-theme-color';

export type AppCheckboxProps = {
  checked: boolean;
  onChange?: (val: boolean) => void;
  style?: ViewStyle | ViewStyle[];
};

export function AppCheckbox({ checked, onChange, style }: AppCheckboxProps) {
  const tint = useThemeColor({}, 'tint');
  const text = useThemeColor({}, 'text');
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={() => onChange?.(!checked)}
      style={[
        styles.box,
        { borderColor: `${text}33`, backgroundColor: checked ? `${text}1A` : 'transparent' },
        style,
      ]}
    >
      {checked ? <Feather name="check" size={16} color={tint} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
