import React from 'react';
import { View } from 'react-native';
import { theme } from '../../theme/theme';

interface SpacerProps {
  size?: keyof typeof theme.spacing;
  horizontal?: boolean;
}

export const Spacer: React.FC<SpacerProps> = ({ size = 'md', horizontal = false }) => {
  return (
    <View
      style={
        horizontal
          ? { width: theme.spacing[size] }
          : { height: theme.spacing[size] }
      }
    />
  );
};
