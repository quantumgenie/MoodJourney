/**
 * Simplified MoodJourney App for Snack.expo.dev compatibility
 * This version removes all problematic dependencies and provides core functionality
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  Alert,
  SafeAreaView
} from 'react-native';

// Simple theme
const theme = {
  colors: {
    primary: '#6200EE',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#000000',
    textSecondary: '#666666',
    joy: '#FFD700',
    sadness: '#4A90E2',
    anger: '#E74C3C',
    fear: '#9B59B6',
    surprise: '#E91E63',
    calm: '#27AE60',
    neutral: '#95A5A6',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
};

type MoodType = 'joy' | 'sadness' | 'anger' | 'fear' | 'surprise' | 'calm' | 'neutral';
type Screen = 'Dashboard' | 'MoodInput' | 'Journal' | 'Analytics';

interface MoodEntry {
  id: string;
  mood: MoodType;
  intensity: number;
  notes: string;
  timestamp: string;
}

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: MoodType;
  timestamp: string;
}

const MoodJourneyApp: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('Dashboard');
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  
  // Mood Input State
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [intensity, setIntensity] = useState(0.5);
  const [moodNotes, setMoodNotes] = useState('');
  
  // Journal State
  const [journalTitle, setJournalTitle] = useState('');
  const [journalContent, setJournalContent] = useState('');
  const [journalMood, setJournalMood] = useState<MoodType>('neutral');

  const moods: { id: MoodType; label: string; color: string }[] = [
    { id: 'joy', label: 'Joy', color: theme.colors.joy },
    { id: 'sadness', label: 'Sadness', color: theme.colors.sadness },
    { id: 'anger', label: 'Anger', color: theme.colors.anger },
    { id: 'fear', label: 'Fear', color: theme.colors.fear },
    { id: 'surprise', label: 'Surprise', color: theme.colors.surprise },
    { id: 'calm', label: 'Calm', color: theme.colors.calm },
    { id: 'neutral', label: 'Neutral', color: theme.colors.neutral },
  ];

  const saveMoodEntry = () => {
    if (!selectedMood) {
      Alert.alert('Error', 'Please select a mood');
      return;
    }

    const newEntry: MoodEntry = {
      id: Date.now().toString(),
      mood: selectedMood,
      intensity,
      notes: moodNotes,
      timestamp: new Date().toISOString(),
    };

    setMoodEntries(prev => [newEntry, ...prev]);
    setSelectedMood(null);
    setIntensity(0.5);
    setMoodNotes('');
    Alert.alert('Success', 'Mood entry saved!');
  };

  const saveJournalEntry = () => {
    if (!journalTitle.trim() || !journalContent.trim()) {
      Alert.alert('Error', 'Please fill in both title and content');
      return;
    }

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      title: journalTitle,
      content: journalContent,
      mood: journalMood,
      timestamp: new Date().toISOString(),
    };

    setJournalEntries(prev => [newEntry, ...prev]);
    setJournalTitle('');
    setJournalContent('');
    setJournalMood('neutral');
    Alert.alert('Success', 'Journal entry saved!');
  };

  const renderDashboard = () => (
    <ScrollView style={styles.content}>
      <Text style={styles.title}>Welcome to MoodJourney</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today's Summary</Text>
        <Text style={styles.cardText}>Mood Entries: {moodEntries.length}</Text>
        <Text style={styles.cardText}>Journal Entries: {journalEntries.length}</Text>
      </View>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => setCurrentScreen('MoodInput')}
      >
        <Text style={styles.buttonText}>Log Your Mood</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => setCurrentScreen('Journal')}
      >
        <Text style={styles.buttonText}>Write in Journal</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderMoodInput = () => (
    <ScrollView style={styles.content}>
      <Text style={styles.title}>How are you feeling?</Text>
      
      <View style={styles.moodGrid}>
        {moods.map((mood) => (
          <TouchableOpacity
            key={mood.id}
            style={[
              styles.moodCard,
              { borderColor: mood.color },
              selectedMood === mood.id && { backgroundColor: mood.color + '20' }
            ]}
            onPress={() => setSelectedMood(mood.id)}
          >
            <Text style={styles.moodLabel}>{mood.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedMood && (
        <>
          <Text style={styles.sectionTitle}>Intensity</Text>
          <View style={styles.sliderContainer}>
            <TouchableOpacity 
              style={[styles.sliderButton, intensity <= 0.3 && styles.activeSlider]}
              onPress={() => setIntensity(0.2)}
            >
              <Text>Mild</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.sliderButton, intensity > 0.3 && intensity <= 0.7 && styles.activeSlider]}
              onPress={() => setIntensity(0.5)}
            >
              <Text>Moderate</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.sliderButton, intensity > 0.7 && styles.activeSlider]}
              onPress={() => setIntensity(0.9)}
            >
              <Text>Strong</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Notes (Optional)</Text>
          <TextInput
            style={styles.textInput}
            value={moodNotes}
            onChangeText={setMoodNotes}
            placeholder="How was your day?"
            multiline
          />

          <TouchableOpacity style={styles.saveButton} onPress={saveMoodEntry}>
            <Text style={styles.saveButtonText}>Save Mood</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );

  const renderJournal = () => (
    <ScrollView style={styles.content}>
      <Text style={styles.title}>Journal</Text>
      
      <Text style={styles.sectionTitle}>Title</Text>
      <TextInput
        style={styles.textInput}
        value={journalTitle}
        onChangeText={setJournalTitle}
        placeholder="Entry title..."
      />

      <Text style={styles.sectionTitle}>Content</Text>
      <TextInput
        style={[styles.textInput, styles.textArea]}
        value={journalContent}
        onChangeText={setJournalContent}
        placeholder="Write your thoughts..."
        multiline
      />

      <Text style={styles.sectionTitle}>Mood</Text>
      <View style={styles.moodGrid}>
        {moods.slice(0, 4).map((mood) => (
          <TouchableOpacity
            key={mood.id}
            style={[
              styles.moodCard,
              { borderColor: mood.color },
              journalMood === mood.id && { backgroundColor: mood.color + '20' }
            ]}
            onPress={() => setJournalMood(mood.id)}
          >
            <Text style={styles.moodLabel}>{mood.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={saveJournalEntry}>
        <Text style={styles.saveButtonText}>Save Entry</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Recent Entries</Text>
      {journalEntries.slice(0, 3).map((entry) => (
        <View key={entry.id} style={styles.entryCard}>
          <Text style={styles.entryTitle}>{entry.title}</Text>
          <Text style={styles.entryContent} numberOfLines={2}>{entry.content}</Text>
          <Text style={styles.entryMood}>Mood: {entry.mood}</Text>
        </View>
      ))}
    </ScrollView>
  );

  const renderAnalytics = () => (
    <ScrollView style={styles.content}>
      <Text style={styles.title}>Analytics</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Mood Summary</Text>
        <Text style={styles.cardText}>Total Entries: {moodEntries.length}</Text>
        {moodEntries.length > 0 && (
          <Text style={styles.cardText}>
            Most Recent: {moodEntries[0].mood} ({Math.round(moodEntries[0].intensity * 100)}%)
          </Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Journal Summary</Text>
        <Text style={styles.cardText}>Total Entries: {journalEntries.length}</Text>
        {journalEntries.length > 0 && (
          <Text style={styles.cardText}>Latest: {journalEntries[0].title}</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent Moods</Text>
        {moodEntries.slice(0, 5).map((entry) => (
          <Text key={entry.id} style={styles.cardText}>
            {entry.mood} - {Math.round(entry.intensity * 100)}%
          </Text>
        ))}
      </View>
    </ScrollView>
  );

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Dashboard':
        return renderDashboard();
      case 'MoodInput':
        return renderMoodInput();
      case 'Journal':
        return renderJournal();
      case 'Analytics':
        return renderAnalytics();
      default:
        return renderDashboard();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderScreen()}
      
      <View style={styles.tabBar}>
        {[
          { screen: 'Dashboard', label: 'Home', icon: '🏠' },
          { screen: 'MoodInput', label: 'Mood', icon: '😊' },
          { screen: 'Journal', label: 'Journal', icon: '📖' },
          { screen: 'Analytics', label: 'Stats', icon: '📊' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.screen}
            style={[
              styles.tabButton,
              currentScreen === tab.screen && styles.activeTab
            ]}
            onPress={() => setCurrentScreen(tab.screen as Screen)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[
              styles.tabLabel,
              currentScreen === tab.screen && styles.activeTabLabel
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    color: theme.colors.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    color: theme.colors.text,
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: 8,
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
    color: theme.colors.text,
  },
  cardText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  moodCard: {
    width: '48%',
    padding: theme.spacing.md,
    borderWidth: 2,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  moodLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  sliderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  sliderButton: {
    flex: 1,
    padding: theme.spacing.sm,
    margin: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeSlider: {
    backgroundColor: theme.colors.primary + '20',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: theme.spacing.sm,
    fontSize: 16,
    marginBottom: theme.spacing.md,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: theme.spacing.md,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  entryCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: 8,
    marginBottom: theme.spacing.sm,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: theme.colors.text,
  },
  entryContent: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  entryMood: {
    fontSize: 12,
    color: theme.colors.primary,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingVertical: theme.spacing.sm,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  activeTab: {
    backgroundColor: theme.colors.primary + '10',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  activeTabLabel: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
});

export default MoodJourneyApp;
