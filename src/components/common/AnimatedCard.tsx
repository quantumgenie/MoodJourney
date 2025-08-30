import React from 'react';
import { ViewStyle } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay,
  FadeInDown,
  SlideInUp,
} from 'react-native-reanimated';
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
  const getEnteringAnimation = () => {
    switch (animationType) {
      case 'slideInUp':
        return SlideInUp.delay(delay).duration(duration);
      case 'scale':
        return FadeInDown.delay(delay).duration(duration).springify();
      case 'fadeInDown':
      default:
        return FadeInDown.delay(delay).duration(duration);
    }
  };

  return (
    <Animated.View entering={getEnteringAnimation()}>
      <Card style={style} variant={variant} padding={padding} {...props}>
        {children}
      </Card>
    </Animated.View>
  );
};
