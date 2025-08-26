import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MainTabParamList, RootStackParamList } from './types';
import { theme } from '../theme/theme';

// Import screens
import DashboardScreen from '../screens/Dashboard';
import MoodInputScreen from '../screens/MoodInput';
import JournalScreen from '../screens/Journal';
import AnalyticsScreen from '../screens/Analytics';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.disabled,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.disabled + '20',
          paddingBottom: theme.spacing.xs,
          height: 60,
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          ...theme.typography.h2,
          color: theme.colors.text,
        },
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="MoodInput" 
        component={MoodInputScreen}
        options={{
          title: 'Mood',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="emoticon" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Journal" 
        component={JournalScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="book" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Analytics" 
        component={AnalyticsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-line" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const MainNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="MainTabs" 
          component={MainTabs}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};