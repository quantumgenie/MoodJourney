import React from 'react';
import { TextInput, TextInputProps, ViewStyle } from 'react-native';

interface AnimatedTextInputProps extends TextInputProps {
  delay?: number;
  animationType?: 'fadeInDown' | 'slideInUp';
  duration?: number;
  containerStyle?: ViewStyle;
}

export const AnimatedTextInputComponent: React.FC<AnimatedTextInputProps> = ({
  delay = 0,
  animationType = 'fadeInDown',
  duration = 600,
  containerStyle,
  ...props
}) => {
  // For Snack compatibility, just render regular TextInput without animations
  return (
    <TextInput
      style={[containerStyle, props.style]}
      {...props}
    />
  );
};
