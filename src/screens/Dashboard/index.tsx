import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography, Card, Button, Spacer } from '../../components/common';
import { theme } from '../../theme/theme';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../../navigation/types';
import { useMoodStorage } from '../../hooks/useMoodStorage';
import { format } from 'date-fns';

type DashboardScreenNavigationProp = BottomTabNavigationProp<MainTabParamList>;

const DashboardScreen = () => {
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const { getMoodEntries } = useMoodStorage();
  const [hasTodayEntry, setHasTodayEntry] = useState(false);

  useEffect(() => {
    checkTodayEntry();
  }, []);

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
    <View style={styles.container}>
      <Typography variant="h1" centered>Welcome to MoodJourney</Typography>
      <Spacer size="lg" />
      
      <Card variant="elevated" style={styles.card}>
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
      </Card>
      
      <Card variant="outlined" style={styles.card}>
        <Typography variant="h3">Quick Actions</Typography>
        <Spacer />
        <Button variant="outlined" onPress={navigateToJournal}>
          Write in Journal
        </Button>
        <Spacer />
        <Button variant="text" onPress={navigateToAnalytics}>
          View Analytics
        </Button>
      </Card>

      <Spacer size="lg" />
      
      {hasTodayEntry && (
        <Card variant="outlined" style={styles.card}>
          <Typography variant="h3">Today's Summary</Typography>
          <Spacer />
          <Button variant="text" onPress={navigateToAnalytics}>
            View Details
          </Button>
        </Card>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  card: {
    padding: theme.spacing.md,
    marginVertical: theme.spacing.sm,
  },
});

export default DashboardScreen;