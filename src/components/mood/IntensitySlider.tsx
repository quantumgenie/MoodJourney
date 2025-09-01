import React, { useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, PanResponder } from 'react-native';
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
  const sliderRef = useRef<View>(null);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (event) => {
      handleTouch(event.nativeEvent.locationX);
    },
    onPanResponderMove: (event) => {
      handleTouch(event.nativeEvent.locationX);
    },
  });

  const handleTouch = (locationX: number) => {
    // Assuming slider width of 280 (container width minus padding)
    const sliderWidth = 280;
    const newValue = Math.max(0, Math.min(1, locationX / sliderWidth));
    onValueChange(newValue);
  };

  return (
    <View style={styles.container}>
      <View 
        ref={sliderRef}
        style={styles.sliderContainer}
        {...panResponder.panHandlers}
      >
        <View style={[styles.track, { backgroundColor: theme.colors.disabled }]} />
        <View 
          style={[
            styles.activeTrack, 
            { 
              backgroundColor: theme.colors[selectedMood],
              width: `${value * 100}%`
            }
          ]} 
        />
        <View 
          style={[
            styles.thumb, 
            { 
              backgroundColor: theme.colors[selectedMood],
              left: `${Math.max(0, Math.min(100, value * 100 - 2))}%` // Adjust for thumb width
            }
          ]} 
        />
      </View>
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
    paddingVertical: theme.spacing.sm,
  },
  sliderContainer: {
    height: 40,
    width: '100%',
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: theme.spacing.sm,
  },
  track: {
    height: 4,
    borderRadius: 2,
    width: '100%',
  },
  activeTrack: {
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    left: theme.spacing.sm,
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: 'absolute',
    marginLeft: -10, // Center the thumb
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.xs,
  },
});
