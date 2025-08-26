import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Text, Circle } from 'react-native-svg';
import { EmotionCategory } from '../../services/semanticAnalysis/types';
import { theme } from '../../theme/theme';
import { Typography } from '../common';

interface EmotionDistributionChartProps {
  distribution: Record<EmotionCategory, number>;
  width?: number;
  height?: number;
}

const { width: screenWidth } = Dimensions.get('window');

export const EmotionDistributionChart: React.FC<EmotionDistributionChartProps> = ({
  distribution,
  width = screenWidth - theme.spacing.md * 2,
  height = 300,
}) => {
  const center = { x: width / 2, y: height / 2 };
  const radius = Math.min(width, height) / 3;
  const emotions = Object.entries(distribution) as [EmotionCategory, number][];
  const total = emotions.reduce((sum, [_, value]) => sum + value, 0);

  // Calculate paths for the pie chart
  const createPieSlice = (startAngle: number, endAngle: number): string => {
    const start = {
      x: center.x + radius * Math.cos(startAngle),
      y: center.y + radius * Math.sin(startAngle),
    };
    const end = {
      x: center.x + radius * Math.cos(endAngle),
      y: center.y + radius * Math.sin(endAngle),
    };
    const largeArcFlag = endAngle - startAngle <= Math.PI ? '0' : '1';

    return `
      M ${center.x} ${center.y}
      L ${start.x} ${start.y}
      A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}
      Z
    `;
  };

  let currentAngle = -Math.PI / 2; // Start from top

  return (
    <View style={styles.container}>
      <Typography variant="h3" centered>Emotion Distribution</Typography>
      <Svg width={width} height={height}>
        {emotions.map(([emotion, value]) => {
          const percentage = (value / total) * 100;
          const angle = (percentage / 100) * 2 * Math.PI;
          const path = createPieSlice(currentAngle, currentAngle + angle);
          
          // Calculate position for label
          const labelAngle = currentAngle + angle / 2;
          const labelRadius = radius * 0.7;
          const labelX = center.x + labelRadius * Math.cos(labelAngle);
          const labelY = center.y + labelRadius * Math.sin(labelAngle);
          
          currentAngle += angle;

          return (
            <React.Fragment key={emotion}>
              <Path
                d={path}
                fill={theme.colors[emotion]}
                opacity={0.7}
              />
              <Text
                x={labelX}
                y={labelY}
                fontSize="12"
                fill={theme.colors.text}
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {`${Math.round(percentage)}%`}
              </Text>
            </React.Fragment>
          );
        })}
        
        {/* Center circle for better aesthetics */}
        <Circle
          cx={center.x}
          cy={center.y}
          r={radius * 0.4}
          fill={theme.colors.surface}
        />
      </Svg>
      
      {/* Legend */}
      <View style={styles.legend}>
        {emotions.map(([emotion, _]) => (
          <View key={emotion} style={styles.legendItem}>
            <View 
              style={[
                styles.legendColor, 
                { backgroundColor: theme.colors[emotion] }
              ]} 
            />
            <Typography variant="body2" style={{ textTransform: 'capitalize' }}>
              {emotion}
            </Typography>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.spacing.sm,
    marginVertical: theme.spacing.xs,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: theme.spacing.xs,
  },
});
