import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography, Spacer } from '../common';
import { theme } from '../../theme/theme';
import { ActivityCorrelation, ActivityInsight } from '../../services/analytics/activityCorrelationService';

interface ActivityEffectivenessCardProps {
  correlations: ActivityCorrelation[];
  insights: ActivityInsight[];
  timeFrame: 'week' | 'month';
}

interface ActivityRowProps {
  correlation: ActivityCorrelation;
  type: 'positive' | 'negative' | 'neutral';
}

const ActivityRow: React.FC<ActivityRowProps> = ({ correlation, type }) => {
  const improvement = correlation.improvementScore;
  const percentage = Math.abs(improvement * 10);
  const isPositive = type === 'positive';
  const isNeutral = type === 'neutral';
  
  // Create a simple progress bar using background colors
  const progressWidth = Math.min(Math.abs(percentage), 50); // Cap at 50% width
  
  // Choose colors based on type - using available theme colors
  const getColor = () => {
    if (isNeutral) return theme.colors.text;
    return isPositive ? theme.colors.joy : theme.colors.error; // Use joy for positive, error for negative
  };

  const getIcon = () => {
    if (improvement > 0.1) return '🟢';
    if (improvement < -0.1) return '🔴';
    return '🟡';
  };
  
  return (
    <View style={styles.activityRow}>
      <View style={styles.activityInfo}>
        <View style={styles.activityHeader}>
          <Typography variant="body1" style={styles.activityName}>
            {getIcon()} {correlation.activity}
          </Typography>
          <Typography 
            variant="body1" 
            style={[
              styles.percentageText,
              { color: getColor() }
            ]}
          >
            {improvement > 0 ? '+' : ''}{percentage.toFixed(1)}%
          </Typography>
        </View>
        
        <View style={styles.activityDetails}>
          <Typography variant="body2" color="disabled">
            {correlation.totalEntries} entries • Avg: {correlation.averageMoodScore}/10 • {correlation.confidence} confidence
          </Typography>
        </View>
        
        {/* Simple progress indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View 
              style={[
                styles.progressBar,
                {
                  width: `${Math.max(progressWidth, 5)}%`, // Minimum width for visibility
                  backgroundColor: getColor()
                }
              ]} 
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const InsightItem: React.FC<{ insight: ActivityInsight }> = ({ insight }) => {
  const getInsightIcon = (type: ActivityInsight['type']) => {
    switch (type) {
      case 'boost': return '🚀';
      case 'challenge': return '⚠️';
      case 'combination': return '🤝';
      case 'trend': return '📈';
      default: return '💡';
    }
  };

  return (
    <View style={styles.insightItem}>
      <Typography variant="body2">
        {getInsightIcon(insight.type)} {insight.message}
      </Typography>
    </View>
  );
};

export const ActivityEffectivenessCard: React.FC<ActivityEffectivenessCardProps> = ({
  correlations,
  insights,
  timeFrame
}) => {
  // Handle empty state
  if (!correlations || correlations.length === 0) {
    return (
      <View style={styles.container}>
        <Typography variant="h3">Activity Effectiveness</Typography>
        <Spacer size="sm" />
        <Typography variant="body2" color="disabled">
          How activities affect your mood (this {timeFrame})
        </Typography>
        <Spacer />
        <View style={styles.emptyState}>
          <Typography variant="body2" color="disabled" centered>
            No activity data available yet.{'\n'}
            Log some moods with activities to see patterns!
          </Typography>
        </View>
      </View>
    );
  }

  // More sensitive filtering - show activities with even small differences
  const topActivities = correlations
    .filter(c => c.improvementScore > 0.05) // Lowered threshold
    .slice(0, 4); // Show more activities
    
  const challengingActivities = correlations
    .filter(c => c.improvementScore < -0.05) // Lowered threshold
    .slice(-3) // Show more activities
    .reverse(); // Show worst first

  // Show neutral activities if no clear positive/negative patterns
  const neutralActivities = correlations
    .filter(c => Math.abs(c.improvementScore) <= 0.05)
    .slice(0, 3);

  return (
    <View style={styles.container}>
      <Typography variant="h3">Activity Effectiveness</Typography>
      <Spacer size="sm" />
      <Typography variant="body2" color="disabled">
        How activities affect your mood (this {timeFrame})
      </Typography>
      
      <Spacer />

      {/* Top Performing Activities */}
      {topActivities.length > 0 && (
        <>
          <Typography variant="h3" style={[styles.sectionHeader, { color: theme.colors.joy }]}>
            🌟 Mood Boosters
          </Typography>
          <Spacer size="sm" />
          {topActivities.map(correlation => (
            <ActivityRow 
              key={correlation.activity}
              correlation={correlation}
              type="positive"
            />
          ))}
          <Spacer />
        </>
      )}

      {/* Challenging Activities */}
      {challengingActivities.length > 0 && (
        <>
          <Typography variant="h3" style={[styles.sectionHeader, { color: theme.colors.error }]}>
            ⚡ Challenging Activities
          </Typography>
          <Spacer size="sm" />
          {challengingActivities.map(correlation => (
            <ActivityRow 
              key={correlation.activity}
              correlation={correlation}
              type="negative"
            />
          ))}
          <Spacer />
        </>
      )}

      {/* Neutral Activities - show when no clear patterns */}
      {topActivities.length === 0 && challengingActivities.length === 0 && neutralActivities.length > 0 && (
        <>
          <Typography variant="h3" style={[styles.sectionHeader, { color: theme.colors.text }]}>
            ⚖️ Balanced Activities
          </Typography>
          <Spacer size="sm" />
          <Typography variant="body2" color="disabled" style={styles.explanationText}>
            These activities have neutral effects on your mood:
          </Typography>
          <Spacer size="sm" />
          {neutralActivities.map(correlation => (
            <ActivityRow 
              key={correlation.activity}
              correlation={correlation}
              type="neutral"
            />
          ))}
          <Spacer />
        </>
      )}

      {/* Insights Section */}
      {insights.length > 0 && (
        <>
          <Typography variant="h3" style={styles.sectionHeader}>
            💡 Insights
          </Typography>
          <Spacer size="sm" />
          {insights.map((insight, index) => (
            <InsightItem key={index} insight={insight} />
          ))}
        </>
      )}

      {/* Show encouraging message for balanced activities */}
      {topActivities.length === 0 && challengingActivities.length === 0 && neutralActivities.length > 0 && (
        <View style={styles.encouragingState}>
          <Typography variant="body2" color="disabled" centered>
            Your activities show balanced mood effects - that's great!{'\n'}
            Keep logging to identify more specific patterns over time.
          </Typography>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
  },
  emptyState: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    minHeight: 120,
  },
  encouragingState: {
    padding: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.joy,
  },
  sectionHeader: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  explanationText: {
    fontStyle: 'italic',
  },
  activityRow: {
    marginBottom: theme.spacing.md,
  },
  activityInfo: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  activityName: {
    fontWeight: '600',
    flex: 1,
  },
  percentageText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  activityDetails: {
    marginBottom: theme.spacing.sm,
  },
  progressContainer: {
    marginTop: theme.spacing.xs,
  },
  progressTrack: {
    height: 4,
    backgroundColor: theme.colors.surface,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  insightItem: {
    marginBottom: theme.spacing.sm,
    paddingLeft: theme.spacing.sm,
  },
});