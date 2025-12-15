import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { RefreshControl as RNRefreshControl, RefreshControlProps } from 'react-native';

/**
 * Themed refresh control component
 */
export function RefreshControl(props: Omit<RefreshControlProps, 'colors' | 'tintColor'>) {
  const tintColor = useThemeColor({}, 'tint');

  return (
    <RNRefreshControl
      {...props}
      tintColor={tintColor}
      colors={[tintColor]}
    />
  );
}
