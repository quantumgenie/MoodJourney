/**
 * Simplified navigation for Snack compatibility
 * Uses basic View-based navigation instead of React Navigation
 */

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../components/common';
import { theme } from '../theme/theme';

// Import screens
import DashboardScreen from '../screens/Dashboard';
import MoodInputScreen from '../screens/MoodInput';
import JournalScreen from '../screens/Journal';
import AnalyticsScreen from '../screens/Analytics';

type Screen = 'Dashboard' | 'MoodInput' | 'Journal' | 'Analytics';

export const SimpleNavigator: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('Dashboard');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Dashboard':
        return <DashboardScreen />;
      case 'MoodInput':
        return <MoodInputScreen />;
      case 'Journal':
        return <JournalScreen />;
      case 'Analytics':
        return <AnalyticsScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  const TabButton: React.FC<{ screen: Screen; label: string; icon: string }> = ({
    screen,
    label,
    icon,
  }) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        currentScreen === screen && styles.activeTab
      ]}
      onPress={() => setCurrentScreen(screen)}
    >
      <Typography 
        variant="caption" 
        style={[
          styles.tabLabel,
          currentScreen === screen && styles.activeTabLabel
        ]}
      >
        {icon} {label}
      </Typography>
    </TouchableOpacity>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {renderScreen()}
        </View>
        
        <View style={styles.tabBar}>
          <TabButton screen="Dashboard" label="Home" icon="🏠" />
          <TabButton screen="MoodInput" label="Mood" icon="😊" />
          <TabButton screen="Journal" label="Journal" icon="📖" />
          <TabButton screen="Analytics" label="Analytics" icon="📊" />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.disabled,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  activeTab: {
    backgroundColor: theme.colors.primary + '20',
  },
  tabLabel: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
  },
  activeTabLabel: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
});
