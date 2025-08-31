import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Typography, Button, Spacer, AnimatedCard, AnimatedTextInputComponent, LoadingSpinner, ErrorState } from '../../components/common';
import { ActivityTags } from '../../components/mood';
import { theme } from '../../theme/theme';
import { useJournalStorage } from '../../hooks/useJournalStorage';
import { JournalEntry } from '../../types/journal';
import { MoodType, ActivityTag } from '../../types/mood';
import { RootStackParamList } from '../../navigation/types';

type JournalEntryRouteProp = RouteProp<RootStackParamList, 'JournalEntry'>;

const moods: MoodType[] = ['joy', 'sadness', 'anger', 'fear', 'surprise', 'calm', 'neutral'];

const JournalEntryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<JournalEntryRouteProp>();
  const { saveJournalEntry, getJournalEntry, isLoading, error } = useJournalStorage();
  const [initialLoading, setInitialLoading] = useState(false);

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
        setInitialLoading(true);
        try {
          const existingEntry = await getJournalEntry(route.params.id);
          if (existingEntry) {
            setEntry(existingEntry);
          }
        } catch (err) {
          Alert.alert('Error', 'Failed to load journal entry');
        } finally {
          setInitialLoading(false);
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
      Alert.alert(
        'Success',
        'Journal entry saved successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      Alert.alert(
        'Error', 
        error || 'Failed to save journal entry. Please try again.'
      );
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

  // Show loading state for existing entry
  if (initialLoading) {
    return (
      <View style={styles.container}>
        <LoadingSpinner message="Loading journal entry..." />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <AnimatedTextInputComponent
            style={styles.titleInput}
            value={entry.title}
            onChangeText={(title) => setEntry(prev => ({ ...prev, title }))}
            placeholder="Entry Title"
            placeholderTextColor={theme.colors.disabled}
            delay={0}
            duration={600}
          />

          <Spacer />

          <AnimatedCard style={styles.section} delay={150} duration={600}>
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
          </AnimatedCard>

          <Spacer />

          <AnimatedCard style={styles.section} delay={300} duration={600}>
            <Typography variant="h3">Activities</Typography>
            <Spacer />
            <ActivityTags
              selectedTags={entry.activities || []}
              onToggleTag={handleActivityToggle}
            />
          </AnimatedCard>

          <Spacer />

          <AnimatedCard style={styles.section} delay={450} duration={600}>
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
          </AnimatedCard>

          <Spacer size="xl" />

          <Animated.View 
            style={styles.actions}
            entering={FadeInDown.delay(600).duration(600)}
          >
            <Button
              size="large"
              onPress={handleSave}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Entry'}
            </Button>
          </Animated.View>

          <Spacer size="xl" />
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
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