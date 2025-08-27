import React, { useState } from 'react';
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
import DateTimePicker from '@react-native-community/datetimepicker';
import { Typography, Card, Button, Spacer } from '../../components/common';
import { ActivityTags, IntensitySlider } from '../../components/mood';
import { theme } from '../../theme/theme';
import { MoodType, ActivityTag, MoodData } from '../../types/mood';
import { useMoodStorage } from '../../hooks/useMoodStorage';
import { useNavigation } from '@react-navigation/native';

const moods: MoodData[] = [
  { id: 'happy', label: 'Happy', color: theme.colors.happy },
  { id: 'calm', label: 'Calm', color: theme.colors.calm },
  { id: 'neutral', label: 'Neutral', color: theme.colors.neutral },
  { id: 'sad', label: 'Sad', color: theme.colors.sad },
  { id: 'angry', label: 'Angry', color: theme.colors.angry },
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
  const [state, setState] = useState<MoodInputState>({
    mood: null,
    intensity: 0.5,
    activities: [],
    notes: '',
    timestamp: new Date(),
  });

  const handleSave = async () => {
    if (!state.mood) return;

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
      console.log('Attempting to save mood entry:', moodEntry);
      await saveMoodEntry(moodEntry);
      
      const entries = await getMoodEntries();
      console.log('All stored entries:', entries);
      
      Alert.alert('Success', 'Mood entry saved successfully!');
      navigation.goBack();
    } catch (err) {
      console.error('Error saving mood entry:', err);
      Alert.alert('Error', 'Failed to save mood entry. Please try again.');
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

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setState(prev => ({ ...prev, timestamp: selectedDate }));
    }
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
          <Typography variant="h2" centered>How are you feeling?</Typography>
          <Spacer size="lg" />
          
          {/* Mood Selection */}
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

          {state.mood && (
            <>
              <Spacer size="lg" />

              {/* Intensity Slider */}
              <Card style={styles.section}>
                <Typography variant="h3">Intensity</Typography>
                <Spacer />
                <IntensitySlider
                  value={state.intensity}
                  onValueChange={(intensity) => setState(prev => ({ ...prev, intensity }))}
                  selectedMood={state.mood}
                />
              </Card>

              <Spacer />

              {/* Activity Tags */}
              <Card style={styles.section}>
                <Typography variant="h3">Activities</Typography>
                <Spacer />
                <ActivityTags
                  selectedTags={state.activities}
                  onToggleTag={handleActivityToggle}
                />
              </Card>

              <Spacer />

              {/* Notes Input */}
              <Card style={styles.section}>
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
              </Card>

              <Spacer />

              {/* Time Selection */}
              <Card style={styles.section}>
                <Typography variant="h3">Time</Typography>
                <Spacer />
                <TouchableOpacity
                  onPress={() => setShowTimePicker(true)}
                  style={styles.timeSelector}
                >
                  <Typography variant="body1">{formatTime(state.timestamp)}</Typography>
                </TouchableOpacity>
                {showTimePicker && (
                  <DateTimePicker
                    value={state.timestamp}
                    mode="time"
                    is24Hour={true}
                    onChange={handleTimeChange}
                  />
                )}
              </Card>

              <Spacer size="xl" />

              {/* Save Button */}
              <View style={styles.actionContainer}>
                <Button 
                  size="large"
                  onPress={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Mood'}
                </Button>
              </View>

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
    justifyContent: 'space-between',
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
});

export default MoodInputScreen;