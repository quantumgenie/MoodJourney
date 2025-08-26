import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Typography, Card, Button, Spacer } from '../../components/common';
import { theme } from '../../theme/theme';

const JournalScreen = () => {
  // Dummy data for demonstration
  const entries = [
    { id: '1', date: 'March 19, 2024', title: 'A Productive Day', mood: 'happy' },
    { id: '2', date: 'March 18, 2024', title: 'Reflecting on Goals', mood: 'calm' },
    { id: '3', date: 'March 17, 2024', title: 'Weekend Thoughts', mood: 'neutral' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Typography variant="h2">My Journal</Typography>
        <Button onPress={() => console.log('New entry')}>
          New Entry
        </Button>
      </View>
      
      <Spacer />
      
      <ScrollView>
        {entries.map(entry => (
          <Card key={entry.id} style={styles.entryCard}>
            <Typography variant="caption" color="disabled">
              {entry.date}
            </Typography>
            <Spacer size="xs" />
            <Typography variant="h3">{entry.title}</Typography>
            <Spacer />
            <View style={styles.cardFooter}>
              <Typography variant="body2" color="disabled">
                Mood: {entry.mood}
              </Typography>
              <Button variant="text" onPress={() => console.log('View entry', entry.id)}>
                Read More
              </Button>
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
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
  entryCard: {
    padding: theme.spacing.md,
    marginVertical: theme.spacing.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default JournalScreen;