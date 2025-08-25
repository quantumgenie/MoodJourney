import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography, Card, Button, Spacer } from '../../components/common';
import { theme } from '../../theme/theme';

const DashboardScreen = () => {
  return (
    <View style={styles.container}>
      <Typography variant="h1" centered>Welcome to MoodJourney</Typography>
      <Spacer size="lg" />
      
      <Card variant="elevated" style={styles.card}>
        <Typography variant="h2">Today's Mood</Typography>
        <Spacer />
        <Typography variant="body1">How are you feeling?</Typography>
        <Spacer size="lg" />
        <Button onPress={() => {}}>
          Add Mood Entry
        </Button>
      </Card>
      
      <Card variant="outlined" style={styles.card}>
        <Typography variant="h3">Quick Actions</Typography>
        <Spacer />
        <Button variant="outlined" onPress={() => {}}>
          Write in Journal
        </Button>
        <Spacer />
        <Button variant="text" onPress={() => {}}>
          View Analytics
        </Button>
      </Card>
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