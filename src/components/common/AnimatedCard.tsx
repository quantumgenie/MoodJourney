import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Card } from './Card';
import { CardProps } from './Card';

interface AnimatedCardProps {
  delay?: number;
  animationType?: 'fadeInDown' | 'slideInUp' | 'scale';
  duration?: number;
  children?: React.ReactNode;
  style?: any;
  variant?: 'elevated' | 'outlined';
  padding?: keyof typeof import('../../theme/theme').theme.spacing;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  delay = 0,
  animationType = 'fadeInDown',
  duration = 600,
  style,
  variant,
  padding,
  ...props
}) => {
  // For Snack compatibility, just render the card without animations
  return (
    <View>
      <Card style={style} variant={variant} padding={padding} {...props}>
        {children}
      </Card>
    </View>
  );
};
