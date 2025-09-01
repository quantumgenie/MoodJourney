/**
 * Snack-compatible animation components
 * Provides simple fallbacks without animations for Snack compatibility
 */

import React from 'react';
import { View, ViewStyle } from 'react-native';

// Simple view that just shows content (no animation for Snack compatibility)
export const FadeInView: React.FC<{
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: ViewStyle;
}> = ({ children, style }) => {
  return <View style={style}>{children}</View>;
};

// Simple view that just shows content (no animation for Snack compatibility)
export const SlideInView: React.FC<{
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: ViewStyle;
}> = ({ children, style }) => {
  return <View style={style}>{children}</View>;
};

// Fallback for complex animations - just show without animation
export const SimpleAnimatedView: React.FC<{
  children: React.ReactNode;
  style?: ViewStyle;
  entering?: any; // Ignore reanimated entering prop
}> = ({ children, style }) => {
  return <View style={style}>{children}</View>;
};
