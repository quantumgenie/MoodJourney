import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Typography, Card, Button, Spacer, AnimatedCard, LoadingSpinner, ErrorState } from '../../components/common';
import { theme } from '../../theme/theme';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../../navigation/types';
import { useMoodStorage } from '../../hooks/useMoodStorage';
import { useJournalStorage } from '../../hooks/useJournalStorage';
import { TodaySummaryService, TodaysSummary } from '../../services/dashboard/todaySummaryService';
import { MoodEntry } from '../../types/mood';
import { JournalEntry } from '../../types/journal';
import { format } from 'date-fns';

type DashboardScreenNavigationProp = BottomTabNavigationProp<MainTabParamList>;

const DashboardScreen = () => {
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const { getMoodEntries } = useMoodStorage();
  const { getJournalEntries } = useJournalStorage();
  const [hasTodayEntry, setHasTodayEntry] = useState(false);
  const [todaysSummary, setTodaysSummary] = useState<TodaysSummary | null>(null);
  const [animationKey, setAnimationKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTodaysData();
  }, []);

  // Refresh today's data and trigger animations when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadTodaysData();
      // Increment animation key to force re-animation on each navigation
      setAnimationKey(prev => prev + 1);
    }, [])
  );

  const loadTodaysData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [moodEntries, journalEntries] = await Promise.all([
        getMoodEntries(),
        getJournalEntries()
      ]);
      
      const today = new Date().toISOString().split('T')[0];
      const todayMoodEntries = moodEntries.filter(entry => 
        entry.timestamp.split('T')[0] === today
      );
      const todayJournalEntries = journalEntries.filter(entry => 
        entry.createdAt.split('T')[0] === today
      );
      
      const hasAnyTodayEntry = todayMoodEntries.length > 0 || todayJournalEntries.length > 0;
      setHasTodayEntry(hasAnyTodayEntry);
      
      // Calculate today's summary
      const summary = TodaySummaryService.calculateTodaysSummary(moodEntries, journalEntries);
      setTodaysSummary(summary);
    } catch (error) {
      console.error('Error loading today\'s data:', error);
      setError('Failed to load today\'s data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToMoodInput = () => {
    navigation.navigate('MoodInput');
  };

  const navigateToJournal = () => {
    navigation.navigate('Journal');
  };

  const navigateToAnalytics = () => {
    navigation.navigate('Analytics');
  };

  const handleViewDetails = () => {
    if (!todaysSummary) {
      navigation.navigate('Analytics');
      return;
    }

    // Smart navigation based on today's data
    if (todaysSummary.journalCount > 0) {
      // Has journal entries - go to Journal filtered for today
      navigation.navigate('Journal');
    } else if (todaysSummary.moodCount > 0) {
      // Has mood entries only - go to Analytics
      navigation.navigate('Analytics');
    } else {
      // No data - go to Analytics for general view
      navigation.navigate('Analytics');
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <LoadingSpinner message="Loading your dashboard..." />
      </ScrollView>
    );
  }

  // Show error state
  if (error) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <ErrorState
          title="Unable to load dashboard"
          message={error}
          onRetry={loadTodaysData}
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Animated.View key={`title-${animationKey}`} entering={FadeInDown.delay(0).duration(600)}>
        <Typography variant="h1" centered>Welcome to MoodJourney</Typography>
      </Animated.View>
      <Spacer size="lg" />
      
      <AnimatedCard key={`mood-${animationKey}`} variant="elevated" style={styles.card} delay={150} duration={600}>
        <Typography variant="h2">Today's Mood</Typography>
        <Spacer />
        {hasTodayEntry ? (
          <>
            <Typography variant="body1">
              You've already logged your mood for {format(new Date(), 'MMMM d')}
            </Typography>
            <Spacer size="lg" />
            <Button variant="outlined" onPress={navigateToMoodInput}>
              Add Another Entry
            </Button>
          </>
        ) : (
          <>
            <Typography variant="body1">How are you feeling?</Typography>
            <Spacer size="lg" />
            <Button onPress={navigateToMoodInput}>
              Add Mood Entry
            </Button>
          </>
        )}
      </AnimatedCard>
      
      <AnimatedCard key={`actions-${animationKey}`} variant="outlined" style={styles.card} delay={300} duration={600}>
        <Typography variant="h3">Quick Actions</Typography>
        <Spacer />
        <Button variant="outlined" onPress={navigateToJournal}>
          Write in Journal
        </Button>
        <Spacer />
        <Button variant="text" onPress={navigateToAnalytics}>
          View Analytics
        </Button>
      </AnimatedCard>

      <Spacer size="lg" />
      
      {hasTodayEntry && todaysSummary && (
        <AnimatedCard key={`summary-${animationKey}`} variant="outlined" style={styles.card} delay={450} duration={600}>
          <Typography variant="h3">Today's Summary</Typography>
          <Spacer />
          
          {todaysSummary.hasData ? (
            <>
              {/* Mood and Entry Count */}
              <View style={styles.summaryRow}>
                <Typography variant="body2" style={styles.summaryLabel}>📊</Typography>
                <Typography variant="body1" style={styles.summaryText}>
                  {todaysSummary.moodCount + todaysSummary.journalCount} {todaysSummary.moodCount + todaysSummary.journalCount === 1 ? 'entry' : 'entries'} today
                </Typography>
              </View>
              
              {/* Dominant Mood */}
              {todaysSummary.dominantMood && (
                <View style={styles.summaryRow}>
                  <Typography variant="body2" style={styles.summaryLabel}>🎭</Typography>
                  <Typography variant="body1" style={styles.summaryText}>
                    {TodaySummaryService.formatSummaryText(todaysSummary).moodText}
                  </Typography>
                </View>
              )}
              
              {/* Top Activities */}
              {todaysSummary.topActivities.length > 0 && (
                <View style={styles.summaryRow}>
                  <Typography variant="body2" style={styles.summaryLabel}>🏃</Typography>
                  <Typography variant="body1" style={styles.summaryText}>
                    {TodaySummaryService.formatSummaryText(todaysSummary).activityText}
                  </Typography>
                </View>
              )}
              
              {/* Mood Trend */}
              {todaysSummary.moodTrend !== 'insufficient_data' && (
                <View style={styles.summaryRow}>
                  <Typography variant="body2" style={styles.summaryLabel}>
                    {todaysSummary.moodTrend === 'improving' ? '📈' : todaysSummary.moodTrend === 'declining' ? '📉' : '➡️'}
                  </Typography>
                  <Typography variant="body1" style={styles.summaryText}>
                    {TodaySummaryService.formatSummaryText(todaysSummary).trendText}
                  </Typography>
                </View>
              )}
            </>
          ) : (
            <Typography variant="body1" style={styles.summaryText}>
              Start logging to see your daily summary
            </Typography>
          )}
          
          <Spacer size="lg" />
          <Button variant="text" onPress={handleViewDetails}>
            View Details
          </Button>
        </AnimatedCard>
      )}
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
  card: {
    padding: theme.spacing.md,
    marginVertical: theme.spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  summaryLabel: {
    marginRight: theme.spacing.sm,
    fontSize: 16,
    width: 24,
  },
  summaryText: {
    flex: 1,
    color: theme.colors.text.secondary,
  },
});

export default DashboardScreen;