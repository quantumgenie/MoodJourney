import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Typography, Card, Button, Spacer } from '../../components/common';
import { theme } from '../../theme/theme';

const moods = [
  { id: 'happy', label: 'Happy', color: theme.colors.happy },
  { id: 'calm', label: 'Calm', color: theme.colors.calm },
  { id: 'neutral', label: 'Neutral', color: theme.colors.neutral },
  { id: 'sad', label: 'Sad', color: theme.colors.sad },
  { id: 'angry', label: 'Angry', color: theme.colors.angry },
];

const MoodInputScreen = () => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  return (
    <ScrollView style={styles.container}>
      <Typography variant="h2" centered>How are you feeling?</Typography>
      <Spacer size="lg" />
      
      <View style={styles.moodGrid}>
        {moods.map((mood) => (
          <Card
            key={mood.id}
            style={[
              styles.moodCard,
              selectedMood === mood.id && { borderColor: mood.color, borderWidth: 2 }
            ]}
            onTouchEnd={() => setSelectedMood(mood.id)}
          >
            <Typography variant="h3" centered>{mood.label}</Typography>
          </Card>
        ))}
      </View>

      <Spacer size="xl" />
      
      {selectedMood && (
        <View style={styles.actionContainer}>
          <Button 
            size="large"
            onPress={() => {
              // TODO: Save mood entry
              console.log('Saving mood:', selectedMood);
            }}
          >
            Save Mood
          </Button>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moodCard: {
    width: '48%',
    marginVertical: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  actionContainer: {
    alignItems: 'center',
  },
});

export default MoodInputScreen;