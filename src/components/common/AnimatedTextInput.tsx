import React from 'react';
import { TextInput, TextInputProps, ViewStyle } from 'react-native';
import Animated, { 
  FadeInDown,
  SlideInUp,
} from 'react-native-reanimated';

interface AnimatedTextInputProps extends TextInputProps {
  delay?: number;
  animationType?: 'fadeInDown' | 'slideInUp';
  duration?: number;
  containerStyle?: ViewStyle;
}

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export const AnimatedTextInputComponent: React.FC<AnimatedTextInputProps> = ({
  delay = 0,
  animationType = 'fadeInDown',
  duration = 600,
  containerStyle,
  ...props
}) => {
  const getEnteringAnimation = () => {
    switch (animationType) {
      case 'slideInUp':
        return SlideInUp.delay(delay).duration(duration);
      case 'fadeInDown':
      default:
        return FadeInDown.delay(delay).duration(duration);
    }
  };

  return (
    <AnimatedTextInput
      entering={getEnteringAnimation()}
      style={[containerStyle, props.style]}
      {...props}
    />
  );
};
