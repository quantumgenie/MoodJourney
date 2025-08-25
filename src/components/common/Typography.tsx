import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { theme } from '../../theme/theme';

interface TypographyProps extends TextProps {
  variant?: keyof typeof theme.typography;
  color?: keyof typeof theme.colors;
  centered?: boolean;
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body1',
  color = 'text',
  centered = false,
  style,
  children,
  ...props
}) => {
  return (
    <Text
      style={[
        styles[variant],
        { color: theme.colors[color] },
        centered && { textAlign: 'center' },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  h1: {
    ...theme.typography.h1,
  },
  h2: {
    ...theme.typography.h2,
  },
  h3: {
    ...theme.typography.h3,
  },
  body1: {
    ...theme.typography.body1,
  },
  body2: {
    ...theme.typography.body2,
  },
  caption: {
    ...theme.typography.caption,
  },
});
