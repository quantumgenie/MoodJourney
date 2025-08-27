import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography, Card, Spacer } from '../common';
import { theme } from '../../theme/theme';
import { JournalEntry } from '../../types/journal';
import { MaterialIcons } from '@expo/vector-icons';

interface JournalEntryCardProps {
  entry: JournalEntry;
  onPress: () => void;
  onDelete: () => void;
}

export const JournalEntryCard: React.FC<JournalEntryCardProps> = ({
  entry,
  onPress,
  onDelete,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card style={styles.card}>
      <TouchableOpacity onPress={onPress}>
        <View style={styles.header}>
          <Typography variant="caption" color="disabled">
            {formatDate(entry.createdAt)}
          </Typography>
          <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
            <MaterialIcons name="delete-outline" size={20} color={theme.colors.error} />
          </TouchableOpacity>
        </View>
        
        <Spacer size="xs" />
        <Typography variant="h3">{entry.title}</Typography>
        
        <Spacer size="sm" />
        <Typography
          variant="body2"
          numberOfLines={2}
          style={styles.preview}
        >
          {entry.content}
        </Typography>

        <Spacer />
        
        <View style={styles.footer}>
          <View style={styles.tags}>
            <View style={[styles.tag, { backgroundColor: theme.colors[entry.mood] }]}>
              <Typography variant="caption" color="surface">
                {entry.mood}
              </Typography>
            </View>
            {entry.tags.slice(0, 2).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Typography variant="caption">
                  {tag}
                </Typography>
              </View>
            ))}
            {entry.tags.length > 2 && (
              <Typography variant="caption" color="disabled">
                +{entry.tags.length - 2} more
              </Typography>
            )}
          </View>
          <MaterialIcons name="chevron-right" size={24} color={theme.colors.disabled} />
        </View>
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteButton: {
    padding: theme.spacing.xs,
  },
  preview: {
    color: theme.colors.disabled,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tags: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  tag: {
    backgroundColor: theme.colors.disabled + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
});
