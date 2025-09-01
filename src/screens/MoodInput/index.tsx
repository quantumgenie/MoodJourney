import React, { useState, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  Alert, 
  Platform, 
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
// DateTimePicker removed for Snack compatibility
// Using Snack-compatible animations
import { FadeInView, SlideInView } from '../../components/common/SnackCompatibleAnimated';
import { useFocusEffect } from '@react-navigation/native';
import { Typography, Card, Button, Spacer, AnimatedCard, LoadingSpinner, ErrorState } from '../../components/common';
import { ActivityTags, IntensitySlider } from '../../components/mood';
import { theme } from '../../theme/theme';
import { MoodType, ActivityTag, MoodData } from '../../types/mood';
import { useMoodStorage } from '../../hooks/useMoodStorage';
import { useNavigation } from '@react-navigation/native';

const moods: MoodData[] = [
  { id: 'joy', label: 'Joy', color: theme.colors.joy },
  { id: 'sadness', label: 'Sadness', color: theme.colors.sadness },
  { id: 'anger', label: 'Anger', color: theme.colors.anger },
  { id: 'fear', label: 'Fear', color: theme.colors.fear },
  { id: 'surprise', label: 'Surprise', color: theme.colors.surprise },
  { id: 'calm', label: 'Calm', color: theme.colors.calm },
  { id: 'neutral', label: 'Neutral', color: theme.colors.neutral },
];

interface MoodInputState {
  mood: MoodType | null;
  intensity: number;
  activities: ActivityTag[];
  notes: string;
  timestamp: Date;
}

const MoodInputScreen = () => {
  const navigation = useNavigation();
  const { saveMoodEntry, getMoodEntries, isLoading, error } = useMoodStorage();
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const [state, setState] = useState<MoodInputState>({
    mood: null,
    intensity: 0.5,
    activities: [],
    notes: '',
    timestamp: new Date(),
  });

  // Trigger animations on each navigation to screen
  useFocusEffect(
    useCallback(() => {
      setAnimationKey(prev => prev + 1);
    }, [])
  );

  const handleSave = async () => {
    if (!state.mood) {
      Alert.alert('Missing Information', 'Please select a mood before saving.');
      return;
    }

    const moodEntry = {
      id: Date.now().toString(),
      mood: state.mood,
      intensity: state.intensity,
      activities: state.activities,
      notes: state.notes,
      timestamp: state.timestamp.toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveMoodEntry(moodEntry);
      
      Alert.alert(
        'Success', 
        'Mood entry saved successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      console.error('Error saving mood entry:', err);
      Alert.alert(
        'Error', 
        error || 'Failed to save mood entry. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleActivityToggle = (activity: ActivityTag) => {
    setState(prev => ({
      ...prev,
      activities: prev.activities.includes(activity)
        ? prev.activities.filter(a => a !== activity)
        : [...prev.activities, activity],
    }));
  };

  const handleTimeChange = () => {
    // For Snack compatibility, we'll just use the current time
    setState(prev => ({ ...prev, timestamp: new Date() }));
    setShowTimePicker(false);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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
          <View key={`title-${animationKey}`}>
            <Typography variant="h2" centered>How are you feeling?</Typography>
          </View>
          <Spacer size="lg" />
          
          {/* Mood Selection */}
          <View key={`mood-grid-${animationKey}`}>
            <View style={styles.moodGrid}>
              {moods.map((mood) => (
                <Card
                  key={mood.id}
                  style={[
                    styles.moodCard,
                    state.mood === mood.id && { borderColor: mood.color, borderWidth: 2 }
                  ]}
                  onTouchEnd={() => setState(prev => ({ ...prev, mood: mood.id as MoodType }))}
                >
                  <Typography variant="h3" centered>{mood.label}</Typography>
                </Card>
              ))}
            </View>
          </View>

          {state.mood && (
            <>
              <Spacer size="lg" />

              {/* Intensity Slider */}
              <AnimatedCard key={`intensity-${animationKey}-${state.mood}`} style={styles.section} delay={300} duration={600}>
                <Typography variant="h3">Intensity</Typography>
                <Spacer />
                <IntensitySlider
                  value={state.intensity}
                  onValueChange={(intensity) => setState(prev => ({ ...prev, intensity }))}
                  selectedMood={state.mood}
                />
              </AnimatedCard>

              <Spacer />

              {/* Activity Tags */}
              <AnimatedCard key={`activities-${animationKey}-${state.mood}`} style={styles.section} delay={450} duration={600}>
                <Typography variant="h3">Activities</Typography>
                <Spacer />
                <ActivityTags
                  selectedTags={state.activities}
                  onToggleTag={handleActivityToggle}
                />
              </AnimatedCard>

              <Spacer />

              {/* Notes Input */}
              <AnimatedCard key={`notes-${animationKey}-${state.mood}`} style={styles.section} delay={600} duration={600}>
                <Typography variant="h3">Notes</Typography>
                <Spacer />
                <TextInput
                  style={styles.notesInput}
                  multiline
                  numberOfLines={4}
                  value={state.notes}
                  onChangeText={(notes) => setState(prev => ({ ...prev, notes }))}
                  placeholder="Add any thoughts or context..."
                  placeholderTextColor={theme.colors.disabled}
                  textAlignVertical="top"
                />
              </AnimatedCard>

              <Spacer />

              {/* Time Selection */}
              <AnimatedCard key={`time-${animationKey}-${state.mood}`} style={styles.section} delay={750} duration={600}>
                <Typography variant="h3">Time</Typography>
                <Spacer />
                <TouchableOpacity
                  onPress={handleTimeChange}
                  style={styles.timeSelector}
                >
                  <Typography variant="body1">{formatTime(state.timestamp)}</Typography>
                  <Typography variant="caption" style={styles.timeHint}>Tap to use current time</Typography>
                </TouchableOpacity>
              </AnimatedCard>

              <Spacer size="xl" />

              {/* Save Button */}
              <FadeInView 
                delay={900} 
                duration={600}
                style={styles.actionContainer}
              >
                <Button 
                  size="large"
                  onPress={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Mood'}
                </Button>
              </FadeInView>

              <Spacer size="xl" />
            </>
          )}
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
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  moodCard: {
    width: '48%',
    marginVertical: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  section: {
    padding: theme.spacing.md,
  },
  notesInput: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: theme.colors.disabled,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
  },
  actionContainer: {
    alignItems: 'center',
  },
  timeSelector: {
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.disabled,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  timeHint: {
    marginTop: theme.spacing.xs,
    opacity: 0.6,
  },
});

export default MoodInputScreen;