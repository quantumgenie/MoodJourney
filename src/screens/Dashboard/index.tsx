import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Typography, Card, Button, Spacer, AnimatedCard } from '../../components/common';
import { theme } from '../../theme/theme';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../../navigation/types';
import { useMoodStorage } from '../../hooks/useMoodStorage';
import { format } from 'date-fns';

type DashboardScreenNavigationProp = BottomTabNavigationProp<MainTabParamList>;

const DashboardScreen = () => {
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const { getMoodEntries } = useMoodStorage();
  const [hasTodayEntry, setHasTodayEntry] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    checkTodayEntry();
  }, []);

  // Refresh today's mood status and trigger animations when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      checkTodayEntry();
      // Increment animation key to force re-animation on each navigation
      setAnimationKey(prev => prev + 1);
    }, [])
  );

  const checkTodayEntry = async () => {
    try {
      const entries = await getMoodEntries();
      const today = new Date().toISOString().split('T')[0];
      const todayEntry = entries.some(entry => 
        entry.timestamp.split('T')[0] === today
      );
      setHasTodayEntry(todayEntry);
    } catch (error) {
      console.error('Error checking today entries:', error);
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
      
      {hasTodayEntry && (
        <AnimatedCard key={`summary-${animationKey}`} variant="outlined" style={styles.card} delay={450} duration={600}>
          <Typography variant="h3">Today's Summary</Typography>
          <Spacer />
          <Button variant="text" onPress={navigateToAnalytics}>
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
});

export default DashboardScreen;