import React from 'react';
import { View, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { Typography } from '../common';
import { theme } from '../../theme/theme';
import { MoodType } from '../../types/mood';

interface IntensitySliderProps {
  value: number;
  onValueChange: (value: number) => void;
  selectedMood: MoodType;
}

export const IntensitySlider: React.FC<IntensitySliderProps> = ({
  value,
  onValueChange,
  selectedMood,
}) => {
  return (
    <View style={styles.container}>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={1}
        value={value}
        onValueChange={onValueChange}
        minimumTrackTintColor={theme.colors[selectedMood]}
        maximumTrackTintColor={theme.colors.disabled}
        thumbTintColor={theme.colors[selectedMood]}
      />
      <View style={styles.labels}>
        <Typography variant="caption">Mild</Typography>
        <Typography variant="caption">Strong</Typography>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.sm,
  },
});
