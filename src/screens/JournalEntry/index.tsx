import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Typography, Card, Button, Spacer } from '../../components/common';
import { ActivityTags } from '../../components/mood';
import { theme } from '../../theme/theme';
import { useJournalStorage } from '../../hooks/useJournalStorage';
import { JournalEntry } from '../../types/journal';
import { MoodType, ActivityTag } from '../../types/mood';
import { RootStackParamList } from '../../navigation/types';

type JournalEntryRouteProp = RouteProp<RootStackParamList, 'JournalEntry'>;

const moods: MoodType[] = ['happy', 'calm', 'neutral', 'sad', 'angry'];

const JournalEntryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<JournalEntryRouteProp>();
  const { saveJournalEntry, getJournalEntry, isLoading } = useJournalStorage();

  const [entry, setEntry] = useState<Partial<JournalEntry>>({
    title: '',
    content: '',
    mood: 'neutral',
    activities: [],
    tags: [],
  });

  useEffect(() => {
    const loadEntry = async () => {
      if (route.params?.id) {
        const existingEntry = await getJournalEntry(route.params.id);
        if (existingEntry) {
          setEntry(existingEntry);
        }
      }
    };
    loadEntry();
  }, [route.params?.id]);

  const handleSave = async () => {
    if (!entry.title?.trim() || !entry.content?.trim()) {
      Alert.alert('Error', 'Please enter both title and content');
      return;
    }

    try {
      const now = new Date().toISOString();
      const completeEntry: JournalEntry = {
        id: route.params?.id || Date.now().toString(),
        title: entry.title,
        content: entry.content,
        mood: entry.mood || 'neutral',
        activities: entry.activities || [],
        tags: entry.tags || [],
        createdAt: route.params?.id ? entry.createdAt! : now,
        updatedAt: now,
      };

      await saveJournalEntry(completeEntry);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save journal entry');
    }
  };

  const handleActivityToggle = (activity: ActivityTag) => {
    setEntry(prev => ({
      ...prev,
      activities: prev.activities?.includes(activity)
        ? prev.activities.filter(a => a !== activity)
        : [...(prev.activities || []), activity],
    }));
  };

  return (
    <ScrollView style={styles.container}>
      <TextInput
        style={styles.titleInput}
        value={entry.title}
        onChangeText={(title) => setEntry(prev => ({ ...prev, title }))}
        placeholder="Entry Title"
        placeholderTextColor={theme.colors.disabled}
      />

      <Spacer />

      <Card style={styles.section}>
        <Typography variant="h3">Mood</Typography>
        <Spacer />
        <View style={styles.moodGrid}>
          {moods.map((mood) => (
            <Button
              key={mood}
              variant={entry.mood === mood ? 'contained' : 'outlined'}
              onPress={() => setEntry(prev => ({ ...prev, mood }))}
              style={[
                styles.moodButton,
                { borderColor: theme.colors[mood] }
              ]}
            >
              {mood}
            </Button>
          ))}
        </View>
      </Card>

      <Spacer />

      <Card style={styles.section}>
        <Typography variant="h3">Activities</Typography>
        <Spacer />
        <ActivityTags
          selectedTags={entry.activities || []}
          onToggleTag={handleActivityToggle}
        />
      </Card>

      <Spacer />

      <Card style={styles.section}>
        <Typography variant="h3">Content</Typography>
        <Spacer />
        <TextInput
          style={styles.contentInput}
          value={entry.content}
          onChangeText={(content) => setEntry(prev => ({ ...prev, content }))}
          placeholder="Write your thoughts..."
          placeholderTextColor={theme.colors.disabled}
          multiline
          textAlignVertical="top"
        />
      </Card>

      <Spacer size="xl" />

      <View style={styles.actions}>
        <Button
          size="large"
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Entry'}
        </Button>
      </View>

      <Spacer size="xl" />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    padding: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.disabled + '40',
  },
  section: {
    padding: theme.spacing.md,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  moodButton: {
    minWidth: 100,
  },
  contentInput: {
    minHeight: 200,
    borderWidth: 1,
    borderColor: theme.colors.disabled + '40',
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    fontSize: 16,
    color: theme.colors.text,
  },
  actions: {
    alignItems: 'center',
  },
});

export default JournalEntryScreen;
