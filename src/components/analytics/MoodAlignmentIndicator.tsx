import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Path, Text } from 'react-native-svg';
import { theme } from '../../theme/theme';
import { Typography } from '../common';

interface MoodAlignmentIndicatorProps {
  alignment: number; // 0 to 1
  size?: number;
}

export const MoodAlignmentIndicator: React.FC<MoodAlignmentIndicatorProps> = ({
  alignment,
  size = 150,
}) => {
  // Ensure alignment is a valid number between 0 and 1
  const safeAlignment = isFinite(alignment) ? Math.max(0, Math.min(1, alignment)) : 0;
  
  const center = size / 2;
  const radius = (size / 2) * 0.8;
  const strokeWidth = size * 0.05;
  
  // Calculate the arc path for the gauge
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    // Ensure all inputs are finite numbers
    if (!isFinite(centerX) || !isFinite(centerY) || !isFinite(radius) || !isFinite(angleInDegrees)) {
      return { x: centerX, y: centerY };
    }
    
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    const x = centerX + (radius * Math.cos(angleInRadians));
    const y = centerY + (radius * Math.sin(angleInRadians));
    
    return {
      x: isFinite(x) ? x : centerX,
      y: isFinite(y) ? y : centerY,
    };
  };

  const createArc = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(center, center, radius, endAngle);
    const end = polarToCartesian(center, center, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
      "M", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    ].join(" ");
  };

  const startAngle = 180;
  const endAngle = 180 + (safeAlignment * 180);

  return (
    <View style={styles.container}>
      <Typography variant="h3" centered>Mood Alignment</Typography>
      <Svg width={size} height={size}>
        {/* Background arc */}
        <Path
          d={createArc(180, 360)}
          stroke={theme.colors.disabled + '30'}
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Alignment arc */}
        <Path
          d={createArc(startAngle, endAngle)}
          stroke={theme.colors.primary}
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Center text */}
        <Text
          x={center}
          y={center}
          fontSize={size * 0.2}
          fill={theme.colors.text}
          textAnchor="middle"
          alignmentBaseline="middle"
        >
          {`${Math.round(safeAlignment * 100)}%`}
        </Text>
      </Svg>
      <Typography variant="body2" centered color="disabled">
        How well your journal emotions align with your selected moods
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
  },
});
