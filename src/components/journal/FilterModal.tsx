import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Typography, Card, Button, Spacer } from '../common';
import { ActivityTags } from '../mood';
import { theme } from '../../theme/theme';
import { MoodType, ActivityTag } from '../../types/mood';
import { JournalFilter } from '../../types/journal';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filter: JournalFilter) => void;
  currentFilter: JournalFilter;
}

const moods: MoodType[] = ['joy', 'sadness', 'anger', 'fear', 'surprise', 'calm', 'neutral'];

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApply,
  currentFilter,
}) => {
  const [selectedMoods, setSelectedMoods] = useState<MoodType[]>(
    currentFilter.moods || []
  );
  const [selectedActivities, setSelectedActivities] = useState<ActivityTag[]>(
    currentFilter.activities || []
  );

  const handleApply = () => {
    onApply({
      moods: selectedMoods.length > 0 ? selectedMoods : undefined,
      activities: selectedActivities,
    });
    onClose();
  };

  const handleClear = () => {
    setSelectedMoods([]);
    setSelectedActivities([]);
    onApply({});
    onClose();
  };

  const handleMoodToggle = (mood: MoodType) => {
    setSelectedMoods(prev =>
      prev.includes(mood)
        ? prev.filter(m => m !== mood)
        : [...prev, mood]
    );
  };

  const handleActivityToggle = (activity: ActivityTag) => {
    setSelectedActivities(prev =>
      prev.includes(activity)
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Card style={styles.modalContent}>
          <View style={styles.header}>
            <Typography variant="h2">Filter Entries</Typography>
            <TouchableOpacity onPress={onClose}>
              <Typography variant="body1" color="error">Close</Typography>
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContentContainer}
          >
            <Spacer size="lg" />

            <Typography variant="h3">By Mood</Typography>
            <Spacer />
            <View style={styles.moodGrid}>
              {moods.map((mood) => (
                <Button
                  key={mood}
                  variant={selectedMoods.includes(mood) ? 'contained' : 'outlined'}
                  onPress={() => handleMoodToggle(mood)}
                  style={[
                    styles.moodButton,
                    { borderColor: theme.colors[mood] }
                  ]}
                >
                  {mood}
                </Button>
              ))}
            </View>

            <Spacer size="lg" />

            <Typography variant="h3">By Activities</Typography>
            <Spacer />
            <ActivityTags
              selectedTags={selectedActivities}
              onToggleTag={handleActivityToggle}
            />

            <Spacer size="xl" />
          </ScrollView>

          <View style={styles.actions}>
            <Button
              variant="outlined"
              onPress={handleClear}
              style={styles.actionButton}
            >
              Clear All
            </Button>
            <Spacer horizontal />
            <Button
              onPress={handleApply}
              style={styles.actionButton}
            >
              Apply Filters
            </Button>
          </View>
        </Card>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scrollContent: {
    maxHeight: 450,
  },
  scrollContentContainer: {
    paddingBottom: theme.spacing.md,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  moodButton: {
    minWidth: 100,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.disabled + '20',
  },
  actionButton: {
    flex: 1,
  },
});
