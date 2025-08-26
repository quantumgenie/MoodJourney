import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Typography, Card, Button, Spacer } from '../../components/common';
import { theme } from '../../theme/theme';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - theme.spacing.md * 2;
const CHART_HEIGHT = 200;

type MoodType = 'happy' | 'calm' | 'neutral' | 'sad' | 'angry';
type TimeFrameType = 'week' | 'month';

interface DailyMood {
  day: string;
  mood: MoodType;
  value: number;
}

// Dummy data for demonstration
const weeklyMoods: DailyMood[] = [
  { day: 'Mon', mood: 'happy', value: 0.8 },
  { day: 'Tue', mood: 'calm', value: 0.6 },
  { day: 'Wed', mood: 'neutral', value: 0.5 },
  { day: 'Thu', mood: 'sad', value: 0.3 },
  { day: 'Fri', mood: 'happy', value: 0.9 },
  { day: 'Sat', mood: 'calm', value: 0.7 },
  { day: 'Sun', mood: 'happy', value: 0.8 },
];

const moodStats: Record<MoodType, number> = {
  happy: 45,
  calm: 30,
  neutral: 15,
  sad: 7,
  angry: 3,
};

const AnalyticsScreen = () => {
  const [timeFrame, setTimeFrame] = useState<TimeFrameType>('week');

  const renderMoodChart = () => {
    const padding = 40;
    const chartWidth = CHART_WIDTH - padding * 2;
    const pointSpacing = chartWidth / (weeklyMoods.length - 1);

    return (
      <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
        {/* Y-axis */}
        <Line
          x1={padding}
          y1={20}
          x2={padding}
          y2={CHART_HEIGHT - 20}
          stroke={theme.colors.disabled}
          strokeWidth="1"
        />
        
        {/* X-axis */}
        <Line
          x1={padding}
          y1={CHART_HEIGHT - 20}
          x2={CHART_WIDTH - padding}
          y2={CHART_HEIGHT - 20}
          stroke={theme.colors.disabled}
          strokeWidth="1"
        />

        {/* Data points and lines */}
        {weeklyMoods.map((data, index) => {
          const x = padding + index * pointSpacing;
          const y = CHART_HEIGHT - (data.value * (CHART_HEIGHT - 40)) - 20;
          const nextData = weeklyMoods[index + 1];
          
          return (
            <React.Fragment key={data.day}>
              <Circle
                cx={x}
                cy={y}
                r="4"
                fill={theme.colors[data.mood]}
              />
              
              {/* Connect points with lines */}
              {nextData && (
                <Line
                  x1={x}
                  y1={y}
                  x2={padding + (index + 1) * pointSpacing}
                  y2={CHART_HEIGHT - (nextData.value * (CHART_HEIGHT - 40)) - 20}
                  stroke={theme.colors.primary}
                  strokeWidth="2"
                />
              )}
              
              {/* X-axis labels */}
              <SvgText
                x={x}
                y={CHART_HEIGHT - 5}
                fontSize="12"
                fill={theme.colors.text}
                textAnchor="middle"
              >
                {data.day}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Typography variant="h2">Mood Analytics</Typography>
        <View style={styles.timeFrameButtons}>
          <Button 
            variant={timeFrame === 'week' ? 'contained' : 'text'}
            onPress={() => setTimeFrame('week')}
          >
            Week
          </Button>
          <Spacer horizontal />
          <Button 
            variant={timeFrame === 'month' ? 'contained' : 'text'}
            onPress={() => setTimeFrame('month')}
          >
            Month
          </Button>
        </View>
      </View>

      <Spacer size="lg" />

      <Card style={styles.chartCard}>
        <Typography variant="h3">Mood Trends</Typography>
        <Spacer />
        {renderMoodChart()}
      </Card>

      <Spacer />

      <Card style={styles.statsCard}>
        <Typography variant="h3">Mood Distribution</Typography>
        <Spacer />
        {(Object.entries(moodStats) as [MoodType, number][]).map(([mood, percentage]) => (
          <View key={mood} style={styles.statRow}>
            <Typography variant="body1" style={{ textTransform: 'capitalize' }}>
              {mood}
            </Typography>
            <View style={styles.statBar}>
              <View 
                style={[
                  styles.statFill, 
                  { 
                    width: `${percentage}%`,
                    backgroundColor: theme.colors[mood],
                  }
                ]} 
              />
            </View>
            <Typography variant="body2">{percentage}%</Typography>
          </View>
        ))}
      </Card>

      <Spacer size="lg" />

      <Card style={styles.insightsCard}>
        <Typography variant="h3">Insights</Typography>
        <Spacer />
        <Typography variant="body1">
          You've been mostly happy this week! Your mood tends to improve on weekends.
        </Typography>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeFrameButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartCard: {
    padding: theme.spacing.md,
  },
  statsCard: {
    padding: theme.spacing.md,
  },
  insightsCard: {
    padding: theme.spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.xs,
  },
  statBar: {
    flex: 1,
    height: 8,
    backgroundColor: theme.colors.disabled + '20',
    borderRadius: 4,
    marginHorizontal: theme.spacing.md,
  },
  statFill: {
    height: '100%',
    borderRadius: 4,
  },
});

export default AnalyticsScreen;