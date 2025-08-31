import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Typography, Card, Button, Spacer, AnimatedCard } from '../../components/common';
import { 
  EmotionDistributionChart,
  MoodAlignmentIndicator,
  ActivityEffectivenessCard,
} from '../../components/analytics';
import { theme } from '../../theme/theme';
import { SemanticAnalysisService, SemanticAnalysisResult } from '../../services/semanticAnalysis';
import { ActivityCorrelationService, ActivityCorrelation, ActivityInsight } from '../../services/analytics/activityCorrelationService';
import { useMoodStorage } from '../../hooks/useMoodStorage';
import { useJournalStorage } from '../../hooks/useJournalStorage';
import { MoodEntry } from '../../types/mood';
import { JournalEntry } from '../../types/journal';
import { subDays, subWeeks, isAfter } from 'date-fns';

// Empty state for analytics when no data is available
const getEmptyAnalysis = (): SemanticAnalysisResult => ({
  dominantEmotion: 'neutral',
  emotionDistribution: {
    joy: 0,
    sadness: 0,
    anger: 0,
    fear: 0,
    surprise: 0,
    calm: 0,
    neutral: 0,
  },
  highlightedWords: [],
  moodAlignment: 0,
  suggestedTags: [],
});

const AnalyticsScreen = () => {
  const [timeFrame, setTimeFrame] = useState<'today' | 'week' | 'month'>('week');
  const [analysisService] = useState(() => new SemanticAnalysisService());
  const [correlationService] = useState(() => new ActivityCorrelationService());
  const [analysis, setAnalysis] = useState<SemanticAnalysisResult>(getEmptyAnalysis());
  const [activityCorrelations, setActivityCorrelations] = useState<ActivityCorrelation[]>([]);
  const [activityInsights, setActivityInsights] = useState<ActivityInsight[]>([]);
  const [animationKey, setAnimationKey] = useState(0);
  
  // Storage hooks for real data
  const { isLoading: moodLoading, getMoodEntries } = useMoodStorage();
  const { isLoading: journalLoading, getJournalEntries } = useJournalStorage();
  
  // State to store fetched data
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);

  // Time-based filtering function
  const getFilteredData = () => {
    const now = new Date();
    let filteredMoodEntries: MoodEntry[];
    let filteredJournalEntries: JournalEntry[];
    
    if (timeFrame === 'today') {
      // Filter for today only
      const today = now.toISOString().split('T')[0];
      filteredMoodEntries = (moodEntries || []).filter(entry => 
        entry.timestamp.split('T')[0] === today
      );
      filteredJournalEntries = (journalEntries || []).filter(entry => 
        entry.createdAt.split('T')[0] === today
      );
    } else {
      // Filter for week or month
      const cutoffDate = timeFrame === 'week' ? subWeeks(now, 1) : subDays(now, 30);
      filteredMoodEntries = (moodEntries || []).filter(entry => 
        isAfter(new Date(entry.timestamp), cutoffDate)
      );
      filteredJournalEntries = (journalEntries || []).filter(entry => 
        isAfter(new Date(entry.createdAt), cutoffDate)
      );
    }
    
    return { filteredMoodEntries, filteredJournalEntries };
  };

  // Aggregation logic for multiple journal entries
  const getAggregatedAnalysis = () => {
    const { filteredJournalEntries } = getFilteredData();
    
    if (filteredJournalEntries.length === 0) {
      // Return empty analysis if no real data
      return getEmptyAnalysis();
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
      } catch (error) {
        console.error('Error loading analytics data:', error);
      }
    };

    loadData();
  }, [timeFrame, getMoodEntries, getJournalEntries]);

  // Reload analytics data and trigger animations when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          const loadedMoodEntries = await getMoodEntries();
          const loadedJournalEntries = await getJournalEntries();
          
          setMoodEntries(loadedMoodEntries);
          setJournalEntries(loadedJournalEntries);
        } catch (error) {
          console.error('Error loading analytics data:', error);
        }
      };

      loadData();
      // Trigger animations on each navigation
      setAnimationKey(prev => prev + 1);
    }, [timeFrame, getMoodEntries, getJournalEntries])
  );

  // Update analysis when data or timeFrame changes
  useEffect(() => {
    // Only run when data is available (not undefined)
    if (!moodEntries || !journalEntries) {
      return;
    }

    const { filteredMoodEntries, filteredJournalEntries } = getFilteredData();

    // Recalculate journal analysis with real data
    const newAnalysis = getAggregatedAnalysis();
    setAnalysis(newAnalysis);
    
    // Calculate activity correlations from mood entries
    const correlations = correlationService.analyzeActivityCorrelations(filteredMoodEntries);
    const insights = correlationService.generateInsights(correlations);
    
    setActivityCorrelations(correlations);
    setActivityInsights(insights);
  }, [moodEntries, journalEntries, timeFrame]);

  // Show loading state
  if (moodLoading || journalLoading) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
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
        <AnimatedCard key={`loading-${animationKey}`} style={styles.loadingCard} delay={0} duration={600}>
          <Typography variant="h3" centered>Loading Analytics...</Typography>
          <Spacer />
          <Typography variant="body2" color="disabled" centered>
            Analyzing your mood and journal data
          </Typography>
        </AnimatedCard>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Typography variant="h2">Mood Analytics</Typography>
        <Spacer size="sm" />
        <View style={styles.timeFrameButtons}>
          <Button 
            variant={timeFrame === 'today' ? 'contained' : 'text'}
            onPress={() => setTimeFrame('today')}
            style={styles.timeFrameButton}
          >
            Today
          </Button>
          <Spacer horizontal size="sm" />
          <Button 
            variant={timeFrame === 'week' ? 'contained' : 'text'}
            onPress={() => setTimeFrame('week')}
            style={styles.timeFrameButton}
          >
            Week
          </Button>
          <Spacer horizontal size="sm" />
          <Button 
            variant={timeFrame === 'month' ? 'contained' : 'text'}
            onPress={() => setTimeFrame('month')}
            style={styles.timeFrameButton}
          >
            Month
          </Button>
        </View>
      </View>

      <Spacer size="lg" />

      <AnimatedCard key={`activity-effectiveness-${animationKey}`} delay={0} duration={600}>
        <ActivityEffectivenessCard 
          correlations={activityCorrelations}
          insights={activityInsights}
          timeFrame={timeFrame}
        />
      </AnimatedCard>

      <Spacer />

      <AnimatedCard key={`distribution-${animationKey}`} delay={150} duration={600}>
        <EmotionDistributionChart distribution={analysis.emotionDistribution} />
      </AnimatedCard>

      <Spacer />

      <AnimatedCard key={`alignment-${animationKey}`} delay={300} duration={600}>
        <MoodAlignmentIndicator alignment={analysis.moodAlignment} />
      </AnimatedCard>

      <Spacer />

      <AnimatedCard key={`insights-${animationKey}`} style={styles.insightsCard} delay={450} duration={600}>
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
      </AnimatedCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl + 60, // Extra padding for tab bar (60px) + spacing
  },
  header: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  timeFrameButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeFrameButton: {
    minWidth: 60,
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