import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
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
  const [selectedMood, setSelectedMood] = useState<MoodType | undefined>(currentFilter.mood);
  const [selectedActivities, setSelectedActivities] = useState<ActivityTag[]>(
    currentFilter.activities || []
  );

  const handleApply = () => {
    onApply({
      mood: selectedMood,
      activities: selectedActivities,
    });
    onClose();
  };

  const handleClear = () => {
    setSelectedMood(undefined);
    setSelectedActivities([]);
    onApply({});
    onClose();
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

          <Spacer size="lg" />

          <Typography variant="h3">By Mood</Typography>
          <Spacer />
          <View style={styles.moodGrid}>
            {moods.map((mood) => (
              <Button
                key={mood}
                variant={selectedMood === mood ? 'contained' : 'outlined'}
                onPress={() => setSelectedMood(mood === selectedMood ? undefined : mood)}
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
    justifyContent: 'flex-end',
  },
  actionButton: {
    flex: 1,
  },
});
