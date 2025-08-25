import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { theme } from '../../theme/theme';

interface CardProps extends ViewProps {
  variant?: 'elevated' | 'outlined';
  padding?: keyof typeof theme.spacing;
}

export const Card: React.FC<CardProps> = ({
  variant = 'elevated',
  padding = 'md',
  style,
  children,
  ...props
}) => {
  return (
    <View
      style={[
        styles.base,
        styles[variant],
        { padding: theme.spacing[padding] },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    marginVertical: theme.spacing.sm,
  },
  elevated: {
    elevation: 2,
    shadowColor: theme.colors.onSurface,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  outlined: {
    borderWidth: 1,
    borderColor: theme.colors.onSurface + '20', // 20 is hex for 12% opacity
  },
});
