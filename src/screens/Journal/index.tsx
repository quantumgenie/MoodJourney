import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, RefreshControl } from 'react-native';
import { Typography, Button, Spacer } from '../../components/common';
import { SearchBar } from '../../components/journal/SearchBar';
import { JournalEntryCard } from '../../components/journal/JournalEntryCard';
import { theme } from '../../theme/theme';
import { useJournalStorage } from '../../hooks/useJournalStorage';
import { JournalEntry } from '../../types/journal';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';

type JournalScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const JournalScreen = () => {
  const navigation = useNavigation<JournalScreenNavigationProp>();
  const { getJournalEntries, deleteJournalEntry, searchJournalEntries, isLoading } = useJournalStorage();
  
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadEntries = async () => {
    try {
      if (searchQuery.trim()) {
        const searchResults = await searchJournalEntries({ searchText: searchQuery });
        setEntries(searchResults);
      } else {
        const allEntries = await getJournalEntries();
        setEntries(allEntries);
      }
    } catch (error) {
      console.error('Error loading entries:', error);
      Alert.alert('Error', 'Failed to load journal entries');
    }
  };

  useEffect(() => {
    loadEntries();
  }, [searchQuery]);

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
    // TODO: Implement filter modal
    console.log('Filter pressed');
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
              {searchQuery
                ? 'No entries found matching your search'
                : 'No journal entries yet. Start writing!'}
            </Typography>
          </View>
        ) : (
          entries.map(entry => (
            <JournalEntryCard
              key={entry.id}
              entry={entry}
              onPress={() => navigation.navigate('JournalEntry', { id: entry.id })}
              onDelete={() => handleDelete(entry.id)}
            />
          ))
        )}
        <Spacer size="xl" />
      </ScrollView>
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
});

export default JournalScreen;