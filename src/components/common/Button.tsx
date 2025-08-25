import React from 'react';
import { 
  TouchableOpacity, 
  StyleSheet, 
  TouchableOpacityProps,
  ActivityIndicator,
} from 'react-native';
import { theme } from '../../theme/theme';
import { Typography } from './Typography';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  color?: keyof typeof theme.colors;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'contained',
  size = 'medium',
  color = 'primary',
  loading = false,
  disabled,
  style,
  children,
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        styles[size],
        variant === 'contained' && { backgroundColor: theme.colors[color] },
        variant === 'outlined' && { borderColor: theme.colors[color] },
        isDisabled && styles.disabled,
        style,
      ]}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'contained' ? theme.colors.surface : theme.colors[color]} 
        />
      ) : (
        <Typography
          variant="body2"
          color={variant === 'contained' ? 'surface' : color}
          centered
        >
          {children}
        </Typography>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contained: {
    elevation: 2,
    shadowColor: theme.colors.onSurface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  outlined: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  text: {
    backgroundColor: 'transparent',
  },
  small: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    minWidth: 64,
  },
  medium: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    minWidth: 80,
  },
  large: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    minWidth: 96,
  },
  disabled: {
    opacity: 0.6,
  },
});
