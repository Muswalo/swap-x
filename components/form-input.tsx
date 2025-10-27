import React, { useState } from 'react';
import { View, TextInput, StyleSheet, ViewStyle, TextInputProps, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useThemeColor } from '@/hooks/use-theme-color';

export type FormInputProps = TextInputProps & {
  icon?: keyof typeof Feather.glyphMap;
  secureToggle?: boolean;
  containerStyle?: ViewStyle | ViewStyle[];
};

export function FormInput({ icon, secureTextEntry, secureToggle, containerStyle, style, ...rest }: FormInputProps) {
  const [hidden, setHidden] = useState(!!secureTextEntry);
  const bg = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const border = `${text}33`;
  const fill = `${text}0F`;

  return (
    <View style={[styles.wrap, { borderColor: border, backgroundColor: fill }, containerStyle]}> 
      {icon ? (
        <Feather name={icon} size={20} color={`${text}CC`} style={styles.leftIcon} />
      ) : null}
      <TextInput
        placeholderTextColor={`${text}66`}
        style={[styles.input, { color: text }, style]}
        secureTextEntry={secureToggle ? hidden : secureTextEntry}
        {...rest}
      />
      {secureToggle ? (
        <Pressable onPress={() => setHidden((v) => !v)} hitSlop={10} style={styles.rightIconWrap}>
          <Feather name={hidden ? 'eye' : 'eye-off'} size={20} color={`${text}99`} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  rightIconWrap: {
    marginLeft: 8,
  },
});
