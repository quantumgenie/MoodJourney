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
import { useMoodStorage } from '../../hooks/useMoodStorage';
import { useJournalStorage } from '../../hooks/useJournalStorage';
import { MoodEntry } from '../../types/mood';
import { JournalEntry } from '../../types/journal';
import { subDays, subWeeks, isAfter } from 'date-fns';

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
  
  // Storage hooks for real data
  const { isLoading: moodLoading, getMoodEntries } = useMoodStorage();
  const { isLoading: journalLoading, getJournalEntries } = useJournalStorage();
  
  // State to store fetched data
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);

  // Time-based filtering function
  const getFilteredData = () => {
    const now = new Date();
    const cutoffDate = timeFrame === 'week' ? subWeeks(now, 1) : subDays(now, 30);
    
    // Add null checks for arrays
    const filteredMoodEntries = (moodEntries || []).filter(entry => 
      isAfter(new Date(entry.timestamp), cutoffDate)
    );
    
    const filteredJournalEntries = (journalEntries || []).filter(entry => 
      isAfter(new Date(entry.createdAt), cutoffDate)
    );
    
    return { filteredMoodEntries, filteredJournalEntries };
  };

  // Aggregation logic for multiple journal entries
  const getAggregatedAnalysis = () => {
    const { filteredJournalEntries } = getFilteredData();
    
    if (filteredJournalEntries.length === 0) {
      // Return demo analysis if no real data
      return analysisService.analyzeEntry(demoJournalEntry);
    }

    // Combine all journal entries into one analysis
    const combinedContent = filteredJournalEntries
      .map(entry => entry.content)
      .join(' ');
    
    const aggregatedEntry = {
      id: 'aggregated',
      content: combinedContent,
      date: new Date().toISOString(),
      mood: filteredJournalEntries[0]?.mood || 'neutral', // Use first entry's mood as default
    };

    return analysisService.analyzeEntry(aggregatedEntry);
  };

  // Load real data when component mounts or timeFrame changes
  useEffect(() => {
    const loadData = async () => {
      try {
        const loadedMoodEntries = await getMoodEntries();
        const loadedJournalEntries = await getJournalEntries();
        
        setMoodEntries(loadedMoodEntries);
        setJournalEntries(loadedJournalEntries);
        
        console.log('Loaded real data:', { 
          moodEntries: loadedMoodEntries.length, 
          journalEntries: loadedJournalEntries.length 
        });
      } catch (error) {
        console.error('Error loading analytics data:', error);
      }
    };

    loadData();
  }, [timeFrame, getMoodEntries, getJournalEntries]);

  // Update analysis when data or timeFrame changes
  useEffect(() => {
    // Only run when data is available (not undefined)
    if (!moodEntries || !journalEntries) {
      return;
    }

    const { filteredMoodEntries, filteredJournalEntries } = getFilteredData();
    console.log(`Analytics data for ${timeFrame}:`, {
      totalMoodEntries: moodEntries.length,
      filteredMoodEntries: filteredMoodEntries.length,
      totalJournalEntries: journalEntries.length,
      filteredJournalEntries: filteredJournalEntries.length,
    });

    // Recalculate analysis with real data
    const newAnalysis = getAggregatedAnalysis();
    setAnalysis(newAnalysis);
  }, [moodEntries, journalEntries, timeFrame]);

  // Show loading state
  if (moodLoading || journalLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Typography variant="h2">Mood Analytics</Typography>
          <View style={styles.timeFrameButtons}>
            <Button 
              variant={timeFrame === 'week' ? 'contained' : 'text'}
              onPress={() => setTimeFrame('week')}
              disabled
            >
              Week
            </Button>
            <Spacer horizontal />
            <Button 
              variant={timeFrame === 'month' ? 'contained' : 'text'}
              onPress={() => setTimeFrame('month')}
              disabled
            >
              Month
            </Button>
          </View>
        </View>
        <Spacer size="lg" />
        <Card style={styles.loadingCard}>
          <Typography variant="h3" centered>Loading Analytics...</Typography>
          <Spacer />
          <Typography variant="body2" color="disabled" centered>
            Analyzing your mood and journal data
          </Typography>
        </Card>
      </View>
    );
  }

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
  loadingCard: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
});

export default AnalyticsScreen;