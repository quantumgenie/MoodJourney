import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography, Button, Spacer } from './index';
import { theme } from '../../theme/theme';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
  centered?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'Please try again later.',
  onRetry,
  retryText = 'Try Again',
  centered = true,
}) => {
  return (
    <View style={[styles.container, centered && styles.centered]}>
      <Typography variant="body1" style={styles.errorIcon}>
        ⚠️
      </Typography>
      <Spacer size="sm" />
      <Typography variant="h3" centered>
        {title}
      </Typography>
      <Spacer size="sm" />
      <Typography variant="body2" color="disabled" centered style={styles.message}>
        {message}
      </Typography>
      {onRetry && (
        <>
          <Spacer size="lg" />
          <Button variant="outlined" onPress={onRetry}>
            {retryText}
          </Button>
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
  errorIcon: {
    fontSize: 32,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    maxWidth: 280,
  },
});

