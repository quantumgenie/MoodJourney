import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Typography, Spacer } from './index';
import { theme } from '../../theme/theme';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
  centered?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 'large',
  centered = true,
}) => {
  return (
    <View style={[styles.container, centered && styles.centered]}>
      <ActivityIndicator 
        size={size} 
        color={theme.colors.primary} 
      />
      {message && (
        <>
          <Spacer size="sm" />
          <Typography variant="body2" color="disabled" centered>
            {message}
          </Typography>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

