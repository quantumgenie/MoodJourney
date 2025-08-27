import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography } from '../common';
import { theme } from '../../theme/theme';
import { ActivityTag, ACTIVITY_TAGS } from '../../types/mood';

interface ActivityTagsProps {
  selectedTags: ActivityTag[];
  onToggleTag: (tag: ActivityTag) => void;
}

export const ActivityTags: React.FC<ActivityTagsProps> = ({
  selectedTags,
  onToggleTag,
}) => {
  return (
    <View style={styles.container}>
      {ACTIVITY_TAGS.map((tag) => (
        <TouchableOpacity
          key={tag}
          onPress={() => onToggleTag(tag)}
          style={[
            styles.tag,
            selectedTags.includes(tag) && styles.tagSelected,
          ]}
        >
          <Typography
            variant="body2"
            color={selectedTags.includes(tag) ? 'surface' : 'text'}
          >
            {tag}
          </Typography>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -theme.spacing.xs,
  },
  tag: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    margin: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.disabled,
  },
  tagSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
});
