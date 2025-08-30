import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert, RefreshControl } from 'react-native';
import { Typography, Button, Spacer, AnimatedCard } from '../../components/common';
import { SearchBar } from '../../components/journal/SearchBar';
import { JournalEntryCard } from '../../components/journal/JournalEntryCard';
import { FilterModal } from '../../components/journal/FilterModal';
import { theme } from '../../theme/theme';
import { useJournalStorage } from '../../hooks/useJournalStorage';
import { JournalEntry, JournalFilter } from '../../types/journal';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';

type JournalScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const JournalScreen = () => {
  const navigation = useNavigation<JournalScreenNavigationProp>();
  const { getJournalEntries, deleteJournalEntry, searchJournalEntries, isLoading } = useJournalStorage();
  
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filter, setFilter] = useState<JournalFilter>({});
  const [animationKey, setAnimationKey] = useState(0);

  const loadEntries = async () => {
    try {
      const searchFilter: JournalFilter = {
        ...filter,
        searchText: searchQuery.trim(),
      };

      const searchResults = await searchJournalEntries(searchFilter);
      setEntries(searchResults);
    } catch (error) {
      console.error('Error loading entries:', error);
      Alert.alert('Error', 'Failed to load journal entries');
    }
  };

  useEffect(() => {
    loadEntries();
  }, [searchQuery, filter]);

  // Reload entries and trigger animations when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadEntries();
      // Trigger fresh animations on each navigation
      setAnimationKey(prev => prev + 1);
    }, [searchQuery, filter])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEntries();
    setRefreshing(false);
  };

  const handleDelete = async (entryId: string) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteJournalEntry(entryId);
              await loadEntries();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete entry');
            }
          },
        },
      ]
    );
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const handleFilter = () => {
    setShowFilterModal(true);
  };

  const handleApplyFilter = (newFilter: JournalFilter) => {
    setFilter(newFilter);
  };

  const getFilterSummary = () => {
    const parts = [];
    if (filter.moods && filter.moods.length > 0) {
      parts.push(`Moods: ${filter.moods.length} selected`);
    }
    if (filter.activities?.length ?? 0 > 0) {
      parts.push(`Activities: ${filter.activities?.length} selected`);
    }
    return parts.join(' • ');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Typography variant="h2">My Journal</Typography>
        <Button 
          onPress={() => navigation.navigate('JournalEntry')}
        >
          New Entry
        </Button>
      </View>
      
      <Spacer />
      
      <SearchBar
        value={searchQuery}
        onChangeText={handleSearch}
        onFilterPress={handleFilter}
      />

      {((filter.moods?.length ?? 0) > 0 || (filter.activities?.length ?? 0) > 0) && (
        <>
          <View style={styles.filterSummary}>
            <Typography variant="caption" color="disabled">
              {getFilterSummary()}
            </Typography>
            <Button
              variant="text"
              onPress={() => setFilter({})}
            >
              Clear
            </Button>
          </View>
          <Spacer size="sm" />
        </>
      )}
      
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
      >
        {entries.length === 0 ? (
          <View style={styles.emptyState}>
            <Typography variant="body1" color="disabled" centered>
              {searchQuery || Object.keys(filter).length > 0
                ? 'No entries found matching your criteria'
                : 'No journal entries yet. Start writing!'}
            </Typography>
          </View>
        ) : (
          entries.map((entry, index) => (
            <JournalEntryCard
              key={`${entry.id}-${animationKey}`}
              entry={entry}
              onPress={() => navigation.navigate('JournalEntry', { id: entry.id })}
              onDelete={() => handleDelete(entry.id)}
              delay={index * 200} // Staggered delay: 0ms, 200ms, 400ms, etc.
            />
          ))
        )}
        <Spacer size="xl" />
        <Spacer size="lg" />
      </ScrollView>

      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyFilter}
        currentFilter={filter}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl * 2,
  },
  filterSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default JournalScreen;