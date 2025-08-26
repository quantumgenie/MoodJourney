import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Typography, Card, Button, Spacer } from '../../components/common';
import { 
  EmotionWordCloud, 
  EmotionDistributionChart,
  MoodAlignmentIndicator,
} from '../../components/analytics';
import { theme } from '../../theme/theme';
import { SemanticAnalysisService } from '../../services/semanticAnalysis';

// Temporary demo data
const demoJournalEntry = {
  id: '1',
  content: 'Today was a wonderful day! I felt really happy and excited about my progress. Though there were some moments of anxiety, overall I remained peaceful and grateful.',
  date: new Date().toISOString(),
  mood: 'happy',
};

const AnalyticsScreen = () => {
  const [timeFrame, setTimeFrame] = useState<'week' | 'month'>('week');
  const [analysisService] = useState(() => new SemanticAnalysisService());
  const [analysis, setAnalysis] = useState(analysisService.analyzeEntry(demoJournalEntry));

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

      <Card>
        <EmotionWordCloud words={analysis.highlightedWords} />
      </Card>

      <Spacer />

      <Card>
        <EmotionDistributionChart distribution={analysis.emotionDistribution} />
      </Card>

      <Spacer />

      <Card>
        <MoodAlignmentIndicator alignment={analysis.moodAlignment} />
      </Card>

      <Spacer />

      <Card style={styles.insightsCard}>
        <Typography variant="h3">Insights</Typography>
        <Spacer />
        <Typography variant="body1">
          • Dominant emotion: {analysis.dominantEmotion}
        </Typography>
        <Spacer size="sm" />
        <Typography variant="body1">
          • Suggested activities: {analysis.suggestedTags.join(', ')}
        </Typography>
        <Spacer size="sm" />
        <Typography variant="body1">
          • Your written emotions {analysis.moodAlignment > 0.7 ? 'strongly align' : 'somewhat align'} with your selected mood
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
  insightsCard: {
    padding: theme.spacing.md,
  },
});

export default AnalyticsScreen;